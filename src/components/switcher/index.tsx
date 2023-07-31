import { HTMLProps, ChangeEvent } from 'react'
import styles from './styles.module.css'

interface SwitcherProps extends HTMLProps<HTMLInputElement> {
  leftLabel?: string
  rightLabel?: string
  checked: boolean
  disabled?: boolean
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
}

export const Switcher = ({
  leftLabel,
  rightLabel,
  checked,
  disabled,
  onChange,
}: SwitcherProps) => {
  return (
    <label className={styles.switcher}>
      <input
        type='checkbox'
        checked={checked}
        disabled={disabled}
        onChange={onChange}
      />
      <span
        className={`${styles['switcher__slider']} ${
          disabled ? styles['switcher__slider--disabled'] : ''
        }`}
      >
        {checked && !!leftLabel && (
          <span className={`${disabled ? 'opacity-30' : ''}`}>{leftLabel}</span>
        )}

        {!checked && !!rightLabel && (
          <span className={`${disabled ? 'opacity-30' : ''}`}>
            {rightLabel}
          </span>
        )}
      </span>
    </label>
  )
}
