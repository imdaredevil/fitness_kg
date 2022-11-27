import React, { useEffect, useState } from "react";
import { Grid, Box, Autocomplete, TextField, Card, Typography } from "@mui/material";
import { useReadCypher } from "use-neo4j";

export default function CardioSelector(props) {
    const key = "name"
    const label = "name"
    const { records: cardio } = useReadCypher("MATCH (m:Cardioexercise) RETURN m", {})
    const loading = (
        <Card sx={{ width: 275, height: "60%", marginTop: "5%", marginLeft: "5%" }}>
            Loading...
        </Card>
    )
    const cardioOptions = (cardio || []).map((m) => m.get('m').properties)
    const onChange = (e, option, action) => {
        props.setActivity(option)
    }
    const element = (
        <Card sx={{ width: 275, height: "60%", marginTop: "5%", marginLeft: "5%" }}>
        <Autocomplete
      id="cardio"
      options={cardioOptions}
      onChange={onChange}
      isOptionEqualToValue={
        (option1, option2) => (option1[key] == option2[key])
      }
      renderOption={(props, option, state) => {
        return (
          <li
            {...props}
          >
            <Typography>
                {option.name}
            </Typography>
            <br></br>
          </li>
        );
      }}
      getOptionLabel={option => option[label]}
      style={{ width: "90%", height: "10%", marginLeft: "5%", marginTop: "4%" }}
      renderInput={params => (
        <TextField
          {...params}
          variant="outlined"
          label="Activity"
        />
        )}
      />
        </Card>
    )
    if(cardio) {
        return element
    } else {
        return loading
    }
}