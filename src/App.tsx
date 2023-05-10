import React from 'react';
import { Alert, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import { useState } from 'react';
import player from './player'
import { Status } from './status';
import { DisplayMessageFunc } from './common';

class MessageState {
  show: boolean;
  variant: string;
  message: string;

  constructor(show: boolean = false, variant: string = "", message: string = "") {
    this.show = show;
    this.variant = variant;
    this.message = message;
  }
}

function App() {
  const [message, setMessage] = useState(new MessageState())

  const displayMessage: DisplayMessageFunc = (message: string, variant: string, timeout_ms: number) => {
    setMessage(new MessageState(true, variant, message))
    if (timeout_ms > 0) {
      setTimeout(() => setMessage(new MessageState()), timeout_ms)
    }
  }

  const onNew = () => {
    const url = "https://api.spacetraders.io/v2/register"
    const header = { "Content-Type": "application/json" }
    const data = {
      "symbol": "LARDON",
      "faction": "COSMIC"
    }
    axios
      .post(url, data, { headers: header }).then((res) => {
        console.log(res)
      })
      .catch((err) => {
        console.log(err)
        setMessage(new MessageState(true, "danger", "Error: " + err.message))
        // setTimeout(() => setMessage(new MessageState()), 1000)
      })
  }

  const onOK = () => {
    setMessage(new MessageState(true, "success", "OK !"))
  }

  const onAgentInfo = () => {
    
    player.getAgentInfo((symbol, headquarters, credits) => {
      console.log(symbol)
      setMessage(new MessageState(true, "success", symbol + headquarters + credits))
    })
      // .then(
      // .catch((err) => {
      //   console.log(err)
      //   setMessage(new MessageState(true, "danger", "Error: " + err.message))
      // })
  }

  return (
    <div className="App">
      <div className="message">{
        message.show &&
        <Alert dismissible onClose={() => setMessage(new MessageState())} key="error" variant={message.variant} style={{ margin: "auto", maxWidth: "50%", marginTop: "5px", marginBottom: "5px" }}>{message.message}</Alert>
      }
      </div>
      <div className="dashboard">
        <h1>
          Dashboard
        </h1>
        <Status displayMessage={displayMessage}/>
        <Button onClick={onNew}>New</Button> <Button onClick={onOK}>OK</Button> <Button onClick={onAgentInfo}>Info</Button>
      </div>

      <div className="justify-content-end">Hello world!</div>
    </div>
  );
}

export default App;
