import React, {useState, useEffect, ChangeEvent} from 'react'
import {Table, Input, Button, Select, Form, Checkbox, Space, Pagination} from 'antd'
import {EditOutlined, SaveOutlined, CloseOutlined, ClearOutlined} from '@ant-design/icons'
import {DragDropContext, Droppable, Draggable, DropResult} from 'react-beautiful-dnd'
import {fetchRetreats, updateRetreat} from '../../api'
import type {ColumnType} from 'antd/es/table/interface'

const {Option} = Select

type Retreat = {
  id: string
  title: string
  location: string
  date: string
  description: string
  price: string
  type: string
  condition: string
  image: string
}

type SortOrder = 'ascend' | 'descend' | ''

interface ColumnDefinition {
  id: keyof Retreat
  label: string
  visible: boolean
}

const initialColumns: ColumnDefinition[] = [
  {id: 'title', label: 'Title', visible: true},
  {id: 'description', label: 'Description', visible: true},
  {id: 'date', label: 'Date', visible: true},
  {id: 'location', label: 'Location', visible: true},
  {id: 'price', label: 'Price', visible: true},
  {id: 'type', label: 'Type', visible: true},
  {id: 'condition', label: 'Condition', visible: true},
  {id: 'image', label: 'Image', visible: true},
]

