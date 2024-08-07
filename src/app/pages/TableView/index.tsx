import React, { useState, useEffect, ChangeEvent } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TableSortLabel, Paper, TextField, Checkbox, Button, IconButton, Select,
  MenuItem, FormControl
} from '@material-ui/core';
import { Grid, Box, InputLabel, Card } from '@mui/material';
import { Edit, Save, Cancel } from '@material-ui/icons';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { fetchRetreats, updateRetreat } from '../../api';

type Retreat = {
  id: string;
  title: string;
  location: string;
  date: string;
  description: string;
  price: string;
  type: string;
  condition: string;
  image: string;
};

type SortOrder = 'asc' | 'desc' | '';

const columns = [
  { id: 'title', label: 'Title', visible: true },
  { id: 'description', label: 'Description', visible: true },
  { id: 'date', label: 'Date', visible: true },
  { id: 'location', label: 'Location', visible: true },
  { id: 'price', label: 'Price', visible: true },
  { id: 'type', label: 'Type', visible: true },
  { id: 'condition', label: 'Condition', visible: true },
  { id: 'image', label: 'Image', visible: true }
];

const RetreatTable: React.FC = () => {
  const [data, setData] = useState<Retreat[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Retreat, order: SortOrder }>({ key: 'title', order: 'asc' });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);
  const [editedRow, setEditedRow] = useState<Retreat | null>(null);
  const [visibleColumns, setVisibleColumns] = useState(columns);

  useEffect(() => {
    fetchRetreats().then(setData);
  }, []);

  const handleSort = (columnId: keyof Retreat) => {
    let order: SortOrder = 'asc';
    if (sortConfig.key === columnId && sortConfig.order === 'asc') order = 'desc';
    if (sortConfig.key === columnId && sortConfig.order === 'desc') order = '';
    setSortConfig({ key: columnId, order });
  };

  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handlePageChange = (direction: 'next' | 'prev') => {
    setCurrentPage(prev => direction === 'next' ? prev + 1 : prev - 1);
  };

  const handleRowsPerPageChange = (event: ChangeEvent<{ value: unknown }>) => {
    setRowsPerPage(event.target.value as number);
    setCurrentPage(1);
  };

  const handleEdit = (retreat: Retreat) => {
    setEditedRow(retreat);
  };

  const handleSave = () => {
    if (editedRow) {
      updateRetreat(editedRow.id, editedRow)
        .then(() => {
          setData(prev => prev.map(row => (row.id === editedRow.id ? editedRow : row)));
          setEditedRow(null);
        });
    }
  };

  const handleCancel = () => {
    setEditedRow(null);
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, columnId: keyof Retreat) => {
    if (editedRow) {
      setEditedRow({ ...editedRow, [columnId]: event.target.value });
    }
  };

  const handleColumnVisibilityChange = (columnId: string) => {
    setVisibleColumns(prev => prev.map(col => col.id === columnId ? { ...col, visible: !col.visible } : col));
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    const reorderedData = Array.from(data);
    const [removed] = reorderedData.splice(result.source.index, 1);
    reorderedData.splice(result.destination.index, 0, removed);
    setData(reorderedData);
  };

  const filteredData = data.filter(row => {
    return visibleColumns.some(col => {
      if (col.visible) {
        const value = row[col.id as keyof Retreat];
        return value && value.toString().toLowerCase().includes(searchQuery.toLowerCase());
      }
      return false;
    });
  });

  const sortedData = filteredData.sort((a, b) => {
    if (sortConfig.order === '') return 0;
    const multiplier = sortConfig.order === 'asc' ? 1 : -1;
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    if (aValue === undefined || bValue === undefined) return 0;
    return aValue.toString().localeCompare(bValue.toString()) * multiplier;
  });

  const paginatedData = sortedData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  return (
    <Card sx={{ p: 5 }} variant="outlined">
      <Grid container spacing={2} columns={16}>
        <Grid item xs={8}>
          <TextField
            label="Search"
            variant="outlined"
            fullWidth
            value={searchQuery}
            onChange={handleSearch}
          />
        </Grid>
        <Grid item xs={8}>
          <FormControl variant="outlined" fullWidth>
            <Select
              labelId="rows-per-page-label"
              value={rowsPerPage}
              onChange={handleRowsPerPageChange}
              label="Rows per page"
            >
              {[5, 10, 15, 20].map(number => (
                <MenuItem key={number} value={number}>{number}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="droppable" direction="vertical">
          {(provided) => (
            <TableContainer component={Paper} ref={provided.innerRef} {...provided.droppableProps}>
              <Table>
                <TableHead>
                  <TableRow>
                    {visibleColumns.map((column) => column.visible && (
                      <TableCell key={column.id}>
                        <TableSortLabel
                          active={sortConfig.key === column.id}
                          direction={sortConfig.order === 'asc' ? 'asc' : 'desc'}
                          onClick={() => handleSort(column.id as keyof Retreat)}
                        >
                          {column.label}
                        </TableSortLabel>
                      </TableCell>
                    ))}
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedData.map((row, index) => (
                    <Draggable key={row.id} draggableId={row.id} index={index}>
                      {(provided) => (
                        <TableRow
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          {visibleColumns.map((column) => column.visible && (
                            <TableCell key={column.id}>
                              {editedRow && editedRow.id === row.id ? (
                                <TextField
                                  value={editedRow[column.id as keyof Retreat]}
                                  onChange={(event) => handleInputChange(event, column.id as keyof Retreat)}
                                />
                              ) : (
                                row[column.id as keyof Retreat]
                              )}
                            </TableCell>
                          ))}
                          <TableCell>
                            {editedRow && editedRow.id === row.id ? (
                              <>
                                <IconButton onClick={handleSave}>
                                  <Save />
                                </IconButton>
                                <IconButton onClick={handleCancel}>
                                  <Cancel />
                                </IconButton>
                              </>
                            ) : (
                              <IconButton onClick={() => handleEdit(row)}>
                                <Edit />
                              </IconButton>
                            )}
                          </TableCell>
                        </TableRow>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Droppable>
      </DragDropContext>

      <div>
        <Button
          onClick={() => handlePageChange('prev')}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <span>{currentPage}</span>
        <Button
          onClick={() => handlePageChange('next')}
          disabled={currentPage === Math.ceil(filteredData.length / rowsPerPage)}
        >
          Next
        </Button>
      </div>
      <Box
        display="flex"
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        p={2} // Padding
        bgcolor="background.paper" // Background color
      >
        {columns.map((column) => (
          <Box p={1} key={column.id}>
            <Checkbox
              checked={visibleColumns.find(col => col.id === column.id)?.visible}
              onChange={() => handleColumnVisibilityChange(column.id)}
            />
            {column.label}
          </Box>
        ))}
      </Box>
    </Card>
  );
};

export default RetreatTable;
