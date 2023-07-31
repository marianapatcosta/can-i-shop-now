import { HTMLProps, useCallback, useEffect, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown } from '@fortawesome/free-solid-svg-icons'
import styles from './styles.module.css'

interface SelectProps<OptionType> extends HTMLProps<HTMLDivElement> {
  options: OptionType[]
  selectedOption: OptionType | undefined
  label?: string
  placeholder: string
  error?: string
  isInvalid?: boolean
  additionalClass?: string
  optionsHeight?: string
  selectOption: (option: OptionType) => void
  onSelectCollapse?: () => void
}

const Select = <OptionType extends { label: JSX.Element; value: string }>({
  label,
  error,
  additionalClass,
  options,
  selectedOption,
  disabled,
  isInvalid = false,
  optionsHeight = '4.5rem',
  placeholder,
  onSelectCollapse,
  selectOption,
  ...rest
}: SelectProps<OptionType>) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const dropdownRef = useRef<HTMLDivElement | null>(null)

  const toggleDropdownExpansion = useCallback(() => {
    !disabled && setIsExpanded((prevIsExpanded) => !prevIsExpanded)
  }, [disabled])

  const collapseDropdown = useCallback(() => {
    !!onSelectCollapse && onSelectCollapse()
    !disabled && setIsExpanded(false)
  }, [disabled, onSelectCollapse])

  const handleOptionSelection = (option: OptionType) => {
    selectOption(option)
    collapseDropdown()
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const element = event.target

      if (
        dropdownRef.current &&
        !dropdownRef?.current.contains(element as Node)
      ) {
        //event.preventDefault()
        collapseDropdown()
      }
    }
    document.addEventListener('mouseup', handleClickOutside)

    return () => document.removeEventListener('mouseup', handleClickOutside)
  }, [dropdownRef, collapseDropdown])

  return (
    <div
      ref={dropdownRef}
      className={`${styles.select} ${additionalClass ? additionalClass : ''}`}
      onTouchStart={
        isExpanded ? (event) => event.stopPropagation() : () => null
      }
      onTouchMove={isExpanded ? (event) => event.stopPropagation() : () => null}
      onTouchEnd={isExpanded ? (event) => event.stopPropagation() : () => null}
    >
      <div>
        {!!label && <p>{label}</p>}
        <button
          className={`${styles['select__header']} ${
            !!isExpanded ? styles['select__header--expanded'] : ''
          } ${isInvalid ? styles['select__header--error'] : ''}`}
          aria-label={placeholder}
          aria-expanded={isExpanded}
          /*// @ts-ignore */
          onClick={toggleDropdownExpansion}
          {...rest}
        >
          {selectedOption?.label || (
            <p className='mb-1 text-start'>{placeholder}</p>
          )}
          <FontAwesomeIcon icon={faChevronDown} />
        </button>
        <ul
          className={`${styles['select__options']}  ${
            !!isExpanded ? `${styles['select__options--expanded']}` : ''
          }`}
          style={{
            maxHeight: optionsHeight,
            height: isExpanded ? optionsHeight : '1px',
          }}
        >
          {options.map((option) => (
            <li
              key={`${label}-${option.value}`}
              value={option.value}
              aria-label={`Select an option ${option.value}`}
              onClick={() => handleOptionSelection(option)}
            >
              {option.label}
            </li>
          ))}
        </ul>
      </div>
      {isInvalid && <p className={styles['select__error']}>{error}</p>}
    </div>
  )
}

export { Select }
