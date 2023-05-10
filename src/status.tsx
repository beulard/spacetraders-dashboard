import React, { useEffect } from 'react';
import { FunctionComponent, useState } from "react"
import player from "./player"
import { DisplayMessageFunc } from './common';

const Status = (props: {displayMessage: DisplayMessageFunc}) => {
    const [name, setName] = useState("")
    const [credits, setCredits] = useState(-1)
    const [home, setHome] = useState("")

    useEffect(() => {
        player.getAgentInfo((symbol, headquarters, credits) => {
            setName(symbol)
            setCredits(credits)
            setHome(headquarters)
            props.displayMessage("OK", "info", 1000)
        })
    }, [])

    return (
        <div style={{ display: "flex", minWidth: 50 }}>
            <span style={{ margin: "auto" }}>{name} from {home}</span><span style={{ margin: "auto" }}>${credits}</span>
        </div>
    )
}

export { Status }