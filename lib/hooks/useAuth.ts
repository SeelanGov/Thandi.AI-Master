import { useState, useEffect, useCallback } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  error: AuthError | null
}

export interface AuthActions {
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signUp: (email: string, password: string, metadata?: Record<string, any>) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<{ error: AuthError | null }>
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>
  clearError: () => void
}

export interface UseAuthReturn extends AuthState, AuthActions {
  isAuthenticated: boolean
  isLoading: boolean
}

/**
 * Custom hook for authentication state management with Supabase Auth
 * 
 * Features:
 * - Session persistence and automatic token refresh
 * - User context throughout the application
 * - Logout and session cleanup functionality
 * - Error handling for authentication operations
 * 
 * Requirements: 2.1, 5.1
 */
export function useAuth(): UseAuthReturn {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null
  })

  // Initialize auth state and set up listener
  useEffect(() => {
    let mounted = true

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (mounted) {
          setState(prev => ({
            ...prev,
            session,
            user: session?.user ?? null,
            loading: false,
            error: error as AuthError | null
          }))
        }
      } catch (error) {
        if (mounted) {
          setState(prev => ({
            ...prev,
            loading: false,
            error: error as AuthError
          }))
        }
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (mounted) {
          setState(prev => ({
            ...prev,
            session,
            user: session?.user ?? null,
            loading: false,
            error: null
          }))

          // Handle session cleanup on sign out
          if (event === 'SIGNED_OUT') {
            // Clear any cached data or perform cleanup
            // Remove assessment drafts from Supabase (if user exists)
            if (state.user?.id) {
              supabase
                .from('assessment_drafts')
                .delete()
                .eq('student_id', state.user.id)
                .then(({ error }) => {
                  if (error) {
                    console.error('Failed to clear assessment drafts:', error);
                  } else {
                    console.log('Assessment drafts cleared');
                  }
                });
            }
          }
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  // Sign in with email and password
  const signIn = useCallback(async (email: string, password: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        setState(prev => ({ ...prev, loading: false, error }))
        return { error }
      }

      return { error: null }
    } catch (error) {
      const authError = error as AuthError
      setState(prev => ({ ...prev, loading: false, error: authError }))
      return { error: authError }
    }
  }, [])

  // Sign up with email and password
  const signUp = useCallback(async (
    email: string, 
    password: string, 
    metadata?: Record<string, any>
  ) => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      })

      if (error) {
        setState(prev => ({ ...prev, loading: false, error }))
        return { error }
      }

      return { error: null }
    } catch (error) {
      const authError = error as AuthError
      setState(prev => ({ ...prev, loading: false, error: authError }))
      return { error: authError }
    }
  }, [])

  // Sign out and cleanup
  const signOut = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const { error } = await supabase.auth.signOut()

      if (error) {
        setState(prev => ({ ...prev, loading: false, error }))
        return { error }
      }

      // Additional cleanup - clear user-specific data from Supabase
      if (state.user?.id) {
        await supabase
          .from('assessment_drafts')
          .delete()
          .eq('student_id', state.user.id);
      }
      
      return { error: null }
    } catch (error) {
      const authError = error as AuthError
      setState(prev => ({ ...prev, loading: false, error: authError }))
      return { error: authError }
    }
  }, [])

  // Reset password
  const resetPassword = useCallback(async (email: string) => {
    setState(prev => ({ ...prev, error: null }))
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      })

      if (error) {
        setState(prev => ({ ...prev, error }))
        return { error }
      }

      return { error: null }
    } catch (error) {
      const authError = error as AuthError
      setState(prev => ({ ...prev, error: authError }))
      return { error: authError }
    }
  }, [])

  // Clear error state
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  return {
    // State
    user: state.user,
    session: state.session,
    loading: state.loading,
    error: state.error,
    
    // Computed properties
    isAuthenticated: !!state.user,
    isLoading: state.loading,
    
    // Actions
    signIn,
    signUp,
    signOut,
    resetPassword,
    clearError
  }
}

export default useAuth