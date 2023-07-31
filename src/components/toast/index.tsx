import React, {
  CSSProperties,
  HTMLAttributes,
  useCallback,
  useEffect,
  useState,
} from 'react'
import { useTranslation } from 'next-i18next'
import { DEFAULT_AUTODISMISS_TIME } from '@/constants'
import { ToastType } from '@/types'
import styles from './styles.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCircleCheck,
  faCircleExclamation,
  faCircleInfo,
  faCircleXmark,
} from '@fortawesome/free-solid-svg-icons'

const TOAST_ICONS = {
  [ToastType.ALERT]: faCircleXmark,
  [ToastType.INFO]: faCircleInfo,
  [ToastType.SUCCESS]: faCircleCheck,
  [ToastType.WARNING]: faCircleExclamation,
}

const TOAST_CLASS_COLOR = {
  [ToastType.ALERT]: 'text-red-800',
  [ToastType.INFO]: 'text-text',
  [ToastType.SUCCESS]: 'text-green-600',
  [ToastType.WARNING]: 'text-text',
}

export interface ToastProps extends HTMLAttributes<HTMLDivElement> {
  style?: CSSProperties
  message: string
  type?: ToastType
  autoDismissable?: boolean
  timeToAutoDismiss?: number
  additionalClass?: string
  onToastDismiss: () => void
}

export const Toast = ({
  message,
  type = ToastType.INFO,
  autoDismissable = true,
  timeToAutoDismiss = DEFAULT_AUTODISMISS_TIME,
  additionalClass = '',
  onToastDismiss,
  ...props
}: ToastProps) => {
  const { t } = useTranslation(['common'])
  const [isDismissing, setIsDismissing] = useState(false)

  const closeToast = useCallback(() => {
    setIsDismissing(true)
  }, [])

  const onDismissToastSuccess = () => {
    onToastDismiss()
    setIsDismissing(false)
  }

  const handleAnimationEnd = () => {
    if (isDismissing) {
      onDismissToastSuccess()
    }
  }

  useEffect(() => {
    if (!autoDismissable) {
      return
    }
    const timerId = setTimeout(closeToast, timeToAutoDismiss)

    return () => clearTimeout(timerId)
  }, [autoDismissable, timeToAutoDismiss, closeToast])

  return (
    <div
      className={`${styles.toast} ${additionalClass} ${
        isDismissing ? styles['toast--dismissing'] : ''
      }`}
      onAnimationEnd={handleAnimationEnd}
      {...props}
    >
      <button
        className={`${styles['toast__close-button']}`}
        aria-label={t('toastDismiss') as string}
        title={t('toastDismiss') as string}
        onClick={closeToast}
      >
        <span aria-hidden={true}>✖</span>
      </button>
      <div className={styles['toast__content']}>
        <FontAwesomeIcon
          icon={TOAST_ICONS[type]}
          size='2xl'
          className={TOAST_CLASS_COLOR[type]}
        />
        <p className={styles['toast__message']}>{t(message)}</p>
      </div>
    </div>
  )
}
