import React, { useState } from "react";
import { Card } from "react-bootstrap";
import styles from "./styles";
import Multiselect from 'multiselect-react-dropdown';
import { useReadCypher } from "use-neo4j";
import Graph from "./graph";

const { FullWidthContainer, Row, Col, PlainText } = styles;

export default function Explore() {
    let { records: exercises } = useReadCypher(`MATCH (ex:Exercise) 
    MATCH (ex)-[:TARGETS]->(m)
    MATCH (ex)-[:USES]->(eq)
    return ex, m, eq`)
    let { records: muscles } = useReadCypher("MATCH (m:Muscle) RETURN m", {})
    let { records: equipments } = useReadCypher("MATCH (m:Equipment) RETURN m", {})
    if (!(muscles && equipments && exercises)) {
        return <div>Loading......</div>
    }
    muscles = muscles.map((m) => m.get('m').properties)
    equipments = equipments.map((m) => m.get('m').properties)
    return (
        <FullWidthContainer style={{ height: "100vh", paddingTop: "3%", backgroundColor: "#ffffffff" }}>
            <Row>
                <Col xs={3} style={{ padding: "1%" }}>
                    <Card style={{ backgroundColor: "#dcdde2ff" }}>
                    <PlainText>
                        Target Muscles
                    </PlainText>
                    <Multiselect
                    options={muscles}
                    displayValue="name"
                    />
                    <PlainText>
                        Available Equipment
                    </PlainText>
                    <Multiselect
                    options={equipments}
                    displayValue="name"
                    />
                    </Card>
                </Col>
                <Col xs={9}>
                    <Graph graph_results={exercises || []}/>
                </Col>
            </Row>
        </FullWidthContainer>

      );
    } 