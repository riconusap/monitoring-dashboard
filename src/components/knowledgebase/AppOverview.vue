<template>
  <div class="app-overview">
    <!-- App Header -->
    <div class="app-header">
      <div class="app-info">
        <div class="app-icon" :style="{ backgroundColor: app.color }">
          {{ app.icon }}
        </div>
        <div class="app-details">
          <h1 class="app-title">{{ app.name }}</h1>
          <p class="app-description">{{ app.description }}</p>
          <div class="app-meta">
            <el-tag 
              :type="getAppStatusType(app.status)"
              size="large"
              effect="light"
            >
              <el-icon><CircleCheck v-if="app.status === 'healthy'" /></el-icon>
              <el-icon><Warning v-if="app.status === 'warning'" /></el-icon>
              <el-icon><CircleClose v-if="app.status === 'critical'" /></el-icon>
              {{ app.status }}
            </el-tag>
            <span class="response-time">
              {{ app.responseTime }}ms response
            </span>
            <span class="last-checked">
              Last checked: {{ formatDate(app.lastChecked) }}
            </span>
          </div>
        </div>
      </div>
      <div class="app-actions">
        <el-button type="primary" @click="visitApp">
          <el-icon><Link /></el-icon>
          Visit App
        </el-button>
        <el-dropdown @command="handleCommand">
          <el-button>
            More Actions
            <el-icon class="el-icon--right"><ArrowDown /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="refresh">
                <el-icon><Refresh /></el-icon>
                Refresh Status
              </el-dropdown-item>
              <el-dropdown-item command="share">
                <el-icon><Share /></el-icon>
                Share Documentation
              </el-dropdown-item>
              <el-dropdown-item command="feedback">
                <el-icon><ChatDotRound /></el-icon>
                Send Feedback
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <!-- Quick Links -->
    <div class="quick-links-section">
      <h2 class="section-title">Quick Links</h2>
      <div class="quick-links-grid">
        <div
          v-for="link in quickLinks"
          :key="link.id"
          class="quick-link-card"
          @click="$emit('navigate-to-section', link.section)"
        >
          <div class="link-icon">
            <component :is="link.icon" />
          </div>
          <div class="link-content">
            <h3 class="link-title">{{ link.title }}</h3>
            <p class="link-description">{{ link.description }}</p>
          </div>
          <div class="link-arrow">
            <el-icon><ArrowRight /></el-icon>
          </div>
        </div>
      </div>
    </div>

    <!-- App Statistics -->
    <div class="app-statistics">
      <h2 class="section-title">Documentation Statistics</h2>
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-icon">
            <el-icon><Document /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ articleCount }}</div>
            <div class="stat-label">Total Articles</div>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-icon">
            <el-icon><View /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ totalViews }}</div>
            <div class="stat-label">Total Views</div>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-icon">
            <el-icon><Clock /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ avgReadTime }}min</div>
            <div class="stat-label">Avg Read Time</div>
          </div>
        </div>
        <div v-if="app.hasApi" class="stat-item">
          <div class="stat-icon">
            <el-icon><Monitor /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ apiEndpoints }}</div>
            <div class="stat-label">API Endpoints</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Updates -->
    <div class="recent-updates">
      <h2 class="section-title">Recent Updates</h2>
      <div class="updates-list">
        <div
          v-for="update in recentUpdates"
          :key="update.id"
          class="update-item"
          @click="$emit('navigate-to-article', update)"
        >
          <div class="update-type">
            <el-tag 
              :type="update.type === 'new' ? 'success' : 'warning'"
              size="small"
              effect="light"
            >
              {{ update.type === 'new' ? 'NEW' : 'UPDATED' }}
            </el-tag>
          </div>
          <div class="update-content">
            <h4 class="update-title">{{ update.title }}</h4>
            <p class="update-description">{{ update.description }}</p>
            <div class="update-meta">
              <span class="update-date">{{ formatDate(update.date) }}</span>
              <span class="update-author">by {{ update.author }}</span>
            </div>
          </div>
          <div class="update-arrow">
            <el-icon><ArrowRight /></el-icon>
          </div>
        </div>
      </div>
    </div>

    <!-- Popular Articles -->
    <div class="popular-articles">
      <h2 class="section-title">Most Popular</h2>
      <div class="articles-list">
        <div
          v-for="(article, index) in popularArticles"
          :key="article.id"
          class="article-item"
          @click="$emit('navigate-to-article', article)"
        >
          <div class="article-rank">{{ index + 1 }}</div>
          <div class="article-content">
            <h4 class="article-title">{{ article.title }}</h4>
            <div class="article-meta">
              <span class="article-views">{{ article.views }} views</span>
              <span class="article-read-time">{{ article.readTime }}min read</span>
            </div>
          </div>
          <div class="article-arrow">
            <el-icon><ArrowRight /></el-icon>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, type PropType } from 'vue'
import { ElMessage } from 'element-plus'
import type { Application } from '@/types'
import type { QuickLink } from '@/composables/useKnowledgebase'
import {
  CircleCheck,
  Warning,
  CircleClose,
  Link,
  ArrowDown,
  ArrowRight,
  Refresh,
  Share,
  ChatDotRound,
  Document,
  View,
  Clock,
  Monitor
} from '@element-plus/icons-vue'

interface Update {
  id: string
  title: string
  description: string
  type: 'new' | 'updated'
  date: Date
  author: string
}

