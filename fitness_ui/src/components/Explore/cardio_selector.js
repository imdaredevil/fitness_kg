import React, { useEffect, useState } from "react";
import { Grid, Box, Autocomplete, TextField, Card, Typography, Slider } from "@mui/material";
import { useReadCypher } from "use-neo4j";

export default function CardioSelector(props) {
    const key = "name"
    const label = "name"
    const [options, setOptions] = useState([undefined, undefined, 40])
    useEffect(() => {
      props.setActivity(options)
    }, [options])
    const { records: cardio } = useReadCypher("MATCH (m:Cardioexercise) RETURN m", {})
    const loading = (
        <Card sx={{ width: "80vw", height: "50%", marginTop: "5%", marginLeft: "5%" }}>
            Loading...
        </Card>
    )
    const cardioOptions = (cardio || []).map((m) => m.get('m').properties)
    const onChange = (e, option, action) => {
        setOptions([options[0], option, options[2]])
    }
    const onChangeValue = (e) => {
      setOptions([e.target.value, options[1], options[2]])
    }

    const onChangeSlider = (e, v) => {
      setOptions([options[0], options[1], v])
    }
    const marks = []
    for(let i=10;i<=100;i+=10) {
      marks.push({
        value: i,
        label: `${i}`
      })
    }
    const element = (
        <Card sx={{ width: "90%", height: "85%", marginTop: "5%", marginLeft: "5%", display: "flex", alignItems: "center" }}>
        <Grid container>
        <Grid item xs={9} sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
            <Slider
              aria-label="NumberOfExercises"
              defaultValue={40}
              valueLabelDisplay="off"
              step={10}
              marks={marks}
              size="small"
              min={10}
              max={100}
              sx={{ width: "90%", paddingBottom: "5%" }}
              onChange={onChangeSlider}
            />
            </Grid>
            <Grid item xs={3} sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Typography variant="h5" textAlign={"center"}>
              {options[2]} Exercises
            </Typography>
            </Grid>
            <Grid item xs={2.5} sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Typography variant="h5" textAlign={"center"}>
              Similar to
            </Typography>
            </Grid>
            <Grid item xs={2.5} sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <TextField
                id="equivalence"
                type="number"
                variant="standard"
                defaultValue={1}
                sx={{ width: "90%" }}
                onChange={onChangeValue}
              />
            </Grid>
            <Grid item xs={2.5} sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Typography variant="h5" textAlign={"center"}>
              times of
            </Typography>
            </Grid>
            <Grid item xs={4.5} sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
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
                style={{ width: "90%"  }}
                renderInput={params => (
                  <TextField
                    {...params}
                    variant="outlined"
                    label="Activity"
                  />
                  )}
                />
            </Grid>
        </Grid>
        </Card>
    )
    if(cardio) {
        return element
    } else {
        return loading
    }
}