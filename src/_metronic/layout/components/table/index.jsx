import {useEffect, useState} from 'react'

const columns = [
  {
    name: 'Title',
    selector: (row) => row.title,
    sortable: true,
  },
  {
    name: 'Director',
    selector: (row) => row.director,
    sortable: true,
  },
  {
    name: 'Year',
    selector: (row) => row.year,
    sortable: true,
  },
]
function Table() {
  const [pending, setPending] = useState(true)
  const [rows, setRows] = useState([])
  useEffect(() => {
    const timeout = setTimeout(() => {
      setRows()
      setPending(false)
    }, 2000)
    return () => clearTimeout(timeout)
  }, [])
  return <>table</>
}

export default Table
