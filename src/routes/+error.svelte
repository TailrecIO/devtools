<script lang="ts">
  import { page } from '$app/stores';

  $: status = $page.status;
  $: message = $page.error?.message || 'An error occurred';
</script>

<svelte:head>
  <title>{status} - DevTools</title>
  <meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="flex items-center justify-center min-h-[80vh] px-4">
  <div class="max-w-2xl w-full text-center">
    <div class="mb-8">
      <h1 class="text-8xl font-bold text-primary-500 mb-4">{status}</h1>
      <h2 class="text-3xl font-semibold text-white mb-4">
        {#if status === 404}
          Page Not Found
        {:else}
          Something Went Wrong
        {/if}
      </h2>
      <p class="text-lg text-surface-400 mb-8">
        {#if status === 404}
          The page you're looking for doesn't exist or has been moved.
        {:else}
          {message}
        {/if}
      </p>
    </div>

    <div class="flex flex-col sm:flex-row gap-4 justify-center">
      <a
        href="/"
        class="btn variant-filled-primary px-6 py-3 rounded-lg font-semibold hover:scale-105 transition-transform"
      >
        <svg class="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        Back to Home
      </a>
      <button
        on:click={() => window.history.back()}
        class="btn variant-ghost-surface px-6 py-3 rounded-lg font-semibold hover:bg-surface-800 transition-colors"
      >
        <svg class="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Go Back
      </button>
    </div>

    {#if status === 404}
      <div class="mt-12">
        <p class="text-sm text-surface-500 mb-4">Popular tools:</p>
        <div class="flex flex-wrap gap-2 justify-center">
          <a href="/base64" class="badge variant-soft-surface hover:variant-filled-surface transition-all">Base64</a>
          <a href="/json" class="badge variant-soft-surface hover:variant-filled-surface transition-all">JSON</a>
          <a href="/jwt" class="badge variant-soft-surface hover:variant-filled-surface transition-all">JWT</a>
          <a href="/regex" class="badge variant-soft-surface hover:variant-filled-surface transition-all">Regex</a>
          <a href="/hash" class="badge variant-soft-surface hover:variant-filled-surface transition-all">Hash</a>
          <a href="/uuid" class="badge variant-soft-surface hover:variant-filled-surface transition-all">UUID</a>
        </div>
      </div>
    {/if}
  </div>
</div>
