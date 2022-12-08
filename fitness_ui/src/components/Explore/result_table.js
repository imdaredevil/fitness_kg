import React , { useEffect, useRef, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';

import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

const columns = [[
    { field: 'id', headerName: 'S. No.', type: 'number', width: 70, editable: false, sortable: false, filterable: false },
    { field: 'name', headerName: 'Name', type: 'string', width: 300, editable: false, sortable: false, filterable: false },
    { field: 'muscle', headerName: 'Muscle', type: 'string', width: 200, editable: false, sortable: false, filterable: false },
    { field: 'equipment', headerName: 'Equipment', type: 'string', width: 200, editable: false, sortable: false, filterable: false },
    { field: 'difficulty', headerName: 'Difficulty', type: 'string', width: 200, editable: false, sortable: false, filterable: false },
    { field: 'mechanics', headerName: 'Mechanics', type: 'string', width: 200, editable: false, sortable: false, filterable: false },
    { field: 'type', headerName: 'Type', type: 'string', width: 200, editable: false, sortable: false, filterable: false }
], [
    { field: 'id', headerName: 'S. No.', type: 'number', width: 70, editable: false, sortable: false, filterable: false },
    { field: 'name', headerName: 'Name', type: 'string', width: 300, editable: false, sortable: false, filterable: false },
    { field: 'muscle', headerName: 'Muscle', type: 'string', width: 200, editable: false, sortable: false, filterable: false },
    { field: 'sanskrit_Name', headerName: 'Sanskrit Name', type: 'string', width: 200, editable: false, sortable: false, filterable: false },
]]

const clickable = [[
    "name",
    "muscle",
    "equipment"
],
[
    "name",
    "muscle"
],
]



export default function RecordsTable(props) {
    const pageSize = props.pageSize
    const { loading, exercises } = props;
    const [value, setValue] = React.useState(0);
    const all_records = exercises
    const onPageChange = (params, value) => {
        props.setIndices([params * pageSize, (params + 1) * pageSize], value)
    }
    const a11yProps = (index) => {
        return {
          id: `simple-tab-${index}`,
          'aria-controls': `simple-tabpanel-${index}`,
        };
    }
    const indices = props.indices
    const setFocusIndex = props.setFocusIndex
    const TabPanel = (props) => {
        const { children, value, index, ...other } = props;
        return (
          <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            style={{ height: "85%" }}
            {...other}
          >
            {value === index && (
                <DataGrid
                density='compact'
                  rows={all_records[value]}
                  columns={columns[value]}
                  pageSize={pageSize}
                  loading={loading}
                  initialState={{ pagination: { page: indices[value][0] / pageSize }}}
                  onPageChange={(params) => onPageChange(params, value)}
                  onCellClick={(params)=>{ 
                    if (clickable[value].includes(params.field)) setFocusIndex(params.row[params.field])}}
                  rowsPerPageOptions={[pageSize]}
                  sx={{
                    '& .MuiTablePagination-root': {
                        height: '5%',
                      }
                  }}
                />
            )}
          </div>
        );
      }

      const handleChange = (event, newValue) => {
        setValue(newValue);
      };

     return (
        <Box sx={{ height: "100%", width: "100%" }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                    <Tab label="Gym Workouts" {...a11yProps(0)} />
                    <Tab label="Yoga" {...a11yProps(1)} />
                </Tabs>
            </Box>
            <TabPanel value={value} index={0} />
            <TabPanel value={value} index={1} />
       </Box>
    );
  }