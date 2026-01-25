/**
 * @file registration-context.tsx
 * @description Context para gerenciar estado global de registro no leaderboard
 */

'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { checkLeaderboardRegistration, registerLeaderboardViaUserOperation } from '@/lib/leaderboard-registration'

interface RegistrationContextType {
  isRegistered: boolean | null
  isChecking: boolean
  isRegistering: boolean
  registrationHash: string | null
  error: string | null
  checkRegistration: (address: string) => Promise<void>
  registerViaUserOperation: (address: string) => Promise<string>
  clearRegistration: () => void
}

const RegistrationContext = createContext<RegistrationContextType | undefined>(undefined)

export function RegistrationProvider({ children }: { children: ReactNode }) {
  const [isRegistered, setIsRegistered] = useState<boolean | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  const [registrationHash, setRegistrationHash] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const checkRegistration = async (address: string) => {
    if (!address) {
      setIsRegistered(null)
      return
    }

    setIsChecking(true)
    setError(null)

    try {
      const registered = await checkLeaderboardRegistration(address)
      setIsRegistered(registered)
    } catch (err: any) {
      console.error('Error checking registration:', err)
      setError(err.message || 'Failed to check registration')
      setIsRegistered(false)
    } finally {
      setIsChecking(false)
    }
  }

  const registerViaUserOperation = async (address: string): Promise<string> => {
    setIsRegistering(true)
    setError(null)

    try {
      const userOpHash = await registerLeaderboardViaUserOperation(
        address as `0x${string}`,
        address as `0x${string}`
      )
      
      setRegistrationHash(userOpHash)
      
      // Aguardar e verificar registro
      await new Promise(resolve => setTimeout(resolve, 5000))
      const registered = await checkLeaderboardRegistration(address)
      setIsRegistered(registered)
      
      return userOpHash
    } catch (err: any) {
      setError(err.message || 'Failed to register via UserOperation')
      throw err
    } finally {
      setIsRegistering(false)
    }
  }

  const clearRegistration = () => {
    setIsRegistered(null)
    setIsRegistering(false)
    setRegistrationHash(null)
    setError(null)
  }

  return (
    <RegistrationContext.Provider
      value={{
        isRegistered,
        isChecking,
        isRegistering,
        registrationHash,
        error,
        checkRegistration,
        registerViaUserOperation,
        clearRegistration,
      }}
    >
      {children}
    </RegistrationContext.Provider>
  )
}

export function useRegistration() {
  const context = useContext(RegistrationContext)
  if (context === undefined) {
    throw new Error('useRegistration must be used within a RegistrationProvider')
  }
  return context
}
