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

  const SITE_URL = "https://devtools.wsgrok.com";

  let mobileMenuOpen = false;

  function toggleMobileMenu() {
    mobileMenuOpen = !mobileMenuOpen;
  }

  function closeMobileMenu() {
    mobileMenuOpen = false;
  }

  // Close menu when route changes
  $: $page.url.pathname, closeMobileMenu();
</script>

<svelte:head>
  <meta name="description" content="Privacy-first developer utilities. Base64, URL, JSON, JWT, Regex, UUID, Hash — everything runs entirely in your browser. No data is ever sent to a server." />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="DevTools" />
  <meta property="og:title" content="DevTools — Developer Utilities" />
  <meta property="og:description" content="Privacy-first developer utilities. Base64, URL, JSON, JWT, Regex, UUID, Hash — everything runs entirely in your browser. No data is ever sent to a server." />
  <meta property="og:url" content={$page.url.href} />
  <meta property="og:image" content="{SITE_URL}/screenshot.jpg" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="DevTools — Developer Utilities" />
  <meta name="twitter:description" content="Privacy-first developer utilities. Base64, URL, JSON, JWT, Regex, UUID, Hash — everything runs entirely in your browser. No data is ever sent to a server." />
  <meta name="twitter:image" content="{SITE_URL}/screenshot.jpg" />
  <link rel="canonical" href={$page.url.href} />
</svelte:head>

<AppShell
  slotSidebarLeft="w-72 overflow-y-auto flex-shrink-0 border-r border-surface-700/50 {mobileMenuOpen ? 'fixed lg:static inset-y-0 left-0 z-30 mobile-sidebar-enter' : 'hidden lg:block'}"
  regionPage="overflow-y-auto"
>
  <svelte:fragment slot="header">
    <AppBar
      background="bg-gradient-to-r from-surface-900 to-surface-800"
      border="border-b border-surface-700/50"
      shadow="shadow-lg"
      padding="px-4 md:px-6 py-4"
    >
      <svelte:fragment slot="lead">
        <div class="flex items-center gap-3">
          <!-- Mobile menu toggle -->
          <button
            on:click={toggleMobileMenu}
            class="lg:hidden p-2 rounded-lg hover:bg-surface-800 transition-colors"
            aria-label="Toggle menu"
          >
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {#if mobileMenuOpen}
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              {:else}
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              {/if}
            </svg>
          </button>

          <img src="/logo.png" alt="DevTools Logo" class="w-8 h-8 flex-shrink-0" />
          <a
            href="/"
            class="flex items-baseline gap-2.5 hover:opacity-80 transition-all duration-200"
          >
            <span class="font-bold text-xl text-white tracking-tight"
              >DevTools</span
            >
            <span class="text-xs text-surface-400 hidden xl:inline font-medium"
              >Developer Utilities — runs entirely in your browser</span
            >
          </a>
        </div>
      </svelte:fragment>
      <svelte:fragment slot="trail">
        <div class="flex items-center gap-2 md:gap-3">
          <a
            href="https://github.com/TailrecIO/devtools/releases"
            target="_blank"
            rel="noopener noreferrer"
            class="hidden xl:flex items-center gap-2 text-xs text-surface-400 hover:text-primary-400 transition-colors duration-200"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <span class="font-medium">Desktop App Available</span>
          </a>
          <a
            href="https://github.com/TailrecIO/devtools"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1.5 rounded-lg bg-surface-800 hover:bg-surface-700 border border-surface-600 hover:border-primary-500/50 transition-all duration-200 group"
          >
            <svg class="w-4 h-4 text-surface-400 group-hover:text-primary-400 transition-colors" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            <span class="text-sm font-semibold text-surface-300 group-hover:text-white transition-colors hidden sm:inline">Open Source</span>
          </a>
        </div>
      </svelte:fragment>
    </AppBar>
  </svelte:fragment>

  <svelte:fragment slot="sidebarLeft">
    <Sidebar />
  </svelte:fragment>

  <!-- Mobile backdrop overlay -->
  {#if mobileMenuOpen}
    <button
      on:click={closeMobileMenu}
      class="lg:hidden fixed inset-0 bg-black/60 z-20 backdrop-blur-sm"
      aria-label="Close menu"
    ></button>
  {/if}

  <div class="p-4 md:p-6 lg:p-8">
    <slot />
  </div>
</AppShell>
