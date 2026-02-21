<script lang="ts">
  import { v1, v4, v5 } from 'uuid';
  import TechnicalDetails from '$lib/components/TechnicalDetails.svelte';

  type Version = 1 | 4 | 5;

  let version: Version = 4;
  let count = 5;
  let namespaceName: 'dns' | 'url' | 'oid' | 'custom' = 'url';

  function setVersion(v: number) { version = v as Version; }
  function setNamespace(ns: string) { namespaceName = ns as 'dns' | 'url' | 'oid' | 'custom'; }
  let customNamespace = '';
  let nameInput = 'example.com';
  let uuids: string[] = [];
  let error = '';
  let copiedIndex = -1;
  let copiedAll = false;

  const NAMESPACES: Record<string, string> = {
    dns: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
    url: '6ba7b811-9dad-11d1-80b4-00c04fd430c8',
    oid: '6ba7b812-9dad-11d1-80b4-00c04fd430c8'
  };

  const VERSION_INFO: Record<Version, { label: string; description: string }> = {
    1: { label: 'v1', description: 'Time-based — Uses current timestamp and a random node identifier.' },
    4: { label: 'v4', description: 'Random — Cryptographically random. Most widely used.' },
    5: { label: 'v5', description: 'Name-based (SHA-1) — Deterministic UUID from a namespace + name pair.' }
  };

  function generate() {
    error = '';
    uuids = [];

    try {
      for (let i = 0; i < count; i++) {
        if (version === 1) {
          uuids.push(v1());
        } else if (version === 4) {
          uuids.push(v4());
        } else if (version === 5) {
          const ns = namespaceName === 'custom' ? customNamespace : NAMESPACES[namespaceName];
          if (!ns) throw new Error('Please enter a custom namespace UUID.');
          uuids.push(v5(nameInput || 'example', ns));
        }
      }
    } catch (e) {
      error = e instanceof Error ? e.message : 'Generation failed';
    }
  }

  async function copyOne(uuid: string, index: number) {
    await navigator.clipboard.writeText(uuid);
    copiedIndex = index;
    setTimeout(() => (copiedIndex = -1), 2000);
  }

  async function copyAll() {
    if (!uuids.length) return;
    await navigator.clipboard.writeText(uuids.join('\n'));
    copiedAll = true;
    setTimeout(() => (copiedAll = false), 2000);
  }

  // Auto-generate on mount with default settings
  generate();
</script>

<svelte:head>
  <title>UUID Generator — DevTools</title>
  <meta name="description" content="Generate UUIDs in version 1 (time-based), v4 (random), or v5 (namespace + name). Bulk generation up to 50 UUIDs at once. Runs entirely in your browser." />
  <meta property="og:title" content="UUID Generator — DevTools" />
  <meta property="og:description" content="Generate UUIDs in version 1 (time-based), v4 (random), or v5 (namespace + name). Bulk generation up to 50 UUIDs at once. Runs entirely in your browser." />
</svelte:head>

