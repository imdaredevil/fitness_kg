import React, { useEffect, useState } from "react";
import { useReadCypher } from "use-neo4j";
import Grid from '@mui/material/Grid';
import QuerySelector from "./w_query_selector";
import { Card, List, ListItem, Typography, Box } from "@mui/material";

export default function Generate(props) {
    const [queryArgs, setQueryArgs] = useState(props.queryArgs || { initial: true })
    const [currentIndex, setCurrentIndex] = useState(0)
    const [workout_exercises, setWorkoutExercises] = useState([]) 
    const { loading, run: queryRun, records: exercises } = useReadCypher(`
    MATCH (n:Regime)-[:INCLUDES]->(ex)
    match (n)-[:INCLUDES]->(ex2)
    MATCH (ex)-[:TARGET]->(mu)
    match (ex2)-[:USES]->(eqs)
    where mu.name in $muscles
    with n, collect(distinct mu.name) as musc, 
    count(distinct ex.name) as correct_exercises,
    collect(distinct eqs.name) as equipment_used,
    collect(distinct ex2.difficulty) as difficulties,
    collect(distinct ex2.mechanics) as mechanics,
    collect(distinct ex2.type) as  types,
    collect(distinct ex2.force_type) as force_types
    match (n)-[:INCLUDES]->(exerc)
    where size(musc) = size($muscles)
    and size([eq in equipment_used where eq in $equipments]) = size(equipment_used)
    and size([diff in difficulties where diff in $difficulty]) = size(difficulties)
    and size([mech in mechanics where mech in $mechanics]) = size(mechanics)
    and size([type in types where type in $type]) = size(types)
    and size([ft in force_types where ft in $force_type]) = size(force_types)
    with n, collect(exerc) as exercises
    where size(exercises) <= 10
    return n.name as workout, exercises
    order by size(exercises) desc
    `, props.queryArgs)

    useEffect(() => {
        queryRun(queryArgs)
    }, [queryArgs])
    useEffect(() => {
        setQueryArgs(props.queryArgs)
    }, [props.queryArgs])
    const get_workout_exercises = (exercises) => {
        const workout = exercises[0]
        if(!workout) return []
        const ex = workout.get("exercises").map((x) => x.properties)
        console.log(ex[0])
        return ex
    }
    useEffect(() => {
        if(exercises) {
                setCurrentIndex(0)
                setWorkoutExercises(get_workout_exercises(exercises))
        }
    }, [exercises])

    const desc_comp = (ex) => (
            <Box sx={{ padding: "5%", height: "100%" }}>
                <Typography variant="h4">
                    {ex.name.charAt(0).toUpperCase() + ex.name.slice(1)}
                </Typography>
                <img src={ex.image_url} width="90%" style={{ padding: "5%" }}></img>
                <List>
                    <ListItem sx={{ padding:"3%", borderBottom: "solid 1.5px #cecece" }} key="difficulty"> 
                        <b>Difficulty: </b>  &nbsp; {ex.difficulty}
                    </ListItem>
                    <ListItem sx={{ padding:"3%", borderBottom: "solid 1.5px #cecece" }} key="equipment"> 
                        <b>Equipment: </b> &nbsp; {ex.equipment}
                    </ListItem>
                    <ListItem sx={{ padding:"3%", borderBottom: "solid 1.5px #cecece" }} key="force_type"> 
                        <b>Force: </b> &nbsp; {ex.force_type}
                    </ListItem>
                    <ListItem sx={{ padding:"3%", borderBottom: "solid 1.5px #cecece" }} key="mechanics"> 
                        <b>Mechanics: </b> &nbsp;  {ex.mechanics}
                    </ListItem>
                    {/* <ListItem sx={{ padding:"3%", borderBottom: "solid 1.5px #cecece" }} key="muscles"> 
                        <b>Muscles: </b> &nbsp;  
                        {ex.muscle.slice(1, ex.muscle.length - 1).trim().split(",").map(x => x.trim().slice(1, x.length - 1)).join(",")}
                    </ListItem> */}
                     <ListItem key="ins"> 
                        <b>Instructions: </b> &nbsp;
                    </ListItem>
                     <ListItem sx={{ paddingBottom:"3%", borderBottom: "solid 1.5px #cecece" }} key="instructions">
                        {ex.instructions}
                    </ListItem>
                    
                </List>
                
            </Box>
        )

   return (
     <Grid container sx={{ height: "94vh" }}>
            <Grid item xs={3} >
                <QuerySelector
                        setQuery={(newVals) => {setQueryArgs({ ...queryArgs, ...newVals, initial: false })}}
                        queryArgs={props.queryArgs}
                />
            </Grid>
            <Grid item xs={9}>
                <Card sx={{ height: "85vh", marginTop: "1.5%", marginLeft: "5%", width: "90%"}}>
                    <Grid container>
                        <Grid item xs={6} sx={{ borderRight: "solid 1.5px #cecece", height: "85vh",  overflowY: "scroll" }}>
                            <List height="100%">
                                {workout_exercises.map((ex, index) => {
                                    return (
                                        <ListItem sx={{ padding:"3%", borderBottom: "solid 1.5px #cecece" }} key={ex.name}
                                        onClick={() => setCurrentIndex(index)}>
                                            <Typography variant="h6">{ex.name.charAt(0).toUpperCase() + ex.name.slice(1)}</Typography>
                                        </ListItem>
                                    )
                                })}
                            </List>
                        </Grid>
                        <Grid item xs={6} sx={{ height: "85vh", overflowY: "scroll" }}>
                            {workout_exercises[currentIndex] && desc_comp(workout_exercises[currentIndex])}
                        </Grid>
                    </Grid>
                </Card>
            </Grid>
     </Grid> 
     )
    } 