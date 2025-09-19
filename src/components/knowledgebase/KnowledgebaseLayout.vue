<template>
  <div class="knowledgebase-layout">
    <h1>Knowledge Base</h1>
    <faq-display />
  </div>
</template>

<script setup lang="ts">
import FaqDisplay from './FaqDisplay.vue';
</script>

<style scoped>
.knowledgebase-layout {
  padding: 20px;
}
</style>