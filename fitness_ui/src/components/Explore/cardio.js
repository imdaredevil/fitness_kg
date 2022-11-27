import React, { useEffect, useState } from "react";
import { Grid, Box, Autocomplete, TextField, Card, Typography } from "@mui/material";
import { useReadCypher } from "use-neo4j";
import CardioSelector from "./cardio_selector";
import { Bar } from 'react-chartjs-2';
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



export default function Cardio() {
    const [activity, setActivity] = useState(null)
    const [chartData, setChartData] = useState(Array(2).fill({
        data: {
        labels: [],
        datasets: []
        },
        options: {}
    }))
    const { records: similar_activities, loading, run: queryRun, error } = useReadCypher(`
    MATCH (m:Cardioexercise { name: $activity })-[:BURNS]->(calorie)
    MATCH (n:Cardioexercise)-[:BURNS]->(calorie)
    where (toInteger(calorie.end) - toInteger(calorie.start)) <= 100
    RETURN n, calorie, m
    ORDER BY abs(toInteger(n.calories) - toInteger(m.calories))
    limit 11
    `, { activity: "" })
    useEffect(() => {
        queryRun({ activity: activity?.name || "" })
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
        }).filter((x) => x.name != activity.name).slice(0, 10)
        const labels = data.map(x => x.name)
        const calories = data.map(x => Number.parseFloat(x.calories))
        const mets = data.map(x => Number.parseFloat(x.met))
        const current_activity = data[0]?.current_activity || { "calories": 0, "met": 0}
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
            label: activity ? {
                content: `${activity?.name} ${names[index]}`,
                display: true
            } : {},
            scaleID: 'y',
            value: Number.parseFloat(current_activity[keys[index]])
        }
        console.log(annotation)
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
    const calorieChart = (
        <Grid item xs={6} sx={{ height: "90%", padding: "2%" }}>
            <Bar
            data={chartData[0].data}
            options={chartData[0].options}
            />
        </Grid>
    )
    const metChart = (
        <Grid item xs={6} sx={{ height: "90%",  padding: "2%" }}>
            <Bar
            data={chartData[1].data}
            options={chartData[1].options}
            />
        </Grid>
    )
    return (
        <Grid container sx={{ height: "94vh" }}>
            <Grid item xs={12} sx={{ height: "20%", marginBottom: "3%" }}>
                <CardioSelector
                setActivity={setActivity}
                />
            </Grid>
            {calorieChart}
            {metChart}
        </Grid>
    )
}