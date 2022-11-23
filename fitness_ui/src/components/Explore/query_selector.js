import React, { useState } from "react";
import { useReadCypher } from "use-neo4j";
import CardContent from '@mui/material/CardContent';
import Card from '@mui/material/Card';
import CheckboxesTags from './form_dropdown';

export default function QuerySelector(props) {
    const [initial, setInitial] = useState(true)
    const { records: muscles } = useReadCypher("MATCH (m:Muscle) RETURN m", {})
    const { records: equipments } = useReadCypher("MATCH (m:Equipment) RETURN m", {})
    let filters = {
        muscles: {
            name: "Muscles",
            key: "url",
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
            values: ["unknown", "beginner", "intermediate", "advanced"].map((x) => {return { name: x }})
        },
        mechanics: {
            name: "Mechanics",
            key: "name",
            values: ["unknown", "isolation", "compound"].map((x) => {return { name: x }})
        },
        type: {
            name: "Type",
            key: "name",
            values: ["unknown", "strength", "warmup", "smr", "powerlifting"].map((x) => {return { name: x }})
        },
        force_type: {
            name: "Force",
            key: "name",
            values: ["unknown", "beginner", "intermediate", "advanced"].map((x) => {return { name: x }})
        }

    }
    const element = (
        <Card sx={{ minWidth: 275, height: "90%", marginTop: "5%", marginLeft: "5%" }}>
            <CardContent sx={{ overflowY: "scroll" }}>
            {Object.keys(filters).map(filter => (
                <CheckboxesTags
                options={filters[filter].values}
                keyname={filters[filter].key}
                name={filters[filter].name}
                setSelected={(values) => props.setQuery({ [filter]: values })}
                />
            ))}
            </CardContent>
        </Card>
    )
    const loading = (
        <Card>
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