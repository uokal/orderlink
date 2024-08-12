import React from 'react'
import {Button, Space} from 'antd'
import {EditOutlined, SaveOutlined, CloseOutlined} from '@ant-design/icons'

interface TableActionsProps {
  isEditing: boolean
  onEdit: () => void
  onSave: () => void
  onCancel: () => void
}

const TableActions: React.FC<TableActionsProps> = ({isEditing, onEdit, onSave, onCancel}) => (
  <Space>
    {isEditing ? (
      <>
        <Button icon={<SaveOutlined />} onClick={onSave} />
        <Button icon={<CloseOutlined />} onClick={onCancel} />
      </>
    ) : (
      <Button icon={<EditOutlined />} onClick={onEdit} />
    )}
  </Space>
)

export default TableActions
