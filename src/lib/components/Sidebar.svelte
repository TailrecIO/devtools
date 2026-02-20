<script lang="ts">
  import { page } from '$app/stores';

  const toolGroups = [
    {
      title: 'Encoding',
      tools: [
        {
          name: 'Base64',
          path: '/base64',
          badge: 'B64',
          description: 'Encode & decode Base64'
        },
        {
          name: 'URL',
          path: '/url',
          badge: 'URL',
          description: 'Encode & decode URLs'
        },
        {
          name: 'Hex',
          path: '/hex',
          badge: 'HEX',
          description: 'Encode & decode Hex'
        }
      ]
    },
    {
      title: 'Formatters',
      tools: [
        {
          name: 'JSON',
          path: '/json',
          badge: '{ }',
          description: 'Format & validate JSON'
        },
        {
          name: 'JSON Escape',
          path: '/json-escape',
          badge: 'ESC',
          description: 'Escape & unescape JSON strings'
        }
      ]
    },
    {
      title: 'Testing',
      tools: [
        {
          name: 'Regex',
          path: '/regex',
          badge: 'RE',
          description: 'Test regular expressions'
        }
      ]
    },
    {
      title: 'Security',
      tools: [
        {
          name: 'JWT Symmetric',
          path: '/jwt',
          badge: 'JWT',
          description: 'Encode & decode JWT (HMAC)'
        },
        {
          name: 'JWT Asymmetric',
          path: '/jwt-rsa',
          badge: 'RSA',
          description: 'Sign & verify JWT with RSA/PSS'
        },
        {
          name: 'Hash',
          path: '/hash',
          badge: 'HASH',
          description: 'MD5, SHA-1/2/3, RIPEMD-160'
        }
      ]
    },
    {
      title: 'Generators',
      tools: [
        {
          name: 'UUID',
          path: '/uuid',
          badge: 'UID',
          description: 'Generate UUIDs'
        }
      ]
    }
  ];

  $: currentPath = $page.url.pathname;
</script>

<div class="flex flex-col h-full py-5 bg-gradient-to-b from-surface-900 to-surface-950">
  <div class="px-5 pb-4 mb-2">
    <p class="text-[11px] font-bold text-surface-400 uppercase tracking-[0.15em]">Navigation</p>
  </div>

  <nav class="flex-1 overflow-y-auto px-4 space-y-6">
    {#each toolGroups as group}
      <div>
        <p class="px-3 mb-2 text-[10px] font-bold text-surface-500 uppercase tracking-[0.15em]">
          {group.title}
        </p>
        <ul class="space-y-1">
          {#each group.tools as tool}
            <li>
              <a
                href={tool.path}
                class="group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                  {currentPath === tool.path
                    ? 'bg-gradient-to-r from-primary-500/20 to-primary-600/20 text-primary-200 shadow-sm shadow-primary-500/10 border border-primary-500/20'
                    : 'hover:bg-surface-800/60 hover:shadow-sm text-surface-300 hover:text-white border border-transparent'}"
              >
                <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 font-mono text-[10px] font-bold transition-all duration-200 {currentPath === tool.path ? 'bg-gradient-to-br from-primary-500/30 to-primary-600/30 text-primary-300 shadow-sm' : 'bg-surface-800 text-surface-400 group-hover:bg-surface-700 group-hover:text-surface-300'}">
                  {tool.badge}
                </div>
                <span class="flex-1">{tool.name}</span>
                {#if currentPath === tool.path}
                  <div class="w-1.5 h-1.5 rounded-full bg-primary-400 shadow-sm shadow-primary-400/50"></div>
                {/if}
              </a>
            </li>
          {/each}
        </ul>
      </div>
    {/each}
  </nav>

  <div class="px-5 pt-5 mt-auto border-t border-surface-800/50">
    <div class="bg-surface-800/30 rounded-lg px-4 py-3 border border-surface-700/30">
      <div class="flex items-center gap-2 mb-1.5">
        <svg class="w-3.5 h-3.5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <p class="text-xs font-semibold text-surface-300">Privacy First</p>
      </div>
      <p class="text-[11px] text-surface-400 leading-relaxed">All processing done client-side. No data sent to servers.</p>
    </div>
  </div>
</div>
