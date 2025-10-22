import { o as onMount } from './ssr2-KRueQ-Mb.js';

const is_legacy = onMount.toString().includes("$$") || /function \w+\(\) \{\}/.test(onMount.toString());
if (is_legacy) {
  ({
    url: new URL("https://example.com")
  });
}
//# sourceMappingURL=state.svelte-Bbc4_9mM.js.map
