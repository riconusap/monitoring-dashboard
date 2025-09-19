import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Application } from '@/types'
import { getApplications } from '@/services/api'

export const useDashboardStore = defineStore('dashboard', () => {
  // State
  const applications = ref<Application[]>([])

  // Actions
  const fetchApplications = async () => {
    try {
      const data = await getApplications()
      applications.value = data
      return data
    } catch (error: any) {
      console.error('Failed to fetch applications:', error)
      throw error
    }
  }

  const loadApplications = async () => {
    console.log('Dashboard store - loadApplications called')
    if (applications.value.length === 0) {
      console.log('Dashboard store - applications empty, fetching...')
      await fetchApplications()
    }
    return applications.value
  }

  return {
    applications,
    fetchApplications,
    loadApplications
  }
})
