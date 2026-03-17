return {
    "saghen/blink.cmp",
    dependencies = {
        "tzachar/cmp-ai",
        "compat/blink.compat",
    },
    opts = {
        sources = {
            default = { "lsp", "path", "snippets", "buffer", "cmp_ai" },
            providers = {
                cmp_ai = {
                    name = "cmp_ai",
                    module = "blink.compat.source",
                    score_offset = 100,
                    async = true,
                },
            },
        },
    },
}
