<template>
  <v-app>
    <v-app-bar color="primary" elevation="2">
      <v-app-bar-title class="text-truncate">WFW Pickleball</v-app-bar-title>
      <v-spacer />
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
            <v-card>
              <v-card-title class="d-flex align-center">
                <span class="text-h4">Profile</span>
                <v-spacer />
                <v-btn
                  v-if="!isEditingProfile"
                  icon="mdi-pencil"
                  variant="text"
                  @click="startEditProfile"
                />
                <v-btn
                  v-else
                  icon="mdi-check"
                  variant="text"
                  color="success"
                  @click="saveProfile"
                />
                <v-btn
                  v-if="isEditingProfile"
                  icon="mdi-close"
                  variant="text"
                  @click="cancelEditProfile"
                />
              </v-card-title>

              <v-card-text>
                <v-list v-if="!userStore.loading">
                  <v-list-item v-if="userStore.profile && !isEditingProfile">
                    <template #prepend>
                      <v-icon>mdi-account</v-icon>
                    </template>
                    <v-list-item-title>Name</v-list-item-title>
                    <v-list-item-subtitle>
                      {{ userStore.profile.playerFirstName }}
                      {{ userStore.profile.playerLastName }}
                    </v-list-item-subtitle>
                  </v-list-item>

                  <v-list-item v-if="userStore.profile && isEditingProfile">
                    <template #prepend>
                      <v-icon>mdi-account</v-icon>
                    </template>
                    <v-list-item-title>Name</v-list-item-title>
                    <div class="d-flex ga-2 mt-2">
                      <v-text-field
                        v-model="editForm.firstName"
                        label="First Name"
                        variant="outlined"
                        density="compact"
                        hide-details
                      />
                      <v-text-field
                        v-model="editForm.lastName"
                        label="Last Name"
                        variant="outlined"
                        density="compact"
                        hide-details
                      />
                    </div>
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

                  <v-list-item v-if="!isEditingProfile">
                    <template #prepend>
                      <v-icon
                        :color="
                          userStore?.profile?.playerRating
                            ? 'yellow-darken-2'
                            : ''
                        "
                      >
                        mdi-star
                      </v-icon>
                    </template>
                    <v-list-item-title>DUPR Rating</v-list-item-title>
                    <v-list-item-subtitle>
                      {{
                        userStore?.profile?.playerRating
                          ? userStore.profile.playerRating
                          : "No Rating"
                      }}
                    </v-list-item-subtitle>
                  </v-list-item>

                  <v-list-item v-if="isEditingProfile">
                    <template #prepend>
                      <v-icon
                        :color="
                          userStore?.profile?.playerRating
                            ? 'yellow-darken-2'
                            : ''
                        "
                      >
                        mdi-star
                      </v-icon>
                    </template>
                    <v-list-item-title>DUPR Rating</v-list-item-title>
                    <v-text-field
                      v-model="editForm.rating"
                      label="DUPR Rating"
                      variant="outlined"
                      density="compact"
                      type="number"
                      step="0.1"
                      hide-details
                      class="mt-2"
                    />
                  </v-list-item>

                  <v-list-item>
                    <template #prepend>
                      <v-icon
                        :color="
                          userStore.profile?.teamName &&
                          userStore.profile.teamName.trim() !== '' &&
                          userStore.profile.teamName.toLowerCase() !== 'no team'
                            ? 'success'
                            : 'error'
                        "
                      >
                        mdi-account-group
                      </v-icon>
                    </template>
                    <v-list-item-title>Team Name</v-list-item-title>
                    <v-list-item-subtitle
                      :class="
                        userStore.profile?.teamName &&
                        userStore.profile.teamName.trim() !== '' &&
                        userStore.profile.teamName.toLowerCase() !== 'no team'
                          ? ''
                          : 'text-error'
                      "
                    >
                      {{
                        userStore.profile?.teamName
                          ? userStore.profile.teamName
                          : "No team"
                      }}
                    </v-list-item-subtitle>
                  </v-list-item>

                  <v-list-item v-if="userStore.profile">
                    <template #prepend>
                      <v-icon
                        :color="
                          userStore.profile.scheduleSubmitted
                            ? 'success'
                            : 'error'
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
                          ? "Finalized"
                          : "Not Finalized"
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
                v-if="userStore.profile && userStore.profile.teamName"
                color="primary"
                prepend-icon="mdi-account-switch"
                @click="handleAddTeam"
              >
                Change Team
              </v-btn>

              <v-btn
                color="secondary"
                prepend-icon="mdi-calendar-plus"
                @click="handleAddSchedule"
              >
                Add to your schedule
              </v-btn>

              <v-btn
                v-if="userStore.profile && !userStore.profile.scheduleSubmitted"
                color="success"
                prepend-icon="mdi-check-circle"
                @click="showFinalizeDialog = true"
              >
                Finalize Schedule
              </v-btn>
            </div>

            <UserSchedule
              :schedule="userSchedule"
              :loading="scheduleLoading"
              @delete="handleDeleteScheduleEvent"
              class="mt-4"
            />
          </v-col>
        </v-row>
      </v-container>
    </v-main>

    <TeamDialog
      v-model="showTeamDialog"
      @submit="handleTeamDialogSubmit"
      @input-focus="snackbar.show = false"
    />

    <ScheduleDialog
      v-model="showScheduleDialog"
      @submit="handleScheduleSubmit"
    />

    <v-dialog v-model="showFinalizeDialog" max-width="500">
      <v-card>
        <v-card-title class="text-h5">Finalize Schedule?</v-card-title>

        <v-card-text>
          <p class="mb-3">
            Are you sure you want to finalize your schedule? This will lock in
            your availability and will be used to automatically schedule
            pickleball games.
          </p>
          <p class="text-warning">
            <v-icon color="warning" class="mr-1">mdi-alert</v-icon>
            Adding an event from your schedule after it is finalized will void
            any scheduled pickleball games you belong to.
          </p>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn text @click="showFinalizeDialog = false">Cancel</v-btn>
          <v-btn color="success" @click="handleFinalizeSchedule">
            Confirm
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
const userStore = useUserStore();

