import {
  Button,
  Popconfirm,
  Popover,
  Select,
  Slider,
  Spin,
  Statistic,
  Tabs,
  TabsProps,
} from "antd";
import Table, { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import AgentDB from "./agent-db";
import api from "./api";
import { HoverTag } from "./components/hover-tag";
import { FleetDB } from "./fleet-db";
import {
  Market,
  MarketTradeGood,
  Ship,
  SystemWaypoint,
} from "./spacetraders-sdk";
import { alphabeticSorter, getSystemSymbol } from "./utils";

const SellGoodShipSelect = (props: {
  sellGood: MarketTradeGood;
  ships: Ship[];
}) => {
  const [selectedShip, setSelectedShip] = useState<Ship | null>(null);
  const [amount, setAmount] = useState(0);
  const [amountInCargo, setAmountInCargo] = useState(0);

  async function onTrade() {
    try {
      const res = await api.fleet.sellCargo(selectedShip!.symbol, {
        symbol: props.sellGood.symbol,
        units: amount,
      });
      const transaction = res.data.data.transaction;
      toast.success(
        `Sold ${transaction.units} units of ${transaction.tradeSymbol} for $${transaction.totalPrice}`
      );
      FleetDB.update();
      AgentDB.update();
      setAmountInCargo(amountInCargo - transaction.units);
    } catch (error) {
      console.log(error);
    }
  }

  // Update selectedShip when fleet is updated.
  // Ensures that the amountInCargo is updated when we sell something
  useEffect(() => {
    if (selectedShip) {
      setSelectedShip(
        props.ships.find((s) => s.symbol === selectedShip.symbol)!
      );
    }
  }, [props.ships, selectedShip]);

  useEffect(() => {
    if (selectedShip) {
      setAmount(1);
      setAmountInCargo(
        selectedShip.cargo.inventory.reduce(
          (pSum, v) =>
            v.symbol === props.sellGood.symbol ? pSum + v.units : pSum,
          0
        )
      );
    }
  }, [selectedShip, props.sellGood]);

  return (
    <div>
      <Select
        style={{ width: "100%" }}
        showSearch
        placeholder="Ship"
        options={props.ships.map((s, idx) => ({
          label: s.symbol,
          value: idx,
        }))}
        onChange={(v) => setSelectedShip(props.ships[v])}
      />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Slider
          style={{ width: "80%" }}
          disabled={selectedShip === null || amountInCargo === 0}
          value={amount}
          min={amountInCargo > 0 ? 1 : 0}
          max={amountInCargo}
          onChange={(val) => setAmount(val)}
        ></Slider>
        <div style={{ width: "20%", textAlign: "center" }}>{amount}</div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Statistic
          title="Total"
          value={props.sellGood.sellPrice * amount}
          prefix="$"
          valueStyle={{ fontSize: "13pt", color: "limegreen" }}
        />
        <Popconfirm
          disabled={selectedShip === null || amountInCargo === 0}
          title="Confirm"
          onConfirm={onTrade}
        >
          <Button
            disabled={selectedShip === null || amountInCargo === 0}
            type="primary"
          >
            Sell
          </Button>
        </Popconfirm>
      </div>
    </div>
  );
};

const PurchaseGoodShipSelect = (props: {
  purchaseGood: MarketTradeGood;
  ships: Ship[];
}) => {
  const [selectedShip, setSelectedShip] = useState<Ship | null>(null);
  const [amount, setAmount] = useState(1);
  const [spaceInCargo, setSpaceInCargo] = useState(0);

  async function onTrade() {
    // Agent might not have enough funds! Handle in response
    try {
      const res = await api.fleet.purchaseCargo(selectedShip!.symbol, {
        symbol: props.purchaseGood.symbol,
        units: amount,
      });
      const transaction = res.data.data.transaction;
      toast.success(
        `Purchased ${transaction.units} units of ${transaction.tradeSymbol} for $${transaction.totalPrice}`
      );
      FleetDB.update();
      AgentDB.update();
      setSpaceInCargo((space) => space - transaction.units);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    if (selectedShip) {
      setAmount(1);
      setSpaceInCargo(selectedShip.cargo.capacity - selectedShip.cargo.units);
    }
  }, [selectedShip]);

  return (
    <div>
      <Select
        style={{ width: "100%" }}
        showSearch
        placeholder="Ship"
        options={props.ships.map((s, idx) => ({
          label: s.symbol,
          value: idx,
        }))}
        onChange={(v) => setSelectedShip(props.ships[v])}
      />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Slider
          style={{ width: "80%" }}
          disabled={selectedShip === null || spaceInCargo === 0}
          // disabled={selectedShip === null || amountInCargo !== 0}
          // max={100}
          value={amount}
          min={spaceInCargo > 0 ? 1 : 0}
          max={spaceInCargo}
          onChange={(val) => setAmount(val)}
        ></Slider>
        <div style={{ width: "20%", textAlign: "center" }}>{amount}</div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Statistic
          title="Total"
          value={props.purchaseGood.purchasePrice * amount}
          prefix="$"
          valueStyle={{ fontSize: "13pt", color: "indianred" }}
        />
        <Popconfirm
          disabled={selectedShip === null || spaceInCargo === 0}
          title="Confirm"
          onConfirm={onTrade}
        >
          <Button
            disabled={selectedShip === null || spaceInCargo === 0}
            type="primary"
          >
            Buy
          </Button>
        </Popconfirm>
      </div>
    </div>
  );
};

const ImportExportTable = (props: { market: Market }) => {
  return (
    <div>
      <table>
        <thead>
          <tr>
            <td>Imports</td>
            <td>Exports</td>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              {props.market.imports.map((i, idx) => (
                <HoverTag
                  color="blue"
                  key={idx}
                  tooltip={i.description}
                  text={i.name}
                />
              ))}
            </td>
            <td>
              {props.market.exports.map((i, idx) => (
                <HoverTag
                  color="green"
                  key={idx}
                  tooltip={i.description}
                  text={i.name}
                />
              ))}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

const MarketInfo = (props: { waypoint: SystemWaypoint }) => {
  const [market, setMarket] = useState<Market | null>(null);
  const [ships, setShips] = useState<Ship[]>([]);

  useEffect(() => {
    console.log(`${market?.symbol} fetch`);
    api.system
      .getMarket(getSystemSymbol(props.waypoint.symbol), props.waypoint.symbol)
      .then((s) => {
        setShips(
          FleetDB.getMyShips().filter(
            (ship) => ship.nav.waypointSymbol === s.data.data.symbol
          )
        );
        setMarket(s.data.data);
      });
  }, [props.waypoint.symbol]);

  useEffect(() => {
    const updateShips = (newShips: Ship[]) => {
      if (market) {
        const newLocalShips = newShips.filter(
          (ship) => ship.nav.waypointSymbol === market.symbol
        );
        // If updated ship nav status is different from stored
        if (
          ships.length !== newLocalShips.length ||
          !ships.every(
            (x) =>
              newLocalShips.filter(
                (s) => s.symbol === x.symbol && s.nav.status === x.nav.status
              ).length !== 0
          )
        ) {
          // Fetch market and ships
          console.log(`${market.symbol} fetch`);
          api.system
            .getMarket(
              getSystemSymbol(props.waypoint.symbol),
              props.waypoint.symbol
            )
            .then((s) => {
              setShips(
                FleetDB.getMyShips().filter(
                  (ship) => ship.nav.waypointSymbol === s.data.data.symbol
                )
              );
              setMarket(s.data.data);
            });

          // DEBUG
          // console.log(
          //   `${market.symbol} ship update. old:`,
          //   ships.map((s) => ({ symbol: s.symbol, status: s.nav.status })),
          //   "new: ",
          //   newLocalShips.map((s) => ({
          //     symbol: s.symbol,
          //     status: s.nav.status,
          //   }))
          // );
        }
      }
    };
    FleetDB.addListener("update", updateShips);

    return () => {
      FleetDB.removeListener("update", updateShips);
    };
  });

  if (market) {
    const items: TabsProps["items"] = [
      {
        key: "imports",
        label: "Import/export",
        children: market ? <ImportExportTable market={market} /> : <div></div>,
      },
      {
        key: "exchange",
        label: "Exchange",
        children: (
          <div>
            {market.exchange.map((i, idx) => (
              <HoverTag key={idx} tooltip={i.description} text={i.name} />
            ))}
          </div>
        ),
      },
      {
        key: "transactions",
        label: "Transactions",
        children: market.transactions?.map((t, idx) => (
          <p key={idx}>
            {t.timestamp} {t.shipSymbol} ${t.totalPrice}
          </p>
        )),
        // <>
        //   TODO
        //   <Table
        //     dataSource={market.transactions}
        //     // {market.exchange.map((i, idx) => (
        //     //   <HoverTag key={idx} tooltip={i.description} text={i.name} />
        //     // ))}
        //   />
        // </>
      },
    ];

    if (market.tradeGoods) {
      const columns: ColumnsType<MarketTradeGood> = [
        {
          title: "Item",
          dataIndex: "symbol",
          key: "item",
          className: "bold small",
          sorter: (a, b) => alphabeticSorter(a.symbol, b.symbol),
        },
        {
          title: "Supply",
          dataIndex: "supply",
          key: "supply",
          className: "small",
          align: "right",
          render: (v) => <p style={{ padding: 0 }}>{v}</p>,
        },
        {
          title: "Sell",
          dataIndex: "sellPrice",
          key: "sell",
          className: "small",
          align: "right",
          sorter: (a, b) => a.sellPrice - b.sellPrice,
          render: (price, good) => (
            <Popover
              trigger="click"
              title={`Sell ${good.symbol}`}
              content={<SellGoodShipSelect sellGood={good} ships={ships} />}
            >
              <Button type="link" size="small">
                ${price}
              </Button>
            </Popover>
          ),
        },
        {
          title: "Purchase",
          dataIndex: "purchasePrice",
          key: "purchasePrice",
          className: "small",
          align: "right",
          sorter: (a, b) => a.purchasePrice - b.purchasePrice,
          render: (price, good) => (
            <Popover
              trigger="click"
              title={`Purchase ${good.symbol}`}
              content={
                <PurchaseGoodShipSelect purchaseGood={good} ships={ships} />
              }
            >
              <Button type="link" size="small">
                ${price}
              </Button>
            </Popover>
          ),
        },
        {
          title: "Volume",
          dataIndex: "tradeVolume",
          key: "tradeVolume",
          className: "small",
          align: "right",
        },
      ];
      items.unshift({
        key: "goods",
        label: "Goods",
        children: (
          <>
            <Table
              className="tradegoods-table"
              rowClassName="table-row"
              size="small"
              columns={columns}
              dataSource={market.tradeGoods.map((g, idx) => ({
                ...g,
                key: idx,
              }))}
              pagination={false}
            ></Table>
          </>
        ),
      });
    }

    // DEBUG
    console.log(`Redraw market ${market.symbol}`);

    return (
      <Tabs
        tabBarStyle={{
          fontSize: 9,
          marginTop: -10,
          marginBottom: 5,
        }}
        style={{ fontSize: 11 }}
        size="small"
        items={items}
      ></Tabs>
    );
  } else {
    return <Spin />;
  }
};

export { MarketInfo };
