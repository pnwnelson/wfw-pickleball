<template>
  <v-app>
    <v-main>
      <v-container fluid class="fill-height">
        <v-row align="center" justify="center">
          <v-col cols="12" sm="8" md="4">
            <v-card elevation="12" rounded="lg">
              <v-card-title class="text-h4 text-center py-6">
                WFW Pickleball
              </v-card-title>
              <v-card-subtitle class="text-center pb-4">
                Tournament Scheduling
              </v-card-subtitle>

              <v-card-text>
                <v-form @submit.prevent="handleLogin">
                  <v-text-field
                    v-model="email"
                    label="Email"
                    type="email"
                    prepend-inner-icon="mdi-email"
                    variant="outlined"
                    :error-messages="errors.email"
                    required
                  />

                  <v-text-field
                    v-model="password"
                    label="Password"
                    :type="showPassword ? 'text' : 'password'"
                    prepend-inner-icon="mdi-lock"
                    :append-inner-icon="
                      showPassword ? 'mdi-eye' : 'mdi-eye-off'
                    "
                    @click:append-inner="showPassword = !showPassword"
                    variant="outlined"
                    :error-messages="errors.password"
                    required
                  />

                  <v-alert
                    v-if="errorMessage"
                    type="error"
                    variant="tonal"
                    class="mb-4"
                  >
                    {{ errorMessage }}
                  </v-alert>

                  <v-btn
                    type="submit"
                    color="primary"
                    size="large"
                    block
                    :loading="loading"
                    class="mb-4"
                  >
                    Login
                  </v-btn>

                  <div class="text-center">
                    <nuxt-link to="/register" class="text-decoration-none">
                      Don't have an account? Register
                    </nuxt-link>
                  </div>
                </v-form>
              </v-card-text>
            </v-card>
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

const email = ref("");
const password = ref("");
const showPassword = ref(false);
const loading = ref(false);
const errorMessage = ref("");
const errors = ref({ email: "", password: "" });

const { login } = useFirebaseAuth();
const userStore = useUserStore();

const handleLogin = async () => {
  errorMessage.value = "";
  errors.value = { email: "", password: "" };

  // Basic validation
  if (!email.value) {
    errors.value.email = "Email is required";
    return;
  }
  if (!password.value) {
    errors.value.password = "Password is required";
    return;
  }

  loading.value = true;

  try {
    const user = await login(email.value, password.value);

    // Fetch user profile from Firestore
    await userStore.fetchUserProfile(user.uid);

    await navigateTo("/profile");
  } catch (error: any) {
    console.error("Login error:", error);

    // Handle Firebase auth errors
    if (error.code === "auth/invalid-credential") {
      errorMessage.value = "Invalid email or password";
    } else if (error.code === "auth/user-not-found") {
      errorMessage.value = "No account found with this email";
    } else if (error.code === "auth/wrong-password") {
      errorMessage.value = "Incorrect password";
    } else if (error.code === "auth/too-many-requests") {
      errorMessage.value = "Too many failed attempts. Please try again later";
    } else {
      errorMessage.value = "Login failed. Please try again";
    }
  } finally {
    loading.value = false;
  }
};
</script>
