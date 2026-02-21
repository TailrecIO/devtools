<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { EditorView, basicSetup } from 'codemirror';
  import { EditorState } from '@codemirror/state';
  import { json } from '@codemirror/lang-json';
  import { oneDark } from '@codemirror/theme-one-dark';

  export let value = '';
  export let language: 'json' | 'text' = 'text';
  export let placeholder = '';
  export let readonly = false;
  export let minHeight = '200px';

  let editorElement: HTMLDivElement;
  let editorView: EditorView | null = null;

  const getLanguageExtension = () => {
    switch (language) {
      case 'json':
        return json();
      default:
        return [];
    }
  };

  onMount(() => {
    const extensions = [
      basicSetup,
      oneDark,
      EditorView.theme({
        '&': {
          fontSize: '14px',
          fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, "Cascadia Code", "Roboto Mono", "Courier New", monospace',
          minHeight: minHeight,
          borderRadius: '0.5rem',
          border: '1px solid rgb(64 64 64 / 0.5)',
          backgroundColor: '#1a1b26'
        },
        '.cm-content': {
          padding: '12px 0'
        },
        '.cm-line': {
          padding: '0 12px'
        },
        '.cm-gutters': {
          backgroundColor: '#16171e',
          borderRight: '1px solid rgb(64 64 64 / 0.3)',
          color: '#5a5f7a'
        },
        '.cm-activeLineGutter': {
          backgroundColor: 'rgb(96 165 250 / 0.1)'
        },
        '.cm-activeLine': {
          backgroundColor: 'rgb(96 165 250 / 0.05)'
        },
        '&.cm-focused': {
          outline: 'none',
          border: '1px solid rgb(96 165 250 / 0.5)'
        },
        '.cm-placeholder': {
          color: '#5a5f7a'
        }
      }),
      EditorView.editable.of(!readonly),
      EditorState.readOnly.of(readonly),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          value = update.state.doc.toString();
        }
      })
    ];

    const languageExt = getLanguageExtension();
    if (languageExt) extensions.push(languageExt);

    if (placeholder) {
      extensions.push(EditorView.placeholder(placeholder));
    }

    editorView = new EditorView({
      state: EditorState.create({
        doc: value,
        extensions
      }),
      parent: editorElement
    });
  });

  onDestroy(() => {
    editorView?.destroy();
  });

  // Update editor when value changes externally
  $: if (editorView && value !== editorView.state.doc.toString()) {
    editorView.dispatch({
      changes: {
        from: 0,
        to: editorView.state.doc.length,
        insert: value
      }
    });
  }
</script>

<div bind:this={editorElement} class="code-editor"></div>

<style>
  .code-editor {
    width: 100%;
  }
</style>
