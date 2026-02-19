<script lang="ts">
  import { CodeBlock } from '@skeletonlabs/skeleton';

  // ─── Types ────────────────────────────────────────────────────
  type AlgKey = 'RS256' | 'RS384' | 'RS512' | 'PS256' | 'PS384' | 'PS512';

  interface AlgSpec {
    name: 'RSASSA-PKCS1-v1_5' | 'RSA-PSS';
    hash: string;
    saltLength?: number;
  }

  const ALG_MAP: Record<AlgKey, AlgSpec> = {
    RS256: { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    RS384: { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-384' },
    RS512: { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-512' },
    PS256: { name: 'RSA-PSS',           hash: 'SHA-256', saltLength: 32 },
    PS384: { name: 'RSA-PSS',           hash: 'SHA-384', saltLength: 48 },
    PS512: { name: 'RSA-PSS',           hash: 'SHA-512', saltLength: 64 }
  };

  // ─── Tab state ───────────────────────────────────────────────
  let mode: 'decode' | 'sign' | 'verify' = 'decode';

  // ─── Key generation ──────────────────────────────────────────
  let genAlg: AlgKey = 'RS256';
  let genKeySize: 2048 | 4096 = 2048;
  let genPrivatePem = '';
  let genPublicPem = '';
  let generating = false;
  let genError = '';

  // ─── Decode ──────────────────────────────────────────────────
  let decodeInput = '';
  let decodedHeader: Record<string, unknown> | null = null;
  let decodedPayload: Record<string, unknown> | null = null;
  let decodedSig = '';
  let decodeError = '';

  // ─── Sign ────────────────────────────────────────────────────
  let signAlg: AlgKey = 'RS256';
  let signHeader = buildDefaultHeader('RS256');
  let signPayload = `{\n  "sub": "1234567890",\n  "name": "John Doe",\n  "iat": ${Math.floor(Date.now() / 1000)},\n  "exp": ${Math.floor(Date.now() / 1000) + 3600}\n}`;
  let signPrivateKey = '';
  let signedToken = '';
  let signError = '';
  let copiedToken = false;

  // ─── Verify ──────────────────────────────────────────────────
  let verifyInput = '';
  let verifyPublicKey = '';
  let verifyResult: {
    valid: boolean;
    header: Record<string, unknown>;
    payload: Record<string, unknown>;
    algorithm: string;
    expiry: { label: string; color: string };
  } | null = null;
  let verifyError = '';

  // ─── Helpers ─────────────────────────────────────────────────
  function buildDefaultHeader(alg: AlgKey): string {
    return `{\n  "alg": "${alg}",\n  "typ": "JWT"\n}`;
  }

  function base64UrlDecode(str: string): string {
    const b64 = str.replace(/-/g, '+').replace(/_/g, '/');
    const pad = b64.length % 4 === 0 ? 0 : 4 - (b64.length % 4);
    return atob(b64 + '='.repeat(pad));
  }

  function base64UrlEncode(str: string): string {
    return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }

  function arrayBufferToBase64Url(buf: ArrayBuffer): string {
    const bytes = new Uint8Array(buf);
    let bin = '';
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }

  function arrayBufferToPem(buf: ArrayBuffer, label: string): string {
    const bytes = new Uint8Array(buf);
    let bin = '';
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    const b64 = btoa(bin);
    const lines = (b64.match(/.{1,64}/g) ?? [b64]).join('\n');
    return `-----BEGIN ${label}-----\n${lines}\n-----END ${label}-----`;
  }

  function pemToArrayBuffer(pem: string): ArrayBuffer {
    const b64 = pem
      .replace(/-----BEGIN.*?-----/, '')
      .replace(/-----END.*?-----/, '')
      .replace(/\s/g, '');
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes.buffer;
  }

  function formatDate(ts: number): string {
    return new Date(ts * 1000).toLocaleString();
  }

  function getExpiryStatus(payload: Record<string, unknown>): { label: string; color: string } {
    if (!('exp' in payload)) return { label: 'No expiry', color: 'text-surface-400' };
    const exp = Number(payload.exp);
    const now = Math.floor(Date.now() / 1000);
    if (now > exp) return { label: 'Expired', color: 'text-error-400' };
    if (exp - now < 300) return { label: 'Expires soon', color: 'text-warning-400' };
    return { label: 'Valid', color: 'text-success-400' };
  }

  async function importPrivateKey(pem: string, alg: AlgKey): Promise<CryptoKey> {
    const spec = ALG_MAP[alg];
    return crypto.subtle.importKey(
      'pkcs8',
      pemToArrayBuffer(pem),
      { name: spec.name, hash: spec.hash },
      false,
      ['sign']
    );
  }

  async function importPublicKey(pem: string, alg: AlgKey): Promise<CryptoKey> {
    const spec = ALG_MAP[alg];
    return crypto.subtle.importKey(
      'spki',
      pemToArrayBuffer(pem),
      { name: spec.name, hash: spec.hash },
      false,
      ['verify']
    );
  }

  // ─── Key generation ──────────────────────────────────────────
  async function generateKeyPair() {
    generating = true;
    genError = '';
    genPrivatePem = '';
    genPublicPem = '';

    try {
      const spec = ALG_MAP[genAlg];
      const keyPair = await crypto.subtle.generateKey(
        {
          name: spec.name,
          modulusLength: genKeySize,
          publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
          hash: spec.hash
        },
        true,
        ['sign', 'verify']
      );

      const privateBuf = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);
      const publicBuf  = await crypto.subtle.exportKey('spki',  keyPair.publicKey);

      genPrivatePem = arrayBufferToPem(privateBuf, 'PRIVATE KEY');
      genPublicPem  = arrayBufferToPem(publicBuf,  'PUBLIC KEY');
    } catch (e) {
      genError = e instanceof Error ? e.message : 'Key generation failed';
    } finally {
      generating = false;
    }
  }

  function useGeneratedKeys() {
    signPrivateKey = genPrivatePem;
    verifyPublicKey = genPublicPem;
    signAlg = genAlg;
    updateSignHeader(genAlg);
  }

  // ─── Decode ──────────────────────────────────────────────────
  function decodeJwt() {
    decodeError = '';
    decodedHeader = null;
    decodedPayload = null;
    decodedSig = '';

    const token = decodeInput.trim();
    if (!token) return;

    const parts = token.split('.');
    if (parts.length !== 3) { decodeError = 'Invalid JWT: expected 3 dot-separated parts.'; return; }

    try {
      decodedHeader  = JSON.parse(base64UrlDecode(parts[0]));
      decodedPayload = JSON.parse(base64UrlDecode(parts[1]));
      decodedSig     = parts[2];
    } catch (e) {
      decodeError = e instanceof Error ? e.message : 'Failed to decode JWT';
    }
  }

  // ─── Sign ────────────────────────────────────────────────────
  function updateSignHeader(alg: AlgKey) {
    try {
      const h = JSON.parse(signHeader);
      h.alg = alg;
      signHeader = JSON.stringify(h, null, 2);
    } catch { signHeader = buildDefaultHeader(alg); }
  }

  function setSignAlg(alg: AlgKey) {
    signAlg = alg;
    updateSignHeader(alg);
  }

  async function signJwt() {
    signError = '';
    signedToken = '';

    try {
      const header  = JSON.parse(signHeader);
      const payload = JSON.parse(signPayload);

      const spec = ALG_MAP[signAlg];
      const encoder = new TextEncoder();

      const headerB64  = base64UrlEncode(JSON.stringify(header));
      const payloadB64 = base64UrlEncode(JSON.stringify(payload));
      const message    = `${headerB64}.${payloadB64}`;

      const key = await importPrivateKey(signPrivateKey, signAlg);

      const sigBuf = await crypto.subtle.sign(
        spec.saltLength !== undefined
          ? { name: spec.name, saltLength: spec.saltLength }
          : spec.name,
        key,
        encoder.encode(message)
      );

      signedToken = `${message}.${arrayBufferToBase64Url(sigBuf)}`;
    } catch (e) {
      signError = e instanceof Error ? e.message : 'Signing failed';
    }
  }

  async function copyToken() {
    if (!signedToken) return;
    await navigator.clipboard.writeText(signedToken);
    copiedToken = true;
    setTimeout(() => (copiedToken = false), 2000);
  }

  // ─── Verify ──────────────────────────────────────────────────
  async function verifyJwt() {
    verifyError = '';
    verifyResult = null;

    const token = verifyInput.trim();
    if (!token) return;

    const parts = token.split('.');
    if (parts.length !== 3) { verifyError = 'Invalid JWT: expected 3 dot-separated parts.'; return; }

    try {
      const header  = JSON.parse(base64UrlDecode(parts[0])) as Record<string, unknown>;
      const payload = JSON.parse(base64UrlDecode(parts[1])) as Record<string, unknown>;
      const alg     = (header.alg as AlgKey) || 'RS256';

      if (!(alg in ALG_MAP)) throw new Error(`Unsupported algorithm: ${alg}`);

      const spec = ALG_MAP[alg];
      const encoder = new TextEncoder();
      const message = `${parts[0]}.${parts[1]}`;

      // Decode base64url signature
      const sigB64 = parts[2].replace(/-/g, '+').replace(/_/g, '/');
      const sigPad = sigB64.length % 4 === 0 ? 0 : 4 - (sigB64.length % 4);
      const sigBin = atob(sigB64 + '='.repeat(sigPad));
      const sigBytes = Uint8Array.from(sigBin, c => c.charCodeAt(0));

      const key = await importPublicKey(verifyPublicKey, alg);

      const valid = await crypto.subtle.verify(
        spec.saltLength !== undefined
          ? { name: spec.name, saltLength: spec.saltLength }
          : spec.name,
        key,
        sigBytes,
        encoder.encode(message)
      );

      verifyResult = { valid, header, payload, algorithm: alg, expiry: getExpiryStatus(payload) };
    } catch (e) {
      verifyError = e instanceof Error ? e.message : 'Verification failed';
    }
  }

  const CLAIM_LABELS: Record<string, string> = {
    iss: 'Issuer', sub: 'Subject', aud: 'Audience',
    exp: 'Expires', iat: 'Issued At', nbf: 'Not Before', jti: 'JWT ID'
  };

  const ALGS: AlgKey[] = ['RS256', 'RS384', 'RS512', 'PS256', 'PS384', 'PS512'];

  function setGenKeySize(n: number) { genKeySize = n as 2048 | 4096; }
  function setGenAlg(a: string) { genAlg = a as AlgKey; }
  function setSignAlgFromStr(a: string) { setSignAlg(a as AlgKey); }
</script>

<svelte:head>
  <title>JWT RSA / PSS — DevTools</title>
  <meta name="description" content="Sign and verify JWTs with asymmetric RSA keys. Supports RS256/384/512 (PKCS#1 v1.5) and PS256/384/512 (RSA-PSS). Generate key pairs directly in your browser." />
  <meta property="og:title" content="JWT RSA / PSS — DevTools" />
  <meta property="og:description" content="Sign and verify JWTs with asymmetric RSA keys. Supports RS256/384/512 (PKCS#1 v1.5) and PS256/384/512 (RSA-PSS). Generate key pairs directly in your browser." />
</svelte:head>

<div class="space-y-6 w-full">

  <!-- ── Header ─────────────────────────────────────────────── -->
  <div>
    <div class="flex items-center gap-2 mb-1">
      <span class="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary-500/20 text-primary-400 uppercase tracking-wider">RSA</span>
      <h1 class="text-2xl font-bold text-white">JWT RSA / PSS</h1>
    </div>
    <p class="text-surface-400 text-sm">
      Sign and verify JWTs with asymmetric keys —
      <span class="font-mono text-surface-300">RS256 RS384 RS512</span> (PKCS#1 v1.5) and
      <span class="font-mono text-surface-300">PS256 PS384 PS512</span> (RSA-PSS).
    </p>
  </div>

  <!-- ── Key Pair Generator ─────────────────────────────────── -->
  <div class="rounded-xl bg-surface-800 border border-surface-700 overflow-hidden">
    <div class="px-4 py-3 border-b border-surface-700 flex items-center gap-2">
      <svg viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 text-primary-400">
        <path fill-rule="evenodd" d="M8 7a5 5 0 1 1 3.61 4.804l-1.903 1.903A1 1 0 0 1 9 14H8v1a1 1 0 0 1-1 1H6v1a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-2a1 1 0 0 1 .293-.707L7.196 10.39A5.002 5.002 0 0 1 8 7zm5-3a.75.75 0 0 0 0 1.5A1.5 1.5 0 0 1 14.5 7 .75.75 0 0 0 16 7a3 3 0 0 0-3-3z" clip-rule="evenodd"/>
      </svg>
      <span class="text-sm font-semibold text-white">Key Pair Generator</span>
      <span class="text-xs text-surface-500 ml-1">— generate a test key pair in-browser</span>
    </div>
    <div class="p-4 space-y-4">
      <div class="flex flex-wrap items-center gap-3">
        <!-- Algorithm -->
        <div class="flex items-center gap-2">
          <span class="text-xs text-surface-500">Algorithm:</span>
          <div class="flex items-center gap-1 p-1 rounded-lg bg-surface-700 border border-surface-600">
            {#each ALGS as alg}
              <button
                class="px-2.5 py-1 rounded-md text-xs font-mono font-medium transition-all
                  {genAlg === alg ? 'bg-primary-500 text-white' : 'text-surface-400 hover:text-white'}"
                on:click={() => { genAlg = alg; }}
              >{alg}</button>
            {/each}
          </div>
        </div>

        <!-- Key size -->
        <div class="flex items-center gap-2">
          <span class="text-xs text-surface-500">Key size:</span>
          <div class="flex items-center gap-1 p-1 rounded-lg bg-surface-700 border border-surface-600">
            {#each [2048, 4096] as size}
              <button
                class="px-2.5 py-1 rounded-md text-xs font-mono font-medium transition-all
                  {genKeySize === size ? 'bg-surface-500 text-white' : 'text-surface-400 hover:text-white'}"
                on:click={() => setGenKeySize(size)}
              >{size}</button>
            {/each}
          </div>
        </div>

        <button
          on:click={generateKeyPair}
          disabled={generating}
          class="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-500 hover:bg-primary-400 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
        >
          {#if generating}
            <svg class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Generating…
          {:else}
            Generate
          {/if}
        </button>

        {#if genPrivatePem}
          <button
            on:click={useGeneratedKeys}
            class="px-3 py-2 rounded-lg text-sm bg-success-500/15 border border-success-500/30 text-success-400 hover:bg-success-500/25 transition-colors"
          >
            Use in Sign &amp; Verify
          </button>
        {/if}
      </div>

      {#if genError}
        <p class="text-xs font-mono text-error-400">{genError}</p>
      {/if}

      {#if genPrivatePem}
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div class="space-y-1.5">
            <span class="text-xs font-semibold text-surface-400 uppercase tracking-wider">Private Key (PKCS#8)</span>
            <pre class="text-[10px] font-mono text-surface-400 bg-surface-700 rounded-lg p-3 overflow-auto max-h-36 border border-surface-600 leading-relaxed">{genPrivatePem}</pre>
          </div>
          <div class="space-y-1.5">
            <span class="text-xs font-semibold text-surface-400 uppercase tracking-wider">Public Key (SPKI)</span>
            <pre class="text-[10px] font-mono text-surface-400 bg-surface-700 rounded-lg p-3 overflow-auto max-h-36 border border-surface-600 leading-relaxed">{genPublicPem}</pre>
          </div>
        </div>
      {/if}
    </div>
  </div>

  <!-- ── Tab Toggle ─────────────────────────────────────────── -->
  <div class="flex items-center gap-1 p-1 rounded-lg bg-surface-800 border border-surface-700 w-fit">
    {#each ['decode', 'sign', 'verify'] as tab}
      <button
        class="px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-all
          {mode === tab ? 'bg-primary-500 text-white shadow-sm' : 'text-surface-400 hover:text-white'}"
        on:click={() => (mode = tab)}
      >{tab}</button>
    {/each}
  </div>

  <!-- ── DECODE ─────────────────────────────────────────────── -->
  {#if mode === 'decode'}
    <div class="space-y-4">
      <div class="space-y-2">
        <span class="text-xs font-semibold text-surface-400 uppercase tracking-wider">JWT Token</span>
        <textarea
          bind:value={decodeInput}
          on:input={decodeJwt}
          placeholder="Paste your JWT here (eyJ...)"
          class="w-full h-48 px-3 py-3 rounded-lg bg-surface-800 border border-surface-700 text-white font-mono text-sm resize-none focus:outline-none focus:border-primary-500 placeholder-surface-600 transition-colors"
          spellcheck="false"
        />
      </div>

      {#if decodeError}
        <div class="flex items-center gap-2 px-4 py-3 rounded-lg bg-error-500/10 border border-error-500/20 text-error-400 text-sm">
          <svg viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 flex-shrink-0"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/></svg>
          {decodeError}
        </div>
      {/if}

      {#if decodedHeader && decodedPayload}
        {@const expiry = getExpiryStatus(decodedPayload)}
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="space-y-2">
            <span class="text-xs font-semibold px-2 py-0.5 rounded bg-primary-500/20 text-primary-400 uppercase tracking-wider">Header</span>
            <div class="rounded-lg border border-surface-700 overflow-hidden">
              <CodeBlock language="json" code={JSON.stringify(decodedHeader, null, 2)} rounded="rounded-lg" />
            </div>
          </div>
          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <span class="text-xs font-semibold px-2 py-0.5 rounded bg-warning-500/20 text-warning-400 uppercase tracking-wider">Payload</span>
              <span class="text-xs {expiry.color} font-medium">{expiry.label}</span>
            </div>
            <div class="rounded-lg border border-surface-700 overflow-hidden">
              <CodeBlock language="json" code={JSON.stringify(decodedPayload, null, 2)} rounded="rounded-lg" />
            </div>
          </div>
          <div class="space-y-2">
            <span class="text-xs font-semibold px-2 py-0.5 rounded bg-error-500/20 text-error-400 uppercase tracking-wider">Signature</span>
            <div class="rounded-lg bg-surface-800 border border-surface-700 p-3">
              <p class="font-mono text-xs text-surface-400 break-all leading-relaxed">{decodedSig}</p>
            </div>
          </div>
        </div>

        {#if Object.keys(decodedPayload).some(k => k in CLAIM_LABELS)}
          <div class="rounded-lg bg-surface-800 border border-surface-700 overflow-hidden">
            <div class="px-4 py-2.5 border-b border-surface-700">
              <span class="text-xs font-semibold text-surface-400 uppercase tracking-wider">Standard Claims</span>
            </div>
            <div class="divide-y divide-surface-700">
              {#each Object.entries(decodedPayload).filter(([k]) => k in CLAIM_LABELS) as [key, value]}
                <div class="flex items-start px-4 py-2.5 gap-4">
                  <span class="text-xs font-mono text-primary-400 w-24 flex-shrink-0 pt-0.5">{key}</span>
                  <span class="text-xs text-surface-400 w-24 flex-shrink-0 pt-0.5">{CLAIM_LABELS[key]}</span>
                  <span class="text-xs text-white font-mono">
                    {key === 'exp' || key === 'iat' || key === 'nbf'
                      ? `${value} (${formatDate(Number(value))})`
                      : String(value)}
                  </span>
                </div>
              {/each}
            </div>
          </div>
        {/if}
      {/if}
    </div>
  {/if}

  <!-- ── SIGN ───────────────────────────────────────────────── -->
  {#if mode === 'sign'}
    <div class="space-y-4">
      <!-- Algorithm selector -->
      <div class="flex items-center gap-3 flex-wrap">
        <span class="text-xs text-surface-500">Algorithm:</span>
        <div class="flex items-center gap-1 p-1 rounded-lg bg-surface-800 border border-surface-700">
          {#each ALGS as alg}
            <button
              class="px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-all
                {signAlg === alg ? 'bg-primary-500 text-white' : 'text-surface-400 hover:text-white'}"
              on:click={() => setSignAlg(alg)}
            >{alg}</button>
          {/each}
        </div>
        <span class="text-xs text-surface-600">
          {signAlg.startsWith('RS') ? 'RSASSA-PKCS1-v1_5' : 'RSA-PSS'}
        </span>
      </div>

      <!-- Header + Payload -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div class="space-y-2">
          <span class="text-xs font-semibold text-surface-400 uppercase tracking-wider">Header</span>
          <textarea
            bind:value={signHeader}
            class="w-full h-48 px-3 py-3 rounded-lg bg-surface-800 border border-surface-700 text-white font-mono text-sm resize-none focus:outline-none focus:border-primary-500 transition-colors"
            spellcheck="false"
          />
        </div>
        <div class="space-y-2">
          <span class="text-xs font-semibold text-surface-400 uppercase tracking-wider">Payload</span>
          <textarea
            bind:value={signPayload}
            class="w-full h-48 px-3 py-3 rounded-lg bg-surface-800 border border-surface-700 text-white font-mono text-sm resize-none focus:outline-none focus:border-primary-500 transition-colors"
            spellcheck="false"
          />
        </div>
      </div>

      <!-- Private Key -->
      <div class="space-y-2">
        <div class="flex items-center gap-2">
          <span class="text-xs font-semibold text-surface-400 uppercase tracking-wider">Private Key</span>
          <span class="text-xs text-surface-600 font-mono">PKCS#8 PEM (-----BEGIN PRIVATE KEY-----)</span>
        </div>
        <textarea
          bind:value={signPrivateKey}
          placeholder={"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"}
          class="w-full h-52 px-3 py-3 rounded-lg bg-surface-800 border border-surface-700 text-white font-mono text-xs resize-none focus:outline-none focus:border-primary-500 placeholder-surface-600 transition-colors"
          spellcheck="false"
        />
      </div>

      <button
        on:click={signJwt}
        disabled={!signPrivateKey.trim()}
        class="px-4 py-2 rounded-lg bg-primary-500 hover:bg-primary-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
      >
        Sign Token
      </button>

      {#if signError}
        <div class="flex items-start gap-2 px-4 py-3 rounded-lg bg-error-500/10 border border-error-500/20 text-error-400 text-sm">
          <svg viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 flex-shrink-0 mt-0.5"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/></svg>
          <span class="font-mono text-xs">{signError}</span>
        </div>
      {/if}

      {#if signedToken}
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-surface-400 uppercase tracking-wider">Signed Token</span>
            <button
              on:click={copyToken}
              class="text-xs px-2.5 py-1 rounded-md transition-all
                {copiedToken ? 'bg-success-500/20 text-success-400' : 'bg-surface-700 text-surface-400 hover:text-white'}"
            >{copiedToken ? 'Copied!' : 'Copy'}</button>
          </div>
          <div class="px-3 py-3 rounded-lg bg-surface-800 border border-success-500/30">
            <p class="font-mono text-xs text-surface-300 break-all leading-relaxed">
              <span class="text-primary-400">{signedToken.split('.')[0]}</span>.<span class="text-warning-400">{signedToken.split('.')[1]}</span>.<span class="text-error-400">{signedToken.split('.')[2]}</span>
            </p>
          </div>
          <p class="text-xs text-surface-500">Header (purple) · Payload (yellow) · Signature (red)</p>
        </div>
      {/if}
    </div>
  {/if}

  <!-- ── VERIFY ─────────────────────────────────────────────── -->
  {#if mode === 'verify'}
    <div class="space-y-4">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div class="space-y-2">
          <span class="text-xs font-semibold text-surface-400 uppercase tracking-wider">JWT Token</span>
          <textarea
            bind:value={verifyInput}
            placeholder="Paste your JWT here (eyJ...)"
            class="w-full h-52 px-3 py-3 rounded-lg bg-surface-800 border border-surface-700 text-white font-mono text-sm resize-none focus:outline-none focus:border-primary-500 placeholder-surface-600 transition-colors"
            spellcheck="false"
          />
        </div>
        <div class="space-y-2">
          <div class="flex items-center gap-2">
            <span class="text-xs font-semibold text-surface-400 uppercase tracking-wider">Public Key</span>
            <span class="text-xs text-surface-600 font-mono">SPKI PEM (-----BEGIN PUBLIC KEY-----)</span>
          </div>
          <textarea
            bind:value={verifyPublicKey}
            placeholder={"-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"}
            class="w-full h-52 px-3 py-3 rounded-lg bg-surface-800 border border-surface-700 text-white font-mono text-xs resize-none focus:outline-none focus:border-primary-500 placeholder-surface-600 transition-colors"
            spellcheck="false"
          />
        </div>
      </div>

      <p class="text-xs text-surface-500">The algorithm is read from the token's <span class="font-mono text-surface-400">alg</span> header claim.</p>

      <button
        on:click={verifyJwt}
        disabled={!verifyInput.trim() || !verifyPublicKey.trim()}
        class="px-4 py-2 rounded-lg bg-primary-500 hover:bg-primary-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
      >
        Verify Signature
      </button>

      {#if verifyError}
        <div class="flex items-start gap-2 px-4 py-3 rounded-lg bg-error-500/10 border border-error-500/20 text-error-400 text-sm">
          <svg viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 flex-shrink-0 mt-0.5"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/></svg>
          <span class="font-mono text-xs">{verifyError}</span>
        </div>
      {/if}

      {#if verifyResult !== null}
        <!-- Verdict -->
        <div class="flex items-center gap-3 px-5 py-4 rounded-xl border
          {verifyResult.valid ? 'bg-success-500/10 border-success-500/30' : 'bg-error-500/10 border-error-500/30'}">
          {#if verifyResult.valid}
            <div class="w-10 h-10 rounded-full bg-success-500/20 flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 text-success-400">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd"/>
              </svg>
            </div>
            <div>
              <p class="text-success-400 font-semibold">Signature Valid</p>
              <p class="text-xs text-surface-400 mt-0.5">Verified with <span class="font-mono text-surface-300">{verifyResult.algorithm}</span> · {verifyResult.expiry.label}</p>
            </div>
          {:else}
            <div class="w-10 h-10 rounded-full bg-error-500/20 flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 text-error-400">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd"/>
              </svg>
            </div>
            <div>
              <p class="text-error-400 font-semibold">Signature Invalid</p>
              <p class="text-xs text-surface-400 mt-0.5">The public key does not match the signature, or the token was tampered with.</p>
            </div>
          {/if}
        </div>

        <!-- Metadata chips -->
        <div class="flex flex-wrap gap-3">
          {#each [
            ['Algorithm', verifyResult.algorithm],
            ['Expiry', verifyResult.expiry.label],
            ...('exp' in verifyResult.payload ? [['Expires', formatDate(Number(verifyResult.payload.exp))]] : []),
            ...('iat' in verifyResult.payload ? [['Issued',   formatDate(Number(verifyResult.payload.iat))]] : [])
          ] as [label, val]}
            <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-800 border border-surface-700">
              <span class="text-xs text-surface-500">{label}</span>
              <span class="font-mono text-xs text-surface-300">{val}</span>
            </div>
          {/each}
        </div>

        <!-- Decoded sections -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <span class="text-xs font-semibold px-2 py-0.5 rounded bg-primary-500/20 text-primary-400 uppercase tracking-wider">Header</span>
            <div class="rounded-lg border border-surface-700 overflow-hidden">
              <CodeBlock language="json" code={JSON.stringify(verifyResult.header, null, 2)} rounded="rounded-lg" />
            </div>
          </div>
          <div class="space-y-2">
            <span class="text-xs font-semibold px-2 py-0.5 rounded bg-warning-500/20 text-warning-400 uppercase tracking-wider">Payload</span>
            <div class="rounded-lg border border-surface-700 overflow-hidden">
              <CodeBlock language="json" code={JSON.stringify(verifyResult.payload, null, 2)} rounded="rounded-lg" />
            </div>
          </div>
        </div>
      {/if}
    </div>
  {/if}

</div>
