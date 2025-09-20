import type { 
  KnowledgebaseApplication, 
  KnowledgebaseArticle, 
  SearchOptions, 
  SearchResult, 
  SearchFilters 
} from '@/types/knowledgebase'

/**
 * Search articles and applications based on multiple criteria
 */
export const performSearch = (
  apps: KnowledgebaseApplication[],
  searchOptions: SearchOptions
): SearchResult[] => {
  const results: SearchResult[] = []
  const query = searchOptions.query.toLowerCase().trim()
  
  if (!query) return results

  apps.forEach(app => {
    // Skip app if specific app is selected and this isn't it
    if (searchOptions.selectedAppId && app.app_id !== searchOptions.selectedAppId) {
      return
    }

    // Search in app name
    if (searchOptions.searchInAppName) {
      const appNameMatch = app.name.toLowerCase().includes(query)
      if (appNameMatch) {
        results.push({
          type: 'app',
          id: app.app_id,
          title: app.name,
          appName: app.name,
          relevanceScore: calculateRelevanceScore(app.name, query, 'app'),
          appId: app.app_id
        })
      }
    }

    // Search in articles
    app.article_list.forEach(article => {
      const matchScore = getArticleMatchScore(article, app, query, searchOptions)
      
      if (matchScore > 0) {
        const categoryName = getCategoryName(app, article.category_id)
        const snippet = extractSnippet(article.content || '', query)
        
        results.push({
          type: 'article',
          id: article.id,
          title: article.title,
          appName: app.name,
          categoryName,
          tags: article.tags,
          snippet,
          relevanceScore: matchScore,
          appId: app.app_id,
          categoryId: article.category_id
        })
      }
    })
  })

  // Sort by relevance score (highest first)
  return results.sort((a, b) => b.relevanceScore - a.relevanceScore)
}

/**
 * Calculate match score for an article based on search criteria
 */
const getArticleMatchScore = (
  article: KnowledgebaseArticle,
  app: KnowledgebaseApplication,
  query: string,
  options: SearchOptions
): number => {
  let score = 0
  const queryWords = query.split(' ').filter(word => word.length > 0)

  // Search in title
  if (options.searchInTitle) {
    const titleMatches = queryWords.filter(word => 
      article.title.toLowerCase().includes(word)
    ).length
    score += titleMatches * 10 // High weight for title matches
  }

  // Search in tags
  if (options.searchInTags && article.tags) {
    const tagMatches = queryWords.filter(word =>
      article.tags.some(tag => tag.toLowerCase().includes(word))
    ).length
    score += tagMatches * 8 // High weight for tag matches
  }

  // Search in content
  if (options.searchInContent && article.content) {
    const contentText = stripHtml(article.content).toLowerCase()
    const contentMatches = queryWords.filter(word => 
      contentText.includes(word)
    ).length
    score += contentMatches * 3 // Lower weight for content matches
  }

  // Search in app name (for context)
  if (options.searchInAppName) {
    const appNameMatches = queryWords.filter(word =>
      app.name.toLowerCase().includes(word)
    ).length
    score += appNameMatches * 5 // Medium weight for app name context
  }

  return score
}

/**
 * Calculate relevance score for exact matches
 */
const calculateRelevanceScore = (text: string, query: string, type: 'app' | 'title' | 'tag' | 'content'): number => {
  const lowerText = text.toLowerCase()
  const lowerQuery = query.toLowerCase()
  
  // Exact match
  if (lowerText === lowerQuery) {
    return type === 'app' ? 100 : type === 'title' ? 95 : type === 'tag' ? 90 : 80
  }
  
  // Starts with query
  if (lowerText.startsWith(lowerQuery)) {
    return type === 'app' ? 85 : type === 'title' ? 80 : type === 'tag' ? 75 : 70
  }
  
  // Contains query
  if (lowerText.includes(lowerQuery)) {
    return type === 'app' ? 70 : type === 'title' ? 65 : type === 'tag' ? 60 : 50
  }
  
  // Word boundaries match
  const words = lowerText.split(/\s+/)
  const queryWords = lowerQuery.split(/\s+/)
  const matchingWords = queryWords.filter(qWord => 
    words.some(word => word.includes(qWord))
  ).length
  
  return (matchingWords / queryWords.length) * (type === 'app' ? 60 : type === 'title' ? 55 : type === 'tag' ? 50 : 40)
}

