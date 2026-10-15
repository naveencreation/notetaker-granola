import React, { createContext, useContext, useMemo, useState } from "react"
import {
  IGranolaService,
  MockGranolaService,
  RealElectronGranolaService,
} from "./granolaService"

type BackendMode = "mock" | "real"

interface ServiceContextValue {
  service: IGranolaService
  backendMode: BackendMode
  toggleBackendMode: () => void
}

const ServiceContext = createContext<ServiceContextValue | null>(null)

export function ServiceProvider({ children }: { children: React.ReactNode }) {
  const [backendMode, setBackendMode] = useState<BackendMode>("mock")

  const mockService = useMemo(() => new MockGranolaService(), [])
  const realService = useMemo(() => new RealElectronGranolaService(), [])

  const value = useMemo<ServiceContextValue>(
    () => ({
      service: backendMode === "mock" ? mockService : realService,
      backendMode,
      toggleBackendMode: () =>
        setBackendMode((prev) => (prev === "mock" ? "real" : "mock")),
    }),
    [backendMode, mockService, realService]
  )

  return (
    <ServiceContext.Provider value={value}>{children}</ServiceContext.Provider>
  )
}

export function useGranolaService() {
  const context = useContext(ServiceContext)
  if (!context) {
    throw new Error("useGranolaService must be used inside a ServiceProvider")
  }
  return context
}
