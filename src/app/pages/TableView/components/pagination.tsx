import React from 'react'
import {Select} from 'antd'

const {Option} = Select

interface PaginationSelectorProps {
  rowsPerPage: number
  onChange: (value: number) => void
}

const PaginationSelection: React.FC<PaginationSelectorProps> = ({rowsPerPage, onChange}) => (
  <Select defaultValue={rowsPerPage} onChange={onChange}>
    {[5, 10, 20, 50].map((value) => (
      <Option key={value} value={value}>
        {value} per page
      </Option>
    ))}
  </Select>
)

export default PaginationSelection
