<template>
  <div class="monitoring-iframe">
    <div class="iframe-header">
      <div class="iframe-title">
        <h3>Monitoring Application</h3>
        <div class="iframe-url">{{ displayUrl }}</div>
      </div>
      
      <div class="iframe-controls">
        <button 
          @click="refreshIframe" 
          class="refresh-btn"
          :disabled="isLoading"
        >
          <span class="refresh-icon">🔄</span>
          Refresh
        </button>
        
        <button 
          @click="openInNewTab" 
          class="external-btn"
        >
          <span class="external-icon">🔗</span>
          Open
        </button>
      </div>
    </div>

    <div class="iframe-container">
      <div v-if="isLoading" class="iframe-loading">
        <div class="loading-spinner"></div>
        <p>Loading monitoring application...</p>
      </div>
      
      <div v-if="error" class="iframe-error">
        <div class="error-icon">⚠️</div>
        <h4>Failed to load monitoring application</h4>
        <p>{{ error }}</p>
        <button @click="refreshIframe" class="retry-btn">
          Try Again
        </button>
      </div>

      <iframe
        v-if="!error"
        ref="iframeRef"
        :src="iframeSrc"
        @load="onIframeLoad"
        @error="onIframeError"
        class="monitoring-frame"
        :class="{ 'loading': isLoading }"
        frameborder="0"
        allowfullscreen
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface Props {
  url: string
  height?: string
}

const props = withDefaults(defineProps<Props>(), {
  height: '600px'
})

const iframeRef = ref<HTMLIFrameElement | null>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)

const iframeSrc = ref(props.url)
const displayUrl = computed(() => {
  try {
    const url = new URL(props.url)
    return url.hostname + url.pathname
  } catch {
    return props.url
  }
})

const refreshIframe = () => {
  isLoading.value = true
  error.value = null
  
  if (iframeRef.value) {
    iframeRef.value.src = iframeSrc.value + '?t=' + Date.now()
  } else {
    iframeSrc.value = props.url + '?t=' + Date.now()
  }
}

const openInNewTab = () => {
  window.open(props.url, '_blank')
}

const onIframeLoad = () => {
  isLoading.value = false
  error.value = null
}

const onIframeError = () => {
  isLoading.value = false
  error.value = 'The monitoring application could not be loaded. Please check the URL or try again later.'
}

onMounted(() => {
  // Set a timeout to handle cases where the iframe doesn't trigger load event
  setTimeout(() => {
    if (isLoading.value) {
      onIframeError()
    }
  }, 10000) // 10 seconds timeout
})
</script>

<style scoped>
.monitoring-iframe {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.iframe-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.iframe-title h3 {
  margin: 0 0 4px 0;
  color: #1f2937;
  font-size: 18px;
  font-weight: 600;
}

.iframe-url {
  font-size: 12px;
  color: #6b7280;
  font-family: monospace;
}

.iframe-controls {
  display: flex;
  gap: 8px;
}

.refresh-btn,
.external-btn,
.retry-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  color: #374151;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.refresh-btn:hover,
.external-btn:hover,
.retry-btn:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.iframe-container {
  position: relative;
  height: v-bind(height);
}

.monitoring-frame {
  width: 100%;
  height: 100%;
  border: none;
  transition: opacity 0.3s ease-in-out;
}

.monitoring-frame.loading {
  opacity: 0.5;
}

.iframe-loading,
.iframe-error {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: white;
  z-index: 10;
}

.iframe-loading {
  color: #6b7280;
}

.iframe-error {
  color: #dc2626;
  text-align: center;
  padding: 40px;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.iframe-error h4 {
  margin: 0 0 8px 0;
  color: #991b1b;
}

.iframe-error p {
  margin: 0 0 20px 0;
  color: #6b7280;
  max-width: 400px;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e5e7eb;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .iframe-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .iframe-controls {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>