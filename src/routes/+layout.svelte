<script lang="ts">
  import "../app.postcss";
  import { AppShell, AppBar } from "@skeletonlabs/skeleton";
  import { storeHighlightJs } from "@skeletonlabs/skeleton";
  import hljs from "highlight.js/lib/core";
  import json from "highlight.js/lib/languages/json";
  import Sidebar from "$lib/components/Sidebar.svelte";
  import { page } from '$app/stores';

  hljs.registerLanguage("json", json);
  storeHighlightJs.set(hljs);
</script>

<svelte:head>
  <meta name="description" content="Privacy-first developer utilities. Base64, URL, JSON, JWT, Regex, UUID, Hash — everything runs entirely in your browser. No data is ever sent to a server." />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="DevTools" />
  <meta property="og:title" content="DevTools — Developer Utilities" />
  <meta property="og:description" content="Privacy-first developer utilities. Base64, URL, JSON, JWT, Regex, UUID, Hash — everything runs entirely in your browser. No data is ever sent to a server." />
  <meta property="og:url" content={$page.url.href} />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="DevTools — Developer Utilities" />
  <meta name="twitter:description" content="Privacy-first developer utilities. Base64, URL, JSON, JWT, Regex, UUID, Hash — everything runs entirely in your browser. No data is ever sent to a server." />
  <link rel="canonical" href={$page.url.href} />
</svelte:head>

<AppShell
  slotSidebarLeft="bg-surface-900 border-r border-surface-700 w-64 overflow-y-auto flex-shrink-0"
  regionPage="overflow-y-auto"
>
  <svelte:fragment slot="header">
    <AppBar
      background="bg-surface-900 border-b border-surface-700"
      padding="px-6 py-3"
    >
      <svelte:fragment slot="lead">
        <div class="flex items-center gap-3">
          <div
            class="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center flex-shrink-0"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              class="w-4 h-4 text-white"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"
              />
            </svg>
          </div>
          <a
            href="/"
            class="flex items-baseline gap-2 hover:opacity-80 transition-opacity"
          >
            <span class="font-bold text-lg text-white tracking-tight"
              >DevTools</span
            >
            <span class="text-xs text-surface-400 hidden md:inline"
              >Developer Utilities — runs entirely in your browser</span
            >
          </a>
        </div>
      </svelte:fragment>
      <svelte:fragment slot="trail">
        <a
          href="https://wsgrok.com"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-surface-700 bg-surface-800 text-surface-400 hover:text-white hover:border-surface-600 transition-all"
        >
          wsgrok.com
        </a>
      </svelte:fragment>
    </AppBar>
  </svelte:fragment>

  <svelte:fragment slot="sidebarLeft">
    <Sidebar />
  </svelte:fragment>

  <div class="p-6">
    <slot />
  </div>
</AppShell>
