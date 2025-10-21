<!--file HeroSection.vue -->
<script setup lang="ts">
import HeroDiagram from "./HeroDiagram.vue";
</script>

<template>
  <div class="hero">
    <div class="container">
      <!-- Tagline -->
    </div>

    <!-- Animated Diagram -->
    <HeroDiagram />
  </div>
</template>

<style scoped>
.hero {
  position: relative;
  z-index: 2;
  margin-bottom: 0;
  /* background-color: #101010; */

  @media (min-width: 768px) {
    margin-bottom: 60px;
  }
}
</style>
