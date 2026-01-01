<template>
  <v-app>
    <v-main>
      <v-container fluid class="fill-height">
        <v-row align="center" justify="center">
          <v-col cols="12" sm="8" md="4">
            <v-card elevation="12" rounded="lg">
              <v-card-title class="text-h4 text-center py-6">
                Create Account
              </v-card-title>
              <v-card-subtitle class="text-center pb-4">
                WFW Pickleball Tournament
              </v-card-subtitle>

              <v-card-text>
                <v-form @submit.prevent="handleRegister">
                  <v-text-field
                    v-model="firstName"
                    label="First Name"
                    prepend-inner-icon="mdi-account"
                    variant="outlined"
                    :error-messages="errors.firstName"
                    required
                  />

                  <v-text-field
                    v-model="lastName"
                    label="Last Name"
                    prepend-inner-icon="mdi-account"
                    variant="outlined"
                    :error-messages="errors.lastName"
                    required
                  />

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
                    v-model="duprRating"
                    label="DUPR Rating (Optional)"
                    type="number"
                    prepend-inner-icon="mdi-star"
                    variant="outlined"
                    hint="Enter your DUPR rating if you have one"
                    :error-messages="errors.duprRating"
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
                    hint="Must be at least 6 characters"
                    required
                  />

                  <v-text-field
                    v-model="confirmPassword"
                    label="Confirm Password"
                    :type="showConfirmPassword ? 'text' : 'password'"
                    prepend-inner-icon="mdi-lock-check"
                    :append-inner-icon="
                      showConfirmPassword ? 'mdi-eye' : 'mdi-eye-off'
                    "
                    @click:append-inner="
                      showConfirmPassword = !showConfirmPassword
                    "
                    variant="outlined"
                    :error-messages="errors.confirmPassword"
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
                    Register
                  </v-btn>

                  <div class="text-center">
                    <nuxt-link to="/login" class="text-decoration-none">
                      Already have an account? Login
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
import { doc, setDoc } from "firebase/firestore";

definePageMeta({
  layout: false,
});

const firstName = ref("");
const lastName = ref("");
const email = ref("");
const duprRating = ref("");
const password = ref("");
const confirmPassword = ref("");
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const loading = ref(false);
const errorMessage = ref("");
const errors = ref({
  firstName: "",
  lastName: "",
  email: "",
  duprRating: "",
  password: "",
  confirmPassword: "",
});

const { register } = useFirebaseAuth();
const { $db } = useNuxtApp();
const userStore = useUserStore();

const handleRegister = async () => {
  errorMessage.value = "";
  errors.value = {
    firstName: "",
    lastName: "",
    email: "",
    duprRating: "",
    password: "",
    confirmPassword: "",
  };

  // Validation
  if (!firstName.value.trim()) {
    errors.value.firstName = "First name is required";
    return;
  }
  if (!lastName.value.trim()) {
    errors.value.lastName = "Last name is required";
    return;
  }
  if (!email.value) {
    errors.value.email = "Email is required";
    return;
  }
  if (!password.value) {
    errors.value.password = "Password is required";
    return;
  }
  if (password.value.length < 6) {
    errors.value.password = "Password must be at least 6 characters";
    return;
  }
  if (password.value !== confirmPassword.value) {
    errors.value.confirmPassword = "Passwords do not match";
    return;
  }

  loading.value = true;

  try {
    const userCredential = await register(email.value, password.value);

    // Create Firestore user document
    const userDoc = {
      playerFirstName: firstName.value.trim(),
      playerLastName: lastName.value.trim(),
      playerRating: duprRating.value ? parseFloat(duprRating.value) : null,
      teamName: "",
      scheduleSubmitted: false,
    };

    await setDoc(doc($db, "users", userCredential.uid), userDoc);

    // Save profile to store
    userStore.setProfile(userDoc);

    await navigateTo("/profile");
  } catch (error: any) {
    console.error("Registration error:", error);

    // Handle Firebase auth errors
    if (error.code === "auth/email-already-in-use") {
      errorMessage.value = "An account with this email already exists";
    } else if (error.code === "auth/invalid-email") {
      errorMessage.value = "Invalid email address";
    } else if (error.code === "auth/weak-password") {
      errorMessage.value = "Password is too weak";
    } else {
      errorMessage.value = "Registration failed. Please try again";
    }
  } finally {
    loading.value = false;
  }
};
</script>
