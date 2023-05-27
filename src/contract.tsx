import { CodeBlock } from "@atlaskit/code";
import DynamicTable from "@atlaskit/dynamic-table";
import { Button, Popconfirm, Popover } from "antd";
import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Contract, ContractDeliverGood } from "spacetraders-sdk";
import api from "./api";
import { RefreshButton } from "./components/refresh-button";
import { MessageContext, MessageType } from "./message-queue";
import { Systems, getSystemSymbol } from "./system";

function getTotalPayment(contract: Contract) {
  return contract.terms.payment.onAccepted + contract.terms.payment.onFulfilled;
}

const Deadline = (props: { deadline: Date }) => {
  // Time left in milliseconds
  const [timeLeft, setTimeLeft] = useState(
    props.deadline.getTime() - Date.now()
  );

  useEffect(() => {
    setTimeout(() => {
      setTimeLeft(timeLeft - 1000);
    }, 1000);
  }, [timeLeft]);

  function getTimeLeftString() {
    let seconds = Math.floor(timeLeft / 1000);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    return `${days}d
          ${hours % 24}h ${minutes % 60}m
          ${seconds % 60}s left`;
  }
  return <span>{getTimeLeftString()}</span>;
};

const ContractDescription = (props: { contract: Contract }) => {
  return (
    <Popover
      trigger="click"
      content={<ContractBody contract={props.contract} />}
    >
      <Button>Show</Button>
    </Popover>
  );
};

const ContractBody = (props: { contract: Contract }) => {
  const { msgQueue } = useContext(MessageContext);

  const contract = props.contract;
  const deadline = new Date(contract.terms.deadline);
  const expires = new Date(contract.expiration);

  // TODO handle other types of contract
  return (
    <div style={{ margin: "1em", minWidth: "30em" }}>
      <h4>
        {contract.type} for {contract.factionSymbol}
      </h4>
      <table>
        <tbody>
          <tr>
            <th>Payment</th>
            <td>${contract.terms.payment.onAccepted}</td>
            <td>+</td>
            <td>${contract.terms.payment.onFulfilled}</td>
            <th>=</th>
            <th>${getTotalPayment(contract)}</th>
          </tr>
        </tbody>
      </table>
      <div style={{ marginTop: "1em" }}>
        <h6>Deadline</h6>
        {deadline.toLocaleDateString("fr")} {deadline.toLocaleTimeString("fr")}{" "}
        <b>
          (
          <Deadline deadline={deadline} />)
        </b>
      </div>
      {contract.accepted || (
        <div>
          <h6>Expires</h6>
          {expires.toDateString()} {expires.toLocaleTimeString()}{" "}
          <b>
            (
            <Deadline deadline={expires} />)
          </b>
        </div>
      )}
      <h6>Deliver</h6>
      <ul>
        {contract.terms.deliver?.map((item, idx) => {
          const d = item as ContractDeliverGood;
          return (
            <li key={idx} style={{ alignItems: "center" }}>
              {d.tradeSymbol} to{" "}
              <div
                className="link-button"
                onClick={() => {
                  Systems.get(getSystemSymbol(d.destinationSymbol)).then(
                    (system) => {
                      msgQueue.post(MessageType.SelectSystem, {
                        system: system,
                      });
                    }
                  );
                }}
              >
                {d.destinationSymbol}
              </div>{" "}
              {d.unitsFulfilled}/{d.unitsRequired}
            </li>
          );
        })}
      </ul>
      <div style={{ paddingTop: "0.5em" }}>
        <Popover
          mouseEnterDelay={0.3}
          content={
            <CodeBlock
              language="json"
              text={JSON.stringify(contract, null, 2)}
              showLineNumbers={false}
            />
          }
        >
          <Button type="dashed">Show JSON</Button>
        </Popover>
      </div>
    </div>
  );
};

const ContractList = () => {
  const [contracts, setContracts] = useState(Array<Contract>());
  const [acceptContractId, setAcceptContractId] = useState("");

  const refresh = (onDone: Function = () => {}) => {
    const promise = api.contract.getContracts();

    toast.promise(promise, {
      loading: "Fetching contracts",
      success: "Fetched contracts",
      error: "Error (check console)",
    });

    promise
      .then((res) => {
        // console.log(res);
        const data = res.data.data;
        setContracts(data);
        onDone();
      })
      .catch((err) => {
        console.log(err);
        onDone();
      });
  };
  useEffect(refresh, []);

  const tableHead = {
    cells: [
      {
        key: "type",
        content: "Type",
        isSortable: true,
      },
      {
        key: "faction",
        content: "Faction",
        isSortable: false,
      },
      { key: "payment", content: "Total payment", isSortable: true },
      {
        key: "info",
        content: "Info",
      },
      {
        key: "acceptButton",
        content: "Accept",
        isSortable: true,
      },
    ],
  };

  const tableRows = contracts.map((contract, idx) => ({
    key: contract.id,
    cells: [
      {
        key: "type",
        content: contract.type,
      },
      {
        key: "faction",
        content: contract.factionSymbol,
      },
      { key: "payment", content: `$${getTotalPayment(contract)}` },
      {
        key: "info",
        content: <ContractDescription contract={contract} />,
      },
      {
        key: "acceptButton",
        content: (
          <Popconfirm
            disabled={contract.accepted}
            title="Accept contract?"
            onConfirm={() => {
              const promise = api.contract.acceptContract(contract.id);
              setContracts(
                contracts.map((c) =>
                  c.id === acceptContractId ? { ...c, accepted: true } : c
                )
              );
              toast.promise(promise, {
                loading: "Accepting...",
                success: "Accepted contract. Good luck!",
                error: "Error!",
              });
              promise
                .then((_) => {
                  refresh();
                })
                .catch((err) => {
                  console.log(err);
                });
            }}
          >
            <Button disabled={contract.accepted} type="primary">
              Accept
            </Button>
          </Popconfirm>
        ),
      },
    ],
  }));

  return (
    <div>
      <div style={{ margin: "auto", marginTop: "1em", width: "40em" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-evenly",
            margin: "auto",
            alignItems: "center",
            height: "2.4em",
          }}
        >
          <h4 style={{ flex: "5 5 auto" }}>Contracts</h4>
          <RefreshButton onClick={refresh} />
        </div>
      </div>
      <div style={{ margin: "auto", maxWidth: "60em" }}>
        <DynamicTable
          head={tableHead}
          rows={tableRows}
          isRankable={true}
        ></DynamicTable>
      </div>
    </div>
  );
};

export { ContractList };
