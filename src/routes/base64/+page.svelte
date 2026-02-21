<script lang="ts">
  import TechnicalDetails from '$lib/components/TechnicalDetails.svelte';

  let input = '';
  let output = '';
  let mode: 'encode' | 'decode' = 'encode';
  let error = '';
  let copied = false;

  function encodeBase64(text: string): string {
    // Properly handle Unicode via UTF-8 bytes
    const bytes = new TextEncoder().encode(text);
    let binary = '';
    bytes.forEach(b => (binary += String.fromCharCode(b)));
    return btoa(binary);
  }

  function decodeBase64(b64: string): string {
    const binary = atob(b64.trim());
    const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }

  function process() {
    error = '';
    if (!input.trim()) {
      output = '';
      return;
    }
    try {
      output = mode === 'encode' ? encodeBase64(input) : decodeBase64(input);
    } catch (e) {
      error = e instanceof Error ? e.message : 'Invalid input';
      output = '';
    }
  }

  function swap() {
    const prev = input;
    input = output;
    output = prev;
    mode = mode === 'encode' ? 'decode' : 'encode';
    if (input) process();
  }

  async function copyOutput() {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    copied = true;
    setTimeout(() => (copied = false), 2000);
  }

  function clear() {
    input = '';
    output = '';
    error = '';
  }

  $: input, process();
</script>

<svelte:head>
  <title>Base64 Encoder / Decoder — DevTools</title>
  <meta name="description" content="Encode text to Base64 or decode Base64 strings back to plain text. Handles Unicode characters correctly. Runs entirely in your browser." />
  <meta property="og:title" content="Base64 Encoder / Decoder — DevTools" />
  <meta property="og:description" content="Encode text to Base64 or decode Base64 strings back to plain text. Handles Unicode characters correctly. Runs entirely in your browser." />
</svelte:head>

