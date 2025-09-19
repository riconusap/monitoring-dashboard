<template>
  <div class="stats-card" :class="`stats-card--${type}`">
    <div class="stats-card__icon">
      <component :is="iconComponent" />
    </div>
    
    <div class="stats-card__content">
      <div class="stats-card__value">{{ value }}</div>
      <div class="stats-card__label">{{ label }}</div>
      <div v-if="subtitle" class="stats-card__subtitle">{{ subtitle }}</div>
    </div>
    
    <div v-if="isLoading" class="stats-card__loading">
      <div class="loading-spinner"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  type: 'users' | 'uptime' | 'tickets'
  value: string | number
  label: string
  subtitle?: string
  isLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false
})

const iconComponent = computed(() => {
  switch (props.type) {
    case 'users':
      return 'UsersIcon'
    case 'uptime':
      return 'ClockIcon'
    case 'tickets':
      return 'TicketIcon'
    default:
      return 'ChartIcon'
  }
})
</script>

<style scoped>
.stats-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  position: relative;
  overflow: hidden;
}

.stats-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.stats-card--users {
  border-left: 4px solid #3b82f6;
}

.stats-card--uptime {
  border-left: 4px solid #10b981;
}

.stats-card--tickets {
  border-left: 4px solid #f59e0b;
}

.stats-card__icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  font-size: 24px;
}

.stats-card--users .stats-card__icon {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.stats-card--users .stats-card__icon::before {
  content: '👥';
}

.stats-card--uptime .stats-card__icon {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.stats-card--uptime .stats-card__icon::before {
  content: '⏱️';
}

.stats-card--tickets .stats-card__icon {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.stats-card--tickets .stats-card__icon::before {
  content: '🎫';
}

.stats-card__content {
  flex: 1;
}

.stats-card__value {
  font-size: 32px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 4px;
  line-height: 1;
}

.stats-card__label {
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stats-card__subtitle {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 4px;
}

.stats-card__loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .stats-card {
    padding: 20px;
  }
  
  .stats-card__value {
    font-size: 24px;
  }
  
  .stats-card__icon {
    width: 40px;
    height: 40px;
    font-size: 20px;
  }
}
</style>