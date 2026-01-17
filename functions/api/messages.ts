
export const onRequestGet: PagesFunction<{
    MESSAGES_KV: KVNamespace;
}> = async (context) => {
    const { searchParams } = new URL(context.request.url);
    const userId = searchParams.get("userId");

    try {
        if (!context.env.MESSAGES_KV) {
            console.error("Error: MESSAGES_KV is not bound to the messages function");
            return new Response(JSON.stringify({ error: "KV not bound" }), {
                status: 500,
                headers: { "Content-Type": "application/json" }
            });
        }

        if (userId) {
            // Get messages for a specific user
            const messages = await context.env.MESSAGES_KV.get(`user:${userId}`);
            console.log(`Fetched messages for user ${userId}:`, messages ? "Found" : "Not Found");
            return new Response(messages || "[]", {
                headers: { "Content-Type": "application/json" }
            });
        } else {
            // Get all users
            const users = await context.env.MESSAGES_KV.get("users_list");
            console.log("Fetched users list:", users ? "Found" : "Not Found");
            return new Response(users || "[]", {
                headers: { "Content-Type": "application/json" }
            });
        }
    } catch (error) {
        console.error("Fetch Messages Error:", error);
        return new Response(JSON.stringify({ error: "Failed to fetch messages" }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
};
