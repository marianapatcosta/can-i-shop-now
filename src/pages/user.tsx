import React, {
  ChangeEvent,
  FormEvent,
  useCallback,
  useMemo,
  useState,
} from 'react'
import { GetServerSidePropsContext } from 'next'
import Head from 'next/head'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { signOut } from 'next-auth/react'
import { getServerSession } from 'next-auth/next'
import { faClose, faPencil, faSave } from '@fortawesome/free-solid-svg-icons'
import axios from 'axios'
import { useMutation } from 'react-query'
import { authOptions } from './api/auth/[...nextauth]'
import {
  Avatar,
  Button,
  ConfirmationModal,
  Input,
  Select,
  Switcher,
} from '@/components'
import { useStore } from '@/store'
import { MySession, ToastType } from '@/types'
import styles from '@/styles/user.module.css'

const locales = [
  { label: 'english', value: 'en-EN' },
  { label: 'portuguese', value: 'pt-PT' },
]

export default function User({ session }: { session: MySession }) {
  const router = useRouter()
  const { t } = useTranslation(['user', 'common'])
  const addToast = useStore((state) => state.addToast)

  const { mutate: updateUser, isLoading: isSavingUser } = useMutation({
    mutationFn: (userData: { zipCode: string; city: string }) => {
      return axios.patch(`/api/user/${session.user.id}`, userData)
    },
    onError: (error, variables, context) => {
      addToast({ type: ToastType.ALERT, message: t('generalError') })
    },
    onSuccess: (data, variables, context) => {
      setIsEditing(false)
      addToast({ type: ToastType.SUCCESS, message: t('userUpdateSuccess') })
    },
  })

  const { mutate: deleteUser, isLoading: isDeletingUser } = useMutation({
    mutationFn: () => {
      return axios.delete(`/api/user/${session.user.id}`)
    },
    onError: (error, variables, context) => {
      addToast({ type: ToastType.ALERT, message: 'generalError' })
    },
    onSuccess: (data, variables, context) => {
      signOut()
      addToast({
        type: ToastType.SUCCESS,
        message: 'deleteAccountSuccess',
      })
    },
  })

  const localeOptions = useMemo(
    () =>
      locales.map((locale) => ({
        label: (
          <Link
            href={router.pathname}
            locale={locale.value}
            className='w-full h-full px-2 py-1 block'
          >
            {t(locale.label)}
          </Link>
        ),
        value: locale.value,
      })),
    [t, router.pathname]
  )

  const [isEditing, setIsEditing] = useState(false)
  const [zipCode, setZipCode] = useState<string>(session?.user.zipCode || '')
  const [city, setCity] = useState<string>(session?.user.city || '')
  const [showModal, setShowModal] = useState<boolean>(false)
  const [isModalClosing, setIsModalClosing] = useState<boolean>(false)

  const settings = useStore((state) => state.settings)

  const updateSettings = useStore((state) => state.updateSettings)

  const selectedLocale = useMemo(
    () => localeOptions.find(({ value }) => value === router.locale),
    [router.locale, localeOptions]
  )

  const updateFormField = useCallback(
    (value: string, setter: React.Dispatch<React.SetStateAction<string>>) => {
      setter(value)
    },
    []
  )

  const handleToggleTheme = (event: ChangeEvent<HTMLInputElement>) => {
    toggleTheme(event.target.checked)
  }

  const handleLocaleChange = useCallback(
    (option: { label: JSX.Element; value: string }) => {
      router.locale = option.value
      updateSettings('locale', option.value)
    },
    [router, updateSettings]
  )

  const toggleTheme = useCallback(
    (isDarkTheme: boolean) => {
      updateSettings('isDarkTheme', isDarkTheme)
      const classAction = isDarkTheme ? 'add' : 'remove'
      document.documentElement.classList[classAction]('dark')
    },
    [updateSettings]
  )

  const saveUserData = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (zipCode === session.user.zipCode && city === session.user.city) {
      setIsEditing(false)
      return
    }

    updateUser({ zipCode, city })
  }

  const deleteAccount = async () => {
    deleteUser()
  }

  const cancelEdit = () => {
    setIsEditing(false)
    setZipCode(session.user.zipCode || '')
    setCity(session.user.city || '')
  }

  const onCloseModalSuccess = useCallback(() => {
    setShowModal(false)
    setIsModalClosing(false)
  }, [])

  if (!session?.user) return null

  return (
    <>
      <Head>
        <title>{t('settings')}</title>
      </Head>
      <>
        <h1>{t('profile')}</h1>
        <div className={styles.user}>
          <div className={styles['user__header']}>
            <Avatar
              src={session.user.image || ''}
              alt={`${session.user.name} avatar`}
              size='big'
            />

            <div>
              <div className='mb-2'>
                <p className='font-bold'>{t('name')}</p>
                <p>{session.user?.name || '-'}</p>
              </div>
              <div>
                <p className='font-bold'>{t('email')}</p>
                <p>{session.user?.email || '-'}</p>
              </div>
            </div>
          </div>

          <form className={styles['user__form']} onSubmit={saveUserData}>
            <Button
              buttonType='action'
              icon={isEditing ? faClose : faPencil}
              iconSize='sm'
              type='button'
              additionalClass={`${styles['edit-button']}`}
              onClick={isEditing ? cancelEdit : () => setIsEditing(true)}
            />
            <div>
              <Input
                autoComplete='off'
                label={t('zipCode') as string}
                placeholder={t('enterZipCode') as string}
                value={zipCode}
                readOnly={!isEditing}
                disabled={!isEditing}
                onChange={(event) =>
                  updateFormField(
                    (event.target as HTMLInputElement).value,
                    setZipCode
                  )
                }
              />
              <Input
                autoComplete='off'
                label={t('city') as string}
                placeholder={t('enterCity') as string}
                value={city}
                readOnly={!isEditing}
                disabled={!isEditing}
                onChange={(event) =>
                  updateFormField(
                    (event.target as HTMLInputElement).value,
                    setCity
                  )
                }
              />
            </div>
            {isEditing && (
              <Button
                label={t('save') as string}
                icon={faSave}
                iconSize='sm'
                additionalClass='sm:w-32 sm:mx-auto mt-4'
                loading={isSavingUser}
              />
            )}
          </form>

          <div>
            <h2>{t('settings')}</h2>
            <div className={styles['user__settings']}>
              <div>
                <p className='font-bold mb-2'>{t('darkMode')}</p>
                <Switcher
                  checked={settings.isDarkTheme}
                  onChange={handleToggleTheme}
                />
              </div>
              <div>
                <p className='font-bold mb-2'>{t('locale')}</p>
                <Select
                  selectedOption={selectedLocale}
                  placeholder={t('selectLocale')}
                  selectOption={handleLocaleChange}
                  options={localeOptions}
                />
              </div>
            </div>
          </div>

          <div className={styles['user__buttons']}>
            <Button label={t('logout') as string} onClick={() => signOut()} />
            <Button
              label={t('deleteAccount') as string}
              onClick={() => setShowModal(true)}
            />
          </div>
        </div>
        {showModal && (
          <ConfirmationModal
            title={t('deleteAccount1') as string}
            question={t('areYouSureDeleteUser') as string}
            isModalClosing={isModalClosing}
            loading={isDeletingUser}
            onCloseModal={() => setIsModalClosing(true)}
            onCloseModalSuccess={onCloseModalSuccess}
            onConfirm={deleteAccount}
          />
        )}
      </>
    </>
  )
}

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const session = await getServerSession(context.req, context.res, authOptions)

  if (!session?.user) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    }
  }
  return {
    props: {
      ...(await serverSideTranslations(context.locale ?? 'en', [
        'user',
        'common',
      ])),
      session,
    },
  }
}
