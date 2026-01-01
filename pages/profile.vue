<template>
  <v-app>
    <v-app-bar color="primary" elevation="2">
      <v-app-bar-title>WFW Pickleball</v-app-bar-title>
      <v-spacer />
      <v-btn @click="handleLogout" prepend-icon="mdi-logout"> Logout </v-btn>
    </v-app-bar>

    <v-main>
      <v-container>
        <v-row>
          <v-col cols="12">
            <v-card>
              <v-card-title class="text-h4"> Profile </v-card-title>

              <v-card-text>
                <v-list v-if="!userStore.loading">
                  <v-list-item v-if="userStore.profile">
                    <template #prepend>
                      <v-icon>mdi-account</v-icon>
                    </template>
                    <v-list-item-title>Name</v-list-item-title>
                    <v-list-item-subtitle>
                      {{ userStore.profile.playerFirstName }}
                      {{ userStore.profile.playerLastName }}
                    </v-list-item-subtitle>
                  </v-list-item>

                  <v-list-item>
                    <template #prepend>
                      <v-icon>mdi-email</v-icon>
                    </template>
                    <v-list-item-title>Email</v-list-item-title>
                    <v-list-item-subtitle>
                      {{ user?.email || "Not available" }}
                    </v-list-item-subtitle>
                  </v-list-item>

                  <v-list-item>
                    <template #prepend>
                      <v-icon>mdi-clock</v-icon>
                    </template>
                    <v-list-item-title>Member Since</v-list-item-title>
                    <v-list-item-subtitle>
                      {{ creationTime }}
                    </v-list-item-subtitle>
                  </v-list-item>

                  <v-list-item>
                    <template #prepend>
                      <v-icon>mdi-star</v-icon>
                    </template>
                    <v-list-item-title>DUPR Rating</v-list-item-title>
                    <v-list-item-subtitle>
                      {{
                        userStore?.profile?.playerRating
                          ? userStore.profile.teamName
                          : "No Rating"
                      }}
                    </v-list-item-subtitle>
                  </v-list-item>

                  <v-list-item>
                    <template #prepend>
                      <v-icon
                        :color="!userStore?.profile?.teamName ? 'error' : ''"
                      >
                        mdi-account-group
                      </v-icon>
                    </template>
                    <v-list-item-title>Team Name</v-list-item-title>
                    <v-list-item-subtitle
                      :class="!userStore?.profile?.teamName ? 'text-error' : ''"
                    >
                      {{
                        userStore?.profile?.teamName
                          ? userStore.profile.teamName
                          : "No team"
                      }}
                    </v-list-item-subtitle>
                  </v-list-item>

                  <v-list-item v-if="userStore.profile">
                    <template #prepend>
                      <v-icon
                        :color="
                          userStore.profile.scheduleSubmitted ? '' : 'error'
                        "
                      >
                        mdi-calendar-check
                      </v-icon>
                    </template>
                    <v-list-item-title>Schedule Status</v-list-item-title>
                    <v-list-item-subtitle
                      :class="
                        userStore.profile.scheduleSubmitted ? '' : 'text-error'
                      "
                    >
                      {{
                        userStore.profile.scheduleSubmitted
                          ? "Submitted"
                          : "Not Submitted"
                      }}
                    </v-list-item-subtitle>
                  </v-list-item>
                </v-list>

                <v-progress-circular
                  v-else
                  indeterminate
                  color="primary"
                  class="ma-4"
                />
              </v-card-text>
            </v-card>

            <div class="d-flex flex-column ga-3 mt-4">
              <v-btn
                v-if="userStore.profile && !userStore.profile.teamName"
                color="primary"
                prepend-icon="mdi-account-multiple-plus"
                @click="handleAddTeam"
              >
                Join a team
              </v-btn>

              <v-btn
                v-if="userStore.profile && !userStore.profile.scheduleSubmitted"
                color="secondary"
                prepend-icon="mdi-calendar-plus"
                @click="handleAddSchedule"
              >
                Add your schedule
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: "auth",
  layout: false,
});

const { user, logout } = useFirebaseAuth();
const userStore = useUserStore();

// Fetch user profile if not already loaded
onMounted(async () => {
  if (user.value && !userStore.profile) {
    await userStore.fetchUserProfile(user.value.uid);
  }
});

const creationTime = computed(() => {
  if (!user.value?.metadata?.creationTime) return "Not available";
  return new Date(user.value.metadata.creationTime).toLocaleDateString();
});

const handleLogout = async () => {
  try {
    await logout();
    userStore.clearProfile();
    await navigateTo("/login");
  } catch (error) {
    console.error("Logout error:", error);
  }
};

const handleAddTeam = () => {
  // TODO: Navigate to team creation page or open dialog
  console.log("Add team clicked");
};

const handleAddSchedule = () => {
  // TODO: Navigate to schedule creation page or open dialog
  console.log("Add schedule clicked");
};
</script>
