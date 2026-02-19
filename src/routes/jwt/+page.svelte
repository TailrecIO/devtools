<script lang="ts">
  import { CodeBlock } from '@skeletonlabs/skeleton';

  // ─── Decode tab ───────────────────────────────────────────────
  let decodeInput = '';
  let decodedHeader: Record<string, unknown> | null = null;
  let decodedPayload: Record<string, unknown> | null = null;
  let decodedSignature = '';
  let decodeError = '';

  // ─── Encode tab ───────────────────────────────────────────────
  let encodeHeader = `{\n  "alg": "HS256",\n  "typ": "JWT"\n}`;
  let encodePayload = `{\n  "sub": "1234567890",\n  "name": "John Doe",\n  "iat": ${Math.floor(Date.now() / 1000)},\n  "exp": ${Math.floor(Date.now() / 1000) + 3600}\n}`;
  let encodeSecret = 'your-secret-key';
  let encodedToken = '';
  let encodeError = '';

  // ─── Verify tab ───────────────────────────────────────────────
  let verifyToken = '';
  let verifySecret = '';
  let verifyResult: {
    valid: boolean;
    header: Record<string, unknown>;
    payload: Record<string, unknown>;
    algorithm: string;
    expiry: { label: string; color: string };
  } | null = null;
  let verifyError = '';

  let mode: 'decode' | 'encode' | 'verify' = 'decode';
  let copiedDecode = false;
  let copiedEncode = false;

  // ─── Helpers ──────────────────────────────────────────────────
  function base64UrlDecode(str: string): string {
    const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    const pad = base64.length % 4 === 0 ? 0 : 4 - (base64.length % 4);
    return atob(base64 + '='.repeat(pad));
  }

  function base64UrlEncode(str: string): string {
    return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }

  function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }

  function formatDate(ts: number): string {
    return new Date(ts * 1000).toLocaleString();
  }

  function getExpiryStatus(payload: Record<string, unknown>): { label: string; color: string } {
    if (!('exp' in payload)) return { label: 'No expiry', color: 'text-surface-400' };
    const exp = Number(payload.exp);
    const now = Math.floor(Date.now() / 1000);
    if (now > exp) return { label: 'Expired', color: 'text-error-400' };
    const diff = exp - now;
    if (diff < 300) return { label: 'Expires soon', color: 'text-warning-400' };
    return { label: 'Valid', color: 'text-success-400' };
  }

  // ─── Decode ───────────────────────────────────────────────────
  function decodeJwt() {
    decodeError = '';
    decodedHeader = null;
    decodedPayload = null;
    decodedSignature = '';

    const token = decodeInput.trim();
    if (!token) return;

    const parts = token.split('.');
    if (parts.length !== 3) {
      decodeError = 'Invalid JWT: expected 3 parts separated by dots.';
      return;
    }

    try {
      decodedHeader = JSON.parse(base64UrlDecode(parts[0]));
      decodedPayload = JSON.parse(base64UrlDecode(parts[1]));
      decodedSignature = parts[2];
    } catch (e) {
      decodeError = e instanceof Error ? e.message : 'Failed to decode JWT';
    }
  }

  // ─── Encode ───────────────────────────────────────────────────
  async function encodeJwt() {
    encodeError = '';
    encodedToken = '';

    try {
      const header = JSON.parse(encodeHeader);
      const payload = JSON.parse(encodePayload);
      const alg = (header.alg as string) || 'HS256';

      const hashMap: Record<string, string> = {
        HS256: 'SHA-256',
        HS384: 'SHA-384',
        HS512: 'SHA-512'
      };
      const hash = hashMap[alg];
      if (!hash) throw new Error(`Unsupported algorithm: ${alg}. Use HS256, HS384, or HS512.`);

      const encoder = new TextEncoder();
      const headerB64 = base64UrlEncode(JSON.stringify(header));
      const payloadB64 = base64UrlEncode(JSON.stringify(payload));
      const message = `${headerB64}.${payloadB64}`;

      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(encodeSecret),
        { name: 'HMAC', hash },
        false,
        ['sign']
      );

      const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
      encodedToken = `${message}.${arrayBufferToBase64Url(signature)}`;
    } catch (e) {
      encodeError = e instanceof Error ? e.message : 'Failed to encode JWT';
    }
  }

  async function copyDecoded() {
    if (!decodeInput.trim()) return;
    await navigator.clipboard.writeText(decodeInput.trim());
    copiedDecode = true;
    setTimeout(() => (copiedDecode = false), 2000);
  }

  async function copyEncoded() {
    if (!encodedToken) return;
    await navigator.clipboard.writeText(encodedToken);
    copiedEncode = true;
    setTimeout(() => (copiedEncode = false), 2000);
  }

  // ─── Verify ───────────────────────────────────────────────────
  async function verifyJwt() {
    verifyResult = null;
    verifyError = '';

    const token = verifyToken.trim();
    if (!token) return;

    const parts = token.split('.');
    if (parts.length !== 3) {
      verifyError = 'Invalid JWT: expected 3 parts separated by dots.';
      return;
    }

    try {
      const header = JSON.parse(base64UrlDecode(parts[0]));
      const payload = JSON.parse(base64UrlDecode(parts[1]));
      const alg = (header.alg as string) || 'HS256';

      const hashMap: Record<string, string> = {
        HS256: 'SHA-256',
        HS384: 'SHA-384',
        HS512: 'SHA-512'
      };
      const hash = hashMap[alg];
      if (!hash) throw new Error(`Unsupported algorithm: ${alg}. Only HS256, HS384, HS512 are supported.`);

      // Decode the signature from base64url to ArrayBuffer
      const sigBase64 = parts[2].replace(/-/g, '+').replace(/_/g, '/');
      const sigPad = sigBase64.length % 4 === 0 ? 0 : 4 - (sigBase64.length % 4);
      const sigBinary = atob(sigBase64 + '='.repeat(sigPad));
      const sigBytes = Uint8Array.from(sigBinary, c => c.charCodeAt(0));

      const encoder = new TextEncoder();
      const message = `${parts[0]}.${parts[1]}`;

      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(verifySecret),
        { name: 'HMAC', hash },
        false,
        ['verify']
      );

      const valid = await crypto.subtle.verify('HMAC', key, sigBytes, encoder.encode(message));

      verifyResult = { valid, header, payload, algorithm: alg, expiry: getExpiryStatus(payload) };
    } catch (e) {
      verifyError = e instanceof Error ? e.message : 'Verification failed';
    }
  }

  const CLAIM_LABELS: Record<string, string> = {
    iss: 'Issuer',
    sub: 'Subject',
    aud: 'Audience',
    exp: 'Expires',
    iat: 'Issued At',
    nbf: 'Not Before',
    jti: 'JWT ID'
  };
