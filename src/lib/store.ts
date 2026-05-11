import { create } from "zustand"

interface Settings {
  siteName: string
  authorName: string
  authorBio: string
  darkMode: boolean
}

interface SettingsStore {
  settings: Settings
  setSettings: (settings: Settings) => void
  toggleDarkMode: () => void
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  settings: {
    siteName: "متجر الروايات",
    authorName: "الكاتب",
    authorBio: "كاتب روايات عربي",
    darkMode: false,
  },
  setSettings: (settings) => set({ settings }),
  toggleDarkMode: () =>
    set((state) => ({
      settings: { ...state.settings, darkMode: !state.settings.darkMode },
    })),
}))
