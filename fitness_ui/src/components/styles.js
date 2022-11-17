import React from 'react';
import  { Container, Button as BootstrapButton, Row, Col } from 'react-bootstrap';


const PlainText = (props) => {
    const newStyle = {
        ...props.style,
    }
    const newClassName = "fw-light " + (props.className || '');
    const newProps = {...props, style: newStyle, className: newClassName};
    return (<p {...newProps}>{props.children}</p>);
}

const BoldText = (props) => {
    const newStyle = {
        ...props.style,
    }
    const newClassName = "fs-4 fw-bold " + (props.className || '');
    const newProps = {...props, style: newStyle, className: newClassName};
    return (<p {...newProps}>{props.children}</p>);
}

const HeadingText = (props) => {
    const newStyle = {
        ...props.style,
    }
    const newClassName = "fs-1 lh-1 fw-bolder" + (props.className || '');
    const newProps = {...props, style: newStyle, className: newClassName};
    return (<p {...newProps}>{props.children}</p>);
}

const Link = (props) => {
    const newStyle = {
        color: "inherit",
        ...props.style,
    };
    const newClassName = "" + (props.className || '');
    const newProps = {...props, style: newStyle, className: newClassName};
    return (<p {...newProps}>{props.children}</p>);
}

const FullWidthContainer = (props) => {
    const newStyle = {
        paddingRight: "25px", 
        marginRight: "-25px", 
        width: "calc(100vw + 25px)",
        ...props.style,
    };
    const newClassName = "" + (props.className || '');
    const newProps = {...props, style: newStyle, className: newClassName};
    return (<Container {...newProps} fluid></Container>);
}

const JustifiedText = (props) => {
    const newStyle = {
        textAlign: "justify",
        ...props.style,
    }
    const newClassName = "fs-5 " + (props.className || '');
    const newProps = {...props, style: newStyle, className: newClassName};
    return (<PlainText {...newProps}>{props.children}</PlainText>);
}


const CenterJustifiedText = (props) => {
    const newStyle = {
        textAlignLast: "center", 
        ...props.style,
    }
    const newClassName = "fs-5 " + (props.className || '');
    const newProps = {...props, style: newStyle, className: newClassName};
    return (<JustifiedText {...newProps}>{props.children}</JustifiedText>);
}

const Button = (props) => {
    const newStyle = {
        backgroundColor: "rgb(0,47,107)", 
        borderRadius: "0", 
        marginTop: "10px", 
        ...props.style,
    }
    const newClassName = "fw-bolder " + (props.className || '');
    const newProps = {...props, style: newStyle, className: newClassName};
    return (<BootstrapButton {...newProps}>{props.children}</BootstrapButton>);
}



const styles = {
    PlainText,
    HeadingText,
    Link,
    FullWidthContainer,
    JustifiedText,
    CenterJustifiedText,
    Button, 
    BoldText,
    Row,
    Col,
    Container
}

export default styles;