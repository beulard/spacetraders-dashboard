import Button from "@atlaskit/button";
import { Code } from "@atlaskit/code";
import DynamicTable from "@atlaskit/dynamic-table";
import Modal, {
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalTransition,
} from "@atlaskit/modal-dialog";
import Popup from "@atlaskit/popup";
import Spinner from "@atlaskit/spinner";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Contract, ContractDeliverGood } from "spacetraders-sdk";
import api from "./api";
import { RefreshButton } from "./components/refresh-button";

function getTotalPayment(contract: Contract) {
  return contract.terms.payment.onAccepted + contract.terms.payment.onFulfilled;
}

const Deadline = (props: { deadline: Date }) => {
  const [timeLeft, setTimeLeft] = useState(
    props.deadline.getTime() - Date.now()
  );

  const decrement = () => setTimeLeft(timeLeft - 1);

  setTimeout(decrement, 1000);

  function getTimeLeftString() {
    const diff = new Date(timeLeft - Date.now());

    return `${diff.getDate()}d
          ${diff.getHours()}h ${diff.getMinutes()}m
          ${diff.getSeconds()}s left`;
  }
  return <>{getTimeLeftString()}</>;
};

const ContractDescription = (props: { contract: Contract }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Popup
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      content={() => <ContractBody contract={props.contract}></ContractBody>}
      trigger={(triggerProps) => (
        <Button
          style={{ width: "4.5em" }}
          {...triggerProps}
          appearance="primary"
          isSelected={isOpen}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? "Hide" : "Show"}
        </Button>
      )}
    ></Popup>
  );
};

const ContractBody = (props: { contract: Contract }) => {
  const [showJSON, setShowJSON] = useState(false);

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
            <li key={idx}>
              {/* TODO Clickable destination symbol */}
              {d.tradeSymbol} to {d.destinationSymbol} {d.unitsFulfilled}/
              {d.unitsRequired}
            </li>
          );
        })}
      </ul>
      {showJSON && (
        <div style={{ margin: "1em 0em 1em 0em" }}>
          <Code>{JSON.stringify(contract, null, 2)}</Code>
        </div>
      )}
      <div style={{}}>
        <Button appearance="subtle" onClick={() => setShowJSON(!showJSON)}>
          {showJSON ? "Hide JSON" : "Show JSON"}
        </Button>
      </div>
    </div>
  );
};

const ContractList = () => {
  const [contracts, setContracts] = useState(Array<Contract>());
  const [modalOpen, setModalOpen] = useState(false);
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
        console.log(res);
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
        content: (
          <ContractDescription contract={contract}></ContractDescription>
        ),
      },
      {
        key: "acceptButton",
        content: contract.accepted ? (
          <Button appearance="primary" isDisabled={true}>
            Accepted
          </Button>
        ) : (
          <>
            <Button
              appearance="primary"
              onClick={() => {
                console.log("Accepting " + contract.id);
                setAcceptContractId(contract.id);
                setModalOpen(true);
              }}
            >
              Accept
            </Button>
          </>
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

        <ModalTransition>
          {modalOpen && (
            <Modal onClose={() => setModalOpen(false)}>
              <ModalHeader>
                <ModalTitle>Accept contract</ModalTitle>
              </ModalHeader>
              <ModalBody>U sure?</ModalBody>
              <ModalFooter>
                <Button
                  appearance="subtle"
                  onClick={() => {
                    setAcceptContractId("");
                    setModalOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  appearance="primary"
                  onClick={() => {
                    const promise =
                      api.contract.acceptContract(acceptContractId);
                    setContracts(
                      contracts.map((c) =>
                        c.id === acceptContractId ? { ...c, accepted: true } : c
                      )
                    );
                    setModalOpen(false);
                    setAcceptContractId("");
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
                  autoFocus
                >
                  Accept
                </Button>
              </ModalFooter>
            </Modal>
          )}
        </ModalTransition>
      </div>
    </div>
  );
};

export { ContractList };
