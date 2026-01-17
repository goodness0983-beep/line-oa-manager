
interface MessageEvent {
    type: string;
    message?: {
        id: string;
        type: string;
        text?: string;
    };
    source: {
        userId: string;
        type: string;
    };
    replyToken: string;
    timestamp: number;
}

interface WebhookRequest {
    destination: string;
    events: MessageEvent[];
}

export const onRequestPost: PagesFunction<{
    LINE_CHANNEL_SECRET: string;
    MESSAGES_KV: KVNamespace;
}> = async (context) => {
    const { request, env } = context;

    try {
        const body = await request.text();
        const signature = request.headers.get("x-line-signature");

        if (!signature) {
            return new Response("Missing signature", { status: 401 });
        }

        // LINE Signature Verification
        const encoder = new TextEncoder();
        const secretKeyData = encoder.encode(env.LINE_CHANNEL_SECRET);
        const key = await crypto.subtle.importKey(
            "raw",
            secretKeyData,
            { name: "HMAC", hash: "SHA-256" },
            false,
            ["verify"]
        );

        const data = encoder.encode(body);
        const signatureBin = Uint8Array.from(atob(signature), c => c.charCodeAt(0));
        const isValid = await crypto.subtle.verify("HMAC", key, signatureBin, data);

        if (!isValid) {
            return new Response("Invalid signature", { status: 401 });
        }

        const payload: WebhookRequest = JSON.parse(body);

        for (const event of payload.events) {
            if (event.type === "message" && event.message?.type === "text") {
                const userId = event.source.userId;
                const messageText = event.message.text;

                // Save message to KV
                // For simplicity, we'll store messages in a list per user
                const existingMessagesRaw = await env.MESSAGES_KV.get(`user:${userId}`);
                const existingMessages = existingMessagesRaw ? JSON.parse(existingMessagesRaw) : [];

                const newMessage = {
                    id: event.message.id,
                    text: messageText,
                    timestamp: event.timestamp,
                    senderId: userId,
                    type: "user"
                };

                existingMessages.push(newMessage);

                // Keep only last 50 messages
                if (existingMessages.length > 50) existingMessages.shift();

                await env.MESSAGES_KV.put(`user:${userId}`, JSON.stringify(existingMessages));

                // Also track user list for the frontend
                const usersRaw = await env.MESSAGES_KV.get("users_list");
                const users: string[] = usersRaw ? JSON.parse(usersRaw) : [];
                if (!users.includes(userId)) {
                    users.push(userId);
                    await env.MESSAGES_KV.put("users_list", JSON.stringify(users));
                }
            }
        }

        return new Response("OK", { status: 200 });

    } catch (error) {
        console.error("Webhook Error:", error);
        return new Response("Internal Error", { status: 500 });
    }
};
