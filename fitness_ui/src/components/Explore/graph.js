import React, { useEffect, useRef, useState } from "react";
import { Network } from "vis-network";

export default function Graph (props) {
	// Create a ref to provide DOM access
    const [networkState, setNetworkState] = useState(null)
    const indices = props.indices
    const [workout_records, yoga_records] = props.graph_results
    const filtered_workout_records = workout_records.slice(indices[0][0], indices[0][1])
    const filtered_yoga_records = yoga_records.slice(indices[1][0], indices[1][1])
    const records = filtered_workout_records.concat(filtered_yoga_records)
    const focus_index = props.focusIndex
    const [graph_loading, setGraphLoading] = useState(true)
    if((!records?.length) && graph_loading) {
        setGraphLoading(false)
    }
    const nodeColorMap = {
        Workout: "#F48885",
        muscle: "#D4D7A8",
        anatomy: "#A596FF",
        equipment: "#A6DBF8",
        position: "#452E4F",
        Yoga: "#DEAF9F",
    }
    const createNode = (record, label_key, node_Type, id_key) => {
        const label = record[label_key]
        const chunkSize = 10;
        const chunks = []
        let nextPref = ""
        for (let i = 0; i < label.length; i += chunkSize) {
            let chunk = label.slice(i, i + chunkSize);
            let last = chunk.split(" ")
            last = last[last.length - 1]
            if (last.length <= 2) {
                chunk = chunk.slice(0, chunk.length - last.length);
            }
            if(chunk.length <= 2) {
                chunks[chunks.length - 1] += nextPref + chunk
            } else {
                chunks.push(nextPref + chunk)
            }
            if(last.length <= 2) {
                nextPref = last
            } else {
                nextPref = ""
            }
        }
        const node_label = chunks.join("\n") + nextPref
        return {
            label: node_label,
            id: record[id_key],
            color: nodeColorMap[node_Type]
        }
    }

    const getData = (curr_records) => {
        const [nodeSet, nodes, edges] = curr_records.reduce(([nodeSet, nodes, edges], record) => {
            nodes.push(createNode(record, "name", record["exercise_type"], "name"))
            if(!nodeSet.has(record.muscle)) {
                nodes.push(createNode(record, "muscle", "muscle", "muscle"))
                nodeSet.add(record.muscle)
            }
            if(record.equipment) {
                if(!nodeSet.has(record.equipment)) {
                    nodes.push(createNode(record, "equipment", "equipment", "equipment"))
                    nodeSet.add(record.equipment)
                }
                edges.push({ "from": record.name, "to": record.equipment, "label": "uses"})
            }
            edges.push({ "from": record.name, "to": record.muscle, "label": "targets"})

            // if (!nodeSet.has(exercise.name)) {
            //     nodes.push(createNode(exercise, "name", "exercise", "name"))
            //     nodeSet.add(exercise.name)
            // }
            // if (muscle && !nodeSet.has(muscle.name)) {
            //     nodes.push(createNode(muscle, "name", "muscle", "name"))
            //     nodeSet.add(muscle.name)
            // }
            // edges.push({ "from": exercise.name, "to": muscle.name, "label": "targets"})
            // const equipment = record.get('eq') && record.get('eq')?.properties
            // if (equipment && !nodeSet.has(equipment.name)) {
            //     nodes.push(createNode(equipment, "name", "equipment", "name"))
            //     nodeSet.add(equipment.name)
            // }
            // if(equipment) {
            //     edges.push({ "from": exercise.name, "to": equipment.name, "label": "uses"})
            // }
            return [nodeSet, nodes, edges]
        }, [new Set(), [], []])
        return { nodes, edges }
    }
    const options =  {
            nodes: {
                shape: "ellipse" 
            },
            edges: {
                color: "black"
            },
            physics: {
            forceAtlas2Based: {
                gravitationalConstant: -30,
                centralGravity: 0.005,
                springLength: 230,
                springConstant: 0.18,
                avoidOverlap: 5.0
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
    const data = getData(records)
    const visJsRef = useRef(null)
    const networkRef = useRef(null)
	useEffect(() => {
        setGraphLoading(true)
        const network =
			visJsRef.current &&
			new Network(visJsRef.current, data, options);
            if(network) {
                network.on("stabilizationIterationsDone", function () {
                    network.setOptions({ physics: false })
                    setGraphLoading(false)
              });
              if(!networkState) {
                setNetworkState(network)
              }
            //   setNetworkState(network)
            //   props.setNetwork(network)
            }
        networkRef.current = network
        setGraphLoading(false)
	}, [visJsRef, props.exercises, indices]);
    useEffect(() => {
        if(networkRef.current && focus_index) {
            networkRef.current.fit({
               nodes: [focus_index] })
        }
        
    }, [focus_index])

    return <div ref={visJsRef} style={{ height: '100%', width: '100%' }} />
};