import React, {useState, useEffect} from 'react'
import {Table, Card, Spin, Divider, Input, Row, Col} from 'antd'
import {useQuery} from 'react-query'
import {fetchRetreats} from '../../api'
import SearchBar from './components/searchBar'
import ViewManager from './components/viewManager'
import ColumnManager from './components/columns'
import {ColumnDefinition, Retreat, SortOrder} from '../../types'
import PaginationSelection from './components/paginationSelection'

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

  const {data: retreats = [], isLoading, isError} = useQuery('retreats', fetchRetreats)

  useEffect(() => {
    if (retreats.length > 0) {
      setData(retreats)
    }
  }, [retreats])

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value)
  }

  const clearSearch = () => {
    setSearchQuery('')
  }

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number, pageSize?: number) => {
    setCurrentPage(page)
    setRowsPerPage(pageSize || rowsPerPage)
  }

  const handleSaveView = (viewName: string) => {
    setViews({...views, [viewName]: visibleColumns})
  }

  const handleLoadView = (viewName: string) => {
    if (views[viewName]) {
      setVisibleColumns(views[viewName])
      setCurrentView(viewName)
    }
  }

  const handleDeleteView = (viewName: string) => {
    const newViews = {...views}
    delete newViews[viewName]
    setViews(newViews)
  }

  const handleToggleVisibility = (columnId: string, visible: boolean) => {
    setVisibleColumns(visibleColumns.map((col) => (col.id === columnId ? {...col, visible} : col)))
  }

  const handleDragEnd = (result: any) => {
    if (!result.destination) return
    const reorderedColumns = Array.from(visibleColumns)
    const [removed] = reorderedColumns.splice(result.source.index, 1)
    reorderedColumns.splice(result.destination.index, 0, removed)
    setVisibleColumns(reorderedColumns)
  }

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    columnId: keyof Retreat
  ) => {
    if (editedRow) {
      setEditedRow({...editedRow, [columnId]: event.target.value})
    }
  }

  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    setSortConfig({
      key: sorter.field,
      order: sorter.order,
    })
  }

  const filteredData = data.filter((retreat) =>
    retreat.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const columnsToRender = visibleColumns
    .filter((col) => col.visible)
    .map((col) => ({
      title: col.label,
      dataIndex: col.id,
      key: col.id,
      width: col.maxWidth,
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
  useEffect(() => {
    if (retreats.length > 0) {
      setData(retreats)
    }
  }, [retreats])
  const paginatedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  )
  return (
    <Card title='Dynamic Table' bordered={false}>
      <Row gutter={16}>
        <Col xs={24} sm={12} md={4}>
          <SearchBar searchQuery={searchQuery} onSearch={handleSearch} onClear={clearSearch} />
        </Col>
        <Col xs={24} sm={12} md={2}>
          <PaginationSelection rowsPerPage={rowsPerPage} onChange={handleRowsPerPageChange} />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <ViewManager
            views={views}
            currentView={currentView}
            onSaveView={handleSaveView}
            onLoadView={handleLoadView}
            onDeleteView={handleDeleteView}
          />
        </Col>
      </Row>
      <Divider />
      <h2 className='mb-4'>Handle visibility and rearrange columns by dragging and dropping.</h2>
      <ColumnManager
        columns={visibleColumns}
        onToggleVisibility={handleToggleVisibility}
        onDragEnd={handleDragEnd}
      />
      <Divider />
      {isLoading ? (
        <Spin tip='Loading...' className='d-flex justify-content-center' />
      ) : isError ? (
        <div>Error</div>
      ) : (
        <Table
          dataSource={paginatedData}
          columns={columnsToRender}
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
