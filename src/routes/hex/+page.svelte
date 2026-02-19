<script lang="ts">
  let input = '';
  let output = '';
  let mode: 'encode' | 'decode' = 'encode';
  let separator: 'space' | 'none' | 'colon' = 'space';

  function setSeparator(v: string) { separator = v as 'space' | 'none' | 'colon'; }
  let uppercase = false;
  let error = '';
  let copied = false;

  function textToHex(text: string): string {
    const bytes = new TextEncoder().encode(text);
    const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0'));
    const sep = separator === 'space' ? ' ' : separator === 'colon' ? ':' : '';
    return uppercase ? hex.join(sep).toUpperCase() : hex.join(sep);
  }

  function hexToText(hex: string): string {
    // Remove all separators and whitespace
    const clean = hex.replace(/[\s:]/g, '');
    if (clean.length % 2 !== 0) throw new Error('Invalid hex: odd number of characters');
    if (!/^[0-9a-fA-F]+$/.test(clean)) throw new Error('Invalid hex: contains non-hex characters');
    const bytes = new Uint8Array(
      clean.match(/.{2}/g)!.map(h => parseInt(h, 16))
    );
    return new TextDecoder().decode(bytes);
  }

  function process() {
    error = '';
    if (!input.trim()) {
      output = '';
      return;
    }
    try {
      output = mode === 'encode' ? textToHex(input) : hexToText(input);
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

  $: input, separator, uppercase, process();

  $: byteCount = (() => {
    if (mode === 'encode') return new TextEncoder().encode(input).length;
    try {
      const clean = input.replace(/[\s:]/g, '');
      return clean.length / 2;
    } catch { return 0; }
  })();
</script>

<svelte:head>
  <title>Hex Encoder / Decoder — DevTools</title>
  <meta name="description" content="Convert text to hexadecimal encoding or decode hex strings back to readable text. Supports space, colon, and no-separator formats. Runs in your browser." />
  <meta property="og:title" content="Hex Encoder / Decoder — DevTools" />
  <meta property="og:description" content="Convert text to hexadecimal encoding or decode hex strings back to readable text. Supports space, colon, and no-separator formats. Runs in your browser." />
</svelte:head>

<div class="space-y-6 w-full">
  <!-- Header -->
  <div>
    <div class="flex items-center gap-2 mb-1">
      <span class="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary-500/20 text-primary-400 uppercase tracking-wider">HEX</span>
      <h1 class="text-2xl font-bold text-white">Hex Encoder / Decoder</h1>
    </div>
    <p class="text-surface-400 text-sm">Convert text to hexadecimal representation or decode hex back to plain text.</p>
  </div>

  <!-- Options Row -->
  <div class="flex flex-wrap items-center gap-4">
    <!-- Mode Toggle -->
    <div class="flex items-center gap-1 p-1 rounded-lg bg-surface-800 border border-surface-700">
      <button
        class="px-3 py-1.5 rounded-md text-sm font-medium transition-all {mode === 'encode' ? 'bg-primary-500 text-white' : 'text-surface-400 hover:text-white'}"
        on:click={() => { mode = 'encode'; process(); }}
      >Encode</button>
      <button
        class="px-3 py-1.5 rounded-md text-sm font-medium transition-all {mode === 'decode' ? 'bg-primary-500 text-white' : 'text-surface-400 hover:text-white'}"
        on:click={() => { mode = 'decode'; process(); }}
      >Decode</button>
    </div>

    {#if mode === 'encode'}
      <!-- Separator -->
      <div class="flex items-center gap-2">
        <span class="text-xs text-surface-500">Separator:</span>
        <div class="flex items-center gap-1 p-1 rounded-lg bg-surface-800 border border-surface-700">
          {#each [{ label: 'Space', value: 'space' }, { label: 'Colon', value: 'colon' }, { label: 'None', value: 'none' }] as opt}
            <button
              class="px-2.5 py-1 rounded-md text-xs font-medium transition-all {separator === opt.value ? 'bg-surface-600 text-white' : 'text-surface-400 hover:text-white'}"
              on:click={() => { setSeparator(opt.value); process(); }}
            >{opt.label}</button>
          {/each}
        </div>
      </div>

      <!-- Uppercase toggle -->
      <div class="flex items-center gap-2 cursor-pointer select-none">
        <div
          class="w-8 h-4 rounded-full transition-colors relative cursor-pointer {uppercase ? 'bg-primary-500' : 'bg-surface-600'}"
          on:click={() => { uppercase = !uppercase; process(); }}
          on:keypress={(e) => e.key === 'Enter' && (uppercase = !uppercase)}
          role="switch"
          aria-checked={uppercase}
          tabindex="0"
        >
          <div class="absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform {uppercase ? 'translate-x-4' : 'translate-x-0.5'}"></div>
        </div>
        <span class="text-xs text-surface-400">Uppercase</span>
      </div>
    {/if}
  </div>

  <!-- IO Area -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <!-- Input -->
    <div class="space-y-2">
      <div class="flex items-center justify-between h-8">
        <span class="text-xs font-semibold text-surface-400 uppercase tracking-wider">
          {mode === 'encode' ? 'Text Input' : 'Hex Input'}
        </span>
        <span class="text-xs text-surface-500 font-mono">
          {#if mode === 'encode'}
            {byteCount} bytes
          {:else}
            {input.replace(/[\s:]/g, '').length / 2 || 0} bytes
          {/if}
        </span>
      </div>
      <textarea
        bind:value={input}
        on:input={process}
        placeholder={mode === 'encode' ? 'Enter text to convert to hex...' : 'Enter hex string (e.g. 48 65 6c 6c 6f)...'}
        class="w-full h-96 px-3 py-3 rounded-lg bg-surface-800 border text-white font-mono text-sm resize-none focus:outline-none placeholder-surface-600 transition-colors
          {error ? 'border-error-500/50 focus:border-error-500' : 'border-surface-700 focus:border-primary-500'}"
        spellcheck="false"
      />
    </div>

    <!-- Output -->
    <div class="space-y-2">
      <div class="flex items-center justify-between h-8">
        <span class="text-xs font-semibold text-surface-400 uppercase tracking-wider">
          {mode === 'encode' ? 'Hex Output' : 'Decoded Text'}
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
        class="w-full h-96 px-3 py-3 rounded-lg bg-surface-800 border border-surface-700 text-white font-mono text-sm resize-none focus:outline-none placeholder-surface-600"
        spellcheck="false"
      />
    </div>
  </div>

  <!-- Error -->
  {#if error}
    <div class="flex items-center gap-2 px-4 py-3 rounded-lg bg-error-500/10 border border-error-500/20 text-error-400 text-sm">
      <svg viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 flex-shrink-0"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/></svg>
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
    <p class="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-3">Quick Reference</p>
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {#each [['A', '41'], ['Z', '5A'], ['0', '30'], ['9', '39'], [' ', '20'], ['!', '21'], ['\n', '0A'], ['\t', '09']] as [char, hex]}
        <div class="flex items-center gap-2 px-2 py-1.5 rounded bg-surface-700">
          <span class="font-mono text-xs text-primary-400 w-4 text-center">{char === '\n' ? '\\n' : char === '\t' ? '\\t' : char}</span>
          <span class="text-surface-500 text-xs">→</span>
          <span class="font-mono text-xs text-surface-300">{hex}</span>
        </div>
      {/each}
    </div>
  </div>
</div>
