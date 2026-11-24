// ---------------------------------------------------------------------------
// Zustand Store with Zundo undo/redo middleware
// Single source of truth for the Project state and UI shell states.
// ---------------------------------------------------------------------------

import type { StoreApi } from 'zustand'
import { create } from 'zustand'
import type { TemporalState } from 'zundo'
import { temporal } from 'zundo'
import type {
  ColorStop,
  GradientConfigUpdate,
  GradientType,
  Project,
} from './types'
import { hasStops } from './types'
import { createDefaultProject, defaultGradientConfig } from './defaults'
import { projectSchema } from './schema'
import { randomizeProject } from './randomize'
import { generateId } from '@/lib/utils'

export interface AppStore {
  // --- Project State ---
  project: Project

  // --- Project Actions ---
  setType: (type: GradientType) => void
  updateGradient: (update: GradientConfigUpdate) => void
  addStop: (color?: string, position?: number) => void
  removeStop: (id: string) => void
  moveStop: (id: string, position: number) => void
  updateStopColor: (id: string, color: string) => void
  updateGlobal: (update: Partial<Project['global']>) => void
  updateCanvas: (update: Partial<Project['canvas']>) => void
  updateNoise: (update: Partial<Project['effects']['noise']>) => void
  reset: () => void
  randomize: () => void
  loadProject: (data: unknown) => { success: boolean; error?: string }

  // --- History (Zundo helpers) ---
  undo: () => void
  redo: () => void
  canUndo: () => boolean
  canRedo: () => boolean

  // --- UI Shell State (not tracked in undo history) ---
  theme: 'light' | 'dark'
  toggleTheme: () => void
  setTheme: (theme: 'light' | 'dark') => void
  activePanel: string | null
  setActivePanel: (panel: string | null) => void
  exportPanelOpen: boolean
  setExportPanelOpen: (open: boolean) => void
  mobileDrawerOpen: boolean
  setMobileDrawerOpen: (open: boolean) => void
}

type StoreWithTemporal = StoreApi<AppStore> & {
  temporal: StoreApi<TemporalState<{ project: Project }>>
}

export const useStore = create<
  AppStore,
  [['temporal', StoreApi<TemporalState<{ project: Project }>>]]
