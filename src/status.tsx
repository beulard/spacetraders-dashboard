import React, { useEffect } from 'react';
import { useState } from "react"
import player from "./player"
import toast from "react-hot-toast"
import { Button, Col, Icon, Row, Typography } from 'lens-ui';

const Status = () => {
    const [name, setName] = useState("")
    const [credits, setCredits] = useState(-1)
    const [home, setHome] = useState("")
    const [loading, setLoading] = useState(true)

    const refresh = () => {
        setLoading(true)
        const promise = player.getAgentInfo()
        toast.promise(promise, {
            loading: "Fetching agent info",
            success: "Fetched agent",
            error: "Error, check console"
        })

        promise
            .then((res) => {
                const data = res.data.data
                setName(data.symbol)
                setCredits(data.credits)
                setHome(data.headquarters)
                setLoading(false)
            })
            .catch((err) => {
                console.log(err)
            })
    }

    useEffect(() => {
        refresh()
    }, [])

    return (
        <div>
            <Row style={{ maxWidth: "75%", height: "2.4em", margin: "auto", padding: "1em", alignItems: "center" }}>
                <Col sm><Typography variant="h6">${credits}</Typography></Col>
                <Col sm><Typography variant="h6">{name} from {home}</Typography></Col>
                <Col xs >
                    {loading ? <Icon fill="primary" spin={true} size="1.5em" name="AiOutlineLoading3Quarters" /> : <Button onClick={refresh}><Icon name="MdRefresh" /></Button>}
                </Col>
            </Row>
        </div>
    )
}

export { Status }