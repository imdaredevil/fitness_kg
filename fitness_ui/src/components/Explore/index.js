import React, { useEffect, useState } from "react";
import { useReadCypher } from "use-neo4j";
import Grid from '@mui/material/Grid';
import QuerySelector from "./query_selector";
import RecordsTable from "./result_table";
import Graph from './graph';


export default function Explore() {
    const [queryArgs, setQueryArgs] = useState({ initial: true })
    const pageSize = 10
    const [indices, setIndices] = useState([0, pageSize])
    const { loading, run: queryRun, records: exercises } = useReadCypher(`MATCH (ex:Exercise) 
    MATCH (ex)-[:TARGETS]->(m)
    MATCH (ex)-[:USES_EQUIPMENT]->(eq)
    WHERE 1 = 1
    AND m.url IN $muscles
    AND eq.name IN $equipments
    AND ex.difficulty IN $difficulty
    AND ex.mechanics IN $mechanics
    AND ex.type IN $type
    return ex, m, eq`, { muscles: [], equipments: [], difficulty: [], mechanics: [], type: [], force_type: [] })
    useEffect(() => {
        queryRun(queryArgs)
    }, [queryArgs])
    return (
        <Grid container sx={{ height: "100vh" }}>
            <Grid item xs={3} sx={{ height: "60%" }}>
                <QuerySelector
                        setQuery={(newVals) => {setQueryArgs({ ...queryArgs, ...newVals, initial: false })}}
                />
            </Grid>
            <Grid item xs={9} sx={{ height: "60%" }}>
                <Graph graph_results={exercises || []} 
                    loading={loading} 
                    indices={indices}
                />
            </Grid>
            <Grid item xs={12} sx={{ height: "40%" }}>
                <RecordsTable loading={loading} exercises={exercises || []} 
                    setIndices={setIndices} 
                    pageSize={pageSize} />
            </Grid>
        </Grid>
    );
    } 