const showTeamDialog = ref(false);
const showScheduleDialog = ref(false);
const showFinalizeDialog = ref(false);
const userSchedule = ref<any[]>([]);
const scheduleLoading = ref(false);
const snackbar = ref({
  show: false,
  message: "",
  color: "error",
  timeout: -1,
});

const isEditingProfile = ref(false);
const editForm = ref({
  firstName: "",
  lastName: "",
  rating: "",
});

// Fetch user profile if not already loaded
onMounted(async () => {
  if (user.value && !userStore.profile) {
    await userStore.fetchUserProfile(user.value.uid);
  }
  await fetchUserSchedule();
});

// Fetch user's schedule from team
const fetchUserSchedule = async () => {
  if (!userStore.profile?.teamName || !user.value?.uid) {
    userSchedule.value = [];
    return;
  }

  scheduleLoading.value = true;
  try {
    const { $db } = useNuxtApp();
    const { collection, query, where, getDocs } = await import(
      "firebase/firestore"
    );

    const teamsRef = collection($db, "teams");
    const q = query(
      teamsRef,
      where("teamName", "==", userStore.profile.teamName)
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const teamData = querySnapshot.docs[0].data();
      const userMember = teamData.members?.find(
        (member: any) => member.uid === user.value?.uid
      );
      userSchedule.value = userMember?.schedule || [];
    }
  } catch (error) {
    console.error("Error fetching schedule:", error);
  } finally {
    scheduleLoading.value = false;
  }
};

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

const startEditProfile = () => {
  editForm.value = {
    firstName: userStore.profile?.playerFirstName || "",
    lastName: userStore.profile?.playerLastName || "",
    rating: userStore.profile?.playerRating || "",
  };
  isEditingProfile.value = true;
};

const cancelEditProfile = () => {
  isEditingProfile.value = false;
  editForm.value = { firstName: "", lastName: "", rating: "" };
};

const saveProfile = async () => {
  try {
    const { $db } = useNuxtApp();
    const { doc, updateDoc } = await import("firebase/firestore");

    const userRef = doc($db, "users", user.value!.uid);
    await updateDoc(userRef, {
      playerFirstName: editForm.value.firstName,
      playerLastName: editForm.value.lastName,
      playerRating: editForm.value.rating,
    });

    await userStore.updateProfile({
      playerFirstName: editForm.value.firstName,
      playerLastName: editForm.value.lastName,
      playerRating: editForm.value.rating,
    });

    isEditingProfile.value = false;
    snackbar.value = {
      show: true,
      message: "Profile updated successfully!",
      color: "success",
      timeout: 2000,
    };
  } catch (error) {
    console.error("Error updating profile:", error);
    snackbar.value = {
      show: true,
      message: "Failed to update profile. Please try again.",
      color: "error",
      timeout: -1,
    };
  }
};

