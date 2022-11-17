import React, { useEffect, useRef } from "react";
import rd3 from 'react-d3-library';

export default function Graph (props) {
	// Create a ref to provide DOM access
    const records = props.graph_results.slice(0, 100) || []
	const visJsRef = useRef(null)
	useEffect(() => {
		const [nodeSet, nodes, edges] = records.reduce(([nodeSet, nodes, edges], record) => {
            const exercise = record.get('ex').properties
            if (!nodeSet.has(exercise.url)) {
                nodes.push({
                    "label": exercise.name,
                    "url": exercise.url,
                    "node_Type": "Exercise",
                    "id": exercise.url
                })
                nodeSet.add(exercise.url)
            }
            const muscle = (record.get('m') && record.get('m').properties)
            if (muscle && !nodeSet.has(muscle.url)) {
                nodes.push({
                    "label": muscle.name,
                    "url": muscle.url,
                    "node_Type": "Muscle",
                    "id": muscle.url
                })
                nodeSet.add(muscle.url)
                edges.push({ "from": exercise.url, "to": muscle.url, "label": "targets"})
            }
            const equipment = record.get('eq') && record.get('eq').properties
            if (equipment && !nodeSet.has(equipment.name)) {
                nodes.push({
                    "label": equipment.name,
                    "node_Type": "Equipment",
                    "id": equipment.name
                })
                nodeSet.add(equipment.name)
                edges.push({ "from": exercise.url, "to": equipment.name, "label": "uses"})
            }
            console.log([exercise.url, equipment?.name, muscle?.url])
            return [nodeSet, nodes, edges]
        }, [new Set(), [], []])
        console.log(nodes)
        console.log(edges)
        const data = {
            nodes, edges
        }
        const network =
			visJsRef.current &&
			new Network(visJsRef.current, data, {});
	}, [visJsRef]);
	return <div ref={visJsRef} style={{ height: '90vh', width: '100%' }} />;
};