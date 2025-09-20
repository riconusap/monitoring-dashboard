import { ref, computed, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useDashboardStore } from '@/stores/dashboard'
import type { Application } from '@/types'
import type { 
  Article,
  KnowledgebaseApplication,
  SearchOptions,
  SearchResult,
  SearchFilters
} from '@/types/knowledgebase'
import { mockKnowledgebaseApps } from '@/data/knowledgebaseData'
import {
  getCategoriesForApp,
  getArticlesForCategory,
  getCategoryById,
  getArticleById,
  getCategoryArticleCount,
  getAppArticleCount,
  getAppStatusType,
  getAppQuickLinks,
  autoExpandCategory
} from '@/utils/knowledgebaseUtils'
import {
  performSearch,
  getAllTags,
  getAllCategories,
  applySearchFilters,
  getSearchSuggestions
} from '@/utils/searchUtils'

export const useKnowledgebase = () => {
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
  const expandedCategories = ref<Set<number>>(new Set())

  // Search-related state
  const searchResults = ref<SearchResult[]>([])
  const isSearching = ref<boolean>(false)
  const searchOptions = ref<SearchOptions>({
    query: '',
    searchInTags: true,
    searchInTitle: true,
    searchInAppName: true,
    searchInContent: true,
    selectedAppId: undefined
  })
  const searchFilters = ref<SearchFilters>({
    appIds: [],
    tags: [],
    categories: []
  })
  const searchSuggestions = ref<string[]>([])
  const showSearchResults = ref<boolean>(false)

  // Knowledge base data
  const knowledgebaseApps = ref<KnowledgebaseApplication[]>(mockKnowledgebaseApps)

  // Computed properties
  const applications = computed((): Application[] => {
    const storeApps = dashboardStore.applications
    
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

  const currentArticleData = computed((): Article => {
    if (!selectedAppId.value || !activeMenuItem.value || activeMenuItem.value === 'overview') {
      return {
        title: 'Select an Application',
        author: 'System',
        lastUpdated: 'N/A',
        readTime: 0,
        views: 0,
        tags: [],
        content: '<p>Please select an application and article to view content.</p>'
      }
    }

    // Parse activeMenuItem untuk mendapatkan categoryId dan articleId
    const match = activeMenuItem.value.match(/category-(\d+)-article-(\d+)/)
    if (!match) {
      return {
        title: 'No Content Available',
        author: 'System',
        lastUpdated: 'N/A',
        readTime: 0,
        views: 0,
        tags: [],
        content: '<p>No content available for this selection.</p>'
      }
    }

    const articleId = parseInt(match[2])
    
    const article = getArticleById(knowledgebaseApps.value, selectedAppId.value, articleId)
    if (!article) {
      return {
        title: 'Article Not Found',
        author: 'System',
        lastUpdated: 'N/A',
        readTime: 0,
        views: 0,
        tags: [],
        content: '<p>Article not found.</p>'
      }
    }

    return {
      title: article.title,
      author: article.author,
      lastUpdated: new Date(article.updated_at).toLocaleDateString('id-ID'),
      readTime: article.read_time || 5,
      views: article.views || 0,
      tags: article.tags || [],
      content: article.content || '<p>No content available.</p>',
      appId: selectedAppId.value
    }
  })

  const previousArticle = computed(() => null)
  const nextArticle = computed(() => null)

  // Search computed properties
  const availableTags = computed(() => getAllTags(knowledgebaseApps.value))
  const availableCategories = computed(() => getAllCategories(knowledgebaseApps.value))
  const filteredSearchResults = computed(() => {
    if (searchFilters.value.appIds.length === 0 && 
        searchFilters.value.tags.length === 0 && 
        searchFilters.value.categories.length === 0) {
      return searchResults.value
    }
    return applySearchFilters(searchResults.value, searchFilters.value)
  })
  const hasActiveSearch = computed(() => searchQuery.value.trim().length > 0 && showSearchResults.value)

  // Navigation functions
  const navigateToSection = (section: string, articleKey?: string) => {
    currentSection.value = section
    currentArticle.value = articleKey || ''
    activeMenuItem.value = articleKey ? `${section}-${articleKey}` : section
    updateBreadcrumb()
  }

  const toggleCategory = (categoryId: number) => {
    if (expandedCategories.value.has(categoryId)) {
      expandedCategories.value.delete(categoryId)
    } else {
      expandedCategories.value.add(categoryId)
    }
  }

  const navigateToArticle = (categoryId: number, articleId: number) => {
    const category = getCategoryById(knowledgebaseApps.value, selectedAppId.value!, categoryId)
    const article = getArticleById(knowledgebaseApps.value, selectedAppId.value!, articleId)
    
    if (category && article) {
      currentSection.value = category.name
      currentArticle.value = article.title
      activeMenuItem.value = `category-${categoryId}-article-${articleId}`
      updateBreadcrumb()
      
      // Auto-expand kategori yang berisi artikel ini
      autoExpandCategory(knowledgebaseApps.value, selectedAppId.value!, categoryId, expandedCategories.value)
    }
  }

  const onArticleSelect = (categoryId: number, articleId: number) => {
    navigateToArticle(categoryId, articleId)
  }

  // Basic functions
  const toggleSidebar = (): void => {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  const onSearch = (query: string): void => {
    searchQuery.value = query
    searchOptions.value.query = query
    
    if (query.trim().length > 0) {
      performSearchOperation()
    } else {
      clearSearch()
    }
  }

  // Search methods
  const performSearchOperation = async (): Promise<void> => {
    if (searchOptions.value.query.trim().length === 0) return
    
    isSearching.value = true
    
    try {
      // Add small delay to simulate async operation and debounce rapid typing
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const results = performSearch(knowledgebaseApps.value, searchOptions.value)
      searchResults.value = results
      showSearchResults.value = true
      
      ElMessage.success(`Found ${results.length} results`)
    } catch (error) {
      console.error('Search error:', error)
      ElMessage.error('Search failed')
    } finally {
      isSearching.value = false
    }
  }

  const clearSearch = (): void => {
    searchQuery.value = ''
    searchOptions.value.query = ''
    searchResults.value = []
    showSearchResults.value = false
    searchSuggestions.value = []
  }

  const updateSearchOptions = (newOptions: Partial<SearchOptions>): void => {
    searchOptions.value = { ...searchOptions.value, ...newOptions }
    if (searchOptions.value.query.trim().length > 0) {
      performSearchOperation()
    }
  }

  const updateSearchFilters = (newFilters: Partial<SearchFilters>): void => {
    searchFilters.value = { ...searchFilters.value, ...newFilters }
  }

  const getSuggestions = (partialQuery: string): void => {
    if (partialQuery.length < 2) {
      searchSuggestions.value = []
      return
    }
    
    const suggestions = getSearchSuggestions(knowledgebaseApps.value, partialQuery, 5)
    searchSuggestions.value = suggestions
  }

  const selectSearchResult = (result: SearchResult): void => {
    if (result.type === 'article') {
      selectedAppId.value = result.appId || null
      if (result.categoryId) {
        navigateToArticle(result.categoryId, result.id)
      }
    } else if (result.type === 'app') {
      selectedAppId.value = result.id
      navigateToSection('overview')
    }
    showSearchResults.value = false
  }

  const onMenuSelect = (menuItem: string): void => {
    activeMenuItem.value = menuItem
    updateBreadcrumb()
  }

  const onAppChange = (appId: number | null): void => {
    selectedAppId.value = appId
    activeMenuItem.value = 'overview'
    if (appId) {
      console.log('Selected app:', applications.value.find(app => app.id === appId))
    }
  }

  const selectApp = (appId: number): void => {
    selectedAppId.value = appId
    activeMenuItem.value = 'overview'
  }

  const updateBreadcrumb = (): void => {
    // Update breadcrumb logic here
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
    
    // Save to localStorage
    localStorage.setItem('knowledgebase-favorites', JSON.stringify(favorites.value))
  }

  const shareCurrentPage = (): void => {
    if (navigator.share) {
      navigator.share({
        title: 'Knowledge Base',
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      ElMessage.success('URL copied to clipboard')
    }
  }

  const submitFeedback = (type: string): void => {
    ElMessage.success(`Thank you for your feedback! (${type})`)
  }

  // Wrapper functions for utility functions
  const getCategoriesForAppWrapper = (appId: number) => {
    return getCategoriesForApp(knowledgebaseApps.value, appId)
  }

  const getArticlesForCategoryWrapper = (appId: number, categoryId: number) => {
    return getArticlesForCategory(knowledgebaseApps.value, appId, categoryId)
  }

  const getCategoryArticleCountWrapper = (appId: number, categoryId: number) => {
    return getCategoryArticleCount(knowledgebaseApps.value, appId, categoryId)
  }

  const getAppArticleCountWrapper = (appId: number) => {
    return getAppArticleCount(knowledgebaseApps.value, appId)
  }

  // Watch for app changes
  watch(selectedAppId, (newAppId: number | null) => {
    if (newAppId) {
      currentSection.value = ''
      currentArticle.value = ''
      activeMenuItem.value = 'overview'
      updateBreadcrumb()
    }
  })

  // Load favorites from localStorage
  onMounted(() => {
    const savedFavorites = localStorage.getItem('knowledgebase-favorites')
    if (savedFavorites) {
      try {
        favorites.value = JSON.parse(savedFavorites)
      } catch (error) {
        console.error('Failed to parse favorites from localStorage:', error)
      }
    }
  })

  const initializeKnowledgebase = async (): Promise<void> => {
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
  }

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
    expandedCategories,
    knowledgebaseApps,
    // Search state
    searchResults,
    isSearching,
    searchOptions,
    searchFilters,
    searchSuggestions,
    showSearchResults,
    // Computed
    applications,
    selectedApp,
    isFavorite,
    currentArticleData,
    previousArticle,
    nextArticle,
    // Search computed
    availableTags,
    availableCategories,
    filteredSearchResults,
    hasActiveSearch,
    // Methods
    toggleSidebar,
    onSearch,
    onMenuSelect,
    onAppChange,
    selectApp,
    navigateToSection,
    navigateToArticle,
    onArticleSelect,
    toggleCategory,
    updateBreadcrumb,
    toggleFavorite,
    shareCurrentPage,
    submitFeedback,
    getAppStatusType,
    getAppArticleCount: getAppArticleCountWrapper,
    getCategoryArticleCount: getCategoryArticleCountWrapper,
    getCategoriesForApp: getCategoriesForAppWrapper,
    getArticlesForCategory: getArticlesForCategoryWrapper,
    getCategoryById: (appId: number, categoryId: number) => getCategoryById(knowledgebaseApps.value, appId, categoryId),
    getArticleById: (appId: number, articleId: number) => getArticleById(knowledgebaseApps.value, appId, articleId),
    getAppQuickLinks,
    initializeKnowledgebase,
    // Search methods
    performSearchOperation,
    clearSearch,
    updateSearchOptions,
    updateSearchFilters,
    getSuggestions,
    selectSearchResult
  }
}

// Export types for components
export type { Article } from '@/types/knowledgebase'