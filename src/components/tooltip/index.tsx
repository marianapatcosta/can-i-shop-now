import styles from './styles.module.css'

interface TooltipProps {
  content: string
  additionalClass?: string
}

export const Tooltip = ({ content, additionalClass = '' }: TooltipProps) => {
  return <span className={`${styles.tooltip} ${additionalClass}`}>{content}</span>
}
