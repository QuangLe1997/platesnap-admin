'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AdminUser } from './types';
import { authenticateAdmin, hasAnyAdmin } from './db/admins';

interface AuthContextType {
  user: AdminUser | null;
  isLoading: boolean;
  needsSetup: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'platesnap_admin_session';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      try {
        // Check if any admin exists
        const adminExists = await hasAnyAdmin();
        setNeedsSetup(!adminExists);

        // Check localStorage for session
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const session = JSON.parse(stored);
          // Verify session is still valid (simple check - in production use JWT)
          if (session.user && session.expiresAt > Date.now()) {
            setUser(session.user);
          } else {
            localStorage.removeItem(STORAGE_KEY);
          }
        }
      } catch (error) {
        console.error('Session check error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const admin = await authenticateAdmin(username, password);
      if (admin) {
        setUser(admin);
        // Store session (expires in 24 hours)
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            user: admin,
            expiresAt: Date.now() + 24 * 60 * 60 * 1000,
          })
        );
        return { success: true };
      }
      return { success: false, error: 'Sai tên đăng nhập hoặc mật khẩu' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Đã xảy ra lỗi. Vui lòng thử lại.' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, needsSetup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
