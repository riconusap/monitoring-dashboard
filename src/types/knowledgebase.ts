import type { Component } from 'vue'

export interface QuickLink {
  id: number
  title: string
  description: string
  icon: Component
  section: string
}

export interface Category {
  id: number
  name: string
  children: Category[]
  depth?: number
}

export interface KnowledgebaseApplication {
  app_id: number
  name: string
  category_list: Category[]
  article_list: KnowledgebaseArticle[]
}

export interface KnowledgebaseArticle {
  id: number
  category_id: number
  title: string
  author: string
  updated_at: string
  updated_by: string
  created_at: string
  created_by: string
  content?: string
  read_time?: number
  views?: number
  tags: string[]
}

export interface Article {
  title: string
  author: string
  lastUpdated: string
  readTime: number
  views: number
  tags: string[]
  content: string
  appId?: number
}

export interface MenuMap {
  section: string
  article: string
}

export interface SearchOptions {
  query: string
  searchInTags: boolean
  searchInTitle: boolean
  searchInAppName: boolean
  searchInContent: boolean
  selectedAppId?: number
}

export interface SearchResult {
  type: 'article' | 'app'
  id: number
  title: string
  appName?: string
  categoryName?: string
  tags?: string[]
  snippet?: string
  relevanceScore: number
  appId?: number
  categoryId?: number
}

export interface SearchFilters {
  appIds: number[]
  tags: string[]
  categories: string[]
}