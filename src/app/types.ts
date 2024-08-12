export type Retreat = {
  id: string
  title: string
  description: string
  location: string
  type: string
  condition: string
  image: string
}

export type ColumnDefinition = {
  id: keyof Retreat
  label: string
  visible: boolean
  maxWidth: number
}

export type SortOrder = 'ascend' | 'descend'