const RetreatTable: React.FC = () => {
  const [data, setData] = useState<Retreat[]>([])
  const [sortConfig, setSortConfig] = useState<{key: keyof Retreat; order: SortOrder}>({
    key: 'title',
    order: 'ascend',
  })
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [rowsPerPage, setRowsPerPage] = useState<number>(5)
  const [editedRow, setEditedRow] = useState<Retreat | null>(null)
  const [visibleColumns, setVisibleColumns] = useState<ColumnDefinition[]>(initialColumns)
  const [views, setViews] = useState<{[key: string]: any}>({})
  const [currentView, setCurrentView] = useState<string>('')

  useEffect(() => {
    fetchRetreats()
      .then(setData)
      .catch((error) => console.error('Failed to fetch retreats:', error))
  }, [])

  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value)
  }

  const clearSearch = () => {
    setSearchQuery('')
  }

  const filterValue = (value: string | number, query: string) => {
    const normalizedQuery = query.trim().toLowerCase()
    if (typeof value === 'string') {
      const normalizedValue = value.trim().toLowerCase()
      return normalizedValue.includes(normalizedQuery)
    }
    if (!isNaN(Number(query)) && !isNaN(Number(value))) {
      return Number(value) === Number(query)
    }
    return false
  }

  const filteredData =
    searchQuery.trim() === ''
      ? data
      : data.filter((row) => {
          return visibleColumns.some((col) => {
            if (col.visible) {
              const value = row[col.id]
              return filterValue(value, searchQuery)
            }
            return false
          })
        })

  const sortedData = filteredData.sort((a, b) => {
    if (sortConfig.order === '') return 0
    const multiplier = sortConfig.order === 'ascend' ? 1 : -1
    const aValue = a[sortConfig.key]
    const bValue = b[sortConfig.key]
    if (aValue === undefined || bValue === undefined) return 0
    return aValue.toString().localeCompare(bValue.toString()) * multiplier
  })

  const paginatedData = sortedData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)

  const handleSort = (columnId: keyof Retreat) => {
    let order: SortOrder = 'ascend'
    if (sortConfig.key === columnId && sortConfig.order === 'ascend') order = 'descend'
    if (sortConfig.key === columnId && sortConfig.order === 'descend') order = ''
    setSortConfig({key: columnId, order})
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleRowsPerPageChange = (value: number) => {
    setRowsPerPage(value)
    setCurrentPage(1)
  }

  const handleEdit = (retreat: Retreat) => {
    setEditedRow(retreat)
  }

  const handleSave = () => {
    if (editedRow) {
      updateRetreat(editedRow.id, editedRow)
        .then(() => {
          setData((prev) => prev.map((row) => (row.id === editedRow.id ? editedRow : row)))
          setEditedRow(null)
        })
        .catch((error) => console.error('Failed to update retreat:', error))
    }
  }

  const handleCancel = () => {
    setEditedRow(null)
  }

  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    columnId: keyof Retreat
  ) => {
    if (editedRow) {
      setEditedRow({...editedRow, [columnId]: event.target.value})
    }
  }

  const handleColumnVisibilityChange = (columnId: keyof Retreat) => {
    setVisibleColumns((prev) =>
      prev.map((col) => (col.id === columnId ? {...col, visible: !col.visible} : col))
    )
  }

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return
    const reorderedData = Array.from(data)
    const [removed] = reorderedData.splice(result.source.index, 1)
    reorderedData.splice(result.destination.index, 0, removed)
    setData(reorderedData)
  }

  const handleSaveView = () => {
    const viewName = prompt('Enter view name:') || ''
    if (viewName) {
      setViews((prev) => ({
        ...prev,
        [viewName]: {columns: visibleColumns, sortConfig, searchQuery, rowsPerPage, currentPage},
      }))
    }
  }

  const handleLoadView = (viewName: string) => {
    const view = views[viewName]
    if (view) {
      setVisibleColumns(view.columns)
      setSortConfig(view.sortConfig)
      setSearchQuery(view.searchQuery)
      setRowsPerPage(view.rowsPerPage)
      setCurrentPage(view.currentPage)
      setCurrentView(viewName)
    }
  }

  const handleDeleteView = () => {
    if (currentView) {
      setViews((prev) => {
        const newViews = {...prev}
        delete newViews[currentView]
        return newViews
      })
      setCurrentView('')
    }
  }

  const columnsToRender: ColumnType<Retreat>[] = visibleColumns
    .filter((col) => col.visible)
    .map((col) => ({
      title: col.label,
      dataIndex: col.id,
      key: col.id,
      sorter: (a: Retreat, b: Retreat) => {
        if (sortConfig.key === col.id) {
          return sortConfig.order === 'ascend'
            ? (a[col.id] as string).localeCompare(b[col.id] as string)
            : (b[col.id] as string).localeCompare(a[col.id] as string)
        }
        return 0
      },
      render: (text: string, record: Retreat) =>
        editedRow && editedRow.id === record.id ? (
          <Input
            value={editedRow[col.id] as string}
            onChange={(e) => handleInputChange(e, col.id)}
          />
        ) : (
          text
        ),
    }))

  const actionColumn: ColumnType<Retreat> = {
    title: 'Actions',
    key: 'actions',
    render: (_text: any, record: Retreat) => (
      <Space>
        {editedRow && editedRow.id === record.id ? (
          <>
            <Button icon={<SaveOutlined />} onClick={handleSave} />
            <Button icon={<CloseOutlined />} onClick={handleCancel} />
          </>
        ) : (
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
        )}
      </Space>
    ),
  }

  return (
    <div style={{padding: 24}}>
      <Form layout='inline' style={{marginBottom: 16}}>
        <Form.Item>
          <Input
            placeholder='Search'
            value={searchQuery}
            onChange={handleSearch}
            suffix={<ClearOutlined onClick={clearSearch} />}
          />
        </Form.Item>
        <Form.Item>
          <Select defaultValue={rowsPerPage} onChange={handleRowsPerPageChange}>
            {[5, 10, 15, 20].map((number) => (
              <Option key={number} value={number}>
                {number}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item>
          <Button onClick={handleSaveView}>Save View</Button>
        </Form.Item>
        <Form.Item>
          <Select
            placeholder='Load View'
            value={currentView}
            onChange={handleLoadView}
            style={{width: 200}}
          >
            {Object.keys(views).map((viewName) => (
              <Option key={viewName} value={viewName}>
                {viewName}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item>
          <Button danger onClick={handleDeleteView}>
            Delete View
          </Button>
        </Form.Item>
      </Form>
      <Checkbox.Group
        options={initialColumns.map((col) => ({label: col.label, value: col.id}))}
        value={visibleColumns.filter((col) => col.visible).map((col) => col.id)}
        onChange={(checkedValues) => {
          const updatedColumns = initialColumns.map((col) => ({
            ...col,
            visible: checkedValues.includes(col.id),
          }))
          setVisibleColumns(updatedColumns)
        }}
      />
      <DragDropContext onDragEnd={handleDragEnd}>
        <Table
          dataSource={paginatedData}
          columns={[...columnsToRender, actionColumn]}
          rowKey='id'
          pagination={false}
          components={{
            body: {
              wrapper: (bodyProps) => (
                <Droppable droppableId='droppable'>
                  {(provided) => (
                    <tbody ref={provided.innerRef} {...provided.droppableProps}>
                      {paginatedData.map((row, index) => (
                        <Draggable key={row.id} draggableId={row.id} index={index}>
                          {(provided) => (
                            <tr
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              {columnsToRender.map((col, colIndex) => {
                                const cellContent = col.render
                                  ? col.render(row[col.dataIndex as keyof Retreat], row, index) // Pass 'index' as the third argument
                                  : row[col.dataIndex as keyof Retreat]
                                return (
                                  <td key={col.key as string}>{cellContent as React.ReactNode}</td>
                                )
                              })}
                              <td>
                                <Space>
                                  {editedRow && editedRow.id === row.id ? (
                                    <>
                                      <Button icon={<SaveOutlined />} onClick={handleSave} />
                                      <Button icon={<CloseOutlined />} onClick={handleCancel} />
                                    </>
                                  ) : (
                                    <Button
                                      icon={<EditOutlined />}
                                      onClick={() => handleEdit(row)}
                                    />
                                  )}
                                </Space>
                              </td>
                            </tr>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </tbody>
                  )}
                </Droppable>
              ),
            },
          }}
        />
      </DragDropContext>

      <Pagination
        current={currentPage}
        pageSize={rowsPerPage}
        total={sortedData.length}
        onChange={handlePageChange}
        showSizeChanger
        onShowSizeChange={(_, size) => handleRowsPerPageChange(size)}
        style={{marginTop: 16}}
      />
    </div>
  )
}

export default RetreatTable