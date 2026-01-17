
export const onRequestGet: PagesFunction<{
    LINE_CHANNEL_SECRET: string;
    LINE_CHANNEL_ACCESS_TOKEN: string;
    MESSAGES_KV: KVNamespace;
    GEMINI_API_KEY: string;
}> = async (context) => {
    const { env } = context;

    let kvTest = "Not attempted";
    try {
        if (env.MESSAGES_KV) {
            await env.MESSAGES_KV.put("debug_test", "works_" + Date.now());
            const val = await env.MESSAGES_KV.get("debug_test");
            kvTest = val && val.startsWith("works_") ? "Success" : "Failed to read back";
        }
    } catch (e: any) {
        kvTest = "Error: " + e.message;
    }

    const diagnostics = {
        LINE_CHANNEL_SECRET: !!env.LINE_CHANNEL_SECRET,
        LINE_CHANNEL_ACCESS_TOKEN: !!env.LINE_CHANNEL_ACCESS_TOKEN,
        GEMINI_API_KEY: !!env.GEMINI_API_KEY,
        MESSAGES_KV: !!env.MESSAGES_KV,
        KV_WRITE_READ_TEST: kvTest,
        timestamp: new Date().toISOString()
    };

    return new Response(JSON.stringify(diagnostics, null, 2), {
        headers: { "Content-Type": "application/json" }
    });
};
