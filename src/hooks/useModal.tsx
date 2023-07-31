import { useCallback, useState } from 'react'
import { useTranslation } from 'next-i18next'
import { useMutation } from 'react-query'
import axios, { AxiosError, AxiosResponse } from 'axios'
import { ConfirmationModal, EditProductModal } from '@/components'
import { ModalType, ProductUserInfo, ToastType } from '@/types'
import { useStore } from '@/store'
import { getErrorTranslationKey } from '@/utils'

type ProductMinimal = { id: string; name: string; sizesToWatch: string }

interface useModalReturnValue {
  onDeleteProduct: (product: ProductMinimal) => void
  onEditProduct: (product: ProductMinimal) => void
  Modal: React.FC
}

export const useModal = (
  onUpdateSuccess?: (product: ProductUserInfo) => void,
  onDeleteSuccess?: () => void
): useModalReturnValue => {
  const { t } = useTranslation(['common'])
  const addToast = useStore((state) => state.addToast)
  const [isModalClosing, setIsModalClosing] = useState(false)
  const [modalType, setModalType] = useState<ModalType | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<ProductMinimal | null>(
    null
  )

  const { mutate: updateProduct, isLoading: isUpdatingProduct } = useMutation({
    mutationFn: (sizesToWatch: string) => {
      return axios.patch(`/api/product/${selectedProduct?.id}`, {
        sizesToWatch,
      })
    },
    onError: (error, variables, context) => {
      const translation = getErrorTranslationKey(
        ((error as AxiosError)?.response as AxiosResponse).data.message
      )
      addToast({
        type: ToastType.ALERT,
        message: t(translation.key, { ...translation.variables }),
      })
    },
    onSuccess: (data, variables, context) => {
      addToast({
        type: ToastType.SUCCESS,
        message: t('productUpdateSuccess'),
      })
      !!onUpdateSuccess && onUpdateSuccess(data?.data.product)
      closeModal()
    },
  })

  const { mutate: deleteProduct, isLoading: isDeletingProduct } = useMutation({
    mutationFn: () => {
      return axios.delete(`/api/product/${selectedProduct?.id}`)
    },
    onError: (error, variables, context) => {
      addToast({ type: ToastType.ALERT, message: t('productDeletedError') })
    },
    onSuccess: (data, variables, context) => {
      addToast({ type: ToastType.SUCCESS, message: t('productDeletedSuccess') })
      closeModal()
      !!onDeleteSuccess && onDeleteSuccess()
    },
  })

  const onEditProduct = useCallback((product: ProductMinimal) => {
    setSelectedProduct(product)
    setModalType(ModalType.EDIT)
  }, [])

  const onDeleteProduct = useCallback((product: ProductMinimal) => {
    setSelectedProduct(product)
    setModalType(ModalType.CONFIRMATION)
  }, [])

  const closeModal = useCallback(() => {
    setIsModalClosing(true)
  }, [])

  const onCloseModalSuccess = useCallback(() => {
    setSelectedProduct(null)
    setModalType(null)
    setIsModalClosing(false)
  }, [])

  const saveEditedProduct = async (updatedSizesToWatch: string) => {
    setSelectedProduct((prevProduct) => ({
      ...prevProduct!,
      sizesToWatch: updatedSizesToWatch,
    }))
    updateProduct(updatedSizesToWatch)
  }

  const onConfirmDeleteProduct = async () => {
    if (!selectedProduct) return
    deleteProduct()
  }

  const Modal = () => {
    if (modalType === ModalType.EDIT) {
      return (
        <EditProductModal
          subtitle={selectedProduct?.name || ''}
          initialSizesToWatch={selectedProduct?.sizesToWatch || ''}
          isModalClosing={isModalClosing}
          loading={isUpdatingProduct}
          onEditSizesToWatch={saveEditedProduct}
          onCloseModal={closeModal}
          onCloseModalSuccess={onCloseModalSuccess}
        />
      )
    }

    if (modalType === ModalType.CONFIRMATION) {
      return (
        <ConfirmationModal
          title={t('deleteProduct') as string}
          question={t('areYouSure', { name: selectedProduct?.name }) as string}
          isModalClosing={isModalClosing}
          loading={isDeletingProduct}
          onConfirm={onConfirmDeleteProduct}
          onCloseModal={closeModal}
          onCloseModalSuccess={onCloseModalSuccess}
        />
      )
    }

    return null
  }

  return { onDeleteProduct, onEditProduct, Modal }
}
