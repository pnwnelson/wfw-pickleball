<template>
  <v-app>
    <v-main>
      <v-container fluid class="fill-height">
        <v-row align="center" justify="center">
          <v-col cols="12" class="text-center">
            <h1 class="text-h2 mb-4">WFW Pickleball</h1>
            <p class="text-h5 mb-8">Tournament Scheduling System</p>
            <div
              class="d-flex flex-column flex-sm-row ga-4 justify-center align-center"
            >
              <v-btn
                to="/login"
                color="primary"
                size="x-large"
                prepend-icon="mdi-login"
                class="w-100 w-sm-auto"
              >
                Login
              </v-btn>
              <v-btn
                to="/register"
                color="secondary"
                size="x-large"
                prepend-icon="mdi-account-plus"
                class="w-100 w-sm-auto"
              >
                Register
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
  layout: false,
});

const { user } = useFirebaseAuth();

// Redirect to profile if already logged in
watchEffect(() => {
  if (user.value) {
    navigateTo("/profile");
  }
});
</script>
