import { FormEvent, memo, useEffect, useState } from 'react'
import { useTranslation } from 'next-i18next'
import { faSave } from '@fortawesome/free-solid-svg-icons'
import { Button, Input, Modal } from '@/components'
import styles from './styles.module.css'

interface EditProductModalProps {
  subtitle: string
  initialSizesToWatch: string
  onEditSizesToWatch: (sizesToWatch: string) => void
  isModalClosing: boolean
  loading?: boolean
  onCloseModal: () => void
  onCloseModalSuccess: () => void
}

export const EditProductModal: React.FC<EditProductModalProps> = memo(
  ({
    subtitle,
    initialSizesToWatch,
    onEditSizesToWatch,
    isModalClosing,
    loading = false,
    onCloseModal,
    onCloseModalSuccess,
  }) => {
    const { t } = useTranslation(['common'])

    const [sizesToWatch, setSizesToWatch] = useState(initialSizesToWatch || '')

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      if (!sizesToWatch) {
        return
      }

      onEditSizesToWatch(sizesToWatch)
    }

    return (
      <Modal
        header={<h1>{t('editProduct')}</h1>}
        additionalClass={styles['edit-product-modal']}
        isModalClosing={isModalClosing}
        onCloseModal={onCloseModal}
        onCloseModalSuccess={onCloseModalSuccess}
      >
        <>
          <p className='mt-8'>{subtitle}</p>
          <form onSubmit={handleSubmit}>
            <Input
              required
              autoComplete='off'
              label={t('sizesToWatch') as string}
              placeholder={t('enterSizesToWatch') as string}
              title={t('enterSizesToWatch') as string}
              value={sizesToWatch}
              pattern='^[A-Za-z0-9,]*$'
              onChange={(event) =>
                setSizesToWatch(
                  (event.target as HTMLInputElement).value.toUpperCase()
                )
              }
            />
            <Button
              disabled={!sizesToWatch}
              label={t('save') as string}
              type='submit'
              icon={faSave}
              loading={loading}
            />
          </form>
        </>
      </Modal>
    )
  }
)

EditProductModal.displayName = 'EditProductModal'
