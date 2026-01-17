
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

        console.log("--- Received Webhook Request ---");
        console.log("Signature present:", !!signature);
        console.log("Body length:", body.length);

        if (!signature) {
            console.error("Error: Missing x-line-signature header");
            return new Response("Missing signature", { status: 401 });
        }

        if (!env.LINE_CHANNEL_SECRET) {
            console.error("Error: LINE_CHANNEL_SECRET environment variable is missing");
            return new Response("Secret missing", { status: 500 });
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
            console.error("Error: LINE signature verification failed");
            return new Response("Invalid signature", { status: 401 });
        }

        console.log("Signature verified successfully");
        const payload: WebhookRequest = JSON.parse(body);

        if (!env.MESSAGES_KV) {
            console.error("Error: MESSAGES_KV namespace is not bound");
            return new Response("KV not bound", { status: 500 });
        }

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
