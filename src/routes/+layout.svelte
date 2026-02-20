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
  slotSidebarLeft="w-64 overflow-y-auto flex-shrink-0"
  regionPage="overflow-y-auto"
>
  <svelte:fragment slot="header">
    <AppBar
      padding="px-6 py-3"
    >
      <svelte:fragment slot="lead">
        <div class="flex items-center gap-3">
          <img src="/logo.svg" alt="DevTools Logo" class="w-8 h-8 flex-shrink-0" />
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
          class="btn btn-sm variant-ghost-surface"
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
