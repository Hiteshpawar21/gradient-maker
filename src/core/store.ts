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
import {
  addStopAt,
  removeStopById,
  moveStopTo,
  updateStopColor as updateStopColorPure,
  updateStopOpacity as updateStopOpacityPure,
  distributeStopsEqually,
  reverseStops as reverseStopsPure,
} from '@/color/stops'

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
  updateStopOpacity: (id: string, opacity: number) => void
  updateStop: (id: string, partial: Partial<ColorStop>) => void
  distributeStops: () => void
  reverseStops: () => void
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
  selectedStopId: string | null
  setSelectedStopId: (id: string | null) => void
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
          const newGrad = defaultGradientConfig(type)
          const firstStopId = hasStops(newGrad) && newGrad.stops.length > 0 ? newGrad.stops[0].id : null
          const enableNoise = type === 'grainy' ? true : state.project.effects.noise.enabled
          return {
            selectedStopId: firstStopId,
            project: {
              ...state.project,
              gradient: newGrad,
              effects: {
                ...state.project.effects,
                noise: {
                  ...state.project.effects.noise,
                  enabled: enableNoise,
                },
              },
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
      addStop: (color, position) => {
        set((state) => {
          const { gradient } = state.project
          if (!hasStops(gradient)) return state

          const stops = addStopAt(gradient.stops, position, color)
          const addedStop = stops.find((s) => !gradient.stops.some((prev) => prev.id === s.id))

          return {
            selectedStopId: addedStop ? addedStop.id : state.selectedStopId,
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

          const stops = removeStopById(gradient.stops, id)
          const remainingId = stops.length > 0 ? stops[0].id : null

          return {
            selectedStopId: state.selectedStopId === id ? remainingId : state.selectedStopId,
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

      // Move stop position
      moveStop: (id: string, position: number) => {
        set((state) => {
          const { gradient } = state.project
          if (!hasStops(gradient)) return state

          const stops = moveStopTo(gradient.stops, id, position)

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

          const stops = updateStopColorPure(gradient.stops, id, color)

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

      // Update opacity for a specific stop
      updateStopOpacity: (id: string, opacity: number) => {
        set((state) => {
          const { gradient } = state.project
          if (!hasStops(gradient)) return state

          const stops = updateStopOpacityPure(gradient.stops, id, opacity)

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

      // Update multiple stop attributes
      updateStop: (id: string, partial: Partial<ColorStop>) => {
        set((state) => {
          const { gradient } = state.project
          if (!hasStops(gradient)) return state

          let stops = gradient.stops.map((s) => (s.id === id ? { ...s, ...partial } : s))
          if (partial.position !== undefined) {
            stops = stops.sort((a, b) => a.position - b.position)
          }

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

      // Distribute stops evenly
      distributeStops: () => {
        set((state) => {
          const { gradient } = state.project
          if (!hasStops(gradient)) return state

          return {
            project: {
              ...state.project,
              gradient: {
                ...gradient,
                stops: distributeStopsEqually(gradient.stops),
              },
            },
          }
        })
      },

      // Reverse stop colors and opacities
      reverseStops: () => {
        set((state) => {
          const { gradient } = state.project
          if (!hasStops(gradient)) return state

          return {
            project: {
              ...state.project,
              gradient: {
                ...gradient,
                stops: reverseStopsPure(gradient.stops),
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
        const defaultProj = createDefaultProject()
        const firstStopId = hasStops(defaultProj.gradient) && defaultProj.gradient.stops.length > 0
          ? defaultProj.gradient.stops[0].id
          : null
        set({ project: defaultProj, selectedStopId: firstStopId })
      },

      // Randomize project palette and type
      randomize: () => {
        const randomProj = randomizeProject()
        const firstStopId = hasStops(randomProj.gradient) && randomProj.gradient.stops.length > 0
          ? randomProj.gradient.stops[0].id
          : null
        set({ project: randomProj, selectedStopId: firstStopId })
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
        const firstStopId = hasStops(result.data.gradient) && result.data.gradient.stops.length > 0
          ? result.data.gradient.stops[0].id
          : null
        set({ project: result.data, selectedStopId: firstStopId })
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
      selectedStopId: 'stop-0',
      setSelectedStopId: (selectedStopId) => {
        set({ selectedStopId })
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
