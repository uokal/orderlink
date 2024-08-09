import React, {useState, ChangeEvent, useEffect} from 'react'
import {
  Table,
  Input,
  Button,
  Select,
  Form,
  Space,
  Pagination,
  Card,
  Col,
  Divider,
  Row,
  Spin,
  Checkbox,
} from 'antd'
import {
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  ClearOutlined,
  AppstoreOutlined,
} from '@ant-design/icons'
import {DragDropContext, Droppable, Draggable, DropResult} from 'react-beautiful-dnd'
import {fetchRetreats, updateRetreat} from '../../api'
import type {ColumnType} from 'antd/es/table/interface'
import type {
  TablePaginationConfig,
  FilterValue,
  SorterResult,
  TableCurrentDataSource,
} from 'antd/es/table/interface'
import {useQuery} from 'react-query'

const {Option} = Select

type Retreat = {
  id: string
  title: string
  location: string
  description: string
  type: string
  condition: string
  image: string
}

type SortOrder = 'ascend' | 'descend' | ''

type ColumnDefinition = {
  id: keyof Retreat
  label: string
  visible: boolean
  maxWidth?: number
}

const initialColumns: ColumnDefinition[] = [
  {id: 'title', label: 'Title', visible: true, maxWidth: 250},
  {id: 'description', label: 'Description', visible: true, maxWidth: 350},
  {id: 'location', label: 'Location', visible: true, maxWidth: 120},
  {id: 'type', label: 'Type', visible: true, maxWidth: 120},
  {id: 'condition', label: 'Condition', visible: true, maxWidth: 200},
  {id: 'image', label: 'Image', visible: true, maxWidth: 300},
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
  const [loading, setLoading] = useState(false)

  const {data: retreats = [], isLoading, isError, error} = useQuery('retreats', fetchRetreats)

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

  const handlePageChange = (page: number, pageSize?: number) => {
    setCurrentPage(page)
    if (pageSize && pageSize !== rowsPerPage) {
      setRowsPerPage(pageSize)
    }
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

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return
    const reorderedColumns = Array.from(visibleColumns)
    const [removed] = reorderedColumns.splice(result.source.index, 1)
    reorderedColumns.splice(result.destination.index, 0, removed)
    setVisibleColumns(reorderedColumns)
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

  const handleTableChange = (
    pagination: TablePaginationConfig,
    filters: Record<string, FilterValue | null>,
    sorter: SorterResult<Retreat> | SorterResult<Retreat>[],
    extra: TableCurrentDataSource<Retreat>
  ) => {
    if (Array.isArray(sorter)) {
      // Handle multiple sorters if necessary
      return
    }

    if (sorter.field && typeof sorter.field === 'string') {
      setSortConfig({
        key: sorter.field as keyof Retreat,
        order: sorter.order || '',
      })
    }
  }

  const columnsToRender: ColumnType<Retreat>[] = visibleColumns
    .filter((col) => col.visible)
    .map((col) => ({
      title: col.label,
      dataIndex: col.id,
      key: col.id,
      width: col.maxWidth,
      sorter: true,
      sortOrder:
        sortConfig.key === col.id
          ? sortConfig.order === ''
            ? undefined
            : sortConfig.order
          : undefined,
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
    <Card title='Dynamic Table' bordered={false}>
      <Form style={{marginBottom: 16}}>
        <Row gutter={16}>
          <Col xs={24} sm={12} md={6}>
            <Form.Item>
              <Input
                placeholder='Search'
                value={searchQuery}
                onChange={handleSearch}
                suffix={<ClearOutlined onClick={clearSearch} />}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Form.Item>
              <Select defaultValue={rowsPerPage} onChange={handleRowsPerPageChange}>
                {[5, 10, 20, 50].map((value) => (
                  <Option key={value} value={value}>
                    {value} per page
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={2}>
            <Form.Item>
              <Button onClick={handleSaveView}>Save View</Button>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Form.Item>
              <Select value={currentView} onChange={handleLoadView} placeholder='Load View'>
                {Object.keys(views).map((viewName) => (
                  <Option key={viewName} value={viewName}>
                    {viewName}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Form.Item>
              <Button onClick={handleDeleteView} disabled={!currentView}>
                Delete View
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
      <Divider />
      <h2 className='mb-4'>
        Handle visibility and rearrange columns by dragging and dropping them to your desired
        position.
      </h2>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId='columns' direction='horizontal'>
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              style={{display: 'flex', marginBottom: 16}}
            >
              {visibleColumns.map((col, index) => (
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
                        onChange={(e) =>
                          setVisibleColumns((prev) =>
                            prev.map((c) =>
                              c.id === col.id ? {...c, visible: e.target.checked} : c
                            )
                          )
                        }
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
      <Divider />
      {isLoading ? (
        <Spin tip='Loading...' />
      ) : isError ? (
        <div>Error</div>
      ) : (
        <Table
          dataSource={paginatedData}
          columns={[...columnsToRender, actionColumn]}
          rowKey='id'
          pagination={{
            current: currentPage,
            pageSize: rowsPerPage,
            total: filteredData.length,
            onChange: handlePageChange,
            showSizeChanger: true,
          }}
          onChange={handleTableChange}
        />
      )}
    </Card>
  )
}

export default RetreatTable
