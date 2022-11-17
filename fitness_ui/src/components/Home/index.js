import React from "react";
import styles from "./styles";

const { FullWidthContainer, Button, BoldText, CenterJustifiedText } = styles;

export default function Home() {
      return (
        <FullWidthContainer style={{ backgroundImage:"url('background.jpeg')", height: "100vh", backgroundSize: "cover", backgroundPosition: "center" }}>
        <CenterJustifiedText style={{ paddingTop: "10%" }}>
            <BoldText>
                Welcome to GraphFit
            </BoldText>
            <a href="/explore">
              <Button>
                  LETS GO
              </Button>
            </a>
        </CenterJustifiedText>
        </FullWidthContainer>

      );
    } 