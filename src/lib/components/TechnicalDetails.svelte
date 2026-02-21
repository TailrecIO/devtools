<script lang="ts">
  export let title: string;
  export let sections: Array<{
    heading: string;
    content: string;
  }>;
</script>

<div class="mt-12 pt-8 border-t border-surface-700">
  <div class="max-w-4xl">
    <h2 class="text-xl font-bold text-white mb-6 flex items-center gap-2">
      <svg class="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      {title}
    </h2>

    <div class="space-y-6">
      {#each sections as section}
        <div>
          <h3 class="text-base font-semibold text-primary-300 mb-2">{section.heading}</h3>
          <p class="text-sm text-surface-300 leading-relaxed">{section.content}</p>
        </div>
      {/each}
    </div>
  </div>
</div>
