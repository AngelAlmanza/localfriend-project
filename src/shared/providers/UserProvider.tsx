'use client'

import { User } from '@supabase/supabase-js'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { createClient } from '../lib/supabase/client'

interface UserContextType {
  user: User | null
  loading: boolean
}

const UserContext = createContext<UserContextType | null>(null)

export const useUserContext = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUserContext must be used within a UserProvider')
  }
  return context
}

export const UserProvider = ({ children }: { children: Readonly<React.ReactNode> }) => {
  const supabase = useMemo(() => createClient(), [])
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const { data, error } = await supabase.auth.getUser()
      setUser(data.user ?? null)
      if (error) {
        console.error(error)
      }
      setLoading(false)
    }

    init()

    const { data: { subscription } } =
      supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null)
      })

    return () => subscription.unsubscribe()
  }, [supabase])

  return (
    <UserContext.Provider value={{ user, loading }}>
      {children}
    </UserContext.Provider>
  )
}
