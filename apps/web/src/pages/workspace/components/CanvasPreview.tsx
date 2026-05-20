import { useState } from 'react'
import styles from '../workspace.module.css'

type Tool = 'hand' | 'pen' | 'eraser' | 'undo'

const TOOLS: { key: Tool; icon: string; label: string }[] = [
  { key: 'hand', icon: '🖐️', label: '手' },
  { key: 'pen', icon: '✏️', label: '笔' },
  { key: 'eraser', icon: '🧹', label: '橡皮擦' },
  { key: 'undo', icon: '↩️', label: '回退' },
]

const CanvasPreview = () => {
  const [activeTool, setActiveTool] = useState<Tool>('hand')

  return (
    <div className={styles.previewArea}>
      <div className={styles.previewToolbar}>
        <div className={styles.previewToolGroup}>
          {TOOLS.map((tool) => (
            <button
              key={tool.key}
              type="button"
              className={`${styles.previewToolBtn} ${
                activeTool === tool.key ? styles.previewToolBtnActive : ''
              }`}
              onClick={() => setActiveTool(tool.key)}
              title={tool.label}
            >
              <span className={styles.previewToolIcon}>{tool.icon}</span>
            </button>
          ))}
        </div>
        <button type="button" className={styles.saveKnowledgeBtn}>
          存入个人知识库
        </button>
      </div>
      <div className={styles.previewCanvas} />
    </div>
  )
}

export default CanvasPreview