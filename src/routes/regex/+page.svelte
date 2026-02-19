<script lang="ts">
  interface MatchResult {
    value: string;
    index: number;
    groups: (string | undefined)[];
    namedGroups: Record<string, string | undefined> | null;
  }

  // ─── State ────────────────────────────────────────────────────
  let pattern = '';
  let flagG = true;
  let flagI = false;
  let flagM = false;
  let flagS = false;
  let flagU = false;

  let testString = '';
  let showReplace = false;
  let replaceWith = '';

  let matches: MatchResult[] = [];
  let replaceResult = '';
  let error = '';

  let copiedReplace = false;

  // ─── Derived ──────────────────────────────────────────────────
  $: flagString = [flagG ? 'g' : '', flagI ? 'i' : '', flagM ? 'm' : '', flagS ? 's' : '', flagU ? 'u' : ''].join('');
  $: regexDisplay = pattern ? `/${pattern}/${flagString}` : '';
  $: isValid = pattern !== '' && error === '';

  // ─── Process ──────────────────────────────────────────────────
  function process() {
    error = '';
    matches = [];
    replaceResult = '';

    if (!pattern) return;

    let regex: RegExp;
    try {
      regex = new RegExp(pattern, flagString);
    } catch (e) {
      error = e instanceof Error ? e.message : 'Invalid regex';
      return;
    }

    if (!testString) return;

    try {
      // Always search globally to find all match positions for highlighting
      const searchRegex = new RegExp(
        regex.source,
        regex.flags.includes('g') ? regex.flags : regex.flags + 'g'
      );

      let m: RegExpExecArray | null;
      while ((m = searchRegex.exec(testString)) !== null) {
        matches.push({
          value: m[0],
          index: m.index,
          groups: m.slice(1),
          namedGroups: m.groups ?? null
        });
        if (m[0].length === 0) searchRegex.lastIndex++; // avoid infinite loop on zero-length matches
        if (matches.length >= 500) break;
      }

      if (showReplace) {
        replaceResult = testString.replace(regex, replaceWith);
      }
    } catch (e) {
      error = e instanceof Error ? e.message : 'Regex execution error';
    }
  }

  // ─── Highlighted HTML ─────────────────────────────────────────
  function esc(text: string): string {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // Cycle through a few distinct highlight colours for visual separation
  const HIGHLIGHT_CLASSES = [
    'bg-primary-500/25 text-primary-200 outline outline-1 outline-primary-500/40',
    'bg-warning-500/20 text-warning-200 outline outline-1 outline-warning-500/30',
    'bg-success-500/20 text-success-200 outline outline-1 outline-success-500/30'
  ];

  $: highlightedHtml = (() => {
    if (!testString) return '';
    if (!matches.length || error || !pattern) return esc(testString);

    let html = '';
    let last = 0;

    matches.forEach((m, i) => {
      if (m.index > last) html += esc(testString.slice(last, m.index));
      const cls = HIGHLIGHT_CLASSES[i % HIGHLIGHT_CLASSES.length];
      html += `<mark class="rounded-sm px-0.5 ${cls}" title="Match ${i + 1}">${esc(m.value) || '&#8203;'}</mark>`;
      last = m.index + m.value.length;
    });

    if (last < testString.length) html += esc(testString.slice(last));
    return html;
  })();

  // ─── Reactivity ───────────────────────────────────────────────
  $: pattern, flagString, testString, replaceWith, showReplace, process();

  // ─── Quick reference ─────────────────────────────────────────
  const QUICK_REF = [
    { token: '.', desc: 'Any character (except newline)' },
    { token: '\\d', desc: 'Digit [0–9]' },
    { token: '\\D', desc: 'Non-digit' },
    { token: '\\w', desc: 'Word char [a-zA-Z0-9_]' },
    { token: '\\W', desc: 'Non-word char' },
    { token: '\\s', desc: 'Whitespace' },
    { token: '\\S', desc: 'Non-whitespace' },
    { token: '\\b', desc: 'Word boundary' },
    { token: '^', desc: 'Start of string / line (m)' },
    { token: '$', desc: 'End of string / line (m)' },
    { token: '*', desc: '0 or more (greedy)' },
    { token: '+', desc: '1 or more (greedy)' },
    { token: '?', desc: '0 or 1 (or lazy)' },
    { token: '{n,m}', desc: 'Between n and m times' },
    { token: '(abc)', desc: 'Capture group' },
    { token: '(?:abc)', desc: 'Non-capture group' },
    { token: '(?<n>abc)', desc: 'Named capture group' },
    { token: 'a|b', desc: 'Alternation (a or b)' },
    { token: '[abc]', desc: 'Character class' },
    { token: '[^abc]', desc: 'Negated class' }
  ];

  const SAMPLES = [
    { label: 'Email', pattern: '[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}', flags: { g: true, i: true, m: false, s: false, u: false }, text: 'Contact us at hello@example.com or support@dev.tools for help.' },
    { label: 'URL', pattern: 'https?:\\/\\/[^\\s/$.?#].[^\\s]*', flags: { g: true, i: false, m: false, s: false, u: false }, text: 'Visit https://example.com or http://docs.example.org/guide for docs.' },
    { label: 'IPv4', pattern: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b', flags: { g: true, i: false, m: false, s: false, u: false }, text: 'Servers: 192.168.1.1, 10.0.0.254, and the gateway 172.16.0.1' },
    { label: 'Hex colour', pattern: '#(?:[0-9a-fA-F]{3}){1,2}\\b', flags: { g: true, i: false, m: false, s: false, u: false }, text: 'Palette: #fff, #333333, #1a2b3c, and the brand colour #7C3AED.' }
  ];

  function loadSample(s: typeof SAMPLES[number]) {
    pattern = s.pattern;
    flagG = s.flags.g; flagI = s.flags.i; flagM = s.flags.m;
    flagS = s.flags.s; flagU = s.flags.u;
    testString = s.text;
  }

  async function copyReplace() {
    if (!replaceResult) return;
    await navigator.clipboard.writeText(replaceResult);
    copiedReplace = true;
    setTimeout(() => (copiedReplace = false), 2000);
  }
</script>

<svelte:head>
  <title>Regex Tester — DevTools</title>
  <meta name="description" content="Test regular expressions with live match highlighting, capture group inspection, and string replace. Supports all JavaScript regex flags (g, i, m, s, u)." />
  <meta property="og:title" content="Regex Tester — DevTools" />
  <meta property="og:description" content="Test regular expressions with live match highlighting, capture group inspection, and string replace. Supports all JavaScript regex flags (g, i, m, s, u)." />
</svelte:head>

<div class="space-y-5 w-full">

  <!-- ── Header ──────────────────────────────────────────────── -->
  <div class="flex items-start justify-between gap-4 flex-wrap">
    <div>
      <div class="flex items-center gap-2 mb-1">
        <span class="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary-500/20 text-primary-400 uppercase tracking-wider">RE</span>
        <h1 class="text-2xl font-bold text-white">Regex Tester</h1>
      </div>
      <p class="text-surface-400 text-sm">Test regular expressions with live match highlighting, capture groups, and replace.</p>
    </div>
    <div class="flex items-center gap-2 flex-wrap">
      <span class="text-xs text-surface-500">Samples:</span>
      {#each SAMPLES as s}
        <button
          on:click={() => loadSample(s)}
          class="text-xs px-2.5 py-1 rounded-md bg-surface-800 border border-surface-700 text-surface-400 hover:text-white hover:border-surface-600 transition-all"
        >{s.label}</button>
      {/each}
    </div>
  </div>

  <!-- ── Pattern bar ──────────────────────────────────────────── -->
  <div class="rounded-xl bg-surface-800 border border-surface-700 p-4 space-y-3">
    <div class="flex items-center gap-3">
      <!-- Pattern input -->
      <div class="relative flex-1">
        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500 font-mono text-sm select-none">/</span>
        <input
          bind:value={pattern}
          type="text"
          placeholder="pattern"
          class="w-full pl-6 pr-6 py-2.5 rounded-lg bg-surface-700 border text-white font-mono text-sm focus:outline-none transition-colors
            {error ? 'border-error-500/60 focus:border-error-500' : 'border-surface-600 focus:border-primary-500'}"
          spellcheck="false"
          autocomplete="off"
        />
        <span class="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 font-mono text-sm select-none">/</span>
      </div>

      <!-- Flags -->
      <div class="flex items-center gap-1">
        {#each [
          { key: 'g', label: 'g', title: 'Global — find all matches', bind: flagG },
          { key: 'i', label: 'i', title: 'Case insensitive', bind: flagI },
          { key: 'm', label: 'm', title: 'Multiline — ^ and $ match line boundaries', bind: flagM },
          { key: 's', label: 's', title: 'Dotall — . matches newlines', bind: flagS },
          { key: 'u', label: 'u', title: 'Unicode mode', bind: flagU }
        ] as flag}
          <button
            title={flag.title}
            class="w-7 h-7 rounded font-mono text-xs font-bold transition-all
              {flag.bind ? 'bg-primary-500/20 text-primary-400 border border-primary-500/40' : 'bg-surface-700 text-surface-500 border border-surface-600 hover:text-white'}"
            on:click={() => {
              if (flag.key === 'g') flagG = !flagG;
              else if (flag.key === 'i') flagI = !flagI;
              else if (flag.key === 'm') flagM = !flagM;
              else if (flag.key === 's') flagS = !flagS;
              else if (flag.key === 'u') flagU = !flagU;
            }}
          >{flag.label}</button>
        {/each}
      </div>

      <!-- Status / count -->
      <div class="flex items-center gap-2 min-w-max">
        {#if error}
          <span class="text-xs text-error-400 flex items-center gap-1.5">
            <svg viewBox="0 0 16 16" fill="currentColor" class="w-3.5 h-3.5 flex-shrink-0"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/><path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/></svg>
            Invalid
          </span>
        {:else if pattern && testString}
          <span class="font-mono text-xs px-2.5 py-1 rounded-full
            {matches.length > 0 ? 'bg-success-500/15 text-success-400 border border-success-500/20' : 'bg-surface-700 text-surface-400'}">
            {matches.length} match{matches.length !== 1 ? 'es' : ''}
          </span>
        {:else if pattern && isValid}
          <span class="text-xs text-success-400 flex items-center gap-1.5">
            <svg viewBox="0 0 16 16" fill="currentColor" class="w-3.5 h-3.5"><path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/></svg>
            Valid
          </span>
        {/if}
      </div>
    </div>

    <!-- Regex display + error -->
    {#if regexDisplay}
      <div class="flex items-start gap-3">
        <span class="font-mono text-xs text-surface-500 bg-surface-700 px-3 py-1.5 rounded-lg border border-surface-600 break-all">{regexDisplay}</span>
      </div>
    {/if}
    {#if error}
      <p class="text-xs font-mono text-error-400 pl-1">{error}</p>
    {/if}
  </div>

  <!-- ── Main IO: input + highlighted ────────────────────────── -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <!-- Test string -->
    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <span class="text-xs font-semibold text-surface-400 uppercase tracking-wider">Test String</span>
        <span class="text-xs text-surface-500 font-mono">{testString.length} chars · {testString.split('\n').length} lines</span>
      </div>
      <textarea
        bind:value={testString}
        placeholder="Enter test string here..."
        class="w-full h-96 px-3 py-3 rounded-lg bg-surface-800 border border-surface-700 text-white font-mono text-sm resize-none focus:outline-none focus:border-primary-500 placeholder-surface-600 transition-colors"
        spellcheck="false"
      />
    </div>

    <!-- Highlighted output -->
    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <span class="text-xs font-semibold text-surface-400 uppercase tracking-wider">Highlighted Matches</span>
        {#if matches.length > 0}
          <div class="flex items-center gap-2 text-xs text-surface-500">
            {#each HIGHLIGHT_CLASSES.slice(0, Math.min(3, matches.length)) as cls, i}
              <span class="font-mono px-1.5 py-0.5 rounded text-[10px] {cls}">#{i + 1}</span>
            {/each}
            {#if matches.length > 3}<span class="text-surface-600">…</span>{/if}
          </div>
        {/if}
      </div>
      <pre
        class="w-full h-96 px-3 py-3 rounded-lg bg-surface-800 border border-surface-700 font-mono text-sm overflow-auto whitespace-pre-wrap break-words leading-relaxed"
        style="word-break: break-all;"
      >{#if testString}{@html highlightedHtml}{:else}<span class="text-surface-600">Highlighted output will appear here...</span>{/if}</pre>
    </div>
  </div>

  <!-- ── Match list ───────────────────────────────────────────── -->
  {#if matches.length > 0}
    <div class="rounded-xl bg-surface-800 border border-surface-700 overflow-hidden">
      <div class="flex items-center justify-between px-4 py-3 border-b border-surface-700">
        <span class="text-xs font-semibold text-surface-400 uppercase tracking-wider">Matches</span>
        <span class="font-mono text-xs text-success-400 bg-success-500/10 px-2 py-0.5 rounded-full border border-success-500/20">{matches.length}</span>
      </div>
      <div class="divide-y divide-surface-700/60 max-h-72 overflow-y-auto">
        {#each matches as m, i}
          <div class="flex items-start gap-4 px-4 py-2.5 hover:bg-surface-700/30 transition-colors">
            <!-- Index badge -->
            <span class="flex-shrink-0 w-6 h-6 rounded flex items-center justify-center font-mono text-[10px] font-bold mt-0.5
              {HIGHLIGHT_CLASSES[i % HIGHLIGHT_CLASSES.length]}">
              {i + 1}
            </span>

            <!-- Value -->
            <div class="flex-1 min-w-0 space-y-1">
              <div class="flex items-baseline gap-3 flex-wrap">
                <code class="font-mono text-sm text-white bg-surface-700 px-2 py-0.5 rounded border border-surface-600 break-all"
                >{m.value === '' ? '(empty)' : m.value}</code>
                <span class="text-xs text-surface-500 font-mono flex-shrink-0">
                  pos {m.index}–{m.index + m.value.length}
                  &nbsp;·&nbsp;
                  len {m.value.length}
                </span>
              </div>

              <!-- Named groups -->
              {#if m.namedGroups && Object.keys(m.namedGroups).length > 0}
                <div class="flex flex-wrap gap-2 pt-0.5">
                  {#each Object.entries(m.namedGroups) as [name, val]}
                    <span class="text-[11px] font-mono">
                      <span class="text-primary-400">{name}</span>
                      <span class="text-surface-500">: </span>
                      <span class="text-surface-300">{val ?? 'undefined'}</span>
                    </span>
                  {/each}
                </div>
              <!-- Numbered groups (only if no named groups) -->
              {:else if m.groups.some(g => g !== undefined)}
                <div class="flex flex-wrap gap-2 pt-0.5">
                  {#each m.groups as g, gi}
                    {#if g !== undefined}
                      <span class="text-[11px] font-mono">
                        <span class="text-primary-400">${gi + 1}</span>
                        <span class="text-surface-500">: </span>
                        <span class="text-surface-300">{g}</span>
                      </span>
                    {/if}
                  {/each}
                </div>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    </div>
  {:else if pattern && testString && !error}
    <div class="flex items-center gap-2 px-4 py-3 rounded-xl bg-surface-800 border border-surface-700 text-surface-500 text-sm">
      <svg viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 flex-shrink-0 text-surface-600"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM6.75 9.25a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5z" clip-rule="evenodd"/></svg>
      No matches found
    </div>
  {/if}

  <!-- ── Replace ──────────────────────────────────────────────── -->
  <div class="rounded-xl border border-surface-700 overflow-hidden">
    <button
      class="w-full flex items-center justify-between px-4 py-3 bg-surface-800 hover:bg-surface-700/50 transition-colors"
      on:click={() => { showReplace = !showReplace; }}
    >
      <span class="text-xs font-semibold text-surface-400 uppercase tracking-wider">Replace</span>
      <svg
        viewBox="0 0 20 20" fill="currentColor"
        class="w-4 h-4 text-surface-500 transition-transform {showReplace ? 'rotate-180' : ''}"
      >
        <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd"/>
      </svg>
    </button>

    {#if showReplace}
      <div class="px-4 py-4 bg-surface-800/50 border-t border-surface-700 space-y-4">
        <div class="space-y-2">
          <div class="flex items-center gap-2">
            <span class="text-xs font-semibold text-surface-400 uppercase tracking-wider">Replace with</span>
            <span class="text-[10px] text-surface-600 font-mono">$1 $2 $&lt;name&gt; $& $' $`</span>
          </div>
          <input
            bind:value={replaceWith}
            type="text"
            placeholder="Replacement string (supports $1, $2, $&, $<name>)"
            class="w-full px-3 py-2.5 rounded-lg bg-surface-800 border border-surface-700 text-white font-mono text-sm focus:outline-none focus:border-primary-500 transition-colors placeholder-surface-600"
            spellcheck="false"
          />
        </div>

        {#if replaceResult !== '' || (pattern && testString)}
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold text-surface-400 uppercase tracking-wider">Result</span>
              <button
                on:click={copyReplace}
                disabled={!replaceResult && replaceResult !== ''}
                class="text-xs px-2.5 py-1 rounded-md transition-all
                  {copiedReplace ? 'bg-success-500/20 text-success-400' : 'bg-surface-700 text-surface-400 hover:text-white disabled:opacity-40'}"
              >{copiedReplace ? 'Copied!' : 'Copy'}</button>
            </div>
            <pre class="w-full min-h-16 max-h-48 px-3 py-3 rounded-lg bg-surface-800 border border-surface-700 font-mono text-sm text-surface-300 overflow-auto whitespace-pre-wrap break-all">{replaceResult}</pre>
          </div>
        {/if}
      </div>
    {/if}
  </div>

  <!-- ── Quick Reference ─────────────────────────────────────── -->
  <div class="rounded-xl bg-surface-800 border border-surface-700 overflow-hidden">
    <div class="px-4 py-3 border-b border-surface-700">
      <span class="text-xs font-semibold text-surface-400 uppercase tracking-wider">Quick Reference</span>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-surface-700">
      {#each QUICK_REF as ref}
        <div
          class="flex items-center gap-3 px-3 py-2 bg-surface-800 hover:bg-surface-750 cursor-pointer group"
          on:click={() => { pattern = ref.token; }}
          on:keypress={(e) => e.key === 'Enter' && (pattern = ref.token)}
          role="button"
          tabindex="0"
          title="Click to use"
        >
          <code class="font-mono text-xs text-primary-400 bg-surface-700 px-2 py-0.5 rounded w-20 flex-shrink-0 group-hover:bg-primary-500/20 transition-colors">{ref.token}</code>
          <span class="text-[11px] text-surface-500 group-hover:text-surface-300 transition-colors">{ref.desc}</span>
        </div>
      {/each}
    </div>
  </div>

</div>
