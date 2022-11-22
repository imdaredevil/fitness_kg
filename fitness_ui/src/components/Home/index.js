import React from "react";
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

export default function Home() {
      return (
        <Box
      sx={{
        paddingTop: "15%",
        width: "100vw",
        height: "100vh",
        backgroundImage:"url('background.jpeg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        textAlign: "center"
      }}>
      <Typography variant="h3" align="center">
            Welcome to GraphFit
      </Typography>
      <br></br>
      <Button variant="contained" margin="2%">
          <a href="/explore">LETS GO</a>
      </Button>
      </Box>
      );
    } 