<template>
  <div class="knowledgebase-view">
    <div class="knowledgebase-layout">
      <!-- Sidebar -->
      <KnowledgebaseSidebar
        :collapsed="sidebarCollapsed"
        :search-query="searchQuery"
        :applications="applications"
        :selected-app-id="selectedAppId"
        :selected-app="selectedApp"
        :active-menu-item="activeMenuItem"
        :is-loading-apps="isLoadingApps"
        :expanded-categories="expandedCategories"
        :get-app-status-type="getAppStatusType"
        :get-app-article-count="getAppArticleCount"
        :get-categories-for-app="getCategoriesForApp"
        :get-articles-for-category="getArticlesForCategory"
        :get-category-article-count="getCategoryArticleCount"
        @toggle-sidebar="toggleSidebar"
        @search="onSearch"
        @app-change="onAppChange"
        @menu-select="onMenuSelect"
        @toggle-category="toggleCategory"
        @article-select="handleArticleSelect"
      />

      <!-- Main Content -->
      <div class="main-content" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
        <!-- Welcome Section (when no app selected) -->
        <AppWelcomeSection
          v-if="!selectedAppId"
          :applications="applications"
          :is-loading-apps="isLoadingApps"
          :get-app-status-type="getAppStatusType"
          :get-app-article-count="getAppArticleCount"
          @select-app="selectApp"
          @navigate-to-section="navigateToSection"
        />

        <!-- App Overview (when app selected but on overview) -->
        <AppOverview
          v-else-if="activeMenuItem === 'overview' && selectedApp"
          :app="selectedApp"
          :quick-links="getAppQuickLinks()"
          :article-count="getAppArticleCount(selectedAppId)"
          :get-app-status-type="getAppStatusType"
          @navigate-to-section="navigateToSection"
          @navigate-to-article="navigateToArticle"
        />

        <!-- Article Content (when viewing specific article) -->
        <ArticleContent
          v-else
          :article="currentArticleData"
          :app-name="selectedApp?.name || ''"
          :current-section="currentSection"
          :is-favorite="isFavorite"
          :previous-article="previousArticle"
          :next-article="nextArticle"
          @back-to-overview="() => onMenuSelect('overview')"
          @toggle-favorite="toggleFavorite"
          @share-article="shareCurrentPage"
          @navigate-to-article="navigateToArticle"
          @submit-feedback="submitFeedback"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue'
import { useKnowledgebase } from '@/composables/useKnowledgebase'
import KnowledgebaseSidebar from '@/components/knowledgebase/KnowledgebaseSidebar.vue'
import AppWelcomeSection from '@/components/knowledgebase/AppWelcomeSection.vue'
import AppOverview from '@/components/knowledgebase/AppOverview.vue'
import ArticleContent from '@/components/knowledgebase/ArticleContent.vue'

export default defineComponent({
  name: 'KnowledgebaseView',
  components: {
    KnowledgebaseSidebar,
    AppWelcomeSection,
    AppOverview,
    ArticleContent
  },
  setup() {
    const {
      // State
      sidebarCollapsed,
      searchQuery,
      activeMenuItem,
      currentSection,
      selectedAppId,
      expandedCategories,
      // Computed
      applications,
      selectedApp,
      isFavorite,
      currentArticleData,
      previousArticle,
      nextArticle,
      isLoadingApps,
      // Methods
      toggleSidebar,
      onSearch,
      onMenuSelect,
      onAppChange,
      selectApp,
      navigateToSection,
      navigateToArticle,
      toggleFavorite,
      shareCurrentPage,
      submitFeedback,
      getAppStatusType,
      getAppArticleCount,
      getCategoryArticleCount,
      getAppQuickLinks,
      getCategoriesForApp,
      getArticlesForCategory,
      onArticleSelect,
      toggleCategory,
      initializeKnowledgebase
    } = useKnowledgebase()

    onMounted(() => {
      initializeKnowledgebase()
    })

    // Handler untuk article select dari CategoryTreeItem
    const handleArticleSelect = (event: { categoryId: number, articleId: number }) => {
      onArticleSelect(event.categoryId, event.articleId)
    }

    return {
      // State
      sidebarCollapsed,
      searchQuery,
      activeMenuItem,
      currentSection,
      selectedAppId,
      expandedCategories,
      // Computed
      applications,
      selectedApp,
      isFavorite,
      currentArticleData,
      previousArticle,
      nextArticle,
      isLoadingApps,
      // Methods
      toggleSidebar,
      onSearch,
      onMenuSelect,
      onAppChange,
      selectApp,
      navigateToSection,
      navigateToArticle,
      toggleFavorite,
      shareCurrentPage,
      submitFeedback,
      getAppStatusType,
      getAppArticleCount,
      getCategoryArticleCount,
      getAppQuickLinks,
      getCategoriesForApp,
      getArticlesForCategory,
      onArticleSelect,
      toggleCategory,
      handleArticleSelect
    }
  }
})
</script>

<style scoped>
.knowledgebase-view {
  height: 100vh;
  overflow: hidden;
}

.knowledgebase-layout {
  display: flex;
  height: 100%;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  background: #ffffff;
  transition: margin-left 0.3s ease;
}

.main-content.sidebar-collapsed {
  margin-left: 0;
}

/* Custom scrollbar */
.main-content::-webkit-scrollbar {
  width: 8px;
}

.main-content::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.main-content::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.main-content::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

@media (max-width: 1024px) {
  .knowledgebase-layout {
    flex-direction: column;
  }
  
  .main-content {
    margin-left: 0 !important;
  }
}
</style>