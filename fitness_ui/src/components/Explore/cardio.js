import React, { useEffect, useState } from "react";
import { Grid, Box, Autocomplete, TextField, Card, Typography } from "@mui/material";
import { useReadCypher } from "use-neo4j";
import CardioSelector from "./cardio_selector";


export default function Cardio() {
    const [activity, setActivity] = useState(null)
    const { records: similar_activities, loading, run: queryRun } = useReadCypher(`
        MATCH (m:Cardioexercise { name: $activity })-[:BURNS]->(calorie)
        MATCH (n:Cardioexercise)-[:BURNS]->(calorie)

    
    `)
    useEffect(() => {
        console.log(activity)
    }, [activity])
    return (
        <Grid container sx={{ height: "94vh" }}>
            <Grid item xs={12} sx={{ height: "60%" }}>
                <CardioSelector
                setActivity={setActivity}
                />
            </Grid>
        </Grid>
    )
}