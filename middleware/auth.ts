export default defineNuxtRouteMiddleware(async (to, from) => {
  if (process.server) return; // Skip on server-side

  const { user, initAuth } = useFirebaseAuth();

  // Initialize auth state and wait for it to complete
  await initAuth();

  // Redirect to login if not authenticated
  if (!user.value) {
    return navigateTo("/login");
  }
});
