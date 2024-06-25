import { defineStore } from 'pinia'

export const SET_SELECTED_RELEASE = 'SET_SELECTED_RELEASE'
export const SET_RELEASE_NOTES = 'SET_RELEASE_NOTES'
export const FETCH_RELEASE_VERSIONS = 'FETCH_RELEASE_VERSIONS'
export const GENERATE_RELEASE_NOTES = 'GENERATE_RELEASE_NOTES'

export const useReleaseStore = defineStore('release', {
  state: () => ({
    selectedRelease: '',
    releaseVersions: [],
    releaseData: {}
  }),
  actions: {
    async [FETCH_RELEASE_VERSIONS]() {
      if (this.releaseVersions.length) return // Only fetch if empty
      try {
        const response = await fetch('/api/jira/versions')
        if (!response.ok) throw new Error('Failed to fetch')
        this.releaseVersions = await response.json()
      } catch (error) {
        console.error('Error fetching release versions:', error)
        throw error // Rethrow to handle in the component
      }
    },
    async [GENERATE_RELEASE_NOTES]() {
      try {
        const response = await fetch(
          `/api/spark/generate-release-notes?fixVersion=${this.selectedRelease}`
        )
        if (!response.ok) throw new Error('Failed to generate release notes')
        return await response.json()
      } catch (error) {
        console.error('Error generating release notes:', error)
        throw error
      }
    },
    [SET_SELECTED_RELEASE](release) {
      this.selectedRelease = release
    },
    [SET_RELEASE_NOTES](notes) {
      this.releaseNotes = notes
    }
  }
})