const handleAddTeam = () => {
  showTeamDialog.value = true;
};

const handleTeamDialogSubmit = async (data: {
  type: "search" | "create";
  teamName: string;
}) => {
  if (data.type === "search") {
    // Join existing team
    try {
      const { $db } = useNuxtApp();
      const {
        collection,
        doc,
        updateDoc,
        query,
        where,
        getDocs,
        arrayUnion,
        arrayRemove,
      } = await import("firebase/firestore");

      // If user has a previous team, remove them from it
      if (userStore.profile?.teamName) {
        const oldTeamsRef = collection($db, "teams");
        const oldTeamQuery = query(
          oldTeamsRef,
          where("teamName", "==", userStore.profile.teamName)
        );
        const oldTeamSnapshot = await getDocs(oldTeamQuery);

        if (!oldTeamSnapshot.empty) {
          const oldTeamDoc = oldTeamSnapshot.docs[0];
          const oldTeamRef = doc($db, "teams", oldTeamDoc.id);
          await updateDoc(oldTeamRef, {
            members: arrayRemove({
              uid: user.value?.uid,
              firstName: userStore.profile?.playerFirstName,
              lastName: userStore.profile?.playerLastName,
              rating: userStore.profile?.playerRating,
            }),
          });
        }
      }

      // Find the new team document
      const teamsRef = collection($db, "teams");
      const q = query(teamsRef, where("teamName", "==", data.teamName));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        snackbar.value = {
          show: true,
          message: "Team not found.",
          color: "error",
          timeout: -1,
        };
        return;
      }

      const teamDoc = querySnapshot.docs[0];

      // Add user to new team members array
      const teamRef = doc($db, "teams", teamDoc.id);
      await updateDoc(teamRef, {
        members: arrayUnion({
          uid: user.value?.uid,
          firstName: userStore.profile?.playerFirstName,
          lastName: userStore.profile?.playerLastName,
          rating: userStore.profile?.playerRating,
        }),
      });

      // Update user's teamName
      const userRef = doc($db, "users", user.value!.uid);
      await updateDoc(userRef, {
        teamName: data.teamName,
      });

      // Update local store
      await userStore.updateProfile({ teamName: data.teamName });

      console.log("Successfully joined team:", data.teamName);
    } catch (error) {
      console.error("Error joining team:", error);
      snackbar.value = {
        show: true,
        message: "Failed to join team. Please try again.",
        color: "error",
        timeout: -1,
      };
    }
  } else {
    // Create new team
    try {
      const { $db } = useNuxtApp();
      const { collection, addDoc, doc, updateDoc, query, where, getDocs } =
        await import("firebase/firestore");

      // Check if team name already exists
      const teamsRef = collection($db, "teams");
      const q = query(teamsRef, where("teamName", "==", data.teamName));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        console.error("Team name already exists");
        snackbar.value = {
          show: true,
          message:
            "A team with this name already exists. Please choose a different name.",
          color: "error",
          timeout: -1,
        };
        return;
      }

      // Create team document
      const teamRef = await addDoc(collection($db, "teams"), {
        teamName: data.teamName,
        ownerId: user.value?.uid,
        members: [
          {
            uid: user.value?.uid,
            firstName: userStore.profile?.playerFirstName,
            lastName: userStore.profile?.playerLastName,
            rating: userStore.profile?.playerRating,
          },
        ],
        createdAt: new Date(),
      });

      // Update user's teamName
      const userRef = doc($db, "users", user.value!.uid);
      await updateDoc(userRef, {
        teamName: data.teamName,
      });

      // Update local store
      await userStore.updateProfile({ teamName: data.teamName });

      console.log("Team created successfully:", teamRef.id);
    } catch (error) {
      console.error("Error creating team:", error);
    }
  }
};

const handleAddSchedule = () => {
  showScheduleDialog.value = true;
};

