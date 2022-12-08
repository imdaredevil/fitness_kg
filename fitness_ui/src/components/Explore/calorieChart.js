import React, { useEffect, useState } from "react";
import { Box, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { Bar } from 'react-chartjs-2';

export default function Chart(props) {
    const [tab, setTab] = useState("calorie")
    const chartData = props.chartData

    const calorieChart = (
        <Bar
        data={chartData[0].data}
        options={chartData[0].options}
        />
        )
    const metChart = (
        <Bar
        data={chartData[1].data}
        options={chartData[1].options}
        />
        )

    const TabPanels = {
        calorie: calorieChart,
        met: metChart
    }
    return (
        <Box>
        <ToggleButtonGroup
            value={tab}
            exclusive
            sx={{ marginTop: "0.25%", alignItems: "center", justifyContent: "center" }}
            onChange={(event, tab) => setTab(tab)}
            aria-label="current tab"
        >
      <ToggleButton value="calorie" aria-label="calorie">
        <Typography>CARDIO</Typography>
      </ToggleButton>
      <ToggleButton value="met" aria-label="calorie">
        <Typography>MET</Typography>
      </ToggleButton>
    </ToggleButtonGroup>
        {TabPanels[tab]}
        </Box>
    )
}