import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { FAQ, LoadingState, FavoriteArticle } from '@/types';
import { getFAQs, searchFAQs } from '@/services/api';

export const useKnowledgebaseStore = defineStore('knowledgebase', () => {
  // State
  const faqs = ref<FAQ[]>([]);
  const filteredFaqs = ref<FAQ[]>([]);
  const searchQuery = ref<string>('');
  const selectedCategory = ref<string>('all');
  const favoriteApplications = ref<Set<number>>(new Set());
  const favoriteArticles = ref<FavoriteArticle[]>([]);
  const loading = ref<LoadingState>({
    isLoading: false,
    error: null
  });

  // Getters
  const getFaqs = computed(() => filteredFaqs.value.length > 0 ? filteredFaqs.value : faqs.value);
  const getCategories = computed(() => {
    const categories = new Set(faqs.value.map(faq => faq.category));
    return ['all', ...Array.from(categories)];
  });
  const isLoading = computed(() => loading.value.isLoading);
  const error = computed(() => loading.value.error);
  const getSearchQuery = computed(() => searchQuery.value);
  const getFavoriteApplications = computed(() => favoriteApplications.value);
  const getFavoriteArticles = computed(() => favoriteArticles.value);

  // Actions
  const fetchFAQs = async () => {
    loading.value.isLoading = true;
    loading.value.error = null;

    try {
      const data = await getFAQs();
      faqs.value = data;
      applyFilters();
    } catch (error: any) {
      loading.value.error = error.message || 'Failed to fetch FAQs';
      throw error;
    } finally {
      loading.value.isLoading = false;
    }
  };

  const searchFAQsAction = async (query: string) => {
    if (!query.trim()) {
      searchQuery.value = '';
      filteredFaqs.value = [];
      applyFilters();
      return;
    }

    searchQuery.value = query;
    loading.value.isLoading = true;
    loading.value.error = null;

    try {
      const data = await searchFAQs(query);
      filteredFaqs.value = data;
      applyFilters();
    } catch (error: any) {
      loading.value.error = error.message || 'Failed to search FAQs';
      throw error;
    } finally {
      loading.value.isLoading = false;
    }
  };

  const setCategory = (category: string) => {
    selectedCategory.value = category;
    applyFilters();
  };

  const applyFilters = () => {
    let filtered = searchQuery.value ? filteredFaqs.value : faqs.value;

    if (selectedCategory.value !== 'all') {
      filtered = filtered.filter(faq => faq.category === selectedCategory.value);
    }

    if (!searchQuery.value) {
      filteredFaqs.value = filtered;
    }
  };

  const clearSearch = () => {
    searchQuery.value = '';
    filteredFaqs.value = [];
    applyFilters();
  };

  const clearError = () => {
    loading.value.error = null;
  };

  // Favorite management
  const toggleApplicationFavorite = (applicationId: number) => {
    if (favoriteApplications.value.has(applicationId)) {
      favoriteApplications.value.delete(applicationId);
    } else {
      favoriteApplications.value.add(applicationId);
    }
    // Save to localStorage
    localStorage.setItem('favoriteApplications', JSON.stringify(Array.from(favoriteApplications.value)));
  };

  const isApplicationFavorite = (applicationId: number) => {
    return favoriteApplications.value.has(applicationId);
  };

  const addFavoriteArticle = (article: FavoriteArticle) => {
    const exists = favoriteArticles.value.find(fav => fav.id === article.id);
    if (!exists) {
      favoriteArticles.value.unshift(article);
      // Save to localStorage
      localStorage.setItem('favoriteArticles', JSON.stringify(favoriteArticles.value));
    }
  };

  const removeFavoriteArticle = (articleId: number) => {
    const index = favoriteArticles.value.findIndex(fav => fav.id === articleId);
    if (index > -1) {
      favoriteArticles.value.splice(index, 1);
      // Save to localStorage
      localStorage.setItem('favoriteArticles', JSON.stringify(favoriteArticles.value));
    }
  };

  const isArticleFavorite = (articleId: number) => {
    return favoriteArticles.value.some(fav => fav.id === articleId);
  };

  const loadFavoritesFromStorage = () => {
    // Load favorite applications
    const savedApps = localStorage.getItem('favoriteApplications');
    if (savedApps) {
      const appIds = JSON.parse(savedApps) as number[];
      favoriteApplications.value = new Set(appIds);
    } else {
      // Set some apps as favorite by default for demo
      favoriteApplications.value = new Set([1, 3]);
      localStorage.setItem('favoriteApplications', JSON.stringify([1, 3]));
    }

    // Load favorite articles
    const savedArticles = localStorage.getItem('favoriteArticles');
    if (savedArticles) {
      favoriteArticles.value = JSON.parse(savedArticles) as FavoriteArticle[];
    }
  };

  // Initialize favorites from localStorage on store creation
  loadFavoritesFromStorage()

  // Add some dummy favorite articles for demo
  const initializeDummyFavorites = () => {
    if (favoriteArticles.value.length === 0) {
      const dummyFavorites: FavoriteArticle[] = [
        {
          id: 1,
          title: "Database Connection Troubleshooting",
          applicationName: "SIMPEG",
          applicationId: 1,
          category: "Troubleshooting",
          createdAt: "2024-09-18"
        },
        {
          id: 2,
          title: "Document Upload Issues",
          applicationName: "E-Office",
          applicationId: 2,
          category: "Troubleshooting",
          createdAt: "2024-09-19"
        },
        {
          id: 3,
          title: "Login Authentication Troubleshooting",
          applicationName: "SIMPEG",
          applicationId: 1,
          category: "Troubleshooting",
          createdAt: "2024-09-16"
        },
        {
          id: 4,
          title: "Information Request Issues",
          applicationName: "PPID",
          applicationId: 3,
          category: "Troubleshooting",
          createdAt: "2024-09-18"
        },
        {
          id: 5,
          title: "Performance Optimization Troubleshooting",
          applicationName: "SIMPEG",
          applicationId: 1,
          category: "Troubleshooting",
          createdAt: "2024-09-20"
        },
        {
          id: 6,
          title: "Workflow Approval Problems",
          applicationName: "E-Office",
          applicationId: 2,
          category: "Troubleshooting",
          createdAt: "2024-09-17"
        },
        {
          id: 7,
          title: "API Integration Troubleshooting",
          applicationName: "SIMPEG",
          applicationId: 1,
          category: "Troubleshooting",
          createdAt: "2024-09-19"
        },
        {
          id: 8,
          title: "Email Notification Issues",
          applicationName: "PPID",
          applicationId: 3,
          category: "Troubleshooting",
          createdAt: "2024-09-19"
        }
      ]
      
      favoriteArticles.value = dummyFavorites
      localStorage.setItem('favoriteArticles', JSON.stringify(dummyFavorites))
    }
  }

  // Initialize dummy data
  initializeDummyFavorites();

  return {
    // State
    faqs,
    filteredFaqs,
    searchQuery,
    selectedCategory,
    favoriteApplications,
    favoriteArticles,
    loading,

    // Getters
    getFaqs,
    getCategories,
    isLoading,
    error,
    getSearchQuery,
    getFavoriteApplications,
    getFavoriteArticles,

    // Actions
    fetchFAQs,
    searchFAQsAction,
    setCategory,
    clearSearch,
    clearError,

    // Favorite actions
    toggleApplicationFavorite,
    isApplicationFavorite,
    addFavoriteArticle,
    removeFavoriteArticle,
    isArticleFavorite,
    loadFavoritesFromStorage,
    initializeDummyFavorites
  };
});