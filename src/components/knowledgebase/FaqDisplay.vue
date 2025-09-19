<template>
  <div class="faq-wrapper">
    <div class="faq-header">
      <h2>Knowledge Base - FAQ Section</h2>
      <p>This component will display frequently asked questions</p>
    </div>
    
    <div class="faq-content">
      <div v-if="knowledgebaseStore.isLoading" class="loading">
        Loading FAQs...
      </div>
      
      <div v-else-if="knowledgebaseStore.error" class="error">
        Error: {{ knowledgebaseStore.error }}
      </div>
      
      <div v-else class="faq-items">
        <div 
          v-for="faq in knowledgebaseStore.getFaqs" 
          :key="faq.id"
          class="faq-item"
        >
          <h3>{{ faq.question }}</h3>
          <p>{{ faq.answer }}</p>
          <span class="faq-category">{{ faq.category }}</span>
        </div>
        
        <div v-if="knowledgebaseStore.getFaqs.length === 0" class="no-faqs">
          No FAQs available at this time.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useKnowledgebaseStore } from '@/stores/knowledgebase'

defineOptions({
  name: 'FaqDisplay'
})

const knowledgebaseStore = useKnowledgebaseStore()

onMounted(async () => {
  try {
    await knowledgebaseStore.fetchFAQs()
  } catch (error) {
    console.error('Failed to load FAQs:', error)
  }
})
</script>

<style scoped>
.faq-wrapper {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.faq-header {
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.faq-content {
  padding: 24px;
}

.faq-item {
  border-bottom: 1px solid #e5e7eb;
  padding: 16px 0;
}

.faq-item:last-child {
  border-bottom: none;
}

.faq-category {
  display: inline-block;
  background: #e5e7eb;
  color: #374151;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  margin-top: 8px;
}

.loading, .error, .no-faqs {
  text-align: center;
  padding: 20px;
  color: #6b7280;
}

.error {
  color: #dc2626;
}
</style>