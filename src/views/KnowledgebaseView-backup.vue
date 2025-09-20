<template>
  <div class="gitbook-layout">
    <!-- Sidebar -->
    <div class="gitbook-sidebar" :class="{ collapsed: sidebarCollapsed }">
      <div class="sidebar-header">
        <div class="sidebar-title" v-show="!sidebarCollapsed">
          <el-icon class="book-icon" size="20"><Reading /></el-icon>
          Knowledge Base
        </div>
        <el-button 
          type="text" 
          :icon="sidebarCollapsed ? Expand : Fold" 
          @click="toggleSidebar"
          class="collapse-btn"
        />
      </div>

      <!-- App Selector -->
      <div class="app-selector" v-show="!sidebarCollapsed">
        <el-select
          v-model="selectedAppId"
          placeholder="Select Application"
          class="app-select"
          size="large"
          @change="onAppChange"
          :loading="isLoadingApps"
        >
          <el-option
            v-for="app in applications"
            :key="app.id"
            :label="app.name"
            :value="app.id"
          >
            <div class="app-option">
              <div class="app-info">
                <span class="app-name">{{ app.name }}</span>
                <span class="app-desc">{{ app.description }}</span>
              </div>
              <el-tag 
                :type="getAppStatusType(app.status)" 
                size="small"
                class="app-status"
              >
                {{ app.status }}
              </el-tag>
            </div>
          </el-option>
        </el-select>
        
        <!-- Debug info (remove in production) -->
        <div v-if="applications.length === 0" class="debug-info">
          <small>No applications found. Loading: {{ isLoadingApps }}</small>
        </div>
        <div v-else class="debug-info">
          <small>{{ applications.length }} applications loaded</small>
        </div>
      </div>
      
      <div class="sidebar-search" v-show="!sidebarCollapsed && selectedAppId">
        <el-input
          v-model="searchQuery"
          placeholder="Search articles..."
          :prefix-icon="Search"
          class="search-input"
          @input="onSearch"
          clearable
        />
      </div>
      
      <div class="sidebar-content" v-show="!sidebarCollapsed && selectedAppId">
        <el-menu
          class="kb-menu"
          :default-active="activeMenuItem"
          @select="onMenuSelect"
        >
          <el-menu-item index="overview">
            <el-icon><House /></el-icon>
            <span>Overview</span>
          </el-menu-item>
          
          <el-sub-menu index="getting-started">
            <template #title>
              <el-icon><Flag /></el-icon>
              <span>Getting Started</span>
            </template>
            <el-menu-item index="installation">Installation Guide</el-menu-item>
            <el-menu-item index="configuration">Configuration</el-menu-item>
            <el-menu-item index="first-steps">First Steps</el-menu-item>
          </el-sub-menu>
          
          <el-sub-menu index="user-guide">
            <template #title>
              <el-icon><Document /></el-icon>
              <span>User Guide</span>
            </template>
            <el-menu-item index="features">Features Overview</el-menu-item>
            <el-menu-item index="workflows">Common Workflows</el-menu-item>
            <el-menu-item index="best-practices">Best Practices</el-menu-item>
          </el-sub-menu>
          
          <el-sub-menu index="troubleshooting">
            <template #title>
              <el-icon><Tools /></el-icon>
              <span>Troubleshooting</span>
            </template>
            <el-menu-item index="common-issues">Common Issues</el-menu-item>
            <el-menu-item index="debugging">Debugging Guide</el-menu-item>
            <el-menu-item index="logs">Log Analysis</el-menu-item>
            <el-menu-item index="performance">Performance Issues</el-menu-item>
          </el-sub-menu>
          
          <el-sub-menu index="api" v-if="selectedApp?.hasApi">
            <template #title>
              <el-icon><Monitor /></el-icon>
              <span>API Reference</span>
            </template>
            <el-menu-item index="authentication">Authentication</el-menu-item>
            <el-menu-item index="endpoints">API Endpoints</el-menu-item>
            <el-menu-item index="examples">Code Examples</el-menu-item>
            <el-menu-item index="webhooks">Webhooks</el-menu-item>
          </el-sub-menu>
          
          <el-menu-item index="faq">
            <el-icon><QuestionFilled /></el-icon>
            <span>FAQ</span>
          </el-menu-item>
        </el-menu>
      </div>

      <!-- No App Selected State -->
      <div class="no-app-selected" v-show="!sidebarCollapsed && !selectedAppId">
        <el-empty 
          description="Select an application to view its documentation"
          :image-size="100"
        >
          <template #image>
            <el-icon size="100" color="#dcdfe6"><Document /></el-icon>
          </template>
        </el-empty>
      </div>
    </div>
    <!-- Main Content -->
    <div class="gitbook-main" :class="{ expanded: sidebarCollapsed }">
      <div class="content-header" v-if="selectedAppId">
        <el-breadcrumb separator="/" class="breadcrumb">
          <el-breadcrumb-item>Knowledge Base</el-breadcrumb-item>
          <el-breadcrumb-item v-if="selectedApp">{{ selectedApp.name }}</el-breadcrumb-item>
          <el-breadcrumb-item v-if="currentSection">{{ currentSection }}</el-breadcrumb-item>
          <el-breadcrumb-item v-if="currentArticle">{{ currentArticle }}</el-breadcrumb-item>
        </el-breadcrumb>
        
        <div class="content-actions">
          <el-button :icon="Star" @click="toggleFavorite" :type="isFavorite ? 'warning' : ''">
            {{ isFavorite ? 'Favorited' : 'Add to Favorites' }}
          </el-button>
          <el-button :icon="Share" @click="shareCurrentPage">Share</el-button>
        </div>
      </div>
      
      <div class="content-body">
        <!-- No App Selected Welcome -->
        <div v-if="!selectedAppId" class="welcome-content">
          <div class="welcome-header">
            <el-icon class="welcome-icon" size="80"><Reading /></el-icon>
            <h1>Application Knowledge Base</h1>
            <p>Select an application from the sidebar to access its documentation, guides, and resources.</p>
          </div>
          
          <div class="app-grid">
            <el-row :gutter="24">
              <el-col :span="8" v-for="app in applications" :key="app.id">
                <el-card class="app-card" @click="selectApp(app.id)">
                  <div class="app-card-content">
                    <div class="app-header">
                      <h3>{{ app.name }}</h3>
                      <el-tag :type="getAppStatusType(app.status)" size="small">
                        {{ app.status }}
                      </el-tag>
                    </div>
                    <p>{{ app.description }}</p>
                    <div class="app-stats">
                      <div class="stat-item">
                        <el-icon><Document /></el-icon>
                        <span>{{ getAppArticleCount(app.id) }} articles</span>
                      </div>
                      <div class="stat-item">
                        <el-icon><View /></el-icon>
                        <span>{{ app.url || 'N/A' }}</span>
                      </div>
                    </div>
                  </div>
                </el-card>
              </el-col>
            </el-row>
          </div>
        </div>

        <!-- App Overview -->
        <div v-else-if="activeMenuItem === 'overview'" class="app-overview">
          <div class="overview-header">
            <div class="app-title-section">
              <h1 class="app-title">{{ selectedApp?.name }} Documentation</h1>
              <el-tag :type="getAppStatusType(selectedApp?.status)" size="large" class="app-status-tag">
                {{ selectedApp?.status }}
              </el-tag>
            </div>
            <p class="app-description">{{ selectedApp?.description }}</p>
          </div>

          <el-row :gutter="24" class="overview-stats">
            <el-col :span="6">
              <el-card class="stat-card">
                <div class="stat-content">
                  <el-icon class="stat-icon" size="24" color="#67c23a"><CircleCheck /></el-icon>
                  <div class="stat-info">
                    <div class="stat-value">{{ selectedApp?.uptime || '99.9%' }}</div>
                    <div class="stat-label">Uptime</div>
                  </div>
                </div>
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card class="stat-card">
                <div class="stat-content">
                  <el-icon class="stat-icon" size="24" color="#409eff"><Document /></el-icon>
                  <div class="stat-info">
                    <div class="stat-value">{{ getAppArticleCount(selectedAppId) }}</div>
                    <div class="stat-label">Articles</div>
                  </div>
                </div>
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card class="stat-card">
                <div class="stat-content">
                  <el-icon class="stat-icon" size="24" color="#e6a23c"><Clock /></el-icon>
                  <div class="stat-info">
                    <div class="stat-value">{{ selectedApp?.lastUpdated || 'Recent' }}</div>
                    <div class="stat-label">Last Updated</div>
                  </div>
                </div>
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card class="stat-card">
                <div class="stat-content">
                  <el-icon class="stat-icon" size="24" color="#f56c6c"><Link /></el-icon>
                  <div class="stat-info">
                    <div class="stat-value">
                      <el-link :href="selectedApp?.url" target="_blank" type="primary">
                        Access App
                      </el-link>
                    </div>
                    <div class="stat-label">Application URL</div>
                  </div>
                </div>
              </el-card>
            </el-col>
          </el-row>

          <div class="quick-access">
            <h2>Quick Access</h2>
            <el-row :gutter="16">
              <el-col :span="8" v-for="link in getAppQuickLinks()" :key="link.id">
                <el-card class="quick-link-card" @click="navigateToSection(link.section)">
                  <div class="quick-link-content">
                    <el-icon class="quick-link-icon" size="32" :component="link.icon" />
                    <h3>{{ link.title }}</h3>
                    <p>{{ link.description }}</p>
                  </div>
                </el-card>
              </el-col>
            </el-row>
          </div>
        </div>
        
        <!-- Article Content -->
        <div v-else class="article-content">
          <div class="article-header">
            <h1 class="article-title">{{ currentArticleData.title }}</h1>
            <div class="article-meta">
              <div class="meta-item">
                <el-icon><User /></el-icon>
                {{ currentArticleData.author }}
              </div>
              <div class="meta-item">
                <el-icon><Calendar /></el-icon>
                {{ currentArticleData.lastUpdated }}
              </div>
              <div class="meta-item">
                <el-icon><Clock /></el-icon>
                {{ currentArticleData.readTime }} min read
              </div>
              <div class="meta-item">
                <el-icon><View /></el-icon>
                {{ currentArticleData.views }} views
              </div>
            </div>
          </div>
          
          <div class="article-body" v-html="currentArticleData.content"></div>
          
          <div class="article-footer">
            <div class="article-tags">
              <el-tag 
                v-for="tag in currentArticleData.tags" 
                :key="tag" 
                class="tag-item"
                type="info"
              >
                {{ tag }}
              </el-tag>
            </div>
            
            <div class="article-navigation">
              <el-button 
                v-if="previousArticle" 
                class="nav-btn prev" 
                :icon="ArrowLeft"
                @click="navigateToArticle(previousArticle)"
              >
                {{ previousArticle.title }}
              </el-button>
              <div></div>
              <el-button 
                v-if="nextArticle" 
                class="nav-btn next" 
                @click="navigateToArticle(nextArticle)"
              >
                {{ nextArticle.title }}
                <el-icon><ArrowRight /></el-icon>
              </el-button>
            </div>
            
            <div class="feedback-section">
              <h4>Was this article helpful for {{ selectedApp?.name }}?</h4>
              <el-space>
                <el-button type="success" :icon="Check" @click="submitFeedback('helpful')">
                  Yes, helpful
                </el-button>
                <el-button type="warning" :icon="Close" @click="submitFeedback('not-helpful')">
                  Needs improvement
                </el-button>
              </el-space>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, computed, onMounted, watch, defineComponent, type Component } from 'vue'
