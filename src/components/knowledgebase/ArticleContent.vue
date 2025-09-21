<template>
  <div class="article-content">
    <!-- Article Header -->
    <div class="article-header">
      <div class="breadcrumb-section">
        <el-breadcrumb separator="/" class="d-flex">
          <el-breadcrumb-item>
            <el-button 
              type="text" 
              @click="$emit('back-to-overview')"
              class="breadcrumb-link"
            >
              {{ appName }}
            </el-button>
          </el-breadcrumb-item>
          <el-breadcrumb-item v-if="currentSection">
            {{ currentSection }}
          </el-breadcrumb-item>
          <el-breadcrumb-item>{{ article.title }}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>

      <div class="article-actions">
        <el-tooltip content="Add to favorites" placement="top">
          <!-- Icons removed as requested -->
        </el-tooltip>
        <el-tooltip content="Share article" placement="top">
          <!-- Icons removed as requested -->
        </el-tooltip>
        <el-dropdown @command="handleCommand">
          <el-button type="default" circle>
            <el-icon><MoreFilled /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="print">
                <el-icon><Printer /></el-icon>
                Print Article
              </el-dropdown-item>
              <el-dropdown-item command="edit">
                <el-icon><Edit /></el-icon>
                Suggest Edit
              </el-dropdown-item>
              <el-dropdown-item command="report">
                <el-icon><Flag /></el-icon>
                Report Issue
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <!-- Article Info -->
    <div class="article-info">
      <h1 class="article-title">{{ article.title }}</h1>
      <div class="article-meta">
        <div class="meta-item">
          <el-icon><User /></el-icon>
          <span>{{ article.author }}</span>
        </div>
        <div class="meta-item">
          <el-icon><Calendar /></el-icon>
          <span>{{ article.lastUpdated }}</span>
        </div>
        <div class="meta-item">
          <el-icon><Clock /></el-icon>
          <span>{{ article.readTime }} min read</span>
        </div>
        <div class="meta-item">
          <el-icon><View /></el-icon>
          <span>{{ article.views }} views</span>
        </div>
      </div>
      
      <!-- Tags -->
      <div v-if="article.tags && article.tags.length > 0" class="article-tags">
        <el-tag
          v-for="tag in article.tags"
          :key="tag"
          size="small"
          effect="light"
          type="info"
        >
          {{ tag }}
        </el-tag>
      </div>
    </div>

    <!-- Table of Contents (if content is long) -->
    <div v-if="showTableOfContents" class="table-of-contents">
      <div class="toc-header">
        <h3>Table of Contents</h3>
        <el-button 
          type="text" 
          size="small"
          @click="toggleToc"
        >
          {{ tocCollapsed ? 'Show' : 'Hide' }}
        </el-button>
      </div>
      <div v-if="!tocCollapsed" class="toc-content">
        <ul class="toc-list">
          <li v-for="heading in tableOfContents" :key="heading.id" class="toc-item">
            <a 
              :href="`#${heading.id}`" 
              :class="`toc-level-${heading.level}`"
              @click.prevent="scrollToHeading(heading.id)"
            >
              {{ heading.text }}
            </a>
          </li>
        </ul>
      </div>
    </div>

    <!-- Article Content -->
    <div class="article-body">
      <div 
        class="content-html"
        v-html="article.content"
        ref="contentRef"
      ></div>
    </div>

    <!-- Article Navigation -->
    <div class="article-navigation">
      <div class="nav-section">
        <el-button 
          v-if="previousArticle" 
          type="default" 
          @click="$emit('navigate-to-article', previousArticle)"
          class="nav-button"
        >
          <el-icon><ArrowLeft /></el-icon>
          <div class="nav-content">
            <span class="nav-label">Previous</span>
            <span class="nav-title">{{ previousArticle.title }}</span>
          </div>
        </el-button>
      </div>
      
      <div class="nav-section">
        <el-button 
          v-if="nextArticle" 
          type="default" 
          @click="$emit('navigate-to-article', nextArticle)"
          class="nav-button next"
        >
          <div class="nav-content">
            <span class="nav-label">Next</span>
            <span class="nav-title">{{ nextArticle.title }}</span>
          </div>
          <el-icon><ArrowRight /></el-icon>
        </el-button>
      </div>
    </div>

    <!-- Feedback Section -->
    <div class="feedback-section">
      <h3>Was this article helpful?</h3>
      <p>Help us improve our documentation</p>
      <div class="feedback-buttons">
        <el-button 
          type="success" 
          @click="$emit('submit-feedback', 'helpful')"
        >
          Yes, helpful
        </el-button>
        <el-button 
          type="warning" 
          @click="$emit('submit-feedback', 'not-helpful')"
        >
          Not helpful
        </el-button>
      </div>
    </div>

    <!-- Related Articles -->
    <div v-if="relatedArticles.length > 0" class="related-articles">
      <h3>Related Articles</h3>
      <div class="related-grid">
        <div
          v-for="related in relatedArticles"
          :key="related.id"
          class="related-card"
          @click="$emit('navigate-to-article', related)"
        >
          <h4 class="related-title">{{ related.title }}</h4>
          <p class="related-description">{{ related.description }}</p>
          <div class="related-meta">
            <span>{{ related.readTime }}min read</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, nextTick, type PropType } from 'vue'
