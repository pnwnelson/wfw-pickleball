<template>
  <v-app>
    <v-app-bar color="primary" elevation="2">
      <v-app-bar-title class="text-truncate"
        >WFW Pickleball - Matches</v-app-bar-title
      >
      <v-spacer />
      <v-btn
        @click="navigateTo('/profile')"
        prepend-icon="mdi-account"
        class="d-none d-sm-flex mr-2"
      >
        Profile
      </v-btn>
      <v-btn
        @click="navigateTo('/profile')"
        icon="mdi-account"
        class="d-sm-none mr-2"
      />
      <v-btn @click="handleLogout" icon="mdi-logout" class="d-sm-none" />
      <v-btn
        @click="handleLogout"
        prepend-icon="mdi-logout"
        class="d-none d-sm-flex"
      >
        Logout
      </v-btn>
    </v-app-bar>

    <v-main>
      <v-container>
        <v-row>
          <v-col cols="12">
            <div class="d-flex align-center mb-4">
              <span class="text-h4">Matches</span>
              <v-spacer />
              <v-btn
                color="primary"
                prepend-icon="mdi-plus"
                @click="showCreateMatchDialog = true"
              >
                Create Match
              </v-btn>
            </div>

            <div v-if="loading" class="text-center py-4">
              <v-progress-circular indeterminate color="primary" />
            </div>

            <div
              v-else-if="!matches || matches.length === 0"
              class="text-center py-8"
            >
              <v-icon size="64" color="grey-lighten-1">mdi-tennis</v-icon>
              <p class="text-grey mt-2">No matches yet</p>
              <p class="text-grey-lighten-1">Create a match to get started</p>
            </div>

            <div v-else class="d-flex flex-column ga-4">
              <div v-for="(roundMatches, round) in matchesByRound" :key="round">
                <div class="text-h5 mb-3">Round {{ round }}</div>
                <div class="d-flex flex-column ga-3">
                  <v-card
                    v-for="match in roundMatches"
                    :key="match.id"
                    elevation="2"
                    class="pa-4"
                  >
                    <div class="d-flex align-center">
                      <v-icon color="primary" class="mr-3">mdi-tennis</v-icon>

                      <div class="flex-grow-1">
                        <div class="text-h6">
                          {{ match.team1 }} vs {{ match.team2 }}
                        </div>
                        <div
                          v-if="match.scheduledTime"
                          class="text-subtitle-2 text-primary mt-1"
                        >
                          Scheduled: {{ match.scheduledTime }}
                        </div>
                        <div
                          v-else
                          class="text-subtitle-2 text-error mt-1"
                        >
                          Not scheduled
                        </div>
                        <div
                          v-if="match.winner"
                          class="text-subtitle-2 text-success mt-1"
                        >
                          Winner: {{ match.winner }}
                        </div>
                      </div>

                      <v-btn
                        icon="mdi-delete"
                        variant="text"
                        color="error"
                        @click="handleDeleteMatch(match.id)"
                      />
                    </div>
                  </v-card>
                </div>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </v-main>

    <v-dialog v-model="showCreateMatchDialog" max-width="600">
      <v-card>
        <v-card-title class="text-h5">Create Match</v-card-title>

        <v-card-text>
          <v-form ref="formRef">
            <v-select
              v-model="matchForm.round"
              :items="rounds"
              label="Round"
              prepend-inner-icon="mdi-numeric"
              variant="outlined"
              placeholder="Select round"
              class="mb-4"
              :rules="[(v) => !!v || 'Round is required']"
            />

            <v-select
              v-model="matchForm.team1"
              :items="teams"
              label="Team 1"
              prepend-inner-icon="mdi-account-group"
              variant="outlined"
              placeholder="Select team 1"
              class="mb-4"
              :rules="[(v) => !!v || 'Team 1 is required']"
            />

            <v-select
              v-model="matchForm.team2"
              :items="teams"
              label="Team 2"
              prepend-inner-icon="mdi-account-group"
              variant="outlined"
              placeholder="Select team 2"
              :rules="[
                (v) => !!v || 'Team 2 is required',
                (v) => v !== matchForm.team1 || 'Teams must be different',
              ]"
            />
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn text @click="handleCancelCreateMatch">Cancel</v-btn>
          <v-btn
            color="primary"
            @click="handleCreateMatch"
            :disabled="
              !matchForm.round ||
              !matchForm.team1 ||
              !matchForm.team2 ||
              matchForm.team1 === matchForm.team2
            "
          >
            Create Match
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      location="top"
      :timeout="snackbar.timeout"
    >
      {{ snackbar.message }}
    </v-snackbar>
  </v-app>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: "auth",
  layout: false,
});

