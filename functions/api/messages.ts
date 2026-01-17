
export const onRequestGet: PagesFunction<{
    MESSAGES_KV: KVNamespace;
}> = async (context) => {
    const { searchParams } = new URL(context.request.url);
    const userId = searchParams.get("userId");

    try {
        if (userId) {
            // Get messages for a specific user
            const messages = await context.env.MESSAGES_KV.get(`user:${userId}`);
            return new Response(messages || "[]", {
                headers: { "Content-Type": "application/json" }
            });
        } else {
            // Get all users
            const users = await context.env.MESSAGES_KV.get("users_list");
            return new Response(users || "[]", {
                headers: { "Content-Type": "application/json" }
            });
        }
    } catch (error) {
        return new Response(JSON.stringify({ error: "Failed to fetch messages" }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
};
