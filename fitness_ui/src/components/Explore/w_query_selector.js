import React, { useState } from "react";
import { useReadCypher } from "use-neo4j";
import CardContent from '@mui/material/CardContent';
import Card from '@mui/material/Card';
import CheckboxesTags from './form_dropdown';
import { Paper, Typography } from "@mui/material";

export default function QuerySelector(props) {
    const [initial, setInitial] = useState(true)
    const { records: muscles } = useReadCypher("MATCH (m) where LABELS(m)[0] in [\"Muscles\", \"Anatomy\"] RETURN m", {})
    const { records: equipments } = useReadCypher("MATCH (m:Equipment) RETURN m", {})
    let filters = {
        muscles: {
            name: "Anatomy",
            key: "name",
            values: (muscles || []).map((m) => m.get('m').properties),
        },
        equipments: {
            name: "Equipments",
            key: "name",
            values: (equipments || []).map((m) => m.get('m').properties)
        },
        difficulty: {
            name: "Difficulty",
            key: "name",
            values: ["beginner", "intermediate", "advanced"].map((x) => {return { name: x }})
        },
        mechanics: {
            name: "Mechanics",
            key: "name",
            values: ["isolation", "compound"].map((x) => {return { name: x }})
        },
        type: {
            name: "Type",
            key: "name",
            values: ["strength", "warmup", "smr", "powerlifting"].map((x) => {return { name: x }})
        },
        force_type: {
            name: "Force",
            key: "name",
            values: [
                       "push",
                       "pull", 
                       "compression",    
                       "isometric",        
                       "pull",        
                       "push (unilateral)", 
                       "hinge (bilateral)",
                       "push (bilateral)",  
                       "static",            
                       "pull (bilateral)",  
                       "hinge (unilateral)",
                       "pull (unilateral)", 
                       "push",              
                       "n/a",               
                       "dynamic stretching",
                       "static stretching",
                       "press (bilateral)"].map((x) => {return { name: x }})
        },
        exercise_type: {
            name: "Exercise Type",
            key: "name",
            values: [
                "Yoga",
                "Workout"
            ].map((x) => {return { name: x }})
        }
    }
    Object.keys(filters).map((filter_name) => {
        let defaultValue = [{ "name": "Select All"}]
        if(props.queryArgs && props.queryArgs[filter_name] 
            && props.queryArgs[filter_name].length < filters[filter_name].values.length) {
            defaultValue = props.queryArgs[filter_name].map((x) => {return { name: x }})
        }
        filters[filter_name] = {
            ...filters[filter_name],
            defaultValue: defaultValue
        }
    })
    const common_filters = ["muscles"]
    const gym_specific_filters = ["equipments", "difficulty", "mechanics", "type", "force_type"]
    const element = (
        <Card sx={{ minWidth: 275, height: "57vh", marginTop: "5%", marginLeft: "5%" }}>
            <CardContent sx={{ maxHeight: "60vh", overflowY: "scroll" }}>
            {common_filters.map(filter => (
                <CheckboxesTags
                options={filters[filter].values}
                keyname={filters[filter].key}
                key={filters[filter].name}
                name={filters[filter].name}
                setSelected={(values) => props.setQuery({ [filter]: values })}
                defaultValue={filters[filter].defaultValue}
                />
            ))}
            {gym_specific_filters.map(filter => (
                <CheckboxesTags
                options={filters[filter].values}
                keyname={filters[filter].key}
                key={filters[filter].name}
                name={filters[filter].name}
                setSelected={(values) => props.setQuery({ [filter]: values })}
                defaultValue={filters[filter].defaultValue}
                />
            ))}
            </CardContent>
        </Card>
    )
    const loading = (
        <Card sx={{ minWidth: 275, height: "90%", marginTop: "5%", marginLeft: "5%" }}>
            Loading...
        </Card>
    )
    if(muscles && equipments && initial) {
        setTimeout(() => {
            const curr_query = Object.keys(filters).reduce((x, filter) => {
                x[filter] = filters[filter].values.map((x) => x[filters[filter].key])
                return x
            }, {})
            props.setQuery(curr_query)
        }, 1000)
        setInitial(false)
    }
    return (muscles && equipments) ? element : loading;
    } 