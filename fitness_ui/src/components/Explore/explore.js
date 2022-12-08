import React, { useEffect, useState } from "react";
import { useReadCypher } from "use-neo4j";
import Grid from '@mui/material/Grid';
import QuerySelector from "./query_selector";
import RecordsTable from "./result_table";
import Graph from './graph';
import Papa from 'papaparse';


export default function Explorer(props) {
    const change_to_string = (string) => {
        string = string.slice(1, string.length - 1)
        const { data } = Papa.parse(string)
        const result = data.map((x) => x.slice(1, x.length - 1)).join(",")
        return result

    }
    const getRecords = (exercises) => {
        const getRecord = (record, index) => {
            const exercise = record.get('ex').properties;
            const exercise_type = record.get('ex').labels.includes('Yoga') ? "Yoga" : "Workout"
            const muscles = record.get('m').properties;
            const equipments = record.get('eq')?.properties
            const result = {
                real_index: index + 1,
                ...exercise,
                name_key: exercise.url,
                muscle: muscles.name,
                muscle_key: muscles.url,
                equipment: equipments?.name,
                equipment_key: equipments?.name,
                exercise_type: exercise_type
            }
            if(result.exercise_type == "Yoga") {
                result.target_areas = change_to_string(result.target_areas)
                result.variation = change_to_string(result.variation)
                result.pose_Type = change_to_string(result.pose_Type)
            }
            return result

        }
        const records = exercises.map(getRecord)
        const [exercise_names, unique_records] = records.reduce((x, y) => {
            if (!x[0].has(y.name)) {
                x[0].add(y.name)
                x[1].push(y)
            }
            return x
        }, [new Set(), []])
        const yoga_records = unique_records.filter((x) => x.exercise_type == "Yoga").map((x, index) => { return {id: index + 1, ...x}})
        const workout_records = unique_records.filter((x) => x.exercise_type == "Workout").map((x, index) => { return {id: index + 1, ...x}})
        return [workout_records, yoga_records]
    }


    const [queryArgs, setQueryArgs] = useState({ initial: true })
    const [records, setRecords] = useState([[], []])
    const pageSize = 10
    const [indices, setIndex] = useState([[0, pageSize], [0, pageSize]])
    const [focusIndex, setFocusIndex] = useState(null)
    const { loading, run: queryRun, records: exercises } = useReadCypher(`MATCH (ex:Workout) 
    MATCH (ex)-[:TARGET]->(m)
    MATCH (ex)-[:USES]->(eq)
    where (m.name IN $muscles)
    AND eq.name IN $equipments
    AND ex.difficulty IN $difficulty
    AND ex.mechanics IN $mechanics
    AND ex.type IN $type
    AND ex.force_type IN $force_type
    AND LABELS(ex)[0] IN $exercise_type
    return ex, m, eq
    UNION
    MATCH (ex:Workout) 
    MATCH (ex)-[:TARGET]->(mu)
    MATCH (mu)-[:PART_OF]->(m)
    MATCH (ex)-[:USES]->(eq)
    where (m.name IN $muscles)
    AND eq.name IN $equipments
    AND ex.difficulty IN $difficulty
    AND ex.mechanics IN $mechanics
    AND ex.type IN $type
    AND ex.force_type IN $force_type
    AND LABELS(ex)[0] IN $exercise_type
    return ex, m, eq
    UNION
    MATCH (ex:Yoga)
    MATCH (ex)-[:TARGET]->(m)
    where (m.name IN $muscles)
    AND LABELS(ex)[0] IN $exercise_type
    return ex, m, null as eq
    UNION
    MATCH (ex:Yoga)
    MATCH (ex)-[:TARGET]->(mu)
    MATCH (mu)-[:PART_OF]->(m)
    where (m.name IN $muscles)
    AND LABELS(ex)[0] IN $exercise_type
    return ex, m, null as eq`, { muscles: [], equipments: [], difficulty: [], mechanics: [], type: [], force_type: [], exercise_type: [] })
    useEffect(() => {
        props.setQueryArgs(queryArgs)
        queryRun(queryArgs)
    }, [queryArgs])
    useEffect(() => {
        setRecords(getRecords(exercises || []))
    }, [exercises])
    const setIndices = (x, index) =>  { 
        const curr_indices = [...indices]; 
        curr_indices[index] = x; setIndex(curr_indices) }
    return (
        <Grid container sx={{ height: "94vh" }}>
            <Grid item xs={3} sx={{ height: "60%" }}>
                <QuerySelector
                        setQuery={(newVals) => {setQueryArgs({ ...queryArgs, ...newVals, initial: false })}}
                />
            </Grid>
            <Grid item xs={9} sx={{ height: "60%" }}>
                <Graph graph_results={getRecords(exercises || [])}
                    exercises={exercises}
                    loading={loading} 
                    indices={indices}
                    focusIndex={focusIndex}
                />
            </Grid>
            <Grid item xs={12} sx={{ height: "40%" }}>
                <RecordsTable loading={loading} exercises={records}
                    setIndices={setIndices}
                    indices={indices}
                    setFocusIndex={setFocusIndex}
                    pageSize={pageSize} />
            </Grid>
        </Grid>
    );
    } 