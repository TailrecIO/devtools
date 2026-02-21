<script lang="ts">
  import { CodeBlock } from '@skeletonlabs/skeleton';
  import TechnicalDetails from '$lib/components/TechnicalDetails.svelte';
  import CodeEditor from '$lib/components/CodeEditor.svelte';

  let input = '';
  let output = '';
  let error = '';
  let indent: 2 | 4 | 0 = 2; // 0 = tab
  let sortKeys = false;
  let mode: 'format' | 'minify' = 'format';

  function setIndent(v: number) { indent = v as 2 | 4 | 0; }
  function setMode(m: string) { mode = m as 'format' | 'minify'; }
  let copied = false;
  let stats: { keys: number; depth: number } | null = null;

  function sortObjectKeys(obj: unknown): unknown {
    if (Array.isArray(obj)) return obj.map(sortObjectKeys);
    if (obj !== null && typeof obj === 'object') {
      return Object.keys(obj as Record<string, unknown>)
        .sort()
        .reduce((acc: Record<string, unknown>, key) => {
          acc[key] = sortObjectKeys((obj as Record<string, unknown>)[key]);
          return acc;
        }, {});
    }
    return obj;
  }

  function getDepth(obj: unknown, depth = 0): number {
    if (Array.isArray(obj)) {
      if (obj.length === 0) return depth;
      return Math.max(...obj.map(v => getDepth(v, depth + 1)));
    }
    if (obj !== null && typeof obj === 'object') {
      const values = Object.values(obj as Record<string, unknown>);
      if (values.length === 0) return depth;
      return Math.max(...values.map(v => getDepth(v, depth + 1)));
    }
    return depth;
  }

  function countKeys(obj: unknown): number {
    if (Array.isArray(obj)) return obj.reduce((acc: number, v) => acc + countKeys(v), 0);
    if (obj !== null && typeof obj === 'object') {
      const keys = Object.keys(obj as Record<string, unknown>);
      return keys.length + keys.reduce((acc, k) => acc + countKeys((obj as Record<string, unknown>)[k]), 0);
    }
    return 0;
  }

  function process() {
    error = '';
    output = '';
    stats = null;
    if (!input.trim()) return;

    try {
      let parsed = JSON.parse(input);
      if (sortKeys) parsed = sortObjectKeys(parsed);

      if (mode === 'minify') {
        output = JSON.stringify(parsed);
      } else {
        const indentValue = indent === 0 ? '\t' : indent;
        output = JSON.stringify(parsed, null, indentValue);
      }

      stats = {
        keys: countKeys(parsed),
        depth: getDepth(parsed)
      };
    } catch (e) {
      error = e instanceof Error ? e.message : 'Invalid JSON';
    }
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
    stats = null;
  }

  function loadSample() {
    input = `{
  "name": "devtools",
  "version": "1.0.0",
  "author": {"name": "Developer", "email": "dev@example.com"},
  "tags": ["tools", "utilities", "developer"],
  "config": {"debug": false, "port": 3000, "maxRetries": 3}
}`;
    process();
  }

  // Process JSON when input, mode, indent, or sortKeys change
  $: input, mode, indent, sortKeys, process();
</script>

<svelte:head>
  <title>JSON Formatter — DevTools</title>
  <meta name="description" content="Prettify, minify, and validate JSON in your browser. Choose indentation style, sort keys alphabetically, and inspect structure — no data sent to servers." />
  <meta property="og:title" content="JSON Formatter — DevTools" />
  <meta property="og:description" content="Prettify, minify, and validate JSON in your browser. Choose indentation style, sort keys alphabetically, and inspect structure — no data sent to servers." />
</svelte:head>

