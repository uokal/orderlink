import React from 'react'
import {Select, Button, Form} from 'antd'

const {Option} = Select

interface ViewManagerProps {
  views: {[key: string]: any}
  currentView: string
  onSaveView: (viewName: string) => void
  onLoadView: (viewName: string) => void
  onDeleteView: (viewName: string) => void
}

const ViewManager: React.FC<ViewManagerProps> = ({
  views,
  currentView,
  onSaveView,
  onLoadView,
  onDeleteView,
}) => {
  // Wrap onSaveView to prompt for a view name
  const handleSaveView = () => {
    const viewName = prompt('Enter a name for the view:')
    if (viewName) {
      onSaveView(viewName)
    }
  }

  // Wrap onDeleteView to use the currentView as the argument
  const handleDeleteView = () => {
    if (currentView) {
      onDeleteView(currentView)
    }
  }

  return (
    <div className='d-flex'>
      <Form.Item className='me-5'>
        <Button onClick={handleSaveView}>Save View</Button>
      </Form.Item>
      <Form.Item className='me-5 w-50'>
        <Select value={currentView} onChange={onLoadView} placeholder='Load View'>
          {Object.keys(views).map((viewName) => (
            <Option key={viewName} value={viewName}>
              {viewName}
            </Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item>
        <Button onClick={handleDeleteView} disabled={!currentView}>
          Delete View
        </Button>
      </Form.Item>
    </div>
  )
}

export default ViewManager