</script>

<svelte:head>
  <title>JWT Encoder / Decoder / Verifier — DevTools</title>
  <meta name="description" content="Decode JWT tokens and inspect headers, payloads, and expiry. Sign and verify tokens using HMAC algorithms (HS256, HS384, HS512). Runs entirely in your browser." />
  <meta property="og:title" content="JWT Encoder / Decoder / Verifier — DevTools" />
  <meta property="og:description" content="Decode JWT tokens and inspect headers, payloads, and expiry. Sign and verify tokens using HMAC algorithms (HS256, HS384, HS512). Runs entirely in your browser." />
</svelte:head>

<div class="space-y-6 w-full">
  <!-- Header -->
  <div>
    <div class="flex items-center gap-2 mb-1">
      <span class="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary-500/20 text-primary-400 uppercase tracking-wider">JWT</span>
      <h1 class="text-2xl font-bold text-white">JWT Encoder / Decoder / Verifier</h1>
    </div>
    <p class="text-surface-400 text-sm">Inspect, sign, and verify JWT tokens. Supports HMAC algorithms (HS256, HS384, HS512).</p>
  </div>

  <!-- Tab Toggle -->
  <div class="flex items-center gap-1 p-1 rounded-lg bg-surface-800 border border-surface-700 w-fit">
    <button
      class="px-4 py-1.5 rounded-md text-sm font-medium transition-all {mode === 'decode' ? 'bg-primary-500 text-white shadow-sm' : 'text-surface-400 hover:text-white'}"
      on:click={() => (mode = 'decode')}
    >Decode</button>
    <button
      class="px-4 py-1.5 rounded-md text-sm font-medium transition-all {mode === 'encode' ? 'bg-primary-500 text-white shadow-sm' : 'text-surface-400 hover:text-white'}"
      on:click={() => (mode = 'encode')}
    >Encode</button>
    <button
      class="px-4 py-1.5 rounded-md text-sm font-medium transition-all {mode === 'verify' ? 'bg-primary-500 text-white shadow-sm' : 'text-surface-400 hover:text-white'}"
      on:click={() => (mode = 'verify')}
    >Verify</button>
  </div>

  <!-- ── DECODE MODE ──────────────────────────────────────────── -->
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
          <!-- Header -->
          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <span class="text-xs font-semibold px-2 py-0.5 rounded bg-primary-500/20 text-primary-400 uppercase tracking-wider">Header</span>
            </div>
            <div class="rounded-lg border border-surface-700 overflow-hidden">
              <CodeBlock language="json" code={JSON.stringify(decodedHeader, null, 2)} rounded="rounded-lg" />
            </div>
          </div>

          <!-- Payload -->
          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <span class="text-xs font-semibold px-2 py-0.5 rounded bg-warning-500/20 text-warning-400 uppercase tracking-wider">Payload</span>
              <span class="text-xs {expiry.color} font-medium">{expiry.label}</span>
            </div>
            <div class="rounded-lg border border-surface-700 overflow-hidden">
              <CodeBlock language="json" code={JSON.stringify(decodedPayload, null, 2)} rounded="rounded-lg" />
            </div>
          </div>

          <!-- Signature -->
          <div class="space-y-2">
            <span class="text-xs font-semibold px-2 py-0.5 rounded bg-error-500/20 text-error-400 uppercase tracking-wider">Signature</span>
            <div class="rounded-lg bg-surface-800 border border-surface-700 p-3">
              <p class="font-mono text-xs text-surface-400 break-all leading-relaxed">{decodedSignature}</p>
            </div>
          </div>
        </div>

        <!-- Claims Table -->
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

  <!-- ── VERIFY MODE ──────────────────────────────────────────── -->
  {#if mode === 'verify'}
    <div class="space-y-4">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <!-- Token -->
        <div class="space-y-2">
          <span class="text-xs font-semibold text-surface-400 uppercase tracking-wider">JWT Token</span>
          <textarea
            bind:value={verifyToken}
            placeholder="Paste your JWT here (eyJ...)"
            class="w-full h-48 px-3 py-3 rounded-lg bg-surface-800 border border-surface-700 text-white font-mono text-sm resize-none focus:outline-none focus:border-primary-500 placeholder-surface-600 transition-colors"
            spellcheck="false"
          />
        </div>

        <!-- Secret -->
        <div class="space-y-2">
          <span class="text-xs font-semibold text-surface-400 uppercase tracking-wider">Secret Key</span>
          <input
            bind:value={verifySecret}
            type="text"
            placeholder="your-secret-key"
            class="w-full px-3 py-2.5 rounded-lg bg-surface-800 border border-surface-700 text-white font-mono text-sm focus:outline-none focus:border-primary-500 transition-colors"
            spellcheck="false"
          />
          <p class="text-xs text-surface-500">The algorithm is read from the token header (<span class="font-mono">alg</span> claim).</p>
        </div>
      </div>

      <button
        on:click={verifyJwt}
        disabled={!verifyToken.trim() || !verifySecret}
        class="px-4 py-2 rounded-lg bg-primary-500 hover:bg-primary-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
      >
        Verify Signature
      </button>

      {#if verifyError}
        <div class="flex items-center gap-2 px-4 py-3 rounded-lg bg-error-500/10 border border-error-500/20 text-error-400 text-sm">
          <svg viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 flex-shrink-0"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/></svg>
          <span class="font-mono text-xs">{verifyError}</span>
        </div>
      {/if}

      {#if verifyResult !== null}
        <!-- Verdict banner -->
        <div class="flex items-center gap-3 px-5 py-4 rounded-xl border
          {verifyResult.valid
            ? 'bg-success-500/10 border-success-500/30'
            : 'bg-error-500/10 border-error-500/30'}">
          {#if verifyResult.valid}
            <div class="w-10 h-10 rounded-full bg-success-500/20 flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 text-success-400">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd"/>
              </svg>
            </div>
            <div>
              <p class="text-success-400 font-semibold">Signature Valid</p>
              <p class="text-xs text-surface-400 mt-0.5">The signature was verified against the provided secret using <span class="font-mono text-surface-300">{verifyResult.algorithm}</span>.</p>
            </div>
          {:else}
            <div class="w-10 h-10 rounded-full bg-error-500/20 flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 text-error-400">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd"/>
              </svg>
            </div>
            <div>
              <p class="text-error-400 font-semibold">Signature Invalid</p>
              <p class="text-xs text-surface-400 mt-0.5">The signature does not match. The secret may be wrong or the token was tampered with.</p>
            </div>
          {/if}
        </div>

        <!-- Expiry status + algorithm row -->
        <div class="flex flex-wrap gap-3">
          <div class="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-800 border border-surface-700">
            <span class="text-xs text-surface-500">Algorithm</span>
            <span class="font-mono text-xs text-white font-semibold">{verifyResult.algorithm}</span>
          </div>
          <div class="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-800 border border-surface-700">
            <span class="text-xs text-surface-500">Expiry</span>
            <span class="text-xs font-medium {verifyResult.expiry.color}">{verifyResult.expiry.label}</span>
          </div>
          {#if 'exp' in verifyResult.payload}
            <div class="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-800 border border-surface-700">
              <span class="text-xs text-surface-500">Expires at</span>
              <span class="font-mono text-xs text-surface-300">{formatDate(Number(verifyResult.payload.exp))}</span>
            </div>
          {/if}
          {#if 'iat' in verifyResult.payload}
            <div class="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-800 border border-surface-700">
              <span class="text-xs text-surface-500">Issued at</span>
              <span class="font-mono text-xs text-surface-300">{formatDate(Number(verifyResult.payload.iat))}</span>
            </div>
          {/if}
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

  <!-- ── ENCODE MODE ──────────────────────────────────────────── -->
  {#if mode === 'encode'}
    <div class="space-y-4">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <!-- Header JSON -->
        <div class="space-y-2">
          <span class="text-xs font-semibold text-surface-400 uppercase tracking-wider">Header</span>
          <textarea
            bind:value={encodeHeader}
            class="w-full h-52 px-3 py-3 rounded-lg bg-surface-800 border border-surface-700 text-white font-mono text-sm resize-none focus:outline-none focus:border-primary-500 transition-colors"
            spellcheck="false"
          />
        </div>

        <!-- Payload JSON -->
        <div class="space-y-2">
          <span class="text-xs font-semibold text-surface-400 uppercase tracking-wider">Payload</span>
          <textarea
            bind:value={encodePayload}
            class="w-full h-52 px-3 py-3 rounded-lg bg-surface-800 border border-surface-700 text-white font-mono text-sm resize-none focus:outline-none focus:border-primary-500 transition-colors"
            spellcheck="false"
          />
        </div>
      </div>

      <!-- Secret -->
      <div class="space-y-2">
        <span class="text-xs font-semibold text-surface-400 uppercase tracking-wider">Secret Key</span>
        <input
          bind:value={encodeSecret}
          type="text"
          placeholder="your-secret-key"
          class="w-full px-3 py-2.5 rounded-lg bg-surface-800 border border-surface-700 text-white font-mono text-sm focus:outline-none focus:border-primary-500 transition-colors"
          spellcheck="false"
        />
      </div>

      <button
        on:click={encodeJwt}
        class="px-4 py-2 rounded-lg bg-primary-500 hover:bg-primary-400 text-white text-sm font-medium transition-colors"
      >
        Generate Token
      </button>

      {#if encodeError}
        <div class="flex items-center gap-2 px-4 py-3 rounded-lg bg-error-500/10 border border-error-500/20 text-error-400 text-sm">
          <svg viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 flex-shrink-0"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/></svg>
          <span class="font-mono text-xs">{encodeError}</span>
        </div>
      {/if}

      {#if encodedToken}
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-surface-400 uppercase tracking-wider">Generated Token</span>
            <button
              on:click={copyEncoded}
              class="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md transition-all
                {copiedEncode ? 'bg-success-500/20 text-success-400' : 'bg-surface-700 text-surface-400 hover:text-white'}"
            >
              {copiedEncode ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <div class="px-3 py-3 rounded-lg bg-surface-800 border border-success-500/30">
            <p class="font-mono text-xs text-surface-300 break-all leading-relaxed">
              <span class="text-primary-400">{encodedToken.split('.')[0]}</span>.<span class="text-warning-400">{encodedToken.split('.')[1]}</span>.<span class="text-error-400">{encodedToken.split('.')[2]}</span>
            </p>
          </div>
          <p class="text-xs text-surface-500">Header (purple) · Payload (yellow) · Signature (red)</p>
        </div>
      {/if}
    </div>
  {/if}
</div>
