import { defineStore } from 'pinia';

export const SET_SELECTED_RELEASE = 'SET_SELECTED_RELEASE';
export const FETCH_RELEASE_VERSIONS = 'FETCH_RELEASE_VERSIONS';

export const useReleaseStore = defineStore('release', {
    state: () => ({
        selectedRelease: '',
        releaseVersions: [],
    }),
    actions: {
        async [FETCH_RELEASE_VERSIONS]() {
            if (this.releaseVersions.length) return; // Only fetch if empty
            try {
                const response = await fetch('/api/jira/versions');
                if (!response.ok) throw new Error('Failed to fetch');
                this.releaseVersions = await response.json();
            } catch (error) {
                console.error('Error fetching release versions:', error);
                throw error; // Rethrow to handle in the component
            }
        },
        [SET_SELECTED_RELEASE](release) {
            this.selectedRelease = release;
        },
    },
});
