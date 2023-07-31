import { StateCreator } from 'zustand'
import { ToastData } from '@/types'

export interface ToastsSlice {
  toasts: ToastData[]
  addToast: (newToast: ToastData) => void
  removeToast: (toastIndex: number) => void
}

export const manageToastsSlice: StateCreator<ToastsSlice> = (set, get) => ({
  toasts: [],
  addToast: (newToast: ToastData) =>
    set((state) => ({ toasts: [...state.toasts, newToast] })),
  removeToast: (toastIndex: number) =>
    set((state) => ({
      toasts: state.toasts.filter((_, index: number) => index !== toastIndex),
    })),
})
