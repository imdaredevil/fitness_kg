import React, { useEffect, useState } from "react";
import { Grid, Box, Autocomplete, TextField, Card, Typography } from "@mui/material";
import { DataGrid } from '@mui/x-data-grid';
import { useReadCypher } from "use-neo4j";
import CardioSelector from "./cardio_selector";
import Chart from './calorieChart';
import annotationPlugin from "chartjs-plugin-annotation";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
  } from 'chart.js';


ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    annotationPlugin,
    Legend
);

const columns = [
    { field: 'name', headerName: 'Name', type: 'string', width: 300, editable: false, sortable: false, filterable: false },
    { field: 'calories', headerName: 'Calories', type: 'number', width: 160, editable: false, sortable: false, filterable: false },
    { field: 'met', headerName: 'METs', type: 'number', width: 160, editable: false, sortable: false, filterable: false }
]


export default function Cardio() {
    const [activity, setActivity] = useState([])
    const [chartData, setChartData] = useState(Array(2).fill({
        data: {
        labels: [],
        datasets: []
        },
        options: {}
    }))
    const [tableData, setTableData] = useState([])
    const { records: similar_activities, loading, run: queryRun, error } = useReadCypher(`
    MATCH (m:Cardioexercise { name: $activity })
    MATCH (n:Cardioexercise)-[:BURNS]->(calorie:Number)
    where (toInteger(calorie.end) >= (toInteger($times) * toInteger(m.calories))) 
    AND (toInteger(calorie.start) <= (toInteger($times) * toInteger(m.calories)))
    AND (m.name <> n.name)
    RETURN n, count(calorie) as calorie, m
    ORDER BY abs(toInteger(n.calories) - toInteger($times * toInteger(m.calories)))
    limit toInteger($num)
    `, { activity: "", times: 1, num: 40 })
    useEffect(() => {
        queryRun({ activity: activity[1]?.name || "", times: Number.parseInt(activity[0]) || 1, num: Number.parseInt(activity[2]) || 40 })
    }, [activity])
    useEffect(() => {
        const data = (similar_activities || []).map((act) => {
            const other_activity = act.get('n').properties
            const current_activity = act.get('m').properties
            return {
                ...other_activity,
                current_activity: current_activity,
                difference: Number(other_activity.calories) - Number.parseFloat(current_activity.calories)
            }
        }).filter((x) => x.name != activity[1]?.name)
        const labels = data.map(x => x.name)
        const calories = data.map(x => Number.parseFloat(x.calories))
        const mets = data.map(x => Number.parseFloat(x.met))
        const current_activity = data[0]?.current_activity || { "calories": 0, "met": 0}
        setTableData(data.map((x, index) => { return { id: index, ...x }}))
        const names = ['Calories', 'METs']
        const keys = ['calories', 'met']
        const chData = [calories, mets].map((nums, index) => {
            const data = {
                labels,
                datasets: [{
                    label: names[index],
                    data: nums,
                    borderWidth: 1,
                    backgroundColor: 'rgba(100, 162, 255, 0.5)'
            }]
        }
        const annotation = {
            type: 'line',
            borderColor: 'rgba(255, 0, 0, 0.5)',
            borderWidth: 1,
            label: activity.length ? {
                content: `${activity[1]?.name} ${names[index]}`,
                display: true
            } : {},
            scaleID: 'y',
            value: Number.parseFloat(current_activity[keys[index]])
        }
        const options = {
            plugins: {
                annotation: {
                    annotations: {
                        annotation
                    }
                }
            }
        }
        return { data, options }
        })
        setChartData(chData)
    }, [similar_activities])
    return (
        <Grid container sx={{ height: "94vh" }}>
            <Grid item xs={2}></Grid>
            <Grid item xs={8} sx={{ height: "20%", marginBottom: "3%" }}>
                <CardioSelector
                setActivity={setActivity}
                />
            </Grid>
            <Grid item xs={2}></Grid>
            <Grid item xs={6} sx={{ height: "90%", padding: "5%" }}>
                <Chart chartData={chartData} />
            </Grid>
            <Grid item xs={6}>
            <Card sx={{ width: "90%", height: "65%", marginTop: "5%", marginRight: "5%" }}>
                <DataGrid
                    density='compact'
                    rows={tableData}
                    columns={columns}
                    pageSize={100}
                    rowsPerPageOptions={[100]}
                    />
            </Card>
            </Grid>  
        </Grid>
    )
}