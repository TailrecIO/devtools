<script lang="ts">
  import { md5, sha1, ripemd160 } from '@noble/hashes/legacy.js';
  import { sha224, sha256, sha384, sha512, sha512_224, sha512_256 } from '@noble/hashes/sha2.js';
  import { sha3_224, sha3_256, sha3_384, sha3_512 } from '@noble/hashes/sha3.js';
  import TechnicalDetails from '$lib/components/TechnicalDetails.svelte';

  type AlgoId =
    | 'md5' | 'sha1' | 'ripemd160'
    | 'sha224' | 'sha256' | 'sha384' | 'sha512' | 'sha512_224' | 'sha512_256'
    | 'sha3_224' | 'sha3_256' | 'sha3_384' | 'sha3_512';

  interface AlgoEntry {
    id: AlgoId;
    label: string;
    bits: number;
    group: string;
    insecure?: boolean;
    fn: (data: Uint8Array) => Uint8Array;
  }

  const algos: AlgoEntry[] = [
    { id: 'md5',        label: 'MD5',         bits: 128, group: 'Legacy', insecure: true, fn: md5 },
    { id: 'sha1',       label: 'SHA-1',        bits: 160, group: 'Legacy', insecure: true, fn: sha1 },
    { id: 'ripemd160',  label: 'RIPEMD-160',   bits: 160, group: 'Legacy', insecure: true, fn: ripemd160 },
    { id: 'sha224',     label: 'SHA-224',       bits: 224, group: 'SHA-2', fn: sha224 },
    { id: 'sha256',     label: 'SHA-256',       bits: 256, group: 'SHA-2', fn: sha256 },
    { id: 'sha384',     label: 'SHA-384',       bits: 384, group: 'SHA-2', fn: sha384 },
    { id: 'sha512',     label: 'SHA-512',       bits: 512, group: 'SHA-2', fn: sha512 },
    { id: 'sha512_224', label: 'SHA-512/224',   bits: 224, group: 'SHA-2', fn: sha512_224 },
    { id: 'sha512_256', label: 'SHA-512/256',   bits: 256, group: 'SHA-2', fn: sha512_256 },
    { id: 'sha3_224',   label: 'SHA3-224',      bits: 224, group: 'SHA-3', fn: sha3_224 },
    { id: 'sha3_256',   label: 'SHA3-256',      bits: 256, group: 'SHA-3', fn: sha3_256 },
    { id: 'sha3_384',   label: 'SHA3-384',      bits: 384, group: 'SHA-3', fn: sha3_384 },
    { id: 'sha3_512',   label: 'SHA3-512',      bits: 512, group: 'SHA-3', fn: sha3_512 },
  ];

  let selectedId: AlgoId = 'sha256';
  let inputMode: 'text' | 'file' = 'text';
  let inputText = '';
  let inputFile: File | null = null;
  let fileData: Uint8Array | null = null;
  let fileError = '';
  let outputFormat: 'hex' | 'base64' = 'hex';
  let compareValue = '';
  let copied = false;
  let showAll = false;

  function toHex(bytes: Uint8Array): string {
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  function toBase64(bytes: Uint8Array): string {
    let s = '';
    for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
    return btoa(s);
  }

  function format(bytes: Uint8Array, fmt: 'hex' | 'base64'): string {
    return fmt === 'hex' ? toHex(bytes) : toBase64(bytes);
  }

  // Reactive data bytes — Svelte tracks inputText and fileData directly
  $: inputBytes = inputMode === 'text'
    ? (inputText ? new TextEncoder().encode(inputText) : null)
    : fileData;

  $: selectedAlgo = algos.find(a => a.id === selectedId)!;

  // Primary hash — depends on inputBytes, selectedAlgo, outputFormat directly
  $: primaryHash = inputBytes ? format(selectedAlgo.fn(inputBytes), outputFormat) : '';

  // All hashes for the "show all" table
  $: allHashes = showAll && inputBytes
    ? algos.map(a => ({ ...a, hash: format(a.fn(inputBytes!), outputFormat) }))
    : [];

  $: compareNorm = compareValue.trim().toLowerCase();
  $: compareStatus = primaryHash && compareNorm
    ? (primaryHash.toLowerCase() === compareNorm ? 'match' : 'mismatch')
    : null;

  function handleFileChange(e: Event) {
    fileError = '';
    fileData = null;
    inputFile = null;
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;
    if (file.size > 100 * 1024 * 1024) { fileError = 'File too large (max 100 MB)'; return; }
    inputFile = file;
    const reader = new FileReader();
    reader.onload = ev => { fileData = new Uint8Array(ev.target?.result as ArrayBuffer); };
    reader.readAsArrayBuffer(file);
  }

  async function copyPrimary() {
    if (!primaryHash) return;
    await navigator.clipboard.writeText(primaryHash);
    copied = true;
    setTimeout(() => { copied = false; }, 1500);
  }

  async function copyRow(hash: string) {
    await navigator.clipboard.writeText(hash);
  }

  function setAlgo(id: string) { selectedId = id as AlgoId; }
  function setInputMode(m: string) { inputMode = m as 'text' | 'file'; }
  function setFormat(f: string) { outputFormat = f as 'hex' | 'base64'; }
</script>

<svelte:head>
  <title>Hash — DevTools</title>
  <meta name="description" content="Compute cryptographic hashes: MD5, SHA-1, SHA-224/256/384/512, SHA3-224/256/384/512, RIPEMD-160. Hash text or files entirely in your browser — no uploads." />
  <meta property="og:title" content="Hash — DevTools" />
  <meta property="og:description" content="Compute cryptographic hashes: MD5, SHA-1, SHA-224/256/384/512, SHA3-224/256/384/512, RIPEMD-160. Hash text or files entirely in your browser — no uploads." />
</svelte:head>

<div class="w-full space-y-5">
  <!-- Header -->
  <div class="flex items-center gap-3">
    <div class="w-9 h-9 rounded-lg bg-primary-500/20 flex items-center justify-center font-mono text-[10px] font-bold text-primary-400">
      HASH
    </div>
    <div>
      <h1 class="text-xl font-bold text-white">Hash</h1>
      <p class="text-sm text-surface-400">Compute cryptographic hashes of text or files</p>
    </div>
  </div>

  <!-- Algorithm selector -->
  <div class="p-4 bg-surface-800 rounded-xl border border-surface-700 space-y-3">
    <span class="text-xs font-semibold text-surface-500 uppercase tracking-wide">Algorithm</span>
    <div class="flex flex-wrap gap-2">
      {#each algos as algo}
        <button
          class="px-3 py-1.5 rounded-lg text-xs font-mono font-medium border transition-all
            {selectedId === algo.id
              ? 'bg-primary-500 border-primary-500 text-white'
              : algo.insecure
                ? 'bg-surface-700 border-surface-600 text-surface-400 hover:border-warning-500/50 hover:text-warning-400'
                : 'bg-surface-700 border-surface-600 text-surface-300 hover:border-primary-500/50 hover:text-white'}"
          on:click={() => setAlgo(algo.id)}
        >
          {algo.label}
          {#if algo.insecure && selectedId !== algo.id}
            <span class="ml-1 opacity-60">⚠</span>
          {/if}
        </button>
      {/each}
    </div>
    {#if selectedAlgo.insecure}
      <p class="text-xs text-warning-400 flex items-center gap-1.5">
        <svg viewBox="0 0 20 20" fill="currentColor" class="w-3.5 h-3.5 flex-shrink-0">
          <path fill-rule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
        </svg>
        {selectedAlgo.label} is cryptographically broken — use SHA-256 or higher for any security purpose.
      </p>
    {/if}
  </div>

  <!-- Input mode toggle -->
  <div class="flex items-center gap-3">
    <div class="flex gap-1 p-1 bg-surface-800 rounded-lg border border-surface-700">
      {#each [{ v: 'text', label: 'Text' }, { v: 'file', label: 'File' }] as opt}
        <button
          class="px-3 py-1.5 rounded-md text-sm font-medium transition-all {inputMode === opt.v ? 'bg-primary-500 text-white' : 'text-surface-400 hover:text-white'}"
          on:click={() => setInputMode(opt.v)}
        >{opt.label}</button>
      {/each}
    </div>
    <div class="flex gap-1 p-0.5 bg-surface-800 rounded-lg border border-surface-700">
      {#each [{ v: 'hex', label: 'Hex' }, { v: 'base64', label: 'Base64' }] as f}
        <button
          class="px-2.5 py-1 rounded-md text-xs font-medium transition-all {outputFormat === f.v ? 'bg-surface-600 text-white' : 'text-surface-500 hover:text-white'}"
          on:click={() => setFormat(f.v)}
        >{f.label}</button>
      {/each}
    </div>
  </div>

  <!-- Text input -->
  {#if inputMode === 'text'}
    <div class="space-y-1.5">
      <textarea
        bind:value={inputText}
        rows={4}
        class="w-full bg-surface-800 border border-surface-700 rounded-xl px-4 py-3 text-sm text-white font-mono placeholder-surface-600 focus:outline-none focus:border-primary-500/60 resize-y"
        placeholder="Enter text to hash..."
        spellcheck="false"
      />
      {#if inputText}
        <p class="text-xs text-surface-600">{new TextEncoder().encode(inputText).length} bytes</p>
      {/if}
    </div>

  <!-- File input -->
  {:else}
    <label class="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-surface-600 rounded-xl cursor-pointer hover:border-primary-500/50 hover:bg-surface-800/40 transition-all">
      <div class="flex flex-col items-center gap-1.5 text-center pointer-events-none">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="w-6 h-6 text-surface-500">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
        {#if inputFile}
          <span class="text-sm text-white font-medium">{inputFile.name}</span>
          <span class="text-xs text-surface-500">{(inputFile.size / 1024).toFixed(1)} KB</span>
        {:else}
          <span class="text-sm text-surface-400">Click to upload a file</span>
          <span class="text-xs text-surface-600">Max 100 MB</span>
        {/if}
      </div>
      <input type="file" class="hidden" on:change={handleFileChange} />
    </label>
    {#if fileError}<p class="text-xs text-error-400 mt-1">{fileError}</p>{/if}
  {/if}

  <!-- Primary result -->
  <div class="rounded-xl border {compareStatus === 'match' ? 'border-success-500/40 bg-success-500/5' : compareStatus === 'mismatch' ? 'border-error-500/40 bg-error-500/5' : 'border-surface-700 bg-surface-800'} transition-colors">
    <div class="flex items-center justify-between px-4 py-2.5 border-b {compareStatus === 'match' ? 'border-success-500/20' : compareStatus === 'mismatch' ? 'border-error-500/20' : 'border-surface-700'}">
      <div class="flex items-center gap-2">
        <span class="text-xs font-mono font-semibold text-surface-400">{selectedAlgo.label}</span>
        <span class="text-[10px] text-surface-600">{selectedAlgo.bits}-bit</span>
        {#if compareStatus === 'match'}
          <span class="text-[10px] px-1.5 py-0.5 rounded bg-success-500/15 text-success-400 font-medium border border-success-500/20">Match</span>
        {:else if compareStatus === 'mismatch'}
          <span class="text-[10px] px-1.5 py-0.5 rounded bg-error-500/15 text-error-400 font-medium border border-error-500/20">Mismatch</span>
        {/if}
      </div>
      <button
        on:click={copyPrimary}
        disabled={!primaryHash}
        class="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg transition-all {primaryHash ? 'text-surface-400 hover:text-white hover:bg-surface-700' : 'text-surface-700 cursor-default'}"
      >
        {#if copied}
          <svg viewBox="0 0 20 20" fill="currentColor" class="w-3.5 h-3.5 text-success-400"><path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" /></svg>
          <span class="text-success-400">Copied</span>
        {:else}
          <svg viewBox="0 0 20 20" fill="currentColor" class="w-3.5 h-3.5"><path d="M7 3.5A1.5 1.5 0 018.5 2h3.879a1.5 1.5 0 011.06.44l3.122 3.12A1.5 1.5 0 0117 6.622V12.5a1.5 1.5 0 01-1.5 1.5h-1v-3.379a3 3 0 00-.879-2.121L10.5 5.379A3 3 0 008.379 4.5H7v-1z" /><path d="M4.5 6A1.5 1.5 0 003 7.5v9A1.5 1.5 0 004.5 18h7a1.5 1.5 0 001.5-1.5v-5.879a1.5 1.5 0 00-.44-1.06L9.44 6.439A1.5 1.5 0 008.378 6H4.5z" /></svg>
          Copy
        {/if}
      </button>
    </div>
    <div class="px-4 py-3 min-h-[3.5rem] flex items-center">
      {#if primaryHash}
        <p class="font-mono text-sm text-white break-all leading-relaxed select-all">{primaryHash}</p>
      {:else}
        <p class="text-sm text-surface-600 italic">
          {inputMode === 'file' ? 'Upload a file to compute hash' : 'Enter text above to compute hash'}
        </p>
      {/if}
    </div>
  </div>

  <!-- Compare input -->
  <div class="space-y-1.5">
    <label for="compare" class="text-xs text-surface-500">Compare — paste a hash to verify</label>
    <input
      id="compare"
      type="text"
      bind:value={compareValue}
      class="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-sm text-white font-mono placeholder-surface-600 focus:outline-none focus:border-primary-500/60"
      placeholder="Paste expected hash here..."
      spellcheck="false"
    />
  </div>

  <!-- Show all toggle -->
  <div class="border-t border-surface-800 pt-4">
    <button
      class="flex items-center gap-2 text-xs text-surface-500 hover:text-white transition-colors"
      on:click={() => showAll = !showAll}
    >
      <svg viewBox="0 0 20 20" fill="currentColor" class="w-3.5 h-3.5 transition-transform {showAll ? 'rotate-90' : ''}">
        <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
      </svg>
      {showAll ? 'Hide' : 'Show'} all algorithms
    </button>

    {#if showAll}
      <div class="mt-3 rounded-xl border border-surface-700 overflow-hidden">
        <table class="w-full text-xs">
          <thead>
            <tr class="border-b border-surface-700 bg-surface-900">
              <th class="px-4 py-2 text-left font-semibold text-surface-500 w-28">Algorithm</th>
              <th class="px-4 py-2 text-left font-semibold text-surface-500">Hash ({outputFormat})</th>
              <th class="px-4 py-2 w-8"></th>
            </tr>
          </thead>
          <tbody>
            {#if inputBytes}
              {#each allHashes as row, i}
                <tr class="border-b border-surface-800 last:border-0 {row.insecure ? 'opacity-60' : ''}">
                  <td class="px-4 py-2.5">
                    <span class="font-mono font-semibold text-surface-300">{row.label}</span>
                    {#if row.insecure}<span class="ml-1 text-warning-500">⚠</span>{/if}
                  </td>
                  <td class="px-4 py-2.5 font-mono text-surface-400 break-all">{row.hash}</td>
                  <td class="px-2 py-2.5">
                    <button
                      on:click={() => copyRow(row.hash)}
                      class="w-6 h-6 flex items-center justify-center rounded text-surface-600 hover:text-white hover:bg-surface-700 transition-all"
                      title="Copy"
                    >
                      <svg viewBox="0 0 20 20" fill="currentColor" class="w-3 h-3">
                        <path d="M7 3.5A1.5 1.5 0 018.5 2h3.879a1.5 1.5 0 011.06.44l3.122 3.12A1.5 1.5 0 0117 6.622V12.5a1.5 1.5 0 01-1.5 1.5h-1v-3.379a3 3 0 00-.879-2.121L10.5 5.379A3 3 0 008.379 4.5H7v-1z" />
                        <path d="M4.5 6A1.5 1.5 0 003 7.5v9A1.5 1.5 0 004.5 18h7a1.5 1.5 0 001.5-1.5v-5.879a1.5 1.5 0 00-.44-1.06L9.44 6.439A1.5 1.5 0 008.378 6H4.5z" />
                      </svg>
                    </button>
                  </td>
                </tr>
              {/each}
            {:else}
              <tr>
                <td colspan="3" class="px-4 py-6 text-center text-surface-600 italic">
                  {inputMode === 'file' ? 'Upload a file to compute hashes' : 'Enter text above to compute hashes'}
                </td>
              </tr>
            {/if}
          </tbody>
        </table>
      </div>
    {/if}
  </div>

  <TechnicalDetails
    title="Understanding Cryptographic Hash Functions"
    sections={[
      {
        heading: "What is a Hash Function?",
        content: "A cryptographic hash function takes input data of any size and produces a fixed-size output (called a hash or digest). The same input always produces the same hash, but even tiny changes to the input create completely different hashes. Hash functions are one-way: you cannot reverse a hash to get the original data."
      },
      {
        heading: "Common Hash Algorithms",
        content: "MD5 (128-bit) and SHA-1 (160-bit) are legacy algorithms considered insecure for cryptographic purposes due to collision vulnerabilities. SHA-2 family (SHA-256, SHA-512) is widely used and secure. SHA-3 (Keccak) is the latest standard, designed as an alternative to SHA-2. RIPEMD-160 is used in Bitcoin addresses."
      },
      {
        heading: "Use Cases",
        content: "File integrity verification (checksums), password storage (hashed with salt), digital signatures, blockchain (Bitcoin uses SHA-256), data deduplication, and creating unique identifiers. For passwords, use specialized functions like bcrypt or Argon2, not plain hashes."
      },
      {
        heading: "Security Considerations",
        content: "Never use MD5 or SHA-1 for security purposes. They have known collision attacks. For new applications, prefer SHA-256 or SHA3-256. Hashing alone is NOT suitable for password storage. Use password hashing functions (bcrypt, Argon2) that include salting and are designed to be slow. Hashes are deterministic and public, so they don't provide confidentiality."
      },
      {
        heading: "Which Algorithm Should I Use?",
        content: "For general checksums: SHA-256. For maximum compatibility: SHA-256. For future-proofing: SHA3-256. For legacy systems only: MD5 (checksums only, not security). For Bitcoin/cryptocurrency: SHA-256 or RIPEMD-160. For password hashing: None of these—use bcrypt, Argon2, or scrypt instead."
      }
    ]}
  />
</div>
