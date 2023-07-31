import Link from 'next/link'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import { Avatar } from '../avatar'
import styles from './styles.module.css'
import { useTranslation } from 'next-i18next'

export const Header = () => {
  const { t } = useTranslation(['common'])
  const router = useRouter()
  const { data: session } = useSession()

  return (
    <header className={styles.header}>
      <div className={styles['header__content']}>
        <Link
          aria-disabled={router.pathname === '/'}
          href={router.pathname !== '/' ? '/' : ''}
          className={`${
            router.pathname === '/' ? styles['header__link--disabled'] : ''
          }`}
        >
          Can I Shop Now?
        </Link>
        {!!session?.user && (
          <Link
            href='/user'
            className={`${styles['header__link']} ${
              router.pathname === '/user'
                ? styles['header__link--disabled']
                : ''
            }`}
          >
            <Avatar
              src={session.user.image || ''}
              alt={`${session.user.name} avatar`}
              size='small'
            />
          </Link>
        )}
      </div>
    </header>
  )
}
