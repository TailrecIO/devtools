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
          name: 'JWT',
          path: '/jwt',
          badge: 'JWT',
          description: 'Encode & decode JWT (HMAC)',
          tag: 'Symmetric'
        },
        {
          name: 'JWT RSA',
          path: '/jwt-rsa',
          badge: 'RSA',
          description: 'Sign & verify JWT with RSA/PSS',
          tag: 'Asymmetric'
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

<div class="flex flex-col h-full py-4">
  <div class="px-4 pb-3 mb-1">
    <p class="text-[10px] font-semibold text-surface-500 uppercase tracking-[0.15em]">Navigation</p>
  </div>

  <nav class="flex-1 overflow-y-auto px-3 space-y-5">
    {#each toolGroups as group}
      <div>
        <p class="px-2 mb-1.5 text-[10px] font-semibold text-surface-500 uppercase tracking-[0.15em]">
          {group.title}
        </p>
        <ul class="space-y-0.5">
          {#each group.tools as tool}
            <li>
              <a
                href={tool.path}
                class="flex items-center gap-3 px-2 py-2 rounded-lg text-sm font-medium transition-all duration-150
                  {currentPath === tool.path
                    ? 'bg-primary-500/15 text-primary-300 border border-primary-500/20'
                    : 'text-surface-300 hover:bg-surface-800 hover:text-white border border-transparent'}"
              >
                <div class="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 font-mono text-[9px] font-bold
                  {currentPath === tool.path
                    ? 'bg-primary-500/30 text-primary-300'
                    : 'bg-surface-700 text-surface-400'}">
                  {tool.badge}
                </div>
                <span>{tool.name}</span>
                {#if tool.tag}
                  <span class="ml-auto text-[9px] font-medium px-1.5 py-0.5 rounded
                    {currentPath === tool.path
                      ? 'bg-primary-500/20 text-primary-400'
                      : 'bg-surface-700 text-surface-500'}">{tool.tag}</span>
                {:else if currentPath === tool.path}
                  <div class="ml-auto w-1.5 h-1.5 rounded-full bg-primary-400"></div>
                {/if}
              </a>
            </li>
          {/each}
        </ul>
      </div>
    {/each}
  </nav>

  <div class="px-4 pt-4 mt-auto border-t border-surface-700">
    <p class="text-[10px] text-surface-600 text-center">All processing done client-side</p>
  </div>
</div>
