import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { User, LoginCredentials, LoadingState } from '@/types';
import { login as apiLogin, logout as apiLogout, validateToken } from '@/services/api';

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null);
  const isAuthenticated = ref<boolean>(false);
  const loading = ref<LoadingState>({
    isLoading: false,
    error: null
  });

  // Getters
  const getUser = computed(() => user.value);
  const isLoggedIn = computed(() => isAuthenticated.value);
  const isLoading = computed(() => loading.value.isLoading);
  const error = computed(() => loading.value.error);

  // Actions
  const login = async (credentials: LoginCredentials) => {
    loading.value.isLoading = true;
    loading.value.error = null;
    
    try {
      const response = await apiLogin(credentials.username, credentials.password);
      
      if (response.token) {
        localStorage.setItem('auth_token', response.token);
        user.value = response.user;
        isAuthenticated.value = true;
        
        return { success: true, user: response.user };
      } else {
        const errorMessage = 'Invalid credentials - no token received';
        loading.value.error = errorMessage;
        return { success: false, error: errorMessage };
      }
    } catch (error: any) {
      const errorMessage = error.message || error.response?.data?.message || 'Login failed';
      loading.value.error = errorMessage;
      return { success: false, error: errorMessage };
    } finally {
      loading.value.isLoading = false;
    }
  };

  const logout = async () => {
    loading.value.isLoading = true;
    
    try {
      await apiLogout();
    } catch (error) {
      console.error('Logout API failed:', error);
    } finally {
      // Clear local state regardless of API call result
      localStorage.removeItem('auth_token');
      user.value = null;
      isAuthenticated.value = false;
      loading.value.isLoading = false;
      loading.value.error = null;
    }
  };

  const checkAuth = async () => {
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      return false;
    }

    try {
      const response = await validateToken();
      if (response.user) {
        user.value = response.user;
        isAuthenticated.value = true;
        return true;
      }
    } catch (error) {
      localStorage.removeItem('auth_token');
    }
    
    return false;
  };

  const clearError = () => {
    loading.value.error = null;
  };

  // Initialize auth state
  const initializeAuth = async () => {
    await checkAuth();
  };

  return {
    // State
    user,
    isAuthenticated,
    loading,
    
    // Getters
    getUser,
    isLoggedIn,
    isLoading,
    error,
    
    // Actions
    login,
    logout,
    checkAuth,
    clearError,
    initializeAuth
  };
});