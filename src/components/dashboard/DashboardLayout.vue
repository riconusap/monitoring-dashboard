<template>
  <el-container class="dashboard-layout">
    <!-- Header -->
    <el-header class="dashboard-header">
      <div class="header-content">
        <div class="header-left">
          <div class="logo-section">
            <el-icon class="logo-icon" :size="28">
              <Monitor />
            </el-icon>
            <h1 class="logo-text">Monitoring Dashboard</h1>
          </div>
        </div>
        
        <div class="header-right">
          <el-space :size="16">
            <!-- Notifications -->
            <el-badge :value="3" :max="99" class="notification-badge">
              <el-button :icon="Bell" circle />
            </el-badge>
            
            <!-- Theme Toggle -->
            <el-tooltip content="Toggle Theme" placement="bottom">
              <el-button :icon="isDark ? Sunny : Moon" circle @click="toggleTheme" />
            </el-tooltip>
            
            <!-- User Dropdown -->
            <el-dropdown @command="handleUserCommand">
              <el-button class="user-button">
                <el-avatar :size="32" class="user-avatar">
                  <el-icon><User /></el-icon>
                </el-avatar>
                <span class="user-name">{{ authStore.user?.username || 'User' }}</span>
                <el-icon class="dropdown-icon"><ArrowDown /></el-icon>
              </el-button>
              
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item :icon="User" command="profile">
                    Profile Settings
                  </el-dropdown-item>
                  <el-dropdown-item :icon="Setting" command="settings">
                    Preferences
                  </el-dropdown-item>
                  <el-dropdown-item :icon="Help" command="help">
                    Help & Support
                  </el-dropdown-item>
                  <el-dropdown-item divided :icon="SwitchButton" command="logout">
                    Logout
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </el-space>
        </div>
      </div>
    </el-header>

    <!-- Main Content -->
    <el-main class="dashboard-main">
      <div class="main-content">
        <!-- Tab Navigation -->
        <el-tabs 
          v-model="activeTab" 
          @tab-change="handleTabChange" 
          class="dashboard-tabs"
          type="card"
          :stretch="true"
          :before-leave="beforeTabLeave"
          tab-position="top"
        >
          <el-tab-pane label="Monitoring" name="monitoring">
            <template #label>
              <span class="tab-label">
                <el-icon><Odometer /></el-icon>
                Monitoring
              </span>
            </template>
            <div class="tab-content" v-loading="isTabLoading">
              <slot name="monitoring">
                <slot />
              </slot>
            </div>
          </el-tab-pane>
          
          <el-tab-pane label="Knowledge Base" name="knowledgebase">
            <template #label>
              <span class="tab-label">
                <el-icon><Reading /></el-icon>
                Knowledge Base
              </span>
            </template>
            <div class="tab-content" v-loading="isTabLoading">
              <KnowledgebaseViewVue />
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-main>

    <!-- Footer -->
    <el-footer class="dashboard-footer">
      <div class="footer-content">
        <div class="footer-left">
          <el-text type="info">
            © 2024 Monitoring Dashboard. All rights reserved.
          </el-text>
        </div>
        
        <div class="footer-right">
          <el-space :size="16">
            <el-link :icon="ChatDotRound" href="#" :underline="false">Support</el-link>
            <el-link :icon="Document" href="#" :underline="false">Documentation</el-link>
            <el-link :icon="Connection" href="#" :underline="false">API</el-link>
          </el-space>
        </div>
      </div>
    </el-footer>
  </el-container>
</template>

<script lang="ts">
import { ref, computed, defineComponent } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { 
  Monitor, Bell, User, ArrowDown, Sunny, Moon, SwitchButton,
  Setting, Help, Odometer, Reading, ChatDotRound, Document, Connection
} from '@element-plus/icons-vue'
import KnowledgebaseViewVue from '@/views/KnowledgebaseView.vue'