import { ElMessage } from 'element-plus'
import type { Article } from '@/types/knowledgebase'
import {
  MoreFilled,
  Printer,
  Edit,
  Flag,
  User,
  Calendar,
  Clock,
  View,
  ArrowLeft,
  ArrowRight
} from '@element-plus/icons-vue'

interface Heading {
  id: string
  text: string
  level: number
}

interface RelatedArticle {
  id: string
  title: string
  description: string
  readTime: number
}

export default defineComponent({
  name: 'ArticleContent',
  components: {
    MoreFilled,
    Printer,
    Edit,
    Flag,
    User,
    Calendar,
    Clock,
    View,
    ArrowLeft,
    ArrowRight
  },
  props: {
    article: {
      type: Object as PropType<Article>,
      required: true
    },
    appName: {
      type: String,
      required: true
    },
    currentSection: {
      type: String,
      default: ''
    },
    isFavorite: {
      type: Boolean,
      default: false
    },
    previousArticle: {
      type: Object as PropType<{ title: string } | null>,
      default: null
    },
    nextArticle: {
      type: Object as PropType<{ title: string } | null>,
      default: null
    }
  },
  emits: [
    'back-to-overview',
    'toggle-favorite',
    'share-article',
    'navigate-to-article',
    'submit-feedback'
  ],
  setup() {
    const contentRef = ref<HTMLElement>()
    const tocCollapsed = ref(false)
    const tableOfContents = ref<Heading[]>([])

    const showTableOfContents = computed(() => {
      return tableOfContents.value.length > 2
    })

    // Mock related articles
    const relatedArticles = ref<RelatedArticle[]>([
      {
        id: 'related-1',
        title: 'Best Practices Guide',
        description: 'Learn the recommended approaches and patterns.',
        readTime: 8
      },
      {
        id: 'related-2',
        title: 'Common Troubleshooting',
        description: 'Solutions to frequently encountered issues.',
        readTime: 6
      },
      {
        id: 'related-3',
        title: 'Advanced Configuration',
        description: 'Deep dive into advanced configuration options.',
        readTime: 12
      }
    ])

    const generateTableOfContents = (): void => {
      if (!contentRef.value) return

      const headings = contentRef.value.querySelectorAll('h1, h2, h3, h4, h5, h6')
      tableOfContents.value = Array.from(headings).map((heading, index) => {
        const id = heading.id || `heading-${index}`
        if (!heading.id) {
          heading.id = id
        }
        
        return {
          id,
          text: heading.textContent || '',
          level: parseInt(heading.tagName.charAt(1))
        }
      })
    }

    const toggleToc = (): void => {
      tocCollapsed.value = !tocCollapsed.value
    }

    const scrollToHeading = (id: string): void => {
      const element = document.getElementById(id)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }

    const handleCommand = (command: string): void => {
      switch (command) {
        case 'print':
          window.print()
          break
        case 'edit':
          ElMessage.info('Opening edit suggestion form...')
          break
        case 'report':
          ElMessage.info('Opening issue report form...')
          break
      }
    }

    onMounted(async () => {
      await nextTick()
      generateTableOfContents()
    })

    return {
      contentRef,
      tocCollapsed,
      tableOfContents,
      showTableOfContents,
      relatedArticles,
      generateTableOfContents,
      toggleToc,
      scrollToHeading,
      handleCommand
    }
  }
})
</script>

<style scoped>
.article-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 32px;
  line-height: 1.7;
}

.article-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.breadcrumb-section {
  flex: 1;
}