const { user, logout } = useFirebaseAuth();

const showCreateMatchDialog = ref(false);
const loading = ref(false);
const teams = ref<string[]>([]);
const matches = ref<any[]>([]);
const formRef = ref();
const rounds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const matchForm = ref({
  round: null as number | null,
  team1: "",
  team2: "",
});
const snackbar = ref({
  show: false,
  message: "",
  color: "error",
  timeout: -1,
});

// Group matches by round
const matchesByRound = computed(() => {
  const grouped: Record<number, any[]> = {};

  matches.value.forEach((match) => {
    const round = match.round || 1;
    if (!grouped[round]) {
      grouped[round] = [];
    }
    grouped[round].push(match);
  });

  // Sort by round number
  return Object.keys(grouped)
    .sort((a, b) => Number(a) - Number(b))
    .reduce((acc, key) => {
      acc[Number(key)] = grouped[Number(key)];
      return acc;
    }, {} as Record<number, any[]>);
});

onMounted(async () => {
  await Promise.all([fetchTeams(), fetchMatches()]);
});

const fetchTeams = async () => {
  try {
    const { $db } = useNuxtApp();
    const { collection, getDocs } = await import("firebase/firestore");

    const teamsRef = collection($db, "teams");
    const querySnapshot = await getDocs(teamsRef);

    teams.value = querySnapshot.docs.map((doc) => doc.data().teamName);
  } catch (error) {
    console.error("Error fetching teams:", error);
  }
};

const fetchMatches = async () => {
  loading.value = true;
  try {
    const { $db } = useNuxtApp();
    const { collection, getDocs, orderBy, query } = await import(
      "firebase/firestore"
    );

    const matchesRef = collection($db, "matches");
    const q = query(matchesRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    matches.value = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching matches:", error);
  } finally {
    loading.value = false;
  }
};

const handleCreateMatch = async () => {
  if (!matchForm.value.team1 || !matchForm.value.team2) {
    return;
  }

  if (matchForm.value.team1 === matchForm.value.team2) {
    snackbar.value = {
      show: true,
      message: "Teams must be different.",
      color: "error",
      timeout: -1,
    };
    return;
  }

  try {
    const { $db } = useNuxtApp();
    const { collection, addDoc } = await import("firebase/firestore");

    await addDoc(collection($db, "matches"), {
      round: matchForm.value.round,
      team1: matchForm.value.team1,
      team2: matchForm.value.team2,
      createdAt: new Date(),
      winner: null,
    });

    snackbar.value = {
      show: true,
      message: "Match created successfully!",
      color: "success",
      timeout: 2000,
    };

    showCreateMatchDialog.value = false;
    resetForm();
    await fetchMatches();
  } catch (error) {
    console.error("Error creating match:", error);
    snackbar.value = {
      show: true,
      message: "Failed to create match. Please try again.",
      color: "error",
      timeout: -1,
    };
  }
};

const handleDeleteMatch = async (matchId: string) => {
  try {
    const { $db } = useNuxtApp();
    const { doc, deleteDoc } = await import("firebase/firestore");

    await deleteDoc(doc($db, "matches", matchId));

    snackbar.value = {
      show: true,
      message: "Match deleted successfully!",
      color: "success",
      timeout: 2000,
    };

    await fetchMatches();
  } catch (error) {
    console.error("Error deleting match:", error);
    snackbar.value = {
      show: true,
      message: "Failed to delete match. Please try again.",
      color: "error",
      timeout: -1,
    };
  }
};

const handleCancelCreateMatch = () => {
  showCreateMatchDialog.value = false;
  resetForm();
};

const resetForm = () => {
  matchForm.value = {
    round: null,
    team1: "",
    team2: "",
  };
};

const formatDate = (timestamp: any) => {
  if (!timestamp) return "";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const handleLogout = async () => {
  try {
    await logout();
    await navigateTo("/login");
  } catch (error) {
    console.error("Logout error:", error);
  }
};
</script>
