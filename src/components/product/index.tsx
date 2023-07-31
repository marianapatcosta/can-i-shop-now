import { useMemo, MouseEvent } from 'react'
import { useTranslation } from 'next-i18next'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBinoculars,
  faCircleCheck,
  faPencil,
  faShoppingCart,
  faTriangleExclamation,
  faTrash,
} from '@fortawesome/free-solid-svg-icons'
import { ProductUserInfo } from '@/types'
import { getFormattedProduct, pascalCaseToSentenceCase } from '@/utils'
import { Button } from '../button'
import styles from './styles.module.css'

interface ProductProps extends ProductUserInfo {
  onDeleteProduct: () => void
  onEditProduct: () => void
}

export const Product = ({
  id,
  productId,
  url,
  name,
  store,
  photoUrl,
  currentPrice,
  originalPrice,
  currency,
  availableSizes,
  allSizes,
  sizesToWatch,
  onEditProduct,
  onDeleteProduct,
}: ProductProps) => {
  const { t } = useTranslation(['products'])
  const router = useRouter()

  const {
    sizesToWatchArray,
    formattedCurrentPrice,
    formattedOriginalPrice,
    sizes,
    displaySize,
  } = useMemo(
    () =>
      getFormattedProduct(
        availableSizes,
        allSizes,
        sizesToWatch,
        currentPrice,
        originalPrice,
        currency,
        router.locale || 'en-EN'
      ),
    [
      availableSizes,
      allSizes,
      sizesToWatch,
      currentPrice,
      originalPrice,
      currency,
      router.locale,
    ]
  )

  const deleteProduct = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    onDeleteProduct()
  }

  const editProduct = (event: MouseEvent<HTMLButtonElement>) => {
    console.log(1111)
    event.preventDefault()
    onEditProduct()
  }

  const goToShop = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    window.open(url, '_blank', 'nofollow noopener noreferrer')
  }

  return (
    <li className='relative'>
      <Link
        href={{
          pathname: '/product/[productId]',
          query: { productId: id },
        }}
      >
        <div
          className={`${styles.product} ${
            !availableSizes.length ? styles['product--not-available'] : ''
          }`}
          data-text={!availableSizes.length ? t('unavailable') : ''}
        >
          <div className={styles.image}>
            <Image src={photoUrl} alt={name} fill />
          </div>
          <div className='flex flex-col w-full'>
            <h2 className={styles.name}>{name}</h2>
            <p className={styles.store}>{pascalCaseToSentenceCase(store)}</p>
            <div className={styles['product-content']}>
              <div className='flex flex-col justify-center'>
                <p
                  className={`${styles['current-price']} ${
                    !!originalPrice ? styles['current-price--highlighted'] : ''
                  }`}
                >
                  <data className='money' value={currentPrice}>
                    {formattedCurrentPrice}
                  </data>
                </p>
                {!!originalPrice && (
                  <p className={styles['original-price']}>
                    <data className='money' value={originalPrice}>
                      {formattedOriginalPrice}
                    </data>
                  </p>
                )}
              </div>
              <div>
                {!sizes.length ? (
                  <p>
                    <FontAwesomeIcon
                      icon={faTriangleExclamation}
                      className='text-highlight mr-1'
                    />
                    {t('productNotAvailable')}
                  </p>
                ) : (
                  <div className='mb-2'>
                    <p className='flex items-center'>
                      {t('availableSizes')}
                      <FontAwesomeIcon
                        icon={faCircleCheck}
                        size='sm'
                        className='text-green-600 ml-2'
                      />
                    </p>
                    <ul className={styles.sizes}>
                      {sizes.map(({ size, isAvailable }) => (
                        <li
                          key={`${productId}-size-${size}`}
                          className={`${styles.size} ${
                            !isAvailable ? styles['size-not-available'] : ''
                          }`}
                        >
                          {t(displaySize(size))}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className='mb-2 flex gap-3'>
                  <div>
                    <p className='flex items-center'>
                      {t('sizesToWatch')}
                      <FontAwesomeIcon
                        icon={faBinoculars}
                        size='sm'
                        className='text-highlight ml-2'
                      />
                    </p>
                    <ul className={styles.sizes}>
                      {sizesToWatchArray.map((size) => (
                        <li
                          key={`${productId}-watch-size-${size}`}
                          className={styles.size}
                        >
                          {t(displaySize(size))}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Button
                    buttonType='action'
                    icon={faPencil}
                    iconSize='sm'
                    additionalClass={`${styles['edit-button']}`}
                    onClick={editProduct}
                  />
                </div>
              </div>
            </div>
            <button className={styles.link} onClick={goToShop}>
              {t('goToShop')}
              <FontAwesomeIcon
                size='sm'
                icon={faShoppingCart}
                className='text-highlight ml-2'
              />
            </button>
          </div>
        </div>

        <Button
          buttonType='action'
          icon={faTrash}
          iconSize='sm'
          additionalClass={`${styles['close-button']}`}
          onClick={deleteProduct}
        />
      </Link>
    </li>
  )
}