<div class="space-y-6 w-full">
  <!-- Header -->
  <div>
    <div class="flex items-center gap-2 mb-1">
      <span class="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary-500/20 text-primary-400 uppercase tracking-wider">UID</span>
      <h1 class="text-2xl font-bold text-white">UUID Generator</h1>
    </div>
    <p class="text-surface-400 text-sm">Generate universally unique identifiers in version 1, 4, or 5 format.</p>
  </div>

  <!-- Config Panel -->
  <div class="rounded-xl bg-surface-800 border border-surface-700 p-5 space-y-5">
    <!-- Version Selector -->
    <div class="space-y-2">
      <span class="text-xs font-semibold text-surface-400 uppercase tracking-wider">Version</span>
      <div class="grid grid-cols-3 gap-2">
        {#each [1, 4, 5] as v}
          <button
            on:click={() => setVersion(v)}
            class="p-3 rounded-lg border text-left transition-all
              {version === v
                ? 'bg-primary-500/15 border-primary-500/40 text-white'
                : 'bg-surface-700 border-surface-600 text-surface-400 hover:border-surface-500 hover:text-white'}"
          >
            <div class="font-mono font-bold text-sm mb-0.5
              {version === v ? 'text-primary-400' : 'text-surface-400'}">
              UUID {VERSION_INFO[v].label}
            </div>
            <div class="text-xs leading-relaxed
              {version === v ? 'text-surface-300' : 'text-surface-500'}">
              {VERSION_INFO[v].description}
            </div>
          </button>
        {/each}
      </div>
    </div>

    <!-- v5 Options -->
    {#if version === 5}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
        <div class="space-y-2">
          <span class="text-xs font-semibold text-surface-400 uppercase tracking-wider">Namespace</span>
          <div class="flex items-center gap-1 p-1 rounded-lg bg-surface-700 border border-surface-600">
            {#each [{ label: 'DNS', value: 'dns' }, { label: 'URL', value: 'url' }, { label: 'OID', value: 'oid' }, { label: 'Custom', value: 'custom' }] as ns}
              <button
                class="flex-1 py-1.5 rounded-md text-xs font-medium transition-all {namespaceName === ns.value ? 'bg-surface-500 text-white' : 'text-surface-400 hover:text-white'}"
                on:click={() => setNamespace(ns.value)}
              >{ns.label}</button>
            {/each}
          </div>
          {#if namespaceName === 'custom'}
            <input
              bind:value={customNamespace}
              type="text"
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              class="w-full px-3 py-2 rounded-lg bg-surface-700 border border-surface-600 text-white font-mono text-xs focus:outline-none focus:border-primary-500 transition-colors placeholder-surface-500"
              spellcheck="false"
            />
          {:else}
            <p class="font-mono text-[10px] text-surface-500 break-all px-1">{NAMESPACES[namespaceName]}</p>
          {/if}
        </div>

        <div class="space-y-2">
          <span class="text-xs font-semibold text-surface-400 uppercase tracking-wider">Name</span>
          <input
            bind:value={nameInput}
            type="text"
            placeholder="example.com"
            class="w-full px-3 py-2 rounded-lg bg-surface-700 border border-surface-600 text-white font-mono text-sm focus:outline-none focus:border-primary-500 transition-colors placeholder-surface-500"
            spellcheck="false"
          />
          <p class="text-xs text-surface-500">Same namespace + name always produces the same UUID.</p>
        </div>
      </div>
    {/if}

    <!-- Count -->
    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <span class="text-xs font-semibold text-surface-400 uppercase tracking-wider">Count</span>
        <span class="font-mono text-xs text-primary-400">{count}</span>
      </div>
      <div class="flex items-center gap-3">
        <input
          type="range"
          bind:value={count}
          min="1"
          max="50"
          class="flex-1 accent-primary-500"
        />
        <input
          type="number"
          bind:value={count}
          min="1"
          max="50"
          class="w-16 px-2 py-1.5 rounded-lg bg-surface-700 border border-surface-600 text-white text-sm text-center font-mono focus:outline-none focus:border-primary-500 transition-colors"
        />
      </div>
    </div>

    <!-- Generate Button -->
    <button
      on:click={generate}
      class="w-full py-2.5 rounded-lg bg-primary-500 hover:bg-primary-400 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
    >
      <svg viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
        <path fill-rule="evenodd" d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm1.23-3.723a.75.75 0 00.219-.53V2.929a.75.75 0 00-1.5 0V5.36l-.31-.31A7 7 0 003.239 8.188a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 000 1.5h4.243a.75.75 0 00.53-.219z" clip-rule="evenodd"/>
      </svg>
      Generate {count} UUID{count !== 1 ? 's' : ''}
    </button>
  </div>

  <!-- Error -->
  {#if error}
    <div class="flex items-center gap-2 px-4 py-3 rounded-lg bg-error-500/10 border border-error-500/20 text-error-400 text-sm">
      <svg viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 flex-shrink-0"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/></svg>
      {error}
    </div>
  {/if}

  <!-- Results -->
  {#if uuids.length > 0}
    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <span class="text-xs font-semibold text-surface-400 uppercase tracking-wider">
          Generated UUIDs <span class="text-surface-600 normal-case">({uuids.length})</span>
        </span>
        <button
          on:click={copyAll}
          class="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md transition-all
            {copiedAll ? 'bg-success-500/20 text-success-400' : 'bg-surface-700 text-surface-400 hover:text-white'}"
        >
          {copiedAll ? 'Copied all!' : 'Copy all'}
        </button>
      </div>

      <div class="rounded-xl border border-surface-700 overflow-hidden divide-y divide-surface-700/50">
        {#each uuids as uuid, i}
          <div class="flex items-center justify-between px-4 py-2.5 bg-surface-800 hover:bg-surface-700/50 transition-colors group">
            <div class="flex items-center gap-3">
              <span class="text-[10px] font-mono text-surface-600 w-5 text-right">{i + 1}</span>
              <span class="font-mono text-sm text-white tracking-wider">{uuid}</span>
            </div>
            <button
              on:click={() => copyOne(uuid, i)}
              class="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-xs px-2 py-1 rounded-md transition-all
                {copiedIndex === i ? 'bg-success-500/20 text-success-400 opacity-100' : 'bg-surface-600 text-surface-400 hover:text-white'}"
            >
              {#if copiedIndex === i}
                <svg viewBox="0 0 20 20" fill="currentColor" class="w-3 h-3"><path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd"/></svg>
              {:else}
                <svg viewBox="0 0 20 20" fill="currentColor" class="w-3 h-3"><path d="M7 3.5A1.5 1.5 0 018.5 2h3.879a1.5 1.5 0 011.06.44l3.122 3.12A1.5 1.5 0 0117 6.622V12.5a1.5 1.5 0 01-1.5 1.5h-1v-3.379a3 3 0 00-.879-2.121L10.5 5.379A3 3 0 008.379 4.5H7v-1z"/><path d="M4.5 6A1.5 1.5 0 003 7.5v9A1.5 1.5 0 004.5 18h7a1.5 1.5 0 001.5-1.5v-5.879a1.5 1.5 0 00-.44-1.06L9.44 6.439A1.5 1.5 0 008.378 6H4.5z"/></svg>
              {/if}
              {copiedIndex === i ? 'Copied' : 'Copy'}
            </button>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <TechnicalDetails
    title="Understanding UUID Versions"
    sections={[
      {
        heading: "What is a UUID?",
        content: "UUID (Universally Unique Identifier) is a 128-bit number displayed as 32 hexadecimal digits in groups of 8-4-4-4-12 (e.g., 550e8400-e29b-41d4-a716-446655440000). UUIDs are designed to be unique across space and time without requiring a central authority."
      },
      {
        heading: "UUID Version 1 (Time-based)",
        content: "Generated from the current timestamp and MAC address of the computer. Pros: Sortable by creation time, guaranteed uniqueness if MAC is unique. Cons: Reveals the computer's MAC address and creation time, privacy concerns. Use when: You need time-ordered IDs and privacy isn't a concern."
      },
      {
        heading: "UUID Version 4 (Random)",
        content: "Generated from random or pseudo-random numbers. 122 bits are random. Pros: No privacy concerns, very simple, most widely used. Cons: Not sortable, tiny collision risk (practically negligible). Use when: You need random unique IDs and don't need sorting. This is the most common choice."
      },
      {
        heading: "UUID Version 5 (Namespace + Name)",
        content: "Generated by hashing a namespace UUID and a name using SHA-1. The same namespace and name always produce the same UUID. Pros: Deterministic and reproducible, useful for creating UUIDs from existing identifiers. Cons: Not random, predictable. Use when: You need consistent UUIDs for the same input across systems."
      },
      {
        heading: "Which Version Should I Use?",
        content: "Version 4 (random) is the most common and recommended for general use. Use v1 if you need time-based sorting and can accept privacy trade-offs. Use v5 if you need deterministic UUIDs derived from existing data (URLs, domain names, etc.). Avoid v1 for user-facing identifiers due to privacy concerns."
      }
    ]}
  />
</div>
