import { defineStore } from "pinia";
import { doc, getDoc } from "firebase/firestore";

export interface UserProfile {
  playerFirstName: string;
  playerLastName: string;
  playerRating: number | null;
  teamName: string;
  scheduleSubmitted: boolean;
}

export const useUserStore = defineStore("user", {
  state: () => ({
    profile: null as UserProfile | null,
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchUserProfile(userId: string) {
      this.loading = true;
      this.error = null;

      try {
        const { $db } = useNuxtApp();
        const userDoc = await getDoc(doc($db, "users", userId));

        if (userDoc.exists()) {
          this.profile = userDoc.data() as UserProfile;
        } else {
          this.error = "User profile not found";
          this.profile = null;
        }
      } catch (error: any) {
        console.error("Error fetching user profile:", error);
        this.error = error.message || "Failed to fetch user profile";
        this.profile = null;
      } finally {
        this.loading = false;
      }
    },

    setProfile(profile: UserProfile) {
      this.profile = profile;
    },

    clearProfile() {
      this.profile = null;
      this.error = null;
    },

    updateProfile(updates: Partial<UserProfile>) {
      if (this.profile) {
        this.profile = { ...this.profile, ...updates };
      }
    },
  },

  persist: true,
});