export default defineComponent({
  name: 'AppOverview',
  components: {
    CircleCheck,
    Warning,
    CircleClose,
    Link,
    ArrowDown,
    ArrowRight,
    Refresh,
    Share,
    ChatDotRound,
    Document,
    View,
    Clock,
    Monitor
  },
  props: {
    app: {
      type: Object as PropType<Application>,
      required: true
    },
    quickLinks: {
      type: Array as PropType<QuickLink[]>,
      required: true
    },
    articleCount: {
      type: Number,
      required: true
    },
    getAppStatusType: {
      type: Function as PropType<(status: string | undefined) => string>,
      required: true
    }
  },
  emits: ['navigate-to-section', 'navigate-to-article'],
  setup(props) {
    const totalViews = computed(() => {
      // Mock calculation - in real app would come from analytics
      return Math.floor(Math.random() * 10000) + 1000
    })

    const avgReadTime = computed(() => {
      // Mock calculation - average across all articles
      return Math.floor(Math.random() * 10) + 5
    })

    const apiEndpoints = computed(() => {
      // Mock count based on app type
      return props.app.hasApi ? Math.floor(Math.random() * 20) + 10 : 0
    })

    const recentUpdates = computed((): Update[] => {
      // Mock recent updates - in real app would come from CMS
      return [
        {
          id: 'update-1',
          title: 'New API Authentication Method',
          description: 'Added support for OAuth 2.0 authentication in API documentation.',
          type: 'new',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          author: 'API Team'
        },
        {
          id: 'update-2',
          title: 'Installation Guide Updated',
          description: 'Updated system requirements and added Docker installation steps.',
          type: 'updated',
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
          author: 'DevOps Team'
        },
        {
          id: 'update-3',
          title: 'Troubleshooting Section Enhanced',
          description: 'Added new common issues and their solutions.',
          type: 'updated',
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
          author: 'Support Team'
        }
      ]
    })

    const popularArticles = computed(() => {
      // Mock popular articles
      return [
        {
          id: 'popular-1',
          title: 'Getting Started Guide',
          views: 1250,
          readTime: 8
        },
        {
          id: 'popular-2',
          title: 'Common Configuration Issues',
          views: 987,
          readTime: 6
        },
        {
          id: 'popular-3',
          title: 'API Integration Tutorial',
          views: 756,
          readTime: 12
        },
        {
          id: 'popular-4',
          title: 'Best Practices Guide',
          views: 543,
          readTime: 10
        }
      ]
    })

    const formatDate = (date: Date): string => {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }).format(date)
    }

    const visitApp = (): void => {
      window.open(props.app.url, '_blank')
    }

    const handleCommand = (command: string): void => {
      switch (command) {
        case 'refresh':
          ElMessage.success('Status refreshed successfully')
          break
        case 'share':
          navigator.clipboard.writeText(window.location.href)
          ElMessage.success('Documentation link copied to clipboard!')
          break
        case 'feedback':
          ElMessage.info('Opening feedback form...')
          break
      }
    }

    return {
      totalViews,
      avgReadTime,
      apiEndpoints,
      recentUpdates,
      popularArticles,
      formatDate,
      visitApp,
      handleCommand
    }
  }
})
</script>

<style scoped>
.app-overview {
  padding: 32px;
  max-width: 900px;
}

.app-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 48px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e5e7eb;
}

.app-info {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  flex: 1;
}

.app-icon {
  width: 80px;
  height: 80px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  color: white;
  flex-shrink: 0;
}

.app-details {
  flex: 1;
}

.app-title {
  font-size: 32px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 8px 0;
}

.app-description {
  font-size: 16px;
  color: #6b7280;
  margin: 0 0 16px 0;
  line-height: 1.6;
}

.app-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.response-time,
.last-checked {
  font-size: 14px;
  color: #9ca3af;
}

.app-actions {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 24px 0;
}

.quick-links-section {
  margin-bottom: 48px;
}

.quick-links-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.quick-link-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.quick-link-card:hover {
  border-color: #3b82f6;
  background: #f8fafc;
  transform: translateY(-2px);
}

.link-icon {
  width: 48px;
  height: 48px;
  background: #eff6ff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3b82f6;
  font-size: 20px;
  flex-shrink: 0;
}

.link-content {
  flex: 1;
}

.link-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 4px 0;
}

.link-description {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
  line-height: 1.4;
}

.link-arrow {
  color: #9ca3af;
  font-size: 16px;
}

.app-statistics {
  margin-bottom: 48px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  background: #3b82f6;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #6b7280;
}

.recent-updates,
.popular-articles {
  margin-bottom: 48px;
}

.updates-list,
.articles-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.update-item,
.article-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.update-item:hover,
.article-item:hover {
  border-color: #3b82f6;
  background: #f8fafc;
}

.update-type {
  flex-shrink: 0;
}

.update-content,
.article-content {
  flex: 1;
}

.update-title,
.article-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 4px 0;
}

.update-description {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 8px 0;
  line-height: 1.4;
}

.update-meta,
.article-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #9ca3af;
}

.article-rank {
  width: 32px;
  height: 32px;
  background: #3b82f6;
  color: white;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  flex-shrink: 0;
}

.update-arrow,
.article-arrow {
  color: #9ca3af;
  font-size: 16px;
}

@media (max-width: 768px) {
  .app-overview {
    padding: 24px 16px;
  }
  
  .app-header {
    flex-direction: column;
    gap: 24px;
  }
  
  .app-info {
    flex-direction: column;
    text-align: center;
  }
  
  .app-title {
    font-size: 24px;
  }
  
  .quick-links-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>