>(
  temporal(
    (set, get) => ({
      // Initial project state
      project: createDefaultProject(),

      // Set gradient type and apply appropriate default configuration
      setType: (type: GradientType) => {
        set((state) => {
          if (state.project.gradient.type === type) return state
          return {
            project: {
              ...state.project,
              gradient: defaultGradientConfig(type),
            },
          }
        })
      },

      // Update specific gradient properties
      updateGradient: (update: GradientConfigUpdate) => {
        set((state) => ({
          project: {
            ...state.project,
            gradient: {
              ...state.project.gradient,
              ...update,
            },
          },
        }))
      },

      // Add stop to gradient if supported
      addStop: (color = '#ffffff', position) => {
        set((state) => {
          const { gradient } = state.project
          if (!hasStops(gradient)) return state

          const currentStops = gradient.stops
          const calculatedPos =
            currentStops.length > 0
              ? Math.min(
                  100,
                  Math.round(
                    (currentStops[currentStops.length - 1].position +
                      (currentStops[currentStops.length - 2]?.position ?? 0)) /
                      2,
                  ),
                )
              : 50
          const nextPos = position ?? calculatedPos

          const newStop: ColorStop = {
            id: generateId(),
            color,
            position: nextPos,
            opacity: 1,
          }

          const stops = [...currentStops, newStop].sort(
            (a, b) => a.position - b.position,
          )

          return {
            project: {
              ...state.project,
              gradient: {
                ...gradient,
                stops,
              },
            },
          }
        })
      },

      // Remove stop by id
      removeStop: (id: string) => {
        set((state) => {
          const { gradient } = state.project
          if (!hasStops(gradient) || gradient.stops.length <= 2) return state

          return {
            project: {
              ...state.project,
              gradient: {
                ...gradient,
                stops: gradient.stops.filter((s) => s.id !== id),
              },
            },
          }
        })
      },

      // Move stop position
      moveStop: (id: string, position: number) => {
        set((state) => {
          const { gradient } = state.project
          if (!hasStops(gradient)) return state

          const clampedPos = Math.max(0, Math.min(100, position))
          const stops = gradient.stops
            .map((s) => (s.id === id ? { ...s, position: clampedPos } : s))
            .sort((a, b) => a.position - b.position)

          return {
            project: {
              ...state.project,
              gradient: {
                ...gradient,
                stops,
              },
            },
          }
        })
      },

      // Update color for a specific stop
      updateStopColor: (id: string, color: string) => {
        set((state) => {
          const { gradient } = state.project
          if (!hasStops(gradient)) return state

          return {
            project: {
              ...state.project,
              gradient: {
                ...gradient,
                stops: gradient.stops.map((s) =>
                  s.id === id ? { ...s, color } : s,
                ),
              },
            },
          }
        })
      },

      // Update global configuration
      updateGlobal: (update: Partial<Project['global']>) => {
        set((state) => ({
          project: {
            ...state.project,
            global: {
              ...state.project.global,
              ...update,
            },
          },
        }))
      },

      // Update canvas configuration
      updateCanvas: (update: Partial<Project['canvas']>) => {
        set((state) => ({
          project: {
            ...state.project,
            canvas: {
              ...state.project.canvas,
              ...update,
            },
          },
        }))
      },

      // Update noise effect configuration
      updateNoise: (update: Partial<Project['effects']['noise']>) => {
        set((state) => ({
          project: {
            ...state.project,
            effects: {
              ...state.project.effects,
              noise: {
                ...state.project.effects.noise,
                ...update,
              },
            },
          },
        }))
      },

      // Reset project to default
      reset: () => {
        set({ project: createDefaultProject() })
      },

      // Randomize project palette and type
      randomize: () => {
        set({ project: randomizeProject() })
      },

      // Load project with Zod validation
      loadProject: (data: unknown) => {
        const result = projectSchema.safeParse(data)
        if (!result.success) {
          const issueMsg = result.error.issues
            .map((i) => `${i.path.join('.')}: ${i.message}`)
            .join('; ')
          return { success: false, error: issueMsg }
        }
        set({ project: result.data })
        return { success: true }
      },

      // History placeholders replaced below
      undo: () => {
        // no-op initial placeholder
      },
      redo: () => {
        // no-op initial placeholder
      },
      canUndo: () => false,
      canRedo: () => false,

      // UI Shell State
      theme: 'dark',
      toggleTheme: () => {
        const nextTheme = get().theme === 'dark' ? 'light' : 'dark'
        if (typeof document !== 'undefined') {
          if (nextTheme === 'dark') {
            document.documentElement.classList.add('dark')
          } else {
            document.documentElement.classList.remove('dark')
          }
        }
        set({ theme: nextTheme })
      },
      setTheme: (theme: 'light' | 'dark') => {
        if (typeof document !== 'undefined') {
          if (theme === 'dark') {
            document.documentElement.classList.add('dark')
          } else {
            document.documentElement.classList.remove('dark')
          }
        }
        set({ theme })
      },
      activePanel: 'colors',
      setActivePanel: (activePanel) => {
        set({ activePanel })
      },
      exportPanelOpen: false,
      setExportPanelOpen: (exportPanelOpen) => {
        set({ exportPanelOpen })
      },
      mobileDrawerOpen: false,
      setMobileDrawerOpen: (mobileDrawerOpen) => {
        set({ mobileDrawerOpen })
      },
    }),
    {
      // Only track project in undo/redo history (ignore UI state changes)
      partialize: (state) => ({ project: state.project }),
      limit: 50,
    },
  ),
)

// Attach typed temporal methods after store creation
const temporalApi = (useStore as unknown as StoreWithTemporal).temporal

useStore.setState({
  undo: () => {
    temporalApi.getState().undo()
  },
  redo: () => {
    temporalApi.getState().redo()
  },
  canUndo: () => temporalApi.getState().pastStates.length > 0,
  canRedo: () => temporalApi.getState().futureStates.length > 0,
})
