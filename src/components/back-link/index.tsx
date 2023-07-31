import Link from 'next/link'
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import styles from './styles.module.css'

interface BackLinkProps {
  label: string
}

export const BackLink = ({ label }: BackLinkProps) => {
  return (
    <Link href='/' className={`${styles['back-link']} `}>
      <FontAwesomeIcon
        size='sm'
        icon={faChevronLeft}
        className='text-highlight mr-2'
      />
      {label}
    </Link>
  )
}
