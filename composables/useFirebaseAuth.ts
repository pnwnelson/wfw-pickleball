import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User
} from 'firebase/auth'

export const useFirebaseAuth = () => {
  const { $auth } = useNuxtApp()
  const user = useState<User | null>('firebase-user', () => null)
  const loading = useState('firebase-auth-loading', () => true)

  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword($auth, email, password)
      user.value = userCredential.user
      return userCredential.user
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const register = async (email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword($auth, email, password)
      user.value = userCredential.user
      return userCredential.user
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await signOut($auth)
      user.value = null
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
  }

  const initAuth = () => {
    return new Promise<User | null>((resolve) => {
      const unsubscribe = onAuthStateChanged($auth, (firebaseUser) => {
        user.value = firebaseUser
        loading.value = false
        unsubscribe()
        resolve(firebaseUser)
      })
    })
  }

  return {
    user,
    loading,
    login,
    register,
    logout,
    initAuth,
  }
}
