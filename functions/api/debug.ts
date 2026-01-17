
export const onRequestGet: PagesFunction<{
    LINE_CHANNEL_SECRET: string;
    LINE_CHANNEL_ACCESS_TOKEN: string;
    MESSAGES_KV: KVNamespace;
    GEMINI_API_KEY: string;
}> = async (context) => {
    const { env } = context;

    const diagnostics = {
        LINE_CHANNEL_SECRET: !!env.LINE_CHANNEL_SECRET,
        LINE_CHANNEL_ACCESS_TOKEN: !!env.LINE_CHANNEL_ACCESS_TOKEN,
        GEMINI_API_KEY: !!env.GEMINI_API_KEY,
        MESSAGES_KV: !!env.MESSAGES_KV,
        timestamp: new Date().toISOString()
    };

    return new Response(JSON.stringify(diagnostics, null, 2), {
        headers: { "Content-Type": "application/json" }
    });
};
