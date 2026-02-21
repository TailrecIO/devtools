<script lang="ts">
  const tools = [
    {
      name: "Base64",
      path: "/base64",
      badge: "B64",
      description:
        "Encode text to Base64 or decode Base64 strings back to plain text. Handles Unicode characters correctly.",
      tags: ["encode", "decode", "encoding"],
    },
    {
      name: "URL",
      path: "/url",
      badge: "URL",
      description:
        "Percent-encode URLs and query parameters with encodeURIComponent or encodeURI, or decode them back.",
      tags: ["url", "percent", "encode", "decode"],
    },
    {
      name: "JSON Formatter",
      path: "/json",
      badge: "{ }",
      description:
        "Prettify, minify, and validate JSON. Choose indentation style and sort keys alphabetically.",
      tags: ["format", "prettify", "validate", "minify"],
    },
    {
      name: "JSON Escape",
      path: "/json-escape",
      badge: "ESC",
      description:
        "Escape a raw string for safe embedding as a JSON value, or unescape a JSON string back to plain text.",
      tags: ["json", "escape", "unescape", "string"],
    },
    {
      name: "Regex Tester",
      path: "/regex",
      badge: "RE",
      description:
        "Test regular expressions with live match highlighting, capture group inspection, and string replace.",
      tags: ["regex", "regexp", "pattern", "match", "test"],
    },
    {
      name: "JWT",
      path: "/jwt",
      badge: "JWT",
      description:
        "Decode JWT tokens and inspect headers, payloads, and expiry. Sign and verify tokens with HMAC algorithms.",
      tags: ["jwt", "token", "auth", "decode", "encode", "verify"],
    },
    {
      name: "JWT RSA",
      path: "/jwt-rsa",
      badge: "RSA",
      description:
        "Sign and verify JWTs with asymmetric RSA keys. Supports RS256/384/512 (PKCS#1 v1.5) and PS256/384/512 (RSA-PSS). Includes in-browser key pair generation.",
      tags: ["jwt", "rsa", "pss", "asymmetric", "sign", "verify", "public key"],
    },
    {
      name: "Hex",
      path: "/hex",
      badge: "HEX",
      description:
        "Convert text to hexadecimal encoding or decode hex strings back to readable text.",
      tags: ["hex", "hexadecimal", "encode", "decode"],
    },
    {
      name: "Hash",
      path: "/hash",
      badge: "HASH",
      description:
        "Compute cryptographic hashes: MD5, SHA-1, SHA-224/256/384/512, SHA3-224/256/384/512, RIPEMD-160. Supports text and file input.",
      tags: ["hash", "md5", "sha256", "sha3", "checksum"],
    },
    {
      name: "UUID Generator",
      path: "/uuid",
      badge: "UID",
      description:
        "Generate UUIDs in version 1 (time-based), v4 (random), or v5 (namespace + name). Bulk generation supported.",
      tags: ["uuid", "guid", "generate", "random"],
    },
  ];
</script>

<svelte:head>
  <title>DevTools — Developer Utilities</title>
  <meta name="description" content="Essential developer tools that run entirely in your browser. Base64, URL encoder, JSON formatter, JWT decoder, Regex tester, UUID generator, Hash calculator and more — free and private." />
  <meta property="og:title" content="DevTools — Developer Utilities" />
  <meta property="og:description" content="Essential developer tools that run entirely in your browser. Base64, URL encoder, JSON formatter, JWT decoder, Regex tester, UUID generator, Hash calculator and more — free and private." />
</svelte:head>

<div class="max-w-4xl mx-auto space-y-10">
  <!-- Hero -->
  <div class="pt-4 pb-2">
    <div class="flex items-center gap-3 mb-4">
      <img src="/logo.png" alt="DevTools Logo" class="w-10 h-10 flex-shrink-0" />
      <div>
        <h1 class="text-3xl font-bold text-white tracking-tight">DevTools</h1>
        <p class="text-surface-400 text-sm">
          Fast, privacy-first developer utilities
        </p>
      </div>
    </div>
    <p class="text-surface-300 text-base leading-relaxed max-w-2xl">
      A collection of essential tools for developers. Everything runs entirely
      in your browser, no data is ever sent to a server.
    </p>
    <div class="flex gap-3 mt-4">
      <span class="badge variant-ghost-success text-xs"
        >🔒 Client-side only</span
      >
      <span class="badge variant-ghost-surface text-xs">No tracking</span>
      <span class="badge variant-ghost-surface text-xs"
        >No account required</span
      >
    </div>
  </div>

  <!-- Tools Grid -->
  <div>
    <h2
      class="text-xs font-semibold text-surface-500 uppercase tracking-[0.15em] mb-4"
    >
      Available Tools
    </h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
      {#each tools as tool}
        <a
          href={tool.path}
          class="group block p-4 rounded-xl bg-surface-800 border border-surface-700 hover:border-primary-500/40 hover:bg-surface-800/80 transition-all duration-200"
        >
          <div class="flex items-start gap-3">
            <div
              class="w-9 h-9 rounded-lg bg-surface-700 group-hover:bg-primary-500/20 flex items-center justify-center flex-shrink-0 font-mono text-[10px] font-bold text-surface-400 group-hover:text-primary-400 transition-colors"
            >
              {tool.badge}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <h3
                  class="font-semibold text-white group-hover:text-primary-300 transition-colors"
                >
                  {tool.name}
                </h3>
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  class="w-3.5 h-3.5 text-surface-500 group-hover:text-primary-400 transition-colors opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 duration-200"
                >
                  <path
                    fill-rule="evenodd"
                    d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
              <p class="text-sm text-surface-400 leading-relaxed">
                {tool.description}
              </p>
              <div class="flex gap-1 mt-2 flex-wrap">
                {#each tool.tags.slice(0, 3) as tag}
                  <span
                    class="text-[10px] px-1.5 py-0.5 rounded bg-surface-700 text-surface-500 font-mono"
                    >{tag}</span
                  >
                {/each}
              </div>
            </div>
          </div>
        </a>
      {/each}
    </div>
  </div>
</div>
