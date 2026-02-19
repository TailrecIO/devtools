<script lang="ts">
  type EncodeMode = 'component' | 'full';

  let input = '';
  let output = '';
  let mode: 'encode' | 'decode' = 'encode';
  let encodeMode: EncodeMode = 'component';
  let error = '';
  let copied = false;

  function setEncodeMode(m: string) { encodeMode = m as EncodeMode; }

  function process() {
    error = '';
    if (!input) { output = ''; return; }
    try {
      if (mode === 'encode') {
        output = encodeMode === 'component'
          ? encodeURIComponent(input)
          : encodeURI(input);
      } else {
        // Try decodeURIComponent first; fall back to decodeURI for full URLs
        output = decodeURIComponent(input.trim());
      }
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

  function clear() { input = ''; output = ''; error = ''; }

  $: input, encodeMode, process();
</script>

<svelte:head>
  <title>URL Encoder / Decoder — DevTools</title>
  <meta name="description" content="Percent-encode URLs and query parameters with encodeURIComponent or encodeURI, or decode them back to plain text. Client-side only." />
  <meta property="og:title" content="URL Encoder / Decoder — DevTools" />
  <meta property="og:description" content="Percent-encode URLs and query parameters with encodeURIComponent or encodeURI, or decode them back to plain text. Client-side only." />
</svelte:head>

<div class="space-y-6 w-full">
  <!-- Header -->
  <div>
    <div class="flex items-center gap-2 mb-1">
      <span class="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary-500/20 text-primary-400 uppercase tracking-wider">URL</span>
      <h1 class="text-2xl font-bold text-white">URL Encoder / Decoder</h1>
    </div>
    <p class="text-surface-400 text-sm">Percent-encode URLs and query parameters, or decode them back to plain text.</p>
  </div>

  <!-- Mode + Options row -->
  <div class="flex flex-wrap items-center gap-3">
    <div class="flex items-center gap-1 p-1 rounded-lg bg-surface-800 border border-surface-700">
      <button
        class="px-4 py-1.5 rounded-md text-sm font-medium transition-all {mode === 'encode' ? 'bg-primary-500 text-white' : 'text-surface-400 hover:text-white'}"
        on:click={() => { mode = 'encode'; process(); }}
      >Encode</button>
      <button
        class="px-4 py-1.5 rounded-md text-sm font-medium transition-all {mode === 'decode' ? 'bg-primary-500 text-white' : 'text-surface-400 hover:text-white'}"
        on:click={() => { mode = 'decode'; process(); }}
      >Decode</button>
    </div>

    {#if mode === 'encode'}
      <div class="flex items-center gap-2">
        <span class="text-xs text-surface-500">Scope:</span>
        <div class="flex items-center gap-1 p-1 rounded-lg bg-surface-800 border border-surface-700">
          <button
            class="px-3 py-1.5 rounded-md text-xs font-medium transition-all {encodeMode === 'component' ? 'bg-surface-600 text-white' : 'text-surface-400 hover:text-white'}"
            on:click={() => setEncodeMode('component')}
          >Component</button>
          <button
            class="px-3 py-1.5 rounded-md text-xs font-medium transition-all {encodeMode === 'full' ? 'bg-surface-600 text-white' : 'text-surface-400 hover:text-white'}"
            on:click={() => setEncodeMode('full')}
          >Full URL</button>
        </div>
      </div>
      <p class="text-xs text-surface-500">
        {#if encodeMode === 'component'}
          <span class="font-mono text-surface-400">encodeURIComponent</span> — encodes everything except <span class="font-mono">A–Z a–z 0–9 - _ . ! ~ * ' ( )</span>
        {:else}
          <span class="font-mono text-surface-400">encodeURI</span> — preserves <span class="font-mono">: / ? # [ ] @ ! $ & ' ( ) * + , ; =</span>
        {/if}
      </p>
    {/if}
  </div>

  <!-- IO Area -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <div class="space-y-2">
      <div class="flex items-center justify-between h-8">
        <span class="text-xs font-semibold text-surface-400 uppercase tracking-wider">
          {mode === 'encode' ? 'Plain Text / URL' : 'Encoded Input'}
        </span>
        <span class="text-xs text-surface-500 font-mono">{input.length} chars</span>
      </div>
      <textarea
        bind:value={input}
        on:input={process}
        placeholder={mode === 'encode' ? 'https://example.com/search?q=hello world&lang=en' : 'https%3A%2F%2Fexample.com%2F...'}
        class="w-full h-72 px-3 py-3 rounded-lg bg-surface-800 border text-white font-mono text-sm resize-none focus:outline-none placeholder-surface-600 transition-colors
          {error ? 'border-error-500/50 focus:border-error-500' : 'border-surface-700 focus:border-primary-500'}"
        spellcheck="false"
      />
    </div>

    <div class="space-y-2">
      <div class="flex items-center justify-between h-8">
        <span class="text-xs font-semibold text-surface-400 uppercase tracking-wider">
          {mode === 'encode' ? 'Encoded Output' : 'Decoded Output'}
        </span>
        <button
          on:click={copyOutput}
          disabled={!output}
          class="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md transition-all
            {copied ? 'bg-success-500/20 text-success-400' : 'bg-surface-700 text-surface-400 hover:text-white hover:bg-surface-600 disabled:opacity-40 disabled:cursor-not-allowed'}"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <textarea
        value={output}
        readonly
        placeholder="Output will appear here..."
        class="w-full h-72 px-3 py-3 rounded-lg bg-surface-800 border border-surface-700 text-white font-mono text-sm resize-none focus:outline-none placeholder-surface-600"
        spellcheck="false"
      />
    </div>
  </div>

  {#if error}
    <div class="flex items-center gap-2 px-4 py-3 rounded-lg bg-error-500/10 border border-error-500/20 text-error-400 text-sm">
      <svg viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 flex-shrink-0"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/></svg>
      <span class="font-mono text-xs">{error}</span>
    </div>
  {/if}

  <div class="flex items-center gap-2">
    <button
      on:click={swap}
      disabled={!output}
      class="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-surface-800 border border-surface-700 text-surface-400 hover:text-white hover:border-surface-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
    >
      <svg viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4"><path fill-rule="evenodd" d="M13.2 2.24a.75.75 0 00.04 1.06l2.1 1.95H6.75a.75.75 0 000 1.5h8.59l-2.1 1.95a.75.75 0 101.02 1.1l3.5-3.25a.75.75 0 000-1.1l-3.5-3.25a.75.75 0 00-1.06.04zm-6.4 8a.75.75 0 00-1.06-.04l-3.5 3.25a.75.75 0 000 1.1l3.5 3.25a.75.75 0 101.02-1.1l-2.1-1.95h8.59a.75.75 0 000-1.5H4.66l2.1-1.95a.75.75 0 00.04-1.06z" clip-rule="evenodd"/></svg>
      Swap
    </button>
    <button
      on:click={clear}
      class="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-surface-800 border border-surface-700 text-surface-400 hover:text-white hover:border-surface-600 transition-all"
    >
      Clear
    </button>
  </div>

  <!-- Reference -->
  <div class="rounded-lg bg-surface-800 border border-surface-700 p-4">
    <p class="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-3">Common Encodings</p>
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {#each [[' ', '%20'], ['/', '%2F'], ['?', '%3F'], ['#', '%23'], ['&', '%26'], ['=', '%3D'], ['+', '%2B'], ['@', '%40']] as [char, encoded]}
        <div class="flex items-center gap-2 px-2 py-1.5 rounded bg-surface-700">
          <span class="font-mono text-xs text-primary-400 w-4 text-center">{char}</span>
          <span class="text-surface-500 text-xs">→</span>
          <span class="font-mono text-xs text-surface-300">{encoded}</span>
        </div>
      {/each}
    </div>
  </div>
</div>
