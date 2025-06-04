import { Permission, Role, User } from '@prisma/client'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router'

type SafeUser = User & {
  role: Role & {
    permissions: {
      permission: Permission
    }[]
  }
}

interface AuthContextType {
  user: SafeUser | null
  isLoading: boolean
  token: string | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  hasPermission: (permission: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SafeUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    // Check for stored token on mount
    const checkStoredToken = async () => {
      const storedToken = await window.api.auth.loadToken()
      if (storedToken) {
        verifyAndSetToken(storedToken)
      } else {
        setIsLoading(false)
      }
    }
    checkStoredToken()
  }, [])

  const verifyAndSetToken = async (token: string) => {
    setIsLoading(true)
    try {
      const response = await window.api.auth.verifyToken(token)
      if (response.success && response.data) {
        const { userId } = response.data
        const userResponse = await window.api.user.getById(userId)
        if (!userResponse.success || !userResponse.data) {
          throw new Error('User not found')
        }
        setUser(userResponse.data)
        setToken(token)
      } else {
        await window.api.auth.clearToken()
      }
    } catch (error) {
      console.error('Token verification failed:', error)
      await window.api.auth.clearToken()
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (username: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await window.api.auth.login({ username, password })
      if (response.success && response.data) {
        const { user, token } = response.data
        setUser(user)
        setToken(token)
        await window.api.auth.saveToken(token)
        navigate('/')
      } else {
        throw new Error(response.error)
      }
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    window.api.auth.clearToken()
    navigate('/login')
  }

  const hasPermission = (permission: string): boolean => {
    if (!user) return false
    return user.role.permissions.some((p) => p.permission.name === permission)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, token, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
