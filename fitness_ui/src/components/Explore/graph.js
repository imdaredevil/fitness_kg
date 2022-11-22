import React, { useEffect, useRef, useState } from "react";
import { Network } from "vis-network";

export default function Graph (props) {
	// Create a ref to provide DOM access
    const records = props.graph_results.slice(props.indices[0], props.indices[1])
    console.log(props.indices, props.graph_results.length, records.length)
    const [graph_loading, setGraphLoading] = useState(true)
    if((!records?.length) && graph_loading) {
        setGraphLoading(false)
    }
    const visJsRef = useRef(null)
	useEffect(() => {
        setGraphLoading(true)
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
            }
            edges.push({ "from": exercise.url, "to": muscle.url, "label": "targets"})
            const equipment = record.get('eq') && record.get('eq').properties
            if (equipment && !nodeSet.has(equipment.name)) {
                nodes.push({
                    "label": equipment.name,
                    "node_Type": "Equipment",
                    "id": equipment.name
                })
                nodeSet.add(equipment.name)
            }
            edges.push({ "from": exercise.url, "to": equipment.name, "label": "uses"})
            return [nodeSet, nodes, edges]
        }, [new Set(), [], []])
        const data = {
            nodes, edges
        }
        const options =  {
            physics: {
            forceAtlas2Based: {
                gravitationalConstant: -26,
                centralGravity: 0.005,
                springLength: 230,
                springConstant: 0.18,
                avoidOverlap: 3.0
            },
            maxVelocity: 146,
            solver: 'forceAtlas2Based',
            timestep: 0.35,
            stabilization: {
                enabled: true,
                iterations: 1000,
                updateInterval: 25
            }
        }
    }
        const network =
			visJsRef.current &&
			new Network(visJsRef.current, data, options);
        if(network) {
            network.on("stabilizationIterationsDone", function () {
                network.setOptions( { physics: false } ); 
                setGraphLoading(false)
          });
        } 
        setGraphLoading(false)
	}, [visJsRef, records]);
    return (graph_loading || props.loading) ? (<div>Loading....</div>) : (<div ref={visJsRef} style={{ height: '50vh', width: '100%' }} />)
};