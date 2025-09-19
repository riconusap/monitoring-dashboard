<template>
  <div class="application-card" :class="[`status-${applicationStats.status}`, { 'selected': isSelected }]">
    <div class="app-header">
      <div class="app-info">
        <div class="app-icon" :style="{ backgroundColor: application.color + '20', color: application.color }">
          {{ application.icon }}
        </div>
        <div class="app-details">
          <h3 class="app-name">{{ application.name }}</h3>
          <p class="app-description">{{ application.description }}</p>
          <div class="app-status">
            <span class="status-indicator" :class="`status-${applicationStats.status}`"></span>
            <span class="status-text">{{ getStatusText(applicationStats.status) }}</span>
            <span class="category-tag">{{ application.category }}</span>
          </div>
        </div>
      </div>
      
      <div class="app-actions">
        <button @click="refreshStats" :disabled="isLoading" class="refresh-btn">
          <span class="refresh-icon" :class="{ 'spinning': isLoading }">🔄</span>
        </button>
        <button @click="openApplication" class="open-btn">
          <span class="open-icon">🔗</span>
        </button>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-item">
        <div class="stat-icon users">👥</div>
        <div class="stat-content">
          <div class="stat-value">{{ applicationStats.concurrentUsers.count }}</div>
          <div class="stat-label">Active Users</div>
        </div>
      </div>

      <div class="stat-item">
        <div class="stat-icon uptime">⏱️</div>
        <div class="stat-content">
          <div class="stat-value">{{ applicationStats.uptime.uptime }}</div>
          <div class="stat-label">Uptime</div>
        </div>
      </div>

      <div class="stat-item">
        <div class="stat-icon tickets">🎫</div>
        <div class="stat-content">
          <div class="stat-value">{{ applicationStats.tickets.total }}</div>
          <div class="stat-label">Tickets</div>
          <div class="stat-subtitle">{{ applicationStats.tickets.open }} open</div>
        </div>
      </div>
    </div>

    <div class="app-footer">
      <div class="last-updated">
        <span class="update-icon">📅</span>
        Last updated: {{ formatTime(applicationStats.lastUpdated) }}
      </div>
      <div class="quick-actions">
        <button @click="viewDetails" class="details-btn">View Details</button>
        <button @click="selectApplication" class="select-btn" v-if="!isSelected">
          Monitor
        </button>
      </div>
    </div>

    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Application, ApplicationStats } from '@/types'

interface Props {
  application: Application
  applicationStats: ApplicationStats
  isSelected?: boolean
  isLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isSelected: false,
  isLoading: false
})

const emit = defineEmits<{
  refresh: [applicationId: number]
  select: [applicationId: number]
  viewDetails: [applicationId: number]
}>()

const getStatusText = (status: string) => {
  switch (status) {
    case 'healthy': return 'Healthy'
    case 'warning': return 'Warning'
    case 'critical': return 'Critical'
    default: return 'Unknown'
  }
}

const formatTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleTimeString()
}

const refreshStats = () => {
  emit('refresh', props.application.id)
}

const selectApplication = () => {
  emit('select', props.application.id)
}

const viewDetails = () => {
  emit('viewDetails', props.application.id)
}

const openApplication = () => {
  window.open(props.application.url, '_blank')
}
</script>

<style scoped>
.application-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  border: 2px solid transparent;
}

.application-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.application-card.selected {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.status-healthy {
  border-left: 4px solid #10b981;
}

.status-warning {
  border-left: 4px solid #f59e0b;
}

.status-critical {
  border-left: 4px solid #ef4444;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.app-info {
  display: flex;
  gap: 16px;
  flex: 1;
}

.app-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}

.app-details {
  flex: 1;
}

.app-name {
  margin: 0 0 4px 0;
  color: #1f2937;
  font-size: 18px;
  font-weight: 600;
}

.app-description {
  margin: 0 0 8px 0;
  color: #6b7280;
  font-size: 14px;
  line-height: 1.4;
}

.app-status {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-indicator.status-healthy {
  background-color: #10b981;
}

.status-indicator.status-warning {
  background-color: #f59e0b;
}

.status-indicator.status-critical {
  background-color: #ef4444;
}

.status-text {
  font-size: 12px;
  font-weight: 500;
  color: #374151;
}

.category-tag {
  background: #f3f4f6;
  color: #6b7280;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
}

.app-actions {
  display: flex;
  gap: 8px;
}

.refresh-btn,
.open-btn {
  width: 36px;
  height: 36px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.refresh-btn:hover,
.open-btn:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.refresh-icon.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 10px;
}

.stat-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.stat-icon.users {
  background: rgba(59, 130, 246, 0.1);
}

.stat-icon.uptime {
  background: rgba(16, 185, 129, 0.1);
}

.stat-icon.tickets {
  background: rgba(245, 158, 11, 0.1);
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  line-height: 1;
}

.stat-label {
  font-size: 11px;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 2px;
}

.stat-subtitle {
  font-size: 10px;
  color: #9ca3af;
  margin-top: 1px;
}

.app-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #f3f4f6;
}

.last-updated {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #6b7280;
  font-size: 12px;
}

.quick-actions {
  display: flex;
  gap: 8px;
}

.details-btn,
.select-btn {
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  color: #374151;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.details-btn:hover {
  background: #f9fafb;
}

.select-btn {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.select-btn:hover {
  background: #2563eb;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .app-header {
    flex-direction: column;
    gap: 16px;
  }
  
  .app-footer {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .quick-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>