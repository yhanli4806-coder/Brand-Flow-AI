import { useState } from 'react'
import styles from './SelectionTabs.module.css'

interface SelectionTabsProps {
  items: string[]
  defaultIndex?: number
  onChange?: (index: number) => void
}

const SelectionTabs = ({ items, defaultIndex = 0, onChange }: SelectionTabsProps) => {
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
          <span className={styles.tabLabel}>{item}</span>
        </button>
      ))}
    </div>
  )
}

export default SelectionTabs
