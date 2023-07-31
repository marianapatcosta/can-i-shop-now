import Image from 'next/image'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser } from '@fortawesome/free-solid-svg-icons'
import styles from './styles.module.css'

interface AvatarProps {
  src: string
  alt: string
  size?: 'small' | 'medium' | 'big'
  additionalClass?: string
}

export const Avatar: React.FC<AvatarProps> = ({
  alt,
  src,
  size = 'medium',
  additionalClass,
  ...rest
}) => {
  return !!src ? (
    <Image
      className={`${styles.avatar} ${styles[`avatar--${size}`]} ${
        additionalClass ? additionalClass : ''
      }`}
      alt={alt}
      src={src}
      width={40}
      height={40}
      {...rest}
    />
  ) : (
    <div className={`${styles.avatar} ${styles[`avatar--${size}`]} p-2`}>
      <FontAwesomeIcon icon={faUser} className='w-full h-full text-gray-600' />
    </div>
  )
}
