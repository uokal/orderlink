import React from 'react'
import {Checkbox} from 'antd'
import {DragDropContext, Droppable, Draggable, DropResult} from 'react-beautiful-dnd'

interface ColumnDefinition {
  id: string
  label: string
  visible: boolean
}

interface ColumnManagerProps {
  columns: ColumnDefinition[]
  onToggleVisibility: (columnId: string, visible: boolean) => void
  onDragEnd: (result: DropResult) => void
}

const ColumnManager: React.FC<ColumnManagerProps> = ({columns, onToggleVisibility, onDragEnd}) => (
  <DragDropContext onDragEnd={onDragEnd}>
    <Droppable droppableId='columns' direction='horizontal'>
      {(provided) => (
        <div ref={provided.innerRef} {...provided.droppableProps} style={{display: 'flex'}}>
          {columns.map((col, index) => (
            <Draggable key={col.id} draggableId={col.id} index={index}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  style={{
                    userSelect: 'none',
                    padding: 8,
                    margin: `0 ${8}px 0 0`,
                    backgroundColor: '#f0f0f0',
                    border: '1px solid #d9d9d9',
                    borderRadius: 4,
                    ...provided.draggableProps.style,
                  }}
                >
                  <Checkbox
                    checked={col.visible}
                    onChange={(e) => onToggleVisibility(col.id, e.target.checked)}
                  >
                    {col.label}
                  </Checkbox>
                </div>
              )}
            </Draggable>
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  </DragDropContext>
)

export default ColumnManager
