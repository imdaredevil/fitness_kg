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
        muscles: (muscles || []).map((m) => m.get('m').properties),
        equipments: (equipments || []).map((m) => m.get('m').properties) 
    }
    const element = (
        <Card sx={{ minWidth: 275, minHeight: "90vh", marginLeft: "5%" }}>
            <CardContent>
            <CheckboxesTags
                options={filters.muscles}
                keyname='url'
                setSelected={(values) => props.setQuery({ muscles: values })}
            />
            <CheckboxesTags
                options={filters.equipments}
                keyname='name'
                setSelected={(values) => props.setQuery({ equipments: values })}
            />
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
            const curr_query = {
                muscles: filters.muscles.map((x) => x.url),
                equipments: filters.equipments.map((x) => x.name)
            }
            props.setQuery(curr_query)
        }, 1000)
        setInitial(false)
    }
    return (muscles && equipments) ? element : loading;
    } 