/**
 * Extract snippet around search query from content
 */
const extractSnippet = (content: string, query: string, maxLength: number = 150): string => {
  const plainText = stripHtml(content)
  const lowerContent = plainText.toLowerCase()
  const lowerQuery = query.toLowerCase()
  
  const index = lowerContent.indexOf(lowerQuery)
  if (index === -1) {
    return plainText.substring(0, maxLength) + (plainText.length > maxLength ? '...' : '')
  }
  
  const start = Math.max(0, index - 50)
  const end = Math.min(plainText.length, index + query.length + 100)
  
  let snippet = plainText.substring(start, end)
  
  if (start > 0) snippet = '...' + snippet
  if (end < plainText.length) snippet = snippet + '...'
  
  // Highlight the query in the snippet
  const regex = new RegExp(`(${query})`, 'gi')
  snippet = snippet.replace(regex, '<mark>$1</mark>')
  
  return snippet
}

/**
 * Strip HTML tags from content
 */
const stripHtml = (html: string): string => {
  return html.replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Get category name by ID
 */
const getCategoryName = (app: KnowledgebaseApplication, categoryId: number): string => {
  const findCategory = (categories: any[], id: number): string | null => {
    for (const category of categories) {
      if (category.id === id) {
        return category.name
      }
      if (category.children && category.children.length > 0) {
        const found = findCategory(category.children, id)
        if (found) return found
      }
    }
    return null
  }
  
  return findCategory(app.category_list, categoryId) || 'Unknown Category'
}

/**
 * Get all unique tags from apps
 */
export const getAllTags = (apps: KnowledgebaseApplication[]): string[] => {
  const tagSet = new Set<string>()
  
  apps.forEach(app => {
    app.article_list.forEach(article => {
      if (article.tags) {
        article.tags.forEach(tag => tagSet.add(tag))
      }
    })
  })
  
  return Array.from(tagSet).sort()
}

/**
 * Get all unique categories
 */
export const getAllCategories = (apps: KnowledgebaseApplication[]): Array<{id: number, name: string, appName: string}> => {
  const categories: Array<{id: number, name: string, appName: string}> = []
  
  const extractCategories = (categoryList: any[], appName: string) => {
    categoryList.forEach(category => {
      categories.push({
        id: category.id,
        name: category.name,
        appName
      })
      
      if (category.children && category.children.length > 0) {
        extractCategories(category.children, appName)
      }
    })
  }
  
  apps.forEach(app => {
    extractCategories(app.category_list, app.name)
  })
  
  return categories.sort((a, b) => a.name.localeCompare(b.name))
}

/**
 * Filter search results based on filters
 */
export const applySearchFilters = (
  results: SearchResult[],
  filters: SearchFilters
): SearchResult[] => {
  return results.filter(result => {
    // Filter by app IDs
    if (filters.appIds.length > 0 && result.appId && !filters.appIds.includes(result.appId)) {
      return false
    }
    
    // Filter by tags
    if (filters.tags.length > 0 && result.tags) {
      const hasMatchingTag = result.tags.some(tag => filters.tags.includes(tag))
      if (!hasMatchingTag) return false
    }
    
    // Filter by categories
    if (filters.categories.length > 0 && result.categoryName) {
      if (!filters.categories.includes(result.categoryName)) return false
    }
    
    return true
  })
}

/**
 * Get search suggestions based on partial query
 */
export const getSearchSuggestions = (
  apps: KnowledgebaseApplication[],
  partialQuery: string,
  maxSuggestions: number = 5
): string[] => {
  const query = partialQuery.toLowerCase().trim()
  if (query.length < 2) return []
  
  const suggestions = new Set<string>()
  
  // Add app names
  apps.forEach(app => {
    if (app.name.toLowerCase().includes(query)) {
      suggestions.add(app.name)
    }
  })
  
  // Add article titles
  apps.forEach(app => {
    app.article_list.forEach(article => {
      if (article.title.toLowerCase().includes(query)) {
        suggestions.add(article.title)
      }
    })
  })
  
  // Add tags
  apps.forEach(app => {
    app.article_list.forEach(article => {
      if (article.tags) {
        article.tags.forEach(tag => {
          if (tag.toLowerCase().includes(query)) {
            suggestions.add(tag)
          }
        })
      }
    })
  })
  
  return Array.from(suggestions).slice(0, maxSuggestions)
}