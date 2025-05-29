<template>
  <div id="app">
    <AppNavbar />
    <main class="container-fluid mt-4">
      <router-view></router-view>
    </main>
  </div>
</template>

<script>
import AppNavbar from '@/components/AppNavbar.vue'

export default {
  components: {
    AppNavbar
  }
}
</script>

<style scoped>
.card {
  border-radius: 15px;
  border: none;
}

.card-header {
  border-radius: 15px 15px 0 0 !important;
}

.h-100 {
  min-height: 400px;
}
</style>