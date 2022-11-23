import React, { useEffect, useRef, useState } from "react";
import { Network } from "vis-network";

export default function Graph (props) {
	// Create a ref to provide DOM access
    const [networkState, setNetworkState] = useState(null)
    const records = props.graph_results.slice(props.indices[0], props.indices[1])
    const [graph_loading, setGraphLoading] = useState(true)
    if((!records?.length) && graph_loading) {
        setGraphLoading(false)
    }
    const nodeColorMap = {
        exercise: "#F48885",
        muscle: "#D4D7A8",
        anatomy: "#A596FF",
        equipment: "#A6DBF8",
        position: "#452E4F",
        workout: "#DEAF9F"
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
            const exercise = record.get('ex').properties
            if (!nodeSet.has(exercise.url)) {
                nodes.push(createNode(exercise, "name", "exercise", "url"))
                nodeSet.add(exercise.url)
            }
            const muscle = (record.get('m') && record.get('m').properties)
            if (muscle && !nodeSet.has(muscle.url)) {
                nodes.push(createNode(muscle, "name", "muscle", "url"))
                nodeSet.add(muscle.url)
            }
            edges.push({ "from": exercise.url, "to": muscle.url, "label": "targets"})
            const equipment = record.get('eq') && record.get('eq').properties
            if (equipment && !nodeSet.has(equipment.name)) {
                nodes.push(createNode(equipment, "name", "equipment", "name"))
                nodeSet.add(equipment.name)
            }
            edges.push({ "from": exercise.url, "to": equipment.name, "label": "uses"})
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

    const visJsRef = useRef(null)
	useEffect(() => {
        setGraphLoading(true)
        const data = getData(records)
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
        setGraphLoading(false)
	}, [visJsRef, records]);
    return <div ref={visJsRef} style={{ height: '100%', width: '100%' }} />
};