const handleScheduleSubmit = async (data: {
  timeSlot: string;
  eventType: string;
}) => {
  try {
    const { $db } = useNuxtApp();
    const { collection, query, where, getDocs, doc, updateDoc, arrayUnion } =
      await import("firebase/firestore");

    // Find the user's team
    if (!userStore.profile?.teamName) {
      snackbar.value = {
        show: true,
        message: "You must join a team before adding schedule events.",
        color: "error",
        timeout: -1,
      };
      return;
    }

    const teamsRef = collection($db, "teams");
    const q = query(
      teamsRef,
      where("teamName", "==", userStore.profile.teamName)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      snackbar.value = {
        show: true,
        message: "Team not found.",
        color: "error",
        timeout: -1,
      };
      return;
    }

    const teamDoc = querySnapshot.docs[0];
    const teamData = teamDoc.data();
    const teamRef = doc($db, "teams", teamDoc.id);

    // Find the user in the members array and add schedule event
    const updatedMembers = teamData.members.map((member: any) => {
      if (member.uid === user.value?.uid) {
        return {
          ...member,
          schedule: [
            ...(member.schedule || []),
            {
              timeSlot: data.timeSlot,
              eventType: data.eventType,
              addedAt: new Date(),
            },
          ],
        };
      }
      return member;
    });

    // Update the team document with the modified members array
    await updateDoc(teamRef, {
      members: updatedMembers,
    });

    snackbar.value = {
      show: true,
      message: "Schedule event added successfully!",
      color: "success",
      timeout: 2000,
    };

    // Refresh the schedule
    await fetchUserSchedule();

    console.log("Schedule event added:", data);
  } catch (error) {
    console.error("Error adding schedule event:", error);
    snackbar.value = {
      show: true,
      message: "Failed to add schedule event. Please try again.",
      color: "error",
      timeout: -1,
    };
  }
};

const handleDeleteScheduleEvent = async (index: number) => {
  try {
    const { $db } = useNuxtApp();
    const { collection, query, where, getDocs, doc, updateDoc } = await import(
      "firebase/firestore"
    );

    if (!userStore.profile?.teamName) {
      return;
    }

    const teamsRef = collection($db, "teams");
    const q = query(
      teamsRef,
      where("teamName", "==", userStore.profile.teamName)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return;
    }

    const teamDoc = querySnapshot.docs[0];
    const teamData = teamDoc.data();
    const teamRef = doc($db, "teams", teamDoc.id);

    // Remove the event at the specified index
    const updatedMembers = teamData.members.map((member: any) => {
      if (member.uid === user.value?.uid) {
        const updatedSchedule = [...(member.schedule || [])];
        updatedSchedule.splice(index, 1);
        return {
          ...member,
          schedule: updatedSchedule,
        };
      }
      return member;
    });

    await updateDoc(teamRef, {
      members: updatedMembers,
    });

    // Set scheduleSubmitted to false when schedule is modified
    const userRef = doc($db, "users", user.value!.uid);
    await updateDoc(userRef, {
      scheduleSubmitted: false,
    });

    // Update local store
    await userStore.updateProfile({ scheduleSubmitted: false });

    snackbar.value = {
      show: true,
      message: "Schedule event deleted successfully!",
      color: "success",
      timeout: 2000,
    };

    // Refresh the schedule
    await fetchUserSchedule();
  } catch (error) {
    console.error("Error deleting schedule event:", error);
    snackbar.value = {
      show: true,
      message: "Failed to delete schedule event. Please try again.",
      color: "error",
      timeout: -1,
    };
  }
};

const handleFinalizeSchedule = async () => {
  try {
    const { $db } = useNuxtApp();
    const { doc, updateDoc } = await import("firebase/firestore");

    // Update user's scheduleSubmitted status
    const userRef = doc($db, "users", user.value!.uid);
    await updateDoc(userRef, {
      scheduleSubmitted: true,
    });

    // Update local store
    await userStore.updateProfile({ scheduleSubmitted: true });

    showFinalizeDialog.value = false;
    snackbar.value = {
      show: true,
      message: "Schedule finalized successfully!",
      color: "success",
      timeout: 2000,
    };
  } catch (error) {
    console.error("Error finalizing schedule:", error);
    snackbar.value = {
      show: true,
      message: "Failed to finalize schedule. Please try again.",
      color: "error",
      timeout: -1,
    };
  }
};
</script>
