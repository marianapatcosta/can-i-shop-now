import { create } from 'zustand'
import { manageToastsSlice, ToastsSlice } from './slices/manageToastsSlice'
import { manageSettings, SettingsSlice } from './slices/manageSettingsSlice'

type StoreState = ToastsSlice & SettingsSlice

export const useStore = create<StoreState>()((...args) => ({
  ...manageToastsSlice(...args),
  ...manageSettings(...args),
}))