import { 
  Reading, Search, Expand, Fold, House, Flag, Monitor, Tools, Document, 
  QuestionFilled, Share, User, Calendar, Clock, View, 
  ArrowLeft, ArrowRight, Check, Close, Star, CircleCheck, Link
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useDashboardStore } from '@/stores/dashboard'
import type { Application } from '@/types'

// Types
interface QuickLink {
  id: number
  title: string
  description: string
  icon: Component
  section: string
}

interface Article {
  title: string
  author: string
  lastUpdated: string
  readTime: number
  views: number
  tags: string[]
  content: string
  appId?: number
}

interface MenuMap {
  section: string
  article: string
}

export default defineComponent({
  name: 'KnowledgebaseView',
  components: {
    Reading, Search, Expand, Fold, House, Flag, Monitor, Tools, Document, 
    QuestionFilled, Share, User, Calendar, Clock, View, 
    ArrowLeft, ArrowRight, Check, Close, Star, CircleCheck, Link
  },
  setup() {
    // Stores
    const dashboardStore = useDashboardStore()

    // Reactive state
    const sidebarCollapsed = ref<boolean>(false)
    const searchQuery = ref<string>('')
    const activeMenuItem = ref<string>('overview')
    const currentSection = ref<string>('')
    const currentArticle = ref<string>('')
    const selectedAppId = ref<number | null>(null)
    const favorites = ref<string[]>([])
    const isLoadingApps = ref<boolean>(true)

// Computed properties
const applications = computed((): Application[] => {
  const storeApps = dashboardStore.applications
  console.log('Applications from store:', storeApps)
  
  // Fallback data jika store kosong
  if (!storeApps || storeApps.length === 0) {
    return [
      {
        id: 1,
        name: 'SIMPEG',
        description: 'Sistem Informasi Manajemen Pegawai',
        url: 'https://simpeg.example.com',
        status: 'healthy',
        lastChecked: new Date(),
        responseTime: 120,
        hasApi: true,
        category: 'HR',
        icon: '👥',
        color: '#3b82f6'
      },
      {
        id: 2,
        name: 'E-Office',
        description: 'Electronic Office Management System',
        url: 'https://eoffice.example.com',
        status: 'warning',
        lastChecked: new Date(),
        responseTime: 250,
        hasApi: true,
        category: 'Office',
        icon: '📄',
        color: '#10b981'
      },
      {
        id: 3,
        name: 'PPID',
        description: 'Pejabat Pengelola Informasi dan Dokumentasi',
        url: 'https://ppid.example.com',
        status: 'critical',
        lastChecked: new Date(),
        responseTime: 450,
        hasApi: false,
        category: 'Information',
        icon: '📋',
        color: '#f59e0b'
      },
      {
        id: 4,
        name: 'Website Portal',
        description: 'Official Government Portal Website',
        url: 'https://portal.example.com',
        status: 'healthy',
        lastChecked: new Date(),
        responseTime: 90,
        hasApi: false,
        category: 'Portal',
        icon: '🌐',
        color: '#8b5cf6'
      }
    ]
  }
  
  return storeApps
})

const selectedApp = computed((): Application | undefined => 
  applications.value.find((app: Application) => app.id === selectedAppId.value)
)

const isFavorite = computed((): boolean => {
  if (!selectedAppId.value || !activeMenuItem.value) return false
  const favoriteKey = `${selectedAppId.value}-${activeMenuItem.value}`
  return favorites.value.includes(favoriteKey)
})

// Per-app articles data
const appArticles = ref<Record<string, Record<string, Article>>>({
  1: { // SIMPEG
    'installation': {
      title: 'SIMPEG Installation Guide',
      author: 'SIMPEG Team',
      lastUpdated: 'September 15, 2025',
      readTime: 8,
      views: 342,
      tags: ['installation', 'setup', 'simpeg'],
      content: `
        <h2>Installing SIMPEG System</h2>
        <p>This guide will walk you through the installation process of the SIMPEG (Sistem Informasi Manajemen Pegawai) application.</p>
        
        <h3>System Requirements</h3>
        <ul>
          <li>PHP 8.1 or higher</li>
          <li>MySQL 8.0 or higher</li>
          <li>Web server (Apache/Nginx)</li>
          <li>Minimum 2GB RAM</li>
        </ul>
        
        <div class="info-box">
          <h4>💡 Important Note</h4>
          <p>Make sure your server meets all requirements before proceeding with installation.</p>
        </div>
        
        <h3>Installation Steps</h3>
        <ol>
          <li>Download the latest SIMPEG package</li>
          <li>Extract files to your web directory</li>
          <li>Configure database settings</li>
          <li>Run database migrations</li>
          <li>Set up file permissions</li>
        </ol>
      `,
      appId: 1
    },
    'common-issues': {
      title: 'Common SIMPEG Issues',
      author: 'Support Team',
      lastUpdated: 'September 12, 2025',
      readTime: 6,
      views: 156,
      tags: ['troubleshooting', 'issues', 'simpeg'],
      content: `
        <h2>Common SIMPEG Issues and Solutions</h2>
        <p>Here are the most frequently encountered issues when using SIMPEG and their solutions.</p>
        
        <h3>Login Issues</h3>
        <p>If users cannot log in to SIMPEG:</p>
        <ol>
          <li>Check user credentials</li>
          <li>Verify database connection</li>
          <li>Clear browser cache</li>
          <li>Check session configuration</li>
        </ol>
        
        <h3>Data Synchronization Problems</h3>
        <p>When employee data is not syncing properly:</p>
        <ul>
          <li>Check API endpoints</li>
          <li>Verify data integrity</li>
          <li>Review synchronization logs</li>
        </ul>
      `,
      appId: 1
    }
  },
  2: { // E-Office
    'installation': {
      title: 'E-Office Setup Guide',
      author: 'E-Office Team',
      lastUpdated: 'September 18, 2025',
      readTime: 10,
      views: 287,
      tags: ['installation', 'setup', 'e-office'],
      content: `
        <h2>E-Office System Setup</h2>
        <p>Complete guide for setting up E-Office document management system.</p>
        
        <h3>Prerequisites</h3>
        <ul>
          <li>Node.js 18+ for frontend</li>
          <li>Java 11+ for backend services</li>
          <li>PostgreSQL 13+</li>
          <li>Docker (recommended)</li>
        </ul>
        
        <h3>Quick Start with Docker</h3>
        <ol>
          <li>Clone the repository</li>
          <li>Run <code>docker-compose up</code></li>
          <li>Access the application at http://localhost:3000</li>
        </ol>
        
        <div class="warning-box">
          <h4>⚠️ Security Note</h4>
          <p>Always change default passwords in production environment.</p>
        </div>
      `,
      appId: 2
    },
    'workflows': {
      title: 'E-Office Workflows',
      author: 'Process Team',
      lastUpdated: 'September 16, 2025',
      readTime: 12,
      views: 198,
      tags: ['workflows', 'process', 'e-office'],
      content: `
        <h2>E-Office Document Workflows</h2>
        <p>Learn how to create and manage document workflows in E-Office.</p>
        
        <h3>Creating a New Workflow</h3>
        <ol>
          <li>Go to Workflow Management</li>
          <li>Click "Create New Workflow"</li>
          <li>Define workflow steps</li>
          <li>Set approval rules</li>
          <li>Test the workflow</li>
        </ol>
        
        <h3>Workflow Best Practices</h3>
        <ul>
          <li>Keep workflows simple and clear</li>
          <li>Define clear roles and responsibilities</li>
          <li>Set appropriate timeouts</li>
          <li>Regular workflow audits</li>
        </ul>
      `,
      appId: 2
    }
  },
  3: { // PPID
    'configuration': {
      title: 'PPID Configuration',
      author: 'PPID Admin',
      lastUpdated: 'September 14, 2025',
      readTime: 7,
      views: 134,
      tags: ['configuration', 'setup', 'ppid'],
      content: `
        <h2>PPID System Configuration</h2>
        <p>Configure PPID (Pejabat Pengelola Informasi dan Dokumentasi) system settings.</p>
        
        <h3>Basic Configuration</h3>
        <ul>
          <li>Organization information</li>
          <li>Contact details</li>
          <li>Service hours</li>
          <li>Document categories</li>
        </ul>
        
        <h3>Advanced Settings</h3>
        <ol>
          <li>Email notifications</li>
          <li>Document approval workflow</li>
          <li>Public access permissions</li>
          <li>Archive management</li>
        </ol>
      `,
      appId: 3
    }
  }
})

// App-specific quick links
const getAppQuickLinks = (): QuickLink[] => {
  if (!selectedAppId.value) return []
  
  const commonLinks = [
    {
      id: 1,
      title: 'Installation',
      description: 'Get started with installation',
      icon: Flag,
      section: 'installation'
    },
    {
      id: 2,
      title: 'User Guide',
      description: 'Learn how to use features',
      icon: Document,
      section: 'features'
    },
    {
      id: 3,
      title: 'Troubleshooting',
      description: 'Solve common issues',
      icon: Tools,
      section: 'common-issues'
    }
  ]

  // Add API documentation link for apps that have API
  if (selectedApp.value?.hasApi) {
    commonLinks.push({
      id: 4,
      title: 'API Reference',
      description: 'Integrate with our API',
      icon: Monitor,
      section: 'authentication'
    })
  }

  return commonLinks
}

const currentArticleData = computed((): Article => {
  if (!selectedAppId.value || !activeMenuItem.value) {
    return {
      title: 'Select an Application',
      author: 'System',
      lastUpdated: 'N/A',
      readTime: 0,
      views: 0,
      tags: [],
      content: '<p>Please select an application to view its documentation.</p>'
    }
  }

  const appKey = selectedAppId.value.toString()
  const appArticle = appArticles.value[appKey]?.[activeMenuItem.value]
  
  return appArticle || {
    title: 'Article Not Found',
    author: 'System',
    lastUpdated: 'N/A',
    readTime: 0,
    views: 0,
    tags: [],
    content: '<p>This article is not available yet. Please check back later.</p>'
  }
})

const previousArticle = computed((): { title: string } | null => {
  // Logic to find previous article within the same app
  return null
})

const nextArticle = computed((): { title: string } | null => {
  // Logic to find next article within the same app
  return null
})

// Methods
const toggleSidebar = (): void => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

const onSearch = (): void => {
  // Implement search functionality within selected app
  console.log('Searching for:', searchQuery.value, 'in app:', selectedAppId.value)
}

const onMenuSelect = (menuItem: string): void => {
  activeMenuItem.value = menuItem
  updateBreadcrumb()
}

const onAppChange = (appId: number): void => {
  selectedAppId.value = appId
  activeMenuItem.value = 'overview'
  updateBreadcrumb()
}

const selectApp = (appId: number): void => {
  selectedAppId.value = appId
  activeMenuItem.value = 'overview'
  updateBreadcrumb()
}

const navigateToSection = (section: string): void => {
  activeMenuItem.value = section
  updateBreadcrumb()
}

const navigateToArticle = (article: any): void => {
  activeMenuItem.value = article.id
  updateBreadcrumb()
}

const updateBreadcrumb = (): void => {
  const menuMap: Record<string, MenuMap> = {
    'overview': { section: '', article: 'Overview' },
    'installation': { section: 'Getting Started', article: 'Installation Guide' },
    'configuration': { section: 'Getting Started', article: 'Configuration' },
    'features': { section: 'User Guide', article: 'Features Overview' },
    'workflows': { section: 'User Guide', article: 'Common Workflows' },
    'common-issues': { section: 'Troubleshooting', article: 'Common Issues' },
    'debugging': { section: 'Troubleshooting', article: 'Debugging Guide' },
    'authentication': { section: 'API Reference', article: 'Authentication' },
    'endpoints': { section: 'API Reference', article: 'API Endpoints' }
  }
  
  const item = menuMap[activeMenuItem.value]
  if (item) {
    currentSection.value = item.section
    currentArticle.value = item.article
  }
}

const toggleFavorite = (): void => {
  if (!selectedAppId.value || !activeMenuItem.value) return
  
  const favoriteKey = `${selectedAppId.value}-${activeMenuItem.value}`
  const index = favorites.value.indexOf(favoriteKey)
  
  if (index > -1) {
    favorites.value.splice(index, 1)
    ElMessage.success('Removed from favorites')
  } else {
    favorites.value.push(favoriteKey)
    ElMessage.success('Added to favorites')
  }
}

const shareCurrentPage = (): void => {
  if (!selectedAppId.value || !activeMenuItem.value) return
  
  const url = `${window.location.origin}/knowledge-base/${selectedAppId.value}/${activeMenuItem.value}`
  navigator.clipboard.writeText(url)
  ElMessage.success('Page link copied to clipboard!')
}

const submitFeedback = (type: 'helpful' | 'not-helpful'): void => {
  ElMessage.success(`Thank you for your feedback on ${selectedApp.value?.name} documentation! (${type})`)
}

const getAppStatusType = (status: string | undefined): string => {
  switch (status) {
    case 'healthy': return 'success'
    case 'warning': return 'warning' 
    case 'critical': return 'danger'
    default: return 'info'
  }
}

const getAppArticleCount = (appId: number): number => {
  const appKey = appId.toString()
  return Object.keys(appArticles.value[appKey] || {}).length
}

// Watch for app changes
watch(selectedAppId, (newAppId: number | null) => {
  if (newAppId) {
    activeMenuItem.value = 'overview'
    updateBreadcrumb()
  }
})

// Lifecycle
onMounted(async () => {
  console.log('KnowledgebaseView mounted')
  isLoadingApps.value = true
  
  try {
    await dashboardStore.loadApplications()
    console.log('Applications loaded:', dashboardStore.applications)
  } catch (error) {
    console.error('Failed to fetch applications:', error)
    ElMessage.error('Failed to load applications')
  } finally {
    isLoadingApps.value = false
  }
  
  updateBreadcrumb()
})

    return {
      // State
      sidebarCollapsed,
      searchQuery,
      activeMenuItem,
      currentSection,
      currentArticle,
      selectedAppId,
      favorites,
      isLoadingApps,
      appArticles,
      // Computed
      applications,
      selectedApp,
      isFavorite,
      currentArticleData,
      previousArticle,
      nextArticle,
      // Methods
      toggleSidebar,
      onSearch,
      onMenuSelect,
      onAppChange,
      selectApp,
      navigateToSection,
      navigateToArticle,
      updateBreadcrumb,
      toggleFavorite,
      shareCurrentPage,
      submitFeedback,
      getAppStatusType,
      getAppArticleCount,
      getAppQuickLinks,
      // Icons
      Reading, Search, Expand, Fold, House, Flag, Monitor, Tools, Document, 
      QuestionFilled, Share, User, Calendar, Clock, View, 
      ArrowLeft, ArrowRight, Check, Close, Star, CircleCheck, Link
    }
  }
})
</script>

