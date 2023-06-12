import { CodeBlock } from "@atlaskit/code";
import { Button, Card, Popconfirm, Popover, Typography } from "antd";
import Table, { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "./api";
import { RefreshButton } from "./components/refresh-button";
import { Contract, ContractDeliverGood } from "./spacetraders-sdk";
import { SystemDB, SystemEvent } from "./system-db";
import { getSystemSymbol } from "./utils";
const { Text } = Typography;

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
      overlayInnerStyle={{ padding: 1 }}
      trigger="click"
      content={<ContractBody contract={props.contract} />}
    >
      <Button>Show</Button>
    </Popover>
  );
};

const ContractBody = (props: { contract: Contract }) => {
  const contract = props.contract;
  const deadline = new Date(contract.terms.deadline);
  const expires = new Date(contract.expiration);

  // TODO handle other types of contract
  return (
    <Card size="small" title={`${contract.type} for ${contract.factionSymbol}`}>
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
      <p>
        <b>Deadline</b>
      </p>
      {deadline.toLocaleDateString("fr")} {deadline.toLocaleTimeString("fr")}{" "}
      <b>
        (
        <Deadline deadline={deadline} />)
      </b>
      {contract.accepted || (
        <div>
          <p>
            <b>Expires</b>
          </p>
          {expires.toDateString()} {expires.toLocaleTimeString()}{" "}
          <b>
            (
            <Deadline deadline={expires} />)
          </b>
        </div>
      )}
      <div>
        <p>
          <b>Deliver</b>
        </p>
        <ul style={{ margin: 0 }}>
          {contract.terms.deliver?.map((item, idx) => {
            const d = item as ContractDeliverGood;
            return (
              <li key={idx}>
                {d.tradeSymbol} to{" "}
                <div
                  className="link-button"
                  onClick={() => {
                    const system = SystemDB.all.find(
                      (s) => s.symbol === getSystemSymbol(d.destinationSymbol)
                    );
                    SystemEvent.emit("select", system);
                  }}
                >
                  {d.destinationSymbol}
                </div>{" "}
                {d.unitsFulfilled}/{d.unitsRequired}
              </li>
            );
          })}
        </ul>
      </div>
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
    </Card>
  );
};

const ContractList = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);

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

  const columns: ColumnsType<Contract> = [
    {
      key: "type",
      title: "Type",
      dataIndex: "type",
    },
    {
      key: "faction",
      title: "Faction",
      dataIndex: "factionSymbol",
      align: "right",
    },
    {
      key: "payment",
      title: "Total payment",
      sorter: (a, b) => getTotalPayment(a) - getTotalPayment(b),
      render: (_, contract) => `$${getTotalPayment(contract)}`,
      align: "right",
    },
    {
      key: "info",
      title: "Info",
      render: (_, contract) => <ContractDescription contract={contract} />,
      align: "center",
    },
    {
      key: "acceptButton",
      title: "Accept",
      align: "center",
      render: (_, contract) => (
        <Popconfirm
          disabled={contract.accepted}
          title="Accept contract?"
          onConfirm={() => {
            const promise = api.contract.acceptContract(contract.id);
            setContracts(
              contracts.map((c) =>
                c.id === contract.id ? { ...c, accepted: true } : c
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
  ];

  return (
    <Card
      size="small"
      title={<Text className="small-heading">Contracts</Text>}
      extra={<RefreshButton onClick={refresh} />}
      type="inner"
      style={{ minWidth: "600px" }}
    >
      <Table
        className="contracts-table"
        rowClassName="table-row"
        size="small"
        columns={columns}
        dataSource={contracts}
        pagination={false}
      ></Table>
    </Card>
  );
};

export { ContractList };