export default defineComponent({
  name: 'DashboardLayout',
  components: {
    Monitor, Bell, User, ArrowDown, Sunny, Moon, SwitchButton,
    Setting, Help, Odometer, Reading, ChatDotRound, Document, Connection, KnowledgebaseViewVue
  },
  emits: [],
  setup() {
    // Router composables
    const router = useRouter()
    const route = useRoute()

    // Reactive state
    const isDark = ref<boolean>(false)
    const activeTab = ref<string>('monitoring')
    const isTabLoading = ref<boolean>(false)

    // Set initial tab based on route
    if (route.params.tab === 'knowledgebase') {
      activeTab.value = 'knowledgebase'
    }

    // Computed properties
    const authStore = computed(() => {
      // Simple auth store access
      return {
        user: { username: 'Admin User' },
        logout: () => {
          router.push('/login')
        }
      }
    })

    // Methods
    const beforeTabLeave = (activeName: string, oldActiveName: string): boolean => {
      // Optional: Add validation before leaving tab
      // For example, check if there are unsaved changes
      console.log(`Switching from ${oldActiveName} to ${activeName}`)
      return true // Allow tab change
    }

    const handleTabChange = (): void => {
      isTabLoading.value = true
      // Simulate loading delay for better UX
      setTimeout(() => {
        isTabLoading.value = false
      }, 300)
    }

    const toggleTheme = (): void => {
      isDark.value = !isDark.value
      ElMessage.success(`Switched to ${isDark.value ? 'dark' : 'light'} theme`)
      
      // Apply theme to document
      if (isDark.value) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }

    const handleUserCommand = (command: string): void => {
      switch (command) {
        case 'profile':
          ElMessage.info('Profile settings opened')
          break
        case 'settings':
          ElMessage.info('Preferences opened')
          break
        case 'help':
          ElMessage.info('Help & Support opened')
          break
        case 'logout':
          handleLogout()
          break
      }
    }

    const handleLogout = (): void => {
      ElMessage.success('Logged out successfully')
      authStore.value.logout()
    }

    return {
      isDark,
      activeTab,
      isTabLoading,
      authStore,
      beforeTabLeave,
      handleTabChange,
      toggleTheme,
      handleUserCommand,
      handleLogout,
      // Icons
      Monitor, Bell, User, ArrowDown, Sunny, Moon, SwitchButton,
      Setting, Help, Odometer, Reading, ChatDotRound, Document, Connection
    }
  }
})
</script>

<style scoped>
.dashboard-layout {
  min-height: 100vh;
  width: 100%;
}

.dashboard-header {
  background: #fff;
  border-bottom: 1px solid var(--el-border-color-light);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  height: 70px !important;
  padding: 0;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 32px;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  color: var(--el-color-primary);
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
  color: var(--el-text-color-primary);
  margin: 0;
}

.notification-badge {
  cursor: pointer;
}

