export const WORKSPACE_VIEW_TABS = ['节点流视图', '画板预览（精修）']

export const WORKSPACE_SIDE_TABS = ['知识资产', '历史记录']

export const WORKSPACE_GROUP_OPTIONS = [
  { key: 'member', icon: '👥', label: '瑞幸项目组（成员视角）' },
  { key: 'personal', icon: '🏠', label: '个人知识库' },
  { key: 'admin', icon: '👑', label: '瑞幸项目组（管理员视角）' },
]

export const WORKSPACE_HISTORY_RECORDS = [
  {
    id: 'history-preview',
    tag: '画板预览',
    time: '刚刚',
    title: '瑞幸夏日海报_v1 生成记录',
    description: '已调用品牌资产与标准 Logo 输出预览结果',
  },
  {
    id: 'history-search',
    tag: '节点流视图',
    time: '10 分钟前',
    title: '项目组知识库检索',
    description: '查看"品牌规范 / 颜色 / Logo"相关引用链路',
  },
  {
    id: 'history-switch',
    tag: '成员操作',
    time: '今天 09:12',
    title: '个人知识库切换记录',
    description: '从"瑞幸项目组"切换到"个人知识库"并查看最近内容',
  },
]

export const WORKSPACE_ASSET_ITEMS = [
  {
    id: 'asset-brand-blue',
    type: 'color' as const,
    label: '品牌蓝 #0022AB',
    value: '#0022AB',
  },
  {
    id: 'asset-logo-white',
    type: 'file' as const,
    label: '标准白底 Logo.svg',
    badge: 'Luckin',
  },
]

/** 右侧属性面板 —— 默认标签 */
export const DEFAULT_TAGS = ['品牌蓝', '标准Logo', '瑞幸元素']

/** 右侧属性面板 —— 滑杆默认值 */
export const SLIDER_CONFIG = {
  min: 0,
  max: 100,
  defaultValue: 70,
  label: '匹配逻辑阈值',
  unit: '%',
  rangeLabels: ['宽泛', '精准'],
}