<style scoped>
/* GitBook-style Layout */
.gitbook-layout {
  display: flex;
  height: 100%;
  min-height: calc(100vh - 240px);
  background: #fafbfc;
}

/* Sidebar Styling */
.gitbook-sidebar {
  width: 280px;
  background: white;
  border-right: 1px solid var(--el-border-color-lighter);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 10;
}

.gitbook-sidebar.collapsed {
  width: 60px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  background: #f8f9fa;
}

.sidebar-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.book-icon {
  color: var(--el-color-primary);
}

.collapse-btn {
  transition: transform 0.3s ease;
}

.sidebar-search {
  padding: 16px 20px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.search-input {
  width: 100%;
}

.sidebar-content {
  height: calc(100% - 200px);
  overflow-y: auto;
  padding: 8px 0;
}
.app-selector {
  padding: 16px 20px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.app-select {
  width: 100%;
}

.app-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.app-info {
  display: flex;
  flex-direction: column;
}

.app-name {
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.app-desc {
  font-size: 12px;
  color: var(--el-text-color-regular);
  margin-top: 2px;
}

.app-status {
  margin-left: 8px;
}

/* Debug info */
.debug-info {
  margin-top: 8px;
  padding: 4px 8px;
  background: var(--el-fill-color-light);
  border-radius: 4px;
  font-size: 11px;
  color: var(--el-text-color-secondary);
}

/* No App Selected State */
.no-app-selected {
  padding: 40px 20px;
  text-align: center;
}

/* App Grid */
.app-grid {
  margin-top: 32px;
}

.app-card {
  cursor: pointer;
  transition: all 0.3s ease;
  height: 100%;
}

.app-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.app-card-content {
  text-align: left;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.app-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.app-card-content p {
  color: var(--el-text-color-regular);
  font-size: 14px;
  line-height: 1.5;
  margin: 0 0 16px 0;
}

.app-stats {
  display: flex;
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

/* App Overview */
.app-overview {
  padding: 32px;
  max-width: 1000px;
  margin: 0 auto;
}

.overview-header {
  margin-bottom: 32px;
}

.app-title-section {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.app-title {
  font-size: 32px;
  font-weight: 700;
  color: var(--el-text-color-primary);
  margin: 0;
}

.app-status-tag {
  font-size: 14px;
  padding: 8px 16px;
}

.app-description {
  font-size: 18px;
  color: var(--el-text-color-regular);
  margin: 0;
  line-height: 1.6;
}

.overview-stats {
  margin-bottom: 48px;
}

.stat-card {
  text-align: center;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
}

.stat-icon {
  flex-shrink: 0;
}

.stat-info {
  text-align: left;
  flex: 1;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--el-text-color-primary);
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.quick-access {
  margin-top: 32px;
}

.quick-access h2 {
  font-size: 24px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0 0 24px 0;
}

/* Enhanced content actions */
.content-actions .el-button {
  margin-left: 8px;
}

.content-actions .el-button:first-child {
  margin-left: 0;
}
.gitbook-sidebar {
  width: 280px;
  background: white;
  border-right: 1px solid var(--el-border-color-lighter);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 10;
}

.gitbook-sidebar.collapsed {
  width: 60px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  background: #f8f9fa;
}

.sidebar-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.book-icon {
  color: var(--el-color-primary);
}

.collapse-btn {
  transition: transform 0.3s ease;
}

.sidebar-search {
  padding: 16px 20px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.search-input {
  width: 100%;
}

.sidebar-content {
  height: calc(100% - 120px);
  overflow-y: auto;
  padding: 8px 0;
}

/* Menu Styling */
.kb-menu {
  border: none;
  background: transparent;
}

.kb-menu :deep(.el-menu-item),
.kb-menu :deep(.el-sub-menu__title) {
  padding-left: 20px !important;
  height: 40px;
  line-height: 40px;
  margin: 2px 8px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.kb-menu :deep(.el-menu-item:hover),
.kb-menu :deep(.el-sub-menu__title:hover) {
  background-color: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}

.kb-menu :deep(.el-menu-item.is-active) {
  background-color: var(--el-color-primary);
  color: white;
  font-weight: 500;
}

.kb-menu :deep(.el-sub-menu .el-menu-item) {
  padding-left: 45px !important;
  font-size: 14px;
}

/* Main Content Area */
.gitbook-main {
  flex: 1;
  background: white;
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.gitbook-main.expanded {
  margin-left: -220px;
}

.content-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 32px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  background: #fafbfc;
}

.breadcrumb {
  font-size: 14px;
}

.content-actions {
  display: flex;
  gap: 8px;
}

.content-body {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}

/* Article Content */
.article-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 32px;
}

.article-header {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.article-title {
  font-size: 32px;
  font-weight: 700;
  color: var(--el-text-color-primary);
  margin: 0 0 16px 0;
  line-height: 1.2;
}

.article-meta {
  display: flex;
  gap: 24px;
  color: var(--el-text-color-regular);
  font-size: 14px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.article-body {
  font-size: 16px;
  line-height: 1.7;
  color: var(--el-text-color-primary);
  margin-bottom: 32px;
}

.article-body :deep(h2) {
  font-size: 24px;
  font-weight: 600;
  margin: 32px 0 16px 0;
  color: var(--el-text-color-primary);
}

.article-body :deep(h3) {
  font-size: 20px;
  font-weight: 600;
  margin: 24px 0 12px 0;
  color: var(--el-text-color-primary);
}

.article-body :deep(p) {
  margin: 16px 0;
}

.article-body :deep(ul),
.article-body :deep(ol) {
  margin: 16px 0;
  padding-left: 24px;
}

.article-body :deep(li) {
  margin: 8px 0;
}

.article-body :deep(.info-box) {
  background: var(--el-color-primary-light-9);
  border: 1px solid var(--el-color-primary-light-7);
  border-radius: 8px;
  padding: 16px;
  margin: 24px 0;
}

.article-body :deep(.warning-box) {
  background: var(--el-color-warning-light-9);
  border: 1px solid var(--el-color-warning-light-7);
  border-radius: 8px;
  padding: 16px;
  margin: 24px 0;
}

.article-body :deep(.info-box h4),
.article-body :deep(.warning-box h4) {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
}

.article-footer {
  border-top: 1px solid var(--el-border-color-lighter);
  padding-top: 24px;
}

.article-tags {
  margin-bottom: 24px;
}

.tag-item {
  margin-right: 8px;
  margin-bottom: 8px;
}

.article-navigation {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
}

.nav-btn {
  flex: 1;
  max-width: 300px;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nav-btn.next {
  text-align: right;
}

.feedback-section {
  text-align: center;
  padding: 24px 0;
}

.feedback-section h4 {
  margin: 0 0 16px 0;
  color: var(--el-text-color-primary);
}

/* Welcome Content */
.welcome-content {
  padding: 64px 32px;
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
}

.welcome-header {
  margin-bottom: 48px;
}

.welcome-icon {
  color: var(--el-color-primary);
  margin-bottom: 24px;
}

.welcome-header h1 {
  font-size: 36px;
  font-weight: 700;
  margin: 0 0 16px 0;
  color: var(--el-text-color-primary);
}

.welcome-header p {
  font-size: 18px;
  color: var(--el-text-color-regular);
  margin: 0;
}

.quick-links {
  text-align: left;
}

.quick-link-card {
  cursor: pointer;
  transition: all 0.3s ease;
  height: 100%;
}

.quick-link-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.quick-link-content {
  text-align: center;
  padding: 16px;
}

.quick-link-icon {
  color: var(--el-color-primary);
  margin-bottom: 16px;
}

.quick-link-content h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: var(--el-text-color-primary);
}

.quick-link-content p {
  font-size: 14px;
  color: var(--el-text-color-regular);
  margin: 0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .gitbook-sidebar {
    width: 100%;
    position: fixed;
    height: 100%;
    transform: translateX(-100%);
    z-index: 1000;
  }
  
  .gitbook-sidebar.collapsed {
    transform: translateX(-100%);
  }
  
  .gitbook-sidebar:not(.collapsed) {
    transform: translateX(0);
  }
  
  .gitbook-main {
    width: 100%;
  }
  
  .content-header {
    padding: 12px 16px;
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .content-actions {
    width: 100%;
    justify-content: flex-start;
    flex-wrap: wrap;
  }
  
  .article-content {
    padding: 24px 16px;
  }
  
  .article-title {
    font-size: 24px;
  }
  
  .welcome-content {
    padding: 32px 16px;
  }
  
  .welcome-header h1 {
    font-size: 28px;
  }
  
  .app-overview {
    padding: 24px 16px;
  }
  
  .app-title {
    font-size: 24px;
  }
  
  .app-title-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .overview-stats .el-col {
    margin-bottom: 16px;
  }
  
  .stat-content {
    justify-content: center;
    text-align: center;
    flex-direction: column;
    gap: 8px;
  }
  
  .stat-info {
    text-align: center;
  }
  
  .app-grid .el-col {
    margin-bottom: 16px;
  }
  
  .quick-access .el-col {
    margin-bottom: 16px;
  }
}
</style>