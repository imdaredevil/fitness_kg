import React , { useRef, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';

import Box from '@mui/material/Box';
import { network } from 'vis-network';

const columns = [
    { field: 'id', headerName: 'ID', type: 'number', width: 70, editable: false, sortable: false, filterable: false },
    { field: 'name', headerName: 'Name', type: 'string', width: 300, editable: false, sortable: false, filterable: false },
    { field: 'muscle', headerName: 'Muscle', type: 'string', width: 200, editable: false, sortable: false, filterable: false },
    { field: 'equipment', headerName: 'Equipment', type: 'string', width: 200, editable: false, sortable: false, filterable: false },
    { field: 'difficulty', headerName: 'Difficulty', type: 'string', width: 200, editable: false, sortable: false, filterable: false },
    { field: 'mechanics', headerName: 'Mechanics', type: 'string', width: 200, editable: false, sortable: false, filterable: false },
    { field: 'type', headerName: 'Type', type: 'string', width: 200, editable: false, sortable: false, filterable: false }
]


export default function RecordsTable(props) {
    const gridRef = useRef()
    const pageSize = props.pageSize
    const { loading, exercises } = props;
    const getRecord = (record, index) => {
        const exercise = record.get('ex').properties;
        const muscles = record.get('m').properties;
        const equipments = record.get('eq').properties;
        return {
            id: index + 1,
            ...exercise,
            name_key: exercise.url,
            muscle: muscles.name,
            muscle_key: muscles.url,
            equipment: equipments.name,
            equipment_key: equipments.name
        }
    }
    const records = exercises.map(getRecord)
    const onPageChange = (params) => {
        props.setIndices([params * pageSize, (params + 1) * pageSize])
    }

     return (
        <Box sx={{ height: "100%", width: "100%" }}>
        <DataGrid
        ref={gridRef}
        density='compact'
          rows={records}
          columns={columns}
          pageSize={pageSize}
          loading={loading}
          onPageChange={onPageChange}
          rowsPerPageOptions={[pageSize]}
          sx={{
            '& .MuiTablePagination-root': {
                height: '5%',
              }
          }}
        />
       </Box>
    );
  }