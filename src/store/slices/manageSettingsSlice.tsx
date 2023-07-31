import { COLLECTION_DARK_THEME, COLLECTION_LOCALE } from '@/constants'
import { StateCreator } from 'zustand'

interface Settings {
  locale: string
  isDarkTheme: boolean
}

export interface SettingsSlice {
  settings: Settings
  updateSettings: (
    setting: keyof Settings,
    newValue: Settings[keyof Settings]
  ) => void
}

const getCollectionName = (setting: keyof Settings) => {
  const collectionMapper = {
    locale: COLLECTION_LOCALE,
    isDarkTheme: COLLECTION_DARK_THEME,
  }

  return collectionMapper[setting]
}

export const manageSettings: StateCreator<SettingsSlice> = (set, get) => ({
  settings: {
    locale: '',
    isDarkTheme:
      typeof window !== 'undefined'
        ? JSON.parse(
            localStorage.getItem(`${COLLECTION_DARK_THEME}`) || 'false'
          )
        : false,
  },
  updateSettings: (
    setting: keyof Settings,
    newValue: Settings[keyof Settings]
  ) =>
    set((state) => {
      localStorage.setItem(getCollectionName(setting), JSON.stringify(newValue))
      return { settings: { ...state.settings, [setting]: newValue } }
    }),
})
