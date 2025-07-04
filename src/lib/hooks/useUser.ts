import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  subscription_tier: 'free' | 'premium';
  created_at: string;
  updated_at: string;
}

interface UseUserReturn {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export function useUser(): UseUserReturn {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = createClientComponentClient();

  // Função para buscar dados completos do usuário
  const fetchUserProfile = async (authUser: User) => {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profileError) {
        // Se o perfil não existe, criar um novo
        if (profileError.code === 'PGRST116') {
          const { data: newProfile, error: createError } = await supabase
            .from('users')
            .insert({
              id: authUser.id,
              email: authUser.email,
              full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Usuário',
              avatar_url: authUser.user_metadata?.avatar_url || '',
              subscription_tier: 'free'
            })
            .select()
            .single();

          if (createError) {
            throw createError;
          }

          return newProfile;
        } else {
          throw profileError;
        }
      }

      return profile;
    } catch (err) {
      console.error('Erro ao buscar perfil do usuário:', err);
      // Fallback: usar dados básicos do auth
      return {
        id: authUser.id,
        email: authUser.email || '',
        full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Usuário',
        avatar_url: authUser.user_metadata?.avatar_url || '',
        subscription_tier: 'free',
        created_at: authUser.created_at,
        updated_at: authUser.updated_at
      };
    }
  };

  // Função para atualizar dados do usuário
  const refreshUser = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        throw sessionError;
      }

      if (!session?.user) {
        setUser(null);
        return;
      }

      const profile = await fetchUserProfile(session.user);
      setUser(profile);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar usuário';
      setError(errorMessage);
      console.error('Erro no refreshUser:', err);
    } finally {
      setLoading(false);
    }
  };

  // Função para fazer logout
  const signOut = async () => {
    try {
      setError(null);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao fazer logout';
      setError(errorMessage);
      console.error('Erro no signOut:', err);
    }
  };

  // Effect para monitorar mudanças na autenticação
  useEffect(() => {
    let mounted = true;

    // Buscar usuário inicial
    refreshUser();

    // Escutar mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log('Auth state changed:', event);

        try {
          setLoading(true);
          setError(null);

          if (event === 'SIGNED_OUT' || !session?.user) {
            setUser(null);
          } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            const profile = await fetchUserProfile(session.user);
            setUser(profile);
          }
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Erro de autenticação';
          setError(errorMessage);
          console.error('Erro no auth state change:', err);
        } finally {
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    loading,
    error,
    signOut,
    refreshUser
  };
}

// Hook especializado para verificar autenticação
export function useAuth() {
  const { user, loading } = useUser();
  
  return {
    isAuthenticated: !!user,
    isLoading: loading,
    user
  };
}

// Hook para verificar assinatura premium
export function useSubscription() {
  const { user } = useUser();
  
  return {
    isPremium: user?.subscription_tier === 'premium',
    subscriptionTier: user?.subscription_tier || 'free',
    canUpgrade: user?.subscription_tier === 'free'
  };
}
