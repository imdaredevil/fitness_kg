import React , { useRef, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Graph from './graph';
import Box from '@mui/material/Box';

const columns = [
    { field: 'id', headerName: 'ID', type: 'number', width: 70, editable: false, sortable: false, filterable: false },
    { field: 'name', headerName: 'Name', type: 'string', width: 300, editable: false, sortable: false, filterable: false },
    { field: 'difficulty', headerName: 'Difficulty', type: 'string', width: 200, editable: false, sortable: false, filterable: false },
    { field: 'mechanics', headerName: 'Mechanics', type: 'string', width: 200, editable: false, sortable: false, filterable: false },
    { field: 'type', headerName: 'Type', type: 'string', width: 200, editable: false, sortable: false, filterable: false }
]


export default function RecordsTable(props) {
    const gridRef = useRef()
    const { loading, exercises } = props;
    const [indices, setIndices] = useState([0, 25])
    const records = exercises.map((record, index) => { return {id: index + 1, ...record.get('ex').properties }})
    const onPageChange = (params) => {
        setIndices([params * 25, (params + 1) * 25])
    }
     return ( <div style={{ height: "42.5%", width: "100%" }}> 
      <Box sx={{ height: "100%" }}>
        <Graph graph_results={exercises || []} loading={loading} indices={indices}/>
        <DataGrid
        ref={gridRef}
        density='compact'
          rows={records}
          columns={columns}
          pageSize={25}
          loading={props.loading}
          onPageChange={onPageChange}
          rowsPerPageOptions={[25]}
        />
       </Box>
      </div>
    );
  }