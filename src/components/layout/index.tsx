import { TOAST_OFFSET } from '@/constants'
import { useStore } from '@/store'
import { ToastData } from '@/types'
import { Header } from '../header'
import { Toast } from '../toast'
import styles from './styles.module.css'

interface LayoutProps {
  children: React.ReactNode
}

export const Layout = ({ children }: LayoutProps) => {
  const toasts = useStore((state) => state.toasts)
  const removeToast = useStore((state) => state.removeToast)

  return (
    <>
      {!!toasts.length &&
        toasts.map(({ message, type }: ToastData, index: number) => (
          <Toast
            key={message}
            message={message}
            style={{ top: `${TOAST_OFFSET * index + 2}rem` }}
            type={type}
            onToastDismiss={() => removeToast(index)}
            autoDismissable={true}
          />
        ))}
      <Header />
      <main className={styles.main}>{children}</main>
    </>
  )
}
