import type { 
  Category, 
  KnowledgebaseApplication, 
  KnowledgebaseArticle,
  QuickLink
} from '@/types/knowledgebase'
import { Flag } from '@element-plus/icons-vue'

/**
 * Get categories for a specific application
 */
export const getCategoriesForApp = (
  apps: KnowledgebaseApplication[], 
  appId: number
): Category[] => {
  const app = apps.find(app => app.app_id === appId)
  return app ? app.category_list : []
}

/**
 * Get articles for a specific category within an application
 */
export const getArticlesForCategory = (
  apps: KnowledgebaseApplication[], 
  appId: number, 
  categoryId: number
): KnowledgebaseArticle[] => {
  const app = apps.find(app => app.app_id === appId)
  if (!app) return []
  
  return app.article_list.filter(article => article.category_id === categoryId)
}

/**
 * Find a category by ID within an application (searches recursively)
 */
export const getCategoryById = (
  apps: KnowledgebaseApplication[], 
  appId: number, 
  categoryId: number
): Category | undefined => {
  const app = apps.find(app => app.app_id === appId)
  if (!app) return undefined
  
  const findCategory = (categories: Category[]): Category | undefined => {
    for (const cat of categories) {
      if (cat.id === categoryId) return cat
      if (cat.children && cat.children.length > 0) {
        const found = findCategory(cat.children)
        if (found) return found
      }
    }
    return undefined
  }
  
  return findCategory(app.category_list)
}

/**
 * Find an article by ID within an application
 */
export const getArticleById = (
  apps: KnowledgebaseApplication[], 
  appId: number, 
  articleId: number
): KnowledgebaseArticle | undefined => {
  const app = apps.find(app => app.app_id === appId)
  if (!app) return undefined
  
  return app.article_list.find(article => article.id === articleId)
}

/**
 * Count articles in a specific category
 */
export const getCategoryArticleCount = (
  apps: KnowledgebaseApplication[], 
  appId: number, 
  categoryId: number
): number => {
  return getArticlesForCategory(apps, appId, categoryId).length
}

/**
 * Count total articles for an application
 */
export const getAppArticleCount = (
  apps: KnowledgebaseApplication[], 
  appId: number
): number => {
  const app = apps.find(app => app.app_id === appId)
  return app ? app.article_list.length : 0
}

/**
 * Get application status type for Element Plus components
 */
export const getAppStatusType = (status: string | undefined): string => {
  switch (status) {
    case 'healthy': return 'success'
    case 'warning': return 'warning'
    case 'critical': return 'danger'
    default: return 'info'
  }
}

/**
 * Get quick links for an application (can be customized per app)
 */
export const getAppQuickLinks = (): QuickLink[] => {
  return [
    {
      id: 1,
      title: 'Getting Started',
      description: 'Basic setup and configuration',
      icon: Flag,
      section: 'getting-started'
    },
    {
      id: 2,
      title: 'Troubleshooting',
      description: 'Common issues and solutions',
      icon: Flag,
      section: 'troubleshooting'
    }
  ]
}

/**
 * Auto-expand parent categories for a given category ID
 */
export const autoExpandCategory = (
  apps: KnowledgebaseApplication[],
  appId: number,
  categoryId: number,
  expandedCategories: Set<number>
): void => {
  // Auto-expand kategori ini
  expandedCategories.add(categoryId)
  
  // Cari parent kategori dan expand juga
  const app = apps.find(app => app.app_id === appId)
  if (!app) return
  
  const findParentCategory = (categories: Category[], targetId: number): number | null => {
    for (const category of categories) {
      if (category.children) {
        for (const child of category.children) {
          if (child.id === targetId) {
            return category.id
          }
          const grandParent = findParentCategory(child.children || [], targetId)
          if (grandParent) {
            return grandParent
          }
        }
      }
    }
    return null
  }
  
  const parentId = findParentCategory(app.category_list, categoryId)
  if (parentId) {
    expandedCategories.add(parentId)
    // Recursively expand parent categories
    autoExpandCategory(apps, appId, parentId, expandedCategories)
  }
}

/**
 * Check if a category should be displayed (has articles or children with articles)
 */
export const shouldShowCategory = (
  apps: KnowledgebaseApplication[],
  appId: number,
  category: Category
): boolean => {
  // Cek apakah kategori ini punya artikel
  const articleCount = getCategoryArticleCount(apps, appId, category.id)
  if (articleCount > 0) return true
  
  // Cek apakah ada child kategori yang punya artikel (recursive)
  if (category.children && category.children.length > 0) {
    return category.children.some(child => 
      shouldShowCategory(apps, appId, child)
    )
  }
  
  return false
}