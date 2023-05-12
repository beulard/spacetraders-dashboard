import React, { useEffect } from "react";
import { Button, Typography, Icon, Collapse, MessageBox, List } from "lens-ui";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { useState } from "react";
import player from "./player";
import { Status } from "./status";
import "lens-ui/dist/index.css";
import {
  AgentsApi,
  ContractsApi,
  Configuration,
  Contract,
  ContractTerms,
  ContractDeliverGood,
} from "spacetraders-sdk";
import { getTotalPayment } from "./contract";

const ContractHeader = (props: { contract: Contract }) => {
  const contract = props.contract;
  const expDate = new Date(contract.expiration);

  return (
    <div style={{ width: "100%" }}>
      <span
        style={{
          display: "inline-block",
          textAlign: "left",
          width: "50%",
        }}
      >
        <b>{`[${contract.factionSymbol}] ${contract.type.toLowerCase()}`}</b>
      </span>
      <span
        style={{
          display: "inline-block",
          textAlign: "center",
          width: "25%",
        }}
      >{` $${getTotalPayment(contract)}`}</span>
      <span
        style={{
          display: "inline-block",
          textAlign: "right",
          width: "25%",
        }}
      >{`exp ${expDate.getHours()}:${expDate.getMinutes()} ${expDate.getDate()}/${
        expDate.getMonth() + 1
      }/${expDate.getFullYear()}`}</span>
    </div>
  );
};

const ContractBody = (props: { contract: Contract }) => {
  const contract = props.contract;
  const deadline = new Date(contract.terms.deadline);

  // TODO handle other types of contract
  return (
    <div>
      <p>{contract.type}</p>
      <p>
        Deadline: {deadline.toDateString()} {deadline.toLocaleTimeString()}
      </p>
      <List intent="primary">
        <List.Item heading>Deliver</List.Item>
        {contract.terms.deliver.map((item) => {
          const d = item as ContractDeliverGood;
          return (
            <p>
              {d.tradeSymbol} to {d.destinationSymbol} {d.unitsFulfilled}/
              {d.unitsRequired}
            </p>
          );
        })}
      </List>
      <Collapse>
        <Collapse.Panel key="1" id="1" header="Show JSON">
          <pre>
            <code>{JSON.stringify(contract)}</code>
          </pre>
        </Collapse.Panel>
      </Collapse>
    </div>
  );
};

const ContractList = () => {
  const [contracts, setContracts] = useState(Array<Contract>());

  const config = new Configuration({
    accessToken: player.apiToken,
  });
  const api = new ContractsApi(config);

  const refresh = () => {
    const promise = api.getContracts();

    toast.promise(promise, {
      loading: "Fetching contracts",
      success: "Fetched contracts",
      error: "Error (check console)",
    });

    promise
      .then((res) => {
        console.log(res);
        const data = res.data.data;
        setContracts(data);
        // console.log(data[0] as Contract);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  useEffect(refresh, []);

  return (
    <div style={{ margin: "auto", marginTop: "5em", width: "40em" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-evenly",
          margin: "auto",
          alignItems: "center",
          height: "2.4em",
        }}
      >
        <Typography variant="h4" style={{ flex: "5 5 auto" }}>
          Contracts
        </Typography>
        <Button
          onClick={refresh}
          style={{ flex: "0 1 auto", alignSelf: "flex-end" }}
        >
          <Icon name="MdRefresh" />
        </Button>
      </div>
      <Collapse style={{ margin: "auto", marginTop: "1em" }}>
        {contracts.map((c) => (
          <Collapse.Panel
            id={c.id}
            key={c.id}
            header={<ContractHeader contract={c} />}
          >
            <ContractBody contract={c} />
          </Collapse.Panel>
        ))}
      </Collapse>
    </div>
  );
};

function App() {
  const onNew = () => {
    const url = "https://api.spacetraders.io/v2/register";
    const header = { "Content-Type": "application/json" };
    const data = {
      symbol: "LARDON",
      faction: "COSMIC",
    };
    axios
      .post(url, data, { headers: header })
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
        toast.error(err.message);
      });
  };

  // TODO Add map view of systems
  // TODO contracts list

  const onOK = () => {
    toast.success("Hello world!");
  };

  return (
    <div className="App">
      <div className="dashboard">
        <Typography variant="h3">Dashboard</Typography>
        <Status />
        <Button className="m1" onClick={onNew}>
          New
        </Button>
        <Button className="m1" onClick={onOK}>
          Hi
        </Button>
        <Button className="m1" intent="success" onClick={() => toast("Hi")}>
          Info
        </Button>
        <ContractList />
      </div>
      <Toaster position="top-right" />
    </div>
  );
}

export default App;
