import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { FAQ, LoadingState } from '@/types';
import { getFAQs, searchFAQs } from '@/services/api';

export const useKnowledgebaseStore = defineStore('knowledgebase', () => {
  // State
  const faqs = ref<FAQ[]>([]);
  const filteredFaqs = ref<FAQ[]>([]);
  const searchQuery = ref<string>('');
  const selectedCategory = ref<string>('all');
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

  return {
    // State
    faqs,
    filteredFaqs,
    searchQuery,
    selectedCategory,
    loading,

    // Getters
    getFaqs,
    getCategories,
    isLoading,
    error,
    getSearchQuery,

    // Actions
    fetchFAQs,
    searchFAQsAction,
    setCategory,
    clearSearch,
    clearError
  };
});