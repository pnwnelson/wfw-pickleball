export default defineNuxtRouteMiddleware(async (to, from) => {
  const { user, initAuth, loading } = useFirebaseAuth();

  // Initialize auth state if not already done
  if (loading.value) {
    await initAuth();
  }

  // Redirect to login if not authenticated
  if (!user.value) {
    return navigateTo("/login");
  }
});
