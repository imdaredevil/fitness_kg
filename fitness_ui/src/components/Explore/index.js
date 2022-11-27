import React, { useEffect, useState } from "react";
import { Box, AppBar, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import Explorer from "./explore";
import Cardio from "./cardio";

export default function Explore() {
    const [tab, setTab] = useState("explore")

    const TabPanels = {
        explore: (<Explorer></Explorer>),
        cardio: (<Cardio></Cardio>)
    }
    return (
        <Box sx={{ height: "100vh" }}>
        <AppBar position="static" sx={{ height: "6vh", backgroundColor: "white" }}>
        <ToggleButtonGroup
            value={tab}
            exclusive
            sx={{ marginTop: "0.25%", alignItems: "center", justifyContent: "center" }}
            onChange={(event, tab) => setTab(tab)}
            aria-label="current tab"
        >
      <ToggleButton value="explore" aria-label="explore" sx={{ padding: "0.5%"}}>
        <Typography>EXPLORE</Typography>
      </ToggleButton>
      <ToggleButton value="cardio" aria-label="cardio" sx={{ padding: "0.5%"}}>
        <Typography>CARDIO</Typography>
      </ToggleButton>
      <ToggleButton value="generate" aria-label="generate" sx={{ padding: "0.5%"}}>
        <Typography>GENERATE</Typography>
      </ToggleButton>
    </ToggleButtonGroup>
        </AppBar>
        {TabPanels[tab]}
        </Box>
    )
}