<div class="space-y-6 w-full">
  <!-- Header -->
  <div>
    <div class="flex items-center gap-2 mb-1">
      <span class="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary-500/20 text-primary-400 uppercase tracking-wider">{'{ }'}</span>
      <h1 class="text-2xl font-bold text-white">JSON Formatter</h1>
    </div>
    <p class="text-surface-400 text-sm">Prettify, minify, and validate JSON with syntax highlighting.</p>
  </div>

  <!-- Options Row -->
  <div class="flex flex-wrap items-center gap-4">
    <!-- Mode Toggle -->
    <div class="flex items-center gap-1 p-1 rounded-lg bg-surface-800 border border-surface-700">
      <button
        class="px-3 py-1.5 rounded-md text-sm font-medium transition-all {mode === 'format' ? 'bg-primary-500 text-white' : 'text-surface-400 hover:text-white'}"
        on:click={() => { mode = 'format'; }}
      >Format</button>
      <button
        class="px-3 py-1.5 rounded-md text-sm font-medium transition-all {mode === 'minify' ? 'bg-primary-500 text-white' : 'text-surface-400 hover:text-white'}"
        on:click={() => { mode = 'minify'; }}
      >Minify</button>
    </div>

    <!-- Indent (only for format mode) -->
    {#if mode === 'format'}
      <div class="flex items-center gap-2">
        <span class="text-xs text-surface-500">Indent:</span>
        <div class="flex items-center gap-1 p-1 rounded-lg bg-surface-800 border border-surface-700">
          {#each [{ label: '2', value: 2 }, { label: '4', value: 4 }, { label: 'Tab', value: 0 }] as opt}
            <button
              class="px-2.5 py-1 rounded-md text-xs font-mono font-medium transition-all {indent === opt.value ? 'bg-surface-600 text-white' : 'text-surface-400 hover:text-white'}"
              on:click={() => setIndent(opt.value)}
            >{opt.label}</button>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Sort Keys -->
    <label class="flex items-center gap-2 cursor-pointer select-none">
      <input type="checkbox" class="sr-only" bind:checked={sortKeys} />
      <div class="w-8 h-4 rounded-full transition-colors relative {sortKeys ? 'bg-primary-500' : 'bg-surface-600'}">
        <div class="absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform {sortKeys ? 'translate-x-4' : 'translate-x-0.5'}"></div>
      </div>
      <span class="text-xs text-surface-400">Sort keys</span>
    </label>

    <button on:click={loadSample} class="text-xs px-2.5 py-1 rounded-md bg-surface-800 border border-surface-700 text-surface-400 hover:text-white hover:border-surface-600 transition-all">
      Load sample
    </button>
  </div>

  <!-- IO Area -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <!-- Input -->
    <div class="space-y-2">
      <div class="flex items-center justify-between h-8">
        <span class="text-xs font-semibold text-surface-400 uppercase tracking-wider">Input</span>
        <div class="flex items-center gap-2">
          {#if error}
            <span class="text-xs text-error-400 flex items-center gap-1">
              <svg viewBox="0 0 16 16" fill="currentColor" class="w-3 h-3"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/><path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/></svg>
              Invalid JSON
            </span>
          {:else if output}
            <span class="text-xs text-success-400 flex items-center gap-1">
              <svg viewBox="0 0 20 20" fill="currentColor" class="w-3 h-3"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd"/></svg>
              Valid JSON
            </span>
          {/if}
        </div>
      </div>
      <CodeEditor
        bind:value={input}
        language="json"
        placeholderText="Enter or paste JSON here..."
        minHeight="32rem"
      />
    </div>

    <!-- Output -->
    <div class="space-y-2">
      <div class="flex items-center justify-between h-8">
        <div class="flex items-center gap-3">
          <span class="text-xs font-semibold text-surface-400 uppercase tracking-wider">Output</span>
          {#if stats}
            <span class="text-[10px] text-surface-500 font-mono">{stats.keys} keys · depth {stats.depth}</span>
          {/if}
        </div>
        <button
          on:click={copyOutput}
          disabled={!output}
          class="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md transition-all
            {copied ? 'bg-success-500/20 text-success-400' : 'bg-surface-700 text-surface-400 hover:text-white hover:bg-surface-600 disabled:opacity-40 disabled:cursor-not-allowed'}"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      {#if output}
        <CodeEditor
          value={output}
          language="json"
          readonly={true}
          minHeight="32rem"
        />
      {:else}
        <div class="h-[32rem] rounded-lg border border-surface-700 bg-surface-800 flex items-center justify-center">
          <p class="text-surface-600 text-sm">Formatted output will appear here</p>
        </div>
      {/if}
    </div>
  </div>

  <!-- Error -->
  {#if error}
    <div class="flex items-start gap-2 px-4 py-3 rounded-lg bg-error-500/10 border border-error-500/20 text-error-400 text-sm">
      <svg viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 flex-shrink-0 mt-0.5">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/>
      </svg>
      <span class="font-mono">{error}</span>
    </div>
  {/if}

  <!-- Actions -->
  <div class="flex items-center gap-2">
    <button
      on:click={clear}
      class="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-surface-800 border border-surface-700 text-surface-400 hover:text-white hover:border-surface-600 transition-all"
    >
      Clear
    </button>
  </div>

  <TechnicalDetails
    title="Understanding JSON Format"
    sections={[
      {
        heading: "What is JSON?",
        content: "JSON (JavaScript Object Notation) is a lightweight, text-based data format for exchanging structured data between systems. It's human-readable and language-independent, making it the de facto standard for web APIs. JSON supports objects (key-value pairs), arrays, strings, numbers, booleans, and null."
      },
      {
        heading: "JSON Syntax Rules",
        content: "Keys must be double-quoted strings. String values must use double quotes, not single quotes. No trailing commas allowed after the last item. Numbers don't need quotes. Only these types are valid: object, array, string, number, true, false, null. Comments are NOT allowed in JSON (use JSON5 if you need comments)."
      },
      {
        heading: "Prettify vs Minify",
        content: "Prettify (format) adds whitespace and line breaks for readability, useful for debugging and human inspection. Minify removes all unnecessary whitespace, reducing file size for transmission. APIs often return minified JSON to save bandwidth. Use prettify during development, minify for production."
      },
      {
        heading: "Common JSON Errors",
        content: "Single quotes instead of double quotes, trailing commas after last array/object element, unquoted keys, comments (use // or /* */), undefined values (use null instead), circular references, dates (JSON has no date type, use ISO 8601 strings), NaN or Infinity (not valid JSON)."
      },
      {
        heading: "Best Practices",
        content: "Always validate JSON before sending it. Use consistent indentation (2 or 4 spaces). Keep keys meaningful and concise. Use camelCase or snake_case consistently. For dates, use ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ). For large numbers, consider strings to avoid precision loss. Sort keys alphabetically for easier comparison and version control."
      }
    ]}
  />
</div>
