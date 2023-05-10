import React from 'react';
import { Button, Typography, Icon } from 'lens-ui'
import toast, { Toaster } from 'react-hot-toast'
import axios from 'axios';
import { useState } from 'react';
import player from './player'
import { Status } from './status';
import 'lens-ui/dist/index.css';

function App() {

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
        toast.error(err.message)
      })
  }

  const onOK = () => {
    toast.success("Hello world!")
  }

  return (
    <div className="App">
      <div className="dashboard">
        <Typography variant="h3">
          Dashboard
        </Typography>
        <Status />
        <Button className="m1" onClick={onNew}>New</Button> 
        <Button className="m1" onClick={onOK}>Hi</Button> 
        <Button className="m1" intent="success" onClick={() => toast("Hi")}>Info</Button>
      </div>
      <Toaster position='top-right' />
    </div>
  );
}

export default App;
