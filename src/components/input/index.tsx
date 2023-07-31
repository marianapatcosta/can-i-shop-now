import { faCircleInfo } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { forwardRef, HTMLProps, RefAttributes, memo } from 'react'
import { Tooltip } from '../tooltip'
import styles from './styles.module.css'

interface InputProps extends HTMLProps<HTMLInputElement> {
  label?: string
  tooltipContent?: string
  error?: string
  isInvalid?: boolean
  additionalClass?: string
}

const Input: React.FC<InputProps & RefAttributes<HTMLInputElement>> = memo(
  forwardRef(
    (
      {
        label,
        tooltipContent,
        error,
        isInvalid = false,
        additionalClass,
        ...rest
      },
      ref
    ) => {
      return (
        <div
          className={`${styles.input} ${
            isInvalid ? styles['input--error'] : ''
          } ${additionalClass ? additionalClass : ''}`}
        >
          <label htmlFor={label}>
            {!!label && (
              <p className='mb-2 font-bold'>
                {label}
                {!!tooltipContent && (
                  <span className='relative group'>
                    <FontAwesomeIcon
                      icon={faCircleInfo}
                      size='sm'
                      className='text-highlight ml-2'
                    />
                    <Tooltip
                      content={tooltipContent}
                      additionalClass={`${styles['input__tooltip']} group-hover:visible group-hover:opacity-100 group-hover:translate-y-0`}
                    />
                  </span>
                )}
              </p>
            )}
            <input
              className={`${styles.input} ${
                isInvalid ? styles['input--error'] : ''
              }`}
              id={label}
              ref={ref}
              {...rest}
            />
          </label>
          {isInvalid && <p className={styles['input__error']}>{error}</p>}
        </div>
      )
    }
  )
)

export { Input }