.breadcrumb-link {
  padding: 0;
  font-size: 14px;
  color: #3b82f6;
}

.breadcrumb-link:hover {
  color: #1d4ed8;
}

.article-actions {
  display: flex;
  gap: 8px;
}

.article-info {
  margin-bottom: 32px;
}

.article-title {
  font-size: 36px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 16px 0;
  line-height: 1.2;
}

.article-meta {
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #6b7280;
}

.meta-item .el-icon {
  font-size: 16px;
}

.article-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.table-of-contents {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 32px;
}

.toc-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.toc-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.toc-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.toc-item {
  margin: 8px 0;
}

.toc-item a {
  color: #6b7280;
  text-decoration: none;
  display: block;
  padding: 4px 0;
  border-radius: 4px;
  transition: color 0.2s ease;
}

.toc-item a:hover {
  color: #3b82f6;
}

.toc-level-1 { font-weight: 600; }
.toc-level-2 { padding-left: 16px; }
.toc-level-3 { padding-left: 32px; font-size: 14px; }
.toc-level-4 { padding-left: 48px; font-size: 14px; }

.article-body {
  margin-bottom: 48px;
}

.content-html {
  color: #374151;
  font-size: 16px;
}

.content-html :deep(h2) {
  font-size: 28px;
  font-weight: 600;
  color: #111827;
  margin: 32px 0 16px 0;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 8px;
}

.content-html :deep(h3) {
  font-size: 22px;
  font-weight: 600;
  color: #111827;
  margin: 24px 0 12px 0;
}

.content-html :deep(h4) {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 20px 0 8px 0;
}

.content-html :deep(p) {
  margin: 16px 0;
  line-height: 1.7;
}

.content-html :deep(ul),
.content-html :deep(ol) {
  margin: 16px 0;
  padding-left: 24px;
}

.content-html :deep(li) {
  margin: 8px 0;
}

.content-html :deep(code) {
  background: #f1f5f9;
  color: #e11d48;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 14px;
}

.content-html :deep(pre) {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  margin: 24px 0;
  overflow-x: auto;
}

.content-html :deep(pre code) {
  background: none;
  color: #374151;
  padding: 0;
}

.content-html :deep(.info-box) {
  background: #eff6ff;
  border-left: 4px solid #3b82f6;
  padding: 16px;
  margin: 24px 0;
  border-radius: 0 8px 8px 0;
}

.content-html :deep(.warning-box) {
  background: #fef3c7;
  border-left: 4px solid #f59e0b;
  padding: 16px;
  margin: 24px 0;
  border-radius: 0 8px 8px 0;
}

.article-navigation {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 48px;
  padding: 24px 0;
  border-top: 1px solid #e5e7eb;
  border-bottom: 1px solid #e5e7eb;
}

.nav-section:last-child {
  display: flex;
  justify-content: flex-end;
}

.nav-button {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  height: auto;
  text-align: left;
  max-width: 250px;
}

.nav-button.next {
  flex-direction: row-reverse;
  text-align: right;
}

.nav-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-label {
  font-size: 12px;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.nav-title {
  font-size: 14px;
  color: #374151;
  font-weight: 500;
  line-height: 1.4;
}

.feedback-section {
  text-align: center;
  padding: 32px;
  background: #f8fafc;
  border-radius: 12px;
  margin-bottom: 48px;
}

.feedback-section h3 {
  font-size: 20px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 8px 0;
}

.feedback-section p {
  color: #6b7280;
  margin: 0 0 24px 0;
}

.feedback-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.related-articles {
  margin-bottom: 32px;
}

.related-articles h3 {
  font-size: 20px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 24px 0;
}

.related-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.related-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.related-card:hover {
  border-color: #3b82f6;
  transform: translateY(-2px);
}

.related-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 8px 0;
}

.related-description {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 12px 0;
  line-height: 1.5;
}

.related-meta {
  font-size: 12px;
  color: #9ca3af;
}

@media (max-width: 768px) {
  .article-content {
    padding: 24px 16px;
  }
  
  .article-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  
  .article-title {
    font-size: 28px;
  }
  
  .article-meta {
    flex-direction: column;
    gap: 12px;
  }
  
  .article-navigation {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .nav-section:last-child {
    justify-content: flex-start;
  }
  
  .nav-button {
    max-width: 100%;
  }
  
  .feedback-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .related-grid {
    grid-template-columns: 1fr;
  }
}
</style>