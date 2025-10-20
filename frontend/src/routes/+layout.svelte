<script>
  import '../app.css';
  import Header from '$lib/components/layout/Header.svelte';
  import Footer from '$lib/components/layout/Footer.svelte';
</script>

<div class="min-h-screen bg-bg-primary dark:bg-dark-bg-primary flex flex-col transition-colors duration-300">
  <!-- Header -->
  <header class="
    sticky top-0 z-50
    bg-white/95 dark:bg-dark-bg-secondary/95
    backdrop-blur-md
    border-b border-gray-200 dark:border-dark-border
    shadow-soft dark:shadow-dark-soft
    transition-colors duration-300
  ">
    <Header />
  </header>
  
  <!-- Main Content -->
  <main class="flex-1 transition-colors duration-300">
    <slot />
  </main>
  
  <!-- Footer -->
  <footer class="
    bg-bg-secondary dark:bg-dark-bg-secondary
    border-t border-gray-200 dark:border-dark-border
    mt-20
    transition-colors duration-300
  ">
    <Footer />
  </footer>
</div>