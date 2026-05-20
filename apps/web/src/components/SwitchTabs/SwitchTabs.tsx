import { useState } from 'react'
import styles from './SwitchTabs.module.css'

interface SwitchTabsProps {
  items: string[]
  defaultIndex?: number
  onChange?: (index: number) => void
}

const SwitchTabs = ({ items, defaultIndex = 0, onChange }: SwitchTabsProps) => {
  const [activeIndex, setActiveIndex] = useState(defaultIndex)

  const handleClick = (index: number) => {
    setActiveIndex(index)
    onChange?.(index)
  }

  return (
    <div className={styles.container}>
      {items.map((item, index) => (
        <button
          key={item}
          type="button"
          className={`${styles.tab} ${index === activeIndex ? styles.tabActive : ''}`}
          onClick={() => handleClick(index)}
        >
          {item}
        </button>
      ))}
    </div>
  )
}

export default SwitchTabs
