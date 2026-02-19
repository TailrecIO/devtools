<script lang="ts">
  let input = '';
  let output = '';
  let mode: 'escape' | 'unescape' = 'escape';
  let includeQuotes = false;
  let error = '';
  let copied = false;

  function process() {
    error = '';
    if (!input) { output = ''; return; }
    try {
      if (mode === 'escape') {
        // JSON.stringify gives us the escaped string with surrounding double-quotes;
        // slice them off unless the user wants them included.
        const escaped = JSON.stringify(input);
        output = includeQuotes ? escaped : escaped.slice(1, -1);
      } else {
        // Accept input with or without surrounding double-quotes.
        let s = input.trim();
        if (!s.startsWith('"')) s = `"${s}"`;
        if (!s.endsWith('"') || s.length < 2) throw new Error('Input must be a valid JSON string value.');
        output = JSON.parse(s) as string;
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
    mode = mode === 'escape' ? 'unescape' : 'escape';
    if (input) process();
  }

  async function copyOutput() {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    copied = true;
    setTimeout(() => (copied = false), 2000);
  }

  function clear() { input = ''; output = ''; error = ''; }

  function loadSample() {
    if (mode === 'escape') {
      input = 'Hello, "World"!\nThis has a tab:\there.\nAnd a backslash: C:\\Users\\dev';
    } else {
      input = 'Hello, \\"World\\"!\\nThis has a tab:\\there.\\nAnd a backslash: C:\\\\Users\\\\dev';
    }
    process();
  }

  $: input, includeQuotes, process();

  // Diff-style: count of escape sequences added/removed
  $: escapeStats = (() => {
    if (!input || !output || error) return null;
    const sequences: Array<[string, string]> = [
      ['\\n', 'newline'], ['\\t', 'tab'], ['\\r', 'carriage return'],
      ['\\\\', 'backslash'], ['\\"', 'quote'], ['\\b', 'backspace'],
      ['\\f', 'form feed']
    ];
    if (mode === 'escape') {
      const found = sequences.filter(([seq]) => output.includes(seq));
      return found.length > 0 ? found.map(([seq, label]) => `${seq} (${label})`) : null;
    }
    return null;
  })();
</script>

<svelte:head>
  <title>JSON Escape / Unescape — DevTools</title>
  <meta name="description" content="Escape a raw string for safe embedding as a JSON value, or unescape a JSON string back to plain text. Fast, private, and runs entirely in your browser." />
  <meta property="og:title" content="JSON Escape / Unescape — DevTools" />
  <meta property="og:description" content="Escape a raw string for safe embedding as a JSON value, or unescape a JSON string back to plain text. Fast, private, and runs entirely in your browser." />
</svelte:head>

<div class="space-y-6 w-full">
  <!-- Header -->
  <div>
    <div class="flex items-center gap-2 mb-1">
      <span class="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary-500/20 text-primary-400 uppercase tracking-wider">ESC</span>
      <h1 class="text-2xl font-bold text-white">JSON Escape / Unescape</h1>
    </div>
    <p class="text-surface-400 text-sm">Escape a raw string for safe embedding inside a JSON value, or unescape a JSON string back to plain text.</p>
  </div>

  <!-- Mode + Options row -->
  <div class="flex flex-wrap items-center gap-3">
    <div class="flex items-center gap-1 p-1 rounded-lg bg-surface-800 border border-surface-700">
      <button
        class="px-4 py-1.5 rounded-md text-sm font-medium transition-all {mode === 'escape' ? 'bg-primary-500 text-white' : 'text-surface-400 hover:text-white'}"
        on:click={() => { mode = 'escape'; process(); }}
      >Escape</button>
      <button
        class="px-4 py-1.5 rounded-md text-sm font-medium transition-all {mode === 'unescape' ? 'bg-primary-500 text-white' : 'text-surface-400 hover:text-white'}"
        on:click={() => { mode = 'unescape'; process(); }}
      >Unescape</button>
    </div>

    {#if mode === 'escape'}
      <label class="flex items-center gap-2 cursor-pointer select-none">
        <input type="checkbox" class="sr-only" bind:checked={includeQuotes} />
        <div class="w-8 h-4 rounded-full transition-colors relative {includeQuotes ? 'bg-primary-500' : 'bg-surface-600'}">
          <div class="absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform {includeQuotes ? 'translate-x-4' : 'translate-x-0.5'}"></div>
        </div>
        <span class="text-xs text-surface-400">Include surrounding quotes</span>
      </label>
    {/if}

    <button
      on:click={loadSample}
      class="text-xs px-2.5 py-1 rounded-md bg-surface-800 border border-surface-700 text-surface-400 hover:text-white hover:border-surface-600 transition-all"
    >
      Load sample
    </button>
  </div>

  <!-- IO Area -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <div class="space-y-2">
      <div class="flex items-center h-8">
        <span class="text-xs font-semibold text-surface-400 uppercase tracking-wider">
          {mode === 'escape' ? 'Raw String Input' : 'Escaped JSON String'}
        </span>
      </div>
      <textarea
        bind:value={input}
        on:input={process}
        placeholder={mode === 'escape'
          ? 'Enter text with newlines, tabs, quotes...'
          : 'Enter escaped JSON string (e.g. Hello\\nWorld)'}
        class="w-full h-80 px-3 py-3 rounded-lg bg-surface-800 border text-white font-mono text-sm resize-none focus:outline-none placeholder-surface-600 transition-colors
          {error ? 'border-error-500/50 focus:border-error-500' : 'border-surface-700 focus:border-primary-500'}"
        spellcheck="false"
      />
    </div>

    <div class="space-y-2">
      <div class="flex items-center justify-between h-8">
        <span class="text-xs font-semibold text-surface-400 uppercase tracking-wider">
          {mode === 'escape' ? 'Escaped Output' : 'Unescaped Output'}
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
        class="w-full h-80 px-3 py-3 rounded-lg bg-surface-800 border border-surface-700 text-white font-mono text-sm resize-none focus:outline-none placeholder-surface-600"
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

  {#if escapeStats && escapeStats.length > 0}
    <div class="flex items-center gap-2 flex-wrap">
      <span class="text-xs text-surface-500">Sequences escaped:</span>
      {#each escapeStats as seq}
        <span class="font-mono text-[11px] px-2 py-0.5 rounded bg-warning-500/10 border border-warning-500/20 text-warning-400">{seq}</span>
      {/each}
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

  <!-- Reference table -->
  <div class="rounded-lg bg-surface-800 border border-surface-700 p-4">
    <p class="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-3">Escape Sequences</p>
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {#each [['\\n', 'Newline (LF)'], ['\\t', 'Horizontal tab'], ['\\r', 'Carriage return'], ['\\\\', 'Backslash'], ['\\"', 'Double quote'], ['\\b', 'Backspace'], ['\\f', 'Form feed'], ['\\uXXXX', 'Unicode']] as [seq, label]}
        <div class="flex items-center gap-2 px-2 py-1.5 rounded bg-surface-700">
          <span class="font-mono text-xs text-primary-400 w-16 flex-shrink-0">{seq}</span>
          <span class="text-surface-500 text-[11px]">{label}</span>
        </div>
      {/each}
    </div>
  </div>
</div>
