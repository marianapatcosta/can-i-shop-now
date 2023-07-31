import { useCallback } from 'react'
import { useTranslation } from 'next-i18next'
import { Button, Modal } from '@/components'
import styles from './styles.module.css'

interface ConfirmationModalProps {
  title?: string
  isModalClosing: boolean
  question?: string
  loading?: boolean
  onConfirm: () => void
  onCloseModal: () => void
  onCloseModalSuccess: () => void
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  title,
  question = 'Are you sure?',
  isModalClosing,
  loading = false,
  onConfirm,
  onCloseModal,
  onCloseModalSuccess,
}) => {
  const { t } = useTranslation(['common'])

  const confirm = useCallback(() => {
    onConfirm()
  }, [onConfirm])

  return (
    <Modal
      additionalClass={styles['confirmation-modal']}
      header={!!title && <h1>{title}</h1>}
      isModalClosing={isModalClosing}
      footer={
        <div className={styles['confirmation-modal__footer']}>
          <Button
            label={t('cancel') as string}
            title={t('cancel') as string}
            buttonType='secondary'
            onClick={onCloseModal}
          />
          <Button
            label={t('confirm') as string}
            title={t('confirm') as string}
            loading={loading}
            onClick={confirm}
          />
        </div>
      }
      onCloseModal={onCloseModal}
      onCloseModalSuccess={onCloseModalSuccess}
    >
      <div className={styles['confirmation-modal__main']}>
        <p className='whitespace-pre-line'>{question}</p>
      </div>
    </Modal>
  )
}

export { ConfirmationModal }