.user-button {
  border: none !important;
  background: transparent !important;
  padding: 8px 16px !important;
  height: auto !important;
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-button:hover {
  background: var(--el-color-primary-light-9) !important;
}

.user-avatar {
  background: var(--el-color-primary-light-8);
  color: var(--el-color-primary);
}

.user-name {
  font-weight: 500;
  margin-left: 0.3em;
  color: var(--el-text-color-primary);
}

.dropdown-icon {
  margin-left: 4px;
  transition: transform 0.3s ease;
}

.user-button:hover .dropdown-icon {
  transform: rotate(180deg);
}

.dashboard-main {
  background: var(--el-bg-color-page);
  padding: 24px;
  flex: 1;
  margin-top: 2em;
  margin-bottom: 2em;
}

.main-content {
  max-width: 1400px;
  margin: 0 auto;
  height: 100%;
}

.dashboard-tabs {
  height: 100%;
  --el-tabs-header-height: 60px;
}

.dashboard-tabs :deep(.el-tabs__header) {
  margin: 0 0 1.25em 0;
  background: transparent;
  padding: 0;
}

.dashboard-tabs :deep(.el-tabs__nav-wrap) {
  padding: 0;
  margin-bottom: 0;
}

.dashboard-tabs :deep(.el-tabs__nav) {
  border: none;
}

.dashboard-tabs :deep(.el-tabs__item) {
  font-size: 16px;
  font-weight: 500;
  padding: 0 32px;
  height: 60px;
  line-height: 60px;
  border-radius: 12px;
  margin-right: 4px;
  border: 2px solid transparent;
  background: var(--el-fill-color-extra-light);
  color: var(--el-text-color-regular);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.dashboard-tabs :deep(.el-tabs__item::before) {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--el-color-primary);
  transform: scaleX(0);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.dashboard-tabs :deep(.el-tabs__item:hover) {
  background: var(--el-fill-color-light);
  color: var(--el-text-color-primary);
  transform: translateY(-2px);
}

.dashboard-tabs :deep(.el-tabs__item.is-active) {
  color: var(--el-color-primary);
  font-weight: 600;
  background: white;
  border-color: var(--el-border-color-light);
  border-bottom-color: white;
  transform: translateY(0);
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.dashboard-tabs :deep(.el-tabs__item.is-active::before) {
  transform: scaleX(1);
}

.dashboard-tabs :deep(.el-tabs__active-bar) {
  display: none;
}

.tab-label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.tab-label .el-icon {
  font-size: 18px;
  transition: transform 0.3s ease;
}

.dashboard-tabs :deep(.el-tabs__item:hover) .tab-label .el-icon {
  transform: scale(1.1);
}

.dashboard-tabs :deep(.el-tabs__item.is-active) .tab-label .el-icon {
  transform: scale(1.05);
  color: var(--el-color-primary);
}

.tab-content {
  min-height: calc(100vh - 280px);
  padding: 32px;
  background: white;
  border-radius: 12px;
  border: 1px solid var(--el-border-color-lighter);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-top: -1px;
  position: relative;
  z-index: 5;
}

/* Enhanced Element Plus tab content styling */
.dashboard-tabs :deep(.el-tab-pane) {
  animation: slideInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dashboard-footer {
  background: #fff;
  border-top: 1px solid var(--el-border-color-light);
  height: 60px !important;
  padding: 0;
}

.footer-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
}

.footer-right .el-link {
  font-size: 14px;
  color: var(--el-text-color-regular);
}

.footer-right .el-link:hover {
  color: var(--el-color-primary);
}

/* Responsive Design */
@media (max-width: 768px) {
  .header-content {
    padding: 0 16px;
  }
  
  .header-left {
    gap: 16px;
  }
  
  .logo-text {
    display: none;
  }
  
  .user-name {
    display: none;
  }
  
  .dashboard-main {
    padding: 16px;
  }
  
  .dashboard-tabs :deep(.el-tabs__item) {
    padding: 0 20px;
    font-size: 14px;
    height: 50px;
    line-height: 50px;
    margin-right: 2px;
  }
  
  .tab-label {
    gap: 6px;
    font-size: 14px;
  }
  
  .tab-label .el-icon {
    font-size: 16px;
  }
  
  .tab-content {
    min-height: calc(100vh - 240px);
    padding: 20px;
    border-radius: 8px;
  }
  
  .footer-content {
    flex-direction: column;
    gap: 8px;
    padding: 12px 16px;
  }
  
  .dashboard-footer {
    height: auto !important;
  }
}

@media (max-width: 480px) {
  .header-content {
    padding: 0 12px;
  }
  
  .dashboard-tabs :deep(.el-tabs__item) {
    padding: 0 16px;
    font-size: 13px;
    height: 45px;
    line-height: 45px;
  }
  
  .tab-label {
    gap: 4px;
    font-size: 13px;
  }
  
  .tab-label .el-icon {
    font-size: 14px;
  }
  
  .tab-content {
    padding: 16px;
    min-height: calc(100vh - 220px);
  }
  
  .footer-right .el-space {
    flex-wrap: wrap;
    justify-content: center;
  }
}

/* Dark mode support */
.dark .dashboard-header {
  background: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-darker);
}

.dark .dashboard-footer {
  background: var(--el-bg-color);
  border-top: 1px solid var(--el-border-color-darker);
}

.dark .dashboard-tabs :deep(.el-tabs__header) {
  border-bottom-color: var(--el-border-color-darker);
}

.dark .dashboard-tabs :deep(.el-tabs__item) {
  background: var(--el-fill-color-dark);
  color: var(--el-text-color-regular);
  border-color: var(--el-border-color-darker);
}

.dark .dashboard-tabs :deep(.el-tabs__item:hover) {
  background: var(--el-fill-color);
  color: var(--el-text-color-primary);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.dark .dashboard-tabs :deep(.el-tabs__item.is-active) {
  background: var(--el-bg-color);
  border-color: var(--el-border-color-darker);
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.2);
}

.dark .tab-content {
  background: var(--el-bg-color);
  border-color: var(--el-border-color-darker);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.dark .user-button:hover {
  background: var(--el-fill-color-light) !important;
}

/* Enhanced Animations */
.user-button {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.logo-icon {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.logo-section:hover .logo-icon {
  transform: scale(1.1) rotate(5deg);
}

.notification-badge .el-button {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.notification-badge:hover .el-button {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(var(--el-color-primary-rgb), 0.3);
}

/* Tab loading state styling */
.dashboard-tabs :deep(.el-loading-mask) {
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(4px);
}

.dark .dashboard-tabs :deep(.el-loading-mask) {
  background-color: rgba(0, 0, 0, 0.8);
}

/* Smooth focus states */
.dashboard-tabs :deep(.el-tabs__item:focus) {
  outline: 2px solid var(--el-color-primary);
  outline-offset: 2px;
}

.dashboard-tabs :deep(.el-tabs__item:focus:not(:focus-visible)) {
  outline: none;
}

/* Gradient background for active tab */
.dashboard-tabs :deep(.el-tabs__item.is-active) {
  background: linear-gradient(135deg, white 0%, var(--el-color-primary-light-9) 100%);
}

.dark .dashboard-tabs :deep(.el-tabs__item.is-active) {
  background: linear-gradient(135deg, var(--el-bg-color) 0%, var(--el-color-primary-dark-2) 100%);
}

/* Default knowledge base content styling */
.default-knowledgebase-content {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  padding: 40px 20px;
}

.default-knowledgebase-content .el-empty {
  padding: 60px 20px;
}
</style>