<div class="space-y-6 w-full">
  <!-- Header -->
  <div class="flex items-start justify-between">
    <div>
      <div class="flex items-center gap-2 mb-1">
        <span class="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary-500/20 text-primary-400 uppercase tracking-wider">B64</span>
        <h1 class="text-2xl font-bold text-white">Base64 Encoder / Decoder</h1>
      </div>
      <p class="text-surface-400 text-sm">Encode text to Base64 or decode Base64 back to plain text. Full Unicode support.</p>
    </div>
  </div>

  <!-- Mode Toggle -->
  <div class="flex items-center gap-1 p-1 rounded-lg bg-surface-800 border border-surface-700 w-fit">
    <button
      class="px-4 py-1.5 rounded-md text-sm font-medium transition-all {mode === 'encode' ? 'bg-primary-500 text-white shadow-sm' : 'text-surface-400 hover:text-white'}"
      on:click={() => { mode = 'encode'; process(); }}
    >
      Encode
    </button>
    <button
      class="px-4 py-1.5 rounded-md text-sm font-medium transition-all {mode === 'decode' ? 'bg-primary-500 text-white shadow-sm' : 'text-surface-400 hover:text-white'}"
      on:click={() => { mode = 'decode'; process(); }}
    >
      Decode
    </button>
  </div>

  <!-- IO Area -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <!-- Input -->
    <div class="space-y-2">
      <div class="flex items-center justify-between h-8">
        <span class="text-xs font-semibold text-surface-400 uppercase tracking-wider">
          {mode === 'encode' ? 'Plain Text Input' : 'Base64 Input'}
        </span>
        <span class="text-xs text-surface-500 font-mono">{input.length} chars</span>
      </div>
      <textarea
        bind:value={input}
        on:input={process}
        placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Paste Base64 string to decode...'}
        class="w-full h-96 px-3 py-3 rounded-lg bg-surface-800 border border-surface-700 text-white font-mono text-sm resize-none focus:outline-none focus:border-primary-500 placeholder-surface-600 transition-colors"
        spellcheck="false"
      />
    </div>

    <!-- Output -->
    <div class="space-y-2">
      <div class="flex items-center justify-between h-8">
        <span class="text-xs font-semibold text-surface-400 uppercase tracking-wider">
          {mode === 'encode' ? 'Base64 Output' : 'Decoded Text'}
        </span>
        <button
          on:click={copyOutput}
          disabled={!output}
          class="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md transition-all
            {copied ? 'bg-success-500/20 text-success-400' : 'bg-surface-700 text-surface-400 hover:text-white hover:bg-surface-600 disabled:opacity-40 disabled:cursor-not-allowed'}"
        >
          {#if copied}
            <svg viewBox="0 0 20 20" fill="currentColor" class="w-3.5 h-3.5"><path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd"/></svg>
            Copied!
          {:else}
            <svg viewBox="0 0 20 20" fill="currentColor" class="w-3.5 h-3.5"><path d="M7 3.5A1.5 1.5 0 018.5 2h3.879a1.5 1.5 0 011.06.44l3.122 3.12A1.5 1.5 0 0117 6.622V12.5a1.5 1.5 0 01-1.5 1.5h-1v-3.379a3 3 0 00-.879-2.121L10.5 5.379A3 3 0 008.379 4.5H7v-1z"/><path d="M4.5 6A1.5 1.5 0 003 7.5v9A1.5 1.5 0 004.5 18h7a1.5 1.5 0 001.5-1.5v-5.879a1.5 1.5 0 00-.44-1.06L9.44 6.439A1.5 1.5 0 008.378 6H4.5z"/></svg>
            Copy
          {/if}
        </button>
      </div>
      <textarea
        value={output}
        readonly
        placeholder="Output will appear here..."
        class="w-full h-96 px-3 py-3 rounded-lg bg-surface-800 border border-surface-700 text-white font-mono text-sm resize-none focus:outline-none placeholder-surface-600
          {output && !error ? 'border-surface-700' : ''}"
        spellcheck="false"
      />
    </div>
  </div>

  <!-- Error -->
  {#if error}
    <div class="flex items-center gap-2 px-4 py-3 rounded-lg bg-error-500/10 border border-error-500/20 text-error-400 text-sm">
      <svg viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 flex-shrink-0">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/>
      </svg>
      {error}
    </div>
  {/if}

  <!-- Actions -->
  <div class="flex items-center gap-2">
    <button
      on:click={swap}
      disabled={!output}
      class="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-surface-800 border border-surface-700 text-surface-400 hover:text-white hover:border-surface-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
    >
      <svg viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
        <path fill-rule="evenodd" d="M13.2 2.24a.75.75 0 00.04 1.06l2.1 1.95H6.75a.75.75 0 000 1.5h8.59l-2.1 1.95a.75.75 0 101.02 1.1l3.5-3.25a.75.75 0 000-1.1l-3.5-3.25a.75.75 0 00-1.06.04zm-6.4 8a.75.75 0 00-1.06-.04l-3.5 3.25a.75.75 0 000 1.1l3.5 3.25a.75.75 0 101.02-1.1l-2.1-1.95h8.59a.75.75 0 000-1.5H4.66l2.1-1.95a.75.75 0 00.04-1.06z" clip-rule="evenodd"/>
      </svg>
      Swap
    </button>
    <button
      on:click={clear}
      class="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-surface-800 border border-surface-700 text-surface-400 hover:text-white hover:border-surface-600 transition-all"
    >
      <svg viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
        <path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4z" clip-rule="evenodd"/>
      </svg>
      Clear
    </button>
  </div>

  <TechnicalDetails
    title="How Base64 Encoding Works"
    sections={[
      {
        heading: "What is Base64?",
        content: "Base64 is a binary-to-text encoding scheme that converts binary data into an ASCII string format using 64 printable characters (A-Z, a-z, 0-9, +, /). It's commonly used to encode binary data for transmission over text-based protocols like email or JSON."
      },
      {
        heading: "How It Works",
        content: "Base64 takes binary data in groups of 3 bytes (24 bits), splits them into 4 groups of 6 bits each, and maps each 6-bit group to one of 64 characters. If the input isn't divisible by 3, padding characters (=) are added to the end to indicate missing bytes."
      },
      {
        heading: "Unicode Support",
        content: "This tool properly handles Unicode characters by first encoding text to UTF-8 bytes using TextEncoder, then applying Base64 encoding. When decoding, it reverses this process: Base64 → UTF-8 bytes → Unicode text. This ensures emoji, accented characters, and other non-ASCII text work correctly."
      },
      {
        heading: "Why Use Base64?",
        content: "Base64 is useful when you need to embed binary data (images, files) in text formats like JSON or HTML. It's also used in data URIs, email attachments (MIME), and authentication tokens. Note: Base64 increases data size by ~33% and is NOT encryption. It's easily reversible."
      },
      {
        heading: "Common Use Cases",
        content: "Embedding images in CSS/HTML (data URIs), encoding JWT tokens, transmitting binary data over JSON APIs, email attachments, encoding credentials in HTTP Basic Authentication, and storing binary data in text-only databases."
      }
    ]}
  />
</div>
