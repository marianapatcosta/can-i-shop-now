import { DetailedHTMLProps, ButtonHTMLAttributes, MouseEvent } from 'react'
import { IconProp, SizeProp } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import styles from './styles.module.css'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'

type ButtonType = 'action' | 'primary' | 'secondary'

interface ButtonProps
  extends DetailedHTMLProps<
    ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  label?: string
  icon?: IconProp
  iconSize?: SizeProp
  disabled?: boolean
  loading?: boolean
  additionalClass?: string
  buttonType?: ButtonType
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void
}

export const Button: React.FC<ButtonProps> = ({
  label,
  icon,
  iconSize,
  additionalClass,
  buttonType = 'primary',
  loading = false,
  onClick,
  ...rest
}) => {
  const handleOnClick = (event: MouseEvent<HTMLButtonElement>) => {
    !!onClick && onClick(event)
  }

  return (
    <button
      className={`${styles.button} ${styles[`button--${buttonType}`]} ${
        additionalClass ? additionalClass : ''
      } ${loading ? styles['button--loading'] : ''}`}
      {...rest}
      onClick={handleOnClick}
    >
      {(!!icon || loading) && (
        <FontAwesomeIcon
          icon={loading ? faSpinner : icon!}
          size={loading ? 'lg' : iconSize}
          className={` ${buttonType !== 'primary' ? 'text-highlight' : ''} ${
            (!!label && !loading)? 'mr-1' : ''
          } ${loading ? 'animate-spin' : ''}`}
        />
      )}
      {!!label && !loading && label}
    </button>
  )
}
