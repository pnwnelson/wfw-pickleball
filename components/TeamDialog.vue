<template>
  <v-dialog v-model="show" max-width="500">
    <v-card>
      <v-card-title class="text-h5">Join a Team</v-card-title>

      <v-card-text>
        <v-tabs
          v-model="activeTab"
          color="primary"
          direction="vertical"
          class="d-sm-none mb-4"
        >
          <v-tab value="search">Search for a team</v-tab>
          <v-tab value="create">Create a new team</v-tab>
        </v-tabs>

        <v-tabs
          v-model="activeTab"
          color="primary"
          grow
          class="d-none d-sm-flex"
        >
          <v-tab value="search">Search for a team</v-tab>
          <v-tab value="create">Create a new team</v-tab>
        </v-tabs>

        <v-tabs-window v-model="activeTab" class="mt-4">
          <v-tabs-window-item value="search">
            <v-select
              v-model="selectedTeam"
              :items="teams"
              item-title="teamName"
              item-value="teamName"
              label="Select a Team"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              placeholder="Choose a team to join"
              clearable
              :loading="loadingTeams"
              @focus="emit('input-focus')"
            >
              <template #no-data>
                <v-list-item>
                  <v-list-item-title> No teams available </v-list-item-title>
                </v-list-item>
              </template>
            </v-select>
          </v-tabs-window-item>

          <v-tabs-window-item value="create">
            <v-text-field
              v-model="newTeamName"
              label="Team Name"
              prepend-inner-icon="mdi-account-group"
              variant="outlined"
              placeholder="Enter new team name"
              clearable
              @focus="emit('input-focus')"
            />
          </v-tabs-window-item>
        </v-tabs-window>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn text @click="handleCancel">Cancel</v-btn>
        <v-btn
          color="primary"
          @click="handleSubmit"
          :disabled="
            (activeTab === 'search' && !selectedTeam) ||
            (activeTab === 'create' && !newTeamName)
          "
        >
          {{ activeTab === "search" ? "Join" : "Create" }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  submit: [data: { type: "search" | "create"; teamName: string }];
  "input-focus": [];
}>();

const show = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const activeTab = ref<"search" | "create">("search");
const selectedTeam = ref("");
const newTeamName = ref("");
const teams = ref<Array<{ teamName: string }>>([]);
const loadingTeams = ref(false);

// Fetch teams from Firestore
const fetchTeams = async () => {
  loadingTeams.value = true;
  try {
    const { $db } = useNuxtApp();
    const { collection, getDocs } = await import("firebase/firestore");

    const teamsRef = collection($db, "teams");
    const querySnapshot = await getDocs(teamsRef);

    teams.value = querySnapshot.docs.map((doc) => ({
      teamName: doc.data().teamName,
    }));
  } catch (error) {
    console.error("Error fetching teams:", error);
  } finally {
    loadingTeams.value = false;
  }
};

const handleCancel = () => {
  show.value = false;
  resetForm();
};

const handleSubmit = () => {
  const teamName =
    activeTab.value === "search" ? selectedTeam.value : newTeamName.value;

  emit("submit", {
    type: activeTab.value,
    teamName: teamName,
  });

  show.value = false;
  resetForm();
};

const resetForm = () => {
  activeTab.value = "search";
  selectedTeam.value = "";
  newTeamName.value = "";
};

// Reset form and fetch teams when dialog is opened
watch(show, (newValue) => {
  if (newValue) {
    resetForm();
    fetchTeams();
  }
});
</script>
