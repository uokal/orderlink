import React from 'react'
import {Input} from 'antd'
import {ClearOutlined} from '@ant-design/icons'

interface SearchBarProps {
  searchQuery: string
  onSearch: (event: React.ChangeEvent<HTMLInputElement>) => void
  onClear: () => void
}

const SearchBar: React.FC<SearchBarProps> = ({searchQuery, onSearch, onClear}) => (
  <Input
    placeholder='Search'
    value={searchQuery}
    onChange={onSearch}
    suffix={<ClearOutlined onClick={onClear} />}
  />
)

export default SearchBar
