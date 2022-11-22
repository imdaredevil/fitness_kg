import React, { useEffect, useState } from "react";
import { useReadCypher } from "use-neo4j";
import Grid from '@mui/material/Grid';
import QuerySelector from "./query_selector";
import RecordsTable from "./result_table";

export default function Explore() {
    const [queryArgs, setQueryArgs] = useState({ initial: true })
    const { loading, run: queryRun, records: exercises } = useReadCypher(`MATCH (ex:Exercise) 
    MATCH (ex)-[:TARGETS]->(m)
    MATCH (ex)-[:USES_EQUIPMENT]->(eq)
    WHERE 1 = 1
    AND m.url IN $muscles
    AND eq.name IN $equipments
    return ex, m, eq`, { muscles: [], equipments: [] })
    useEffect(() => {
        queryRun(queryArgs)
    }, [queryArgs])
    return (
        <Grid container sx={{ height: "100vh", paddingTop: "3%" }}>
            <Grid item xs={3}>
                <QuerySelector
                        setQuery={(newVals) => {setQueryArgs({ ...queryArgs, ...newVals, initial: false })}}
                />
            </Grid>
            <Grid item xs={9} sx={{padding: "1%" }}>
                <RecordsTable loading={loading} exercises={exercises || []} />
            </Grid>
        </Grid>
    );
    } 