<template>
  <div>
    <header>
      <nav>
        <NuxtLink to="/">ホーム</NuxtLink>
      </nav>
    </header>
    
    <main>
      <NuxtPage />
    </main>
    
    <footer>
      <p>© 2025 <a href="http://github.com/qoorus" target="_blank" rel="noopener noreferrer">qoorus</a></p>
    </footer>
  </div>
</template>

<style>
html, body {
  margin: 0;
  padding: 0;
  font-family: 'Arial', sans-serif;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 15px;
}
</style>