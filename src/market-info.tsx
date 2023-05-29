import { useEffect, useState } from "react";
import {
  Market,
  MarketTradeGood,
  Ship,
  SystemWaypoint,
} from "spacetraders-sdk";
import { getSystemSymbol } from "./utils";
import api from "./api";
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
import { HoverTag } from "./components/hover-tag";
import Table, { ColumnsType } from "antd/es/table";
import toast from "react-hot-toast";

const SellGoodShipSelect = (props: {
  sellGood: MarketTradeGood;
  ships: Ship[];
}) => {
  const [selectedShip, setSelectedShip] = useState<Ship | null>(null);
  const [amount, setAmount] = useState(0);

  async function onTrade() {
    toast("Implement sell transaction handling");
  }

  let amountInCargo = 0;
  if (selectedShip) {
    amountInCargo = selectedShip.cargo.inventory.reduce(
      (pSum, v) => (v.symbol === props.sellGood.symbol ? pSum + v.units : pSum),
      0
    );
  }

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
      <Slider
        disabled={selectedShip === null || amountInCargo === 0}
        // disabled={selectedShip === null || amountInCargo !== 0}
        // max={100}
        min={amountInCargo > 0 ? 1 : 0}
        max={amountInCargo}
        onChange={(val) => setAmount(val)}
      ></Slider>

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
    } catch (error) {
      const apiError = (error as any).response?.data?.error;
      if (apiError) {
        toast.error(apiError.message);
      }
      console.log(error);
    }
  }

  let spaceInCargo = 0;
  if (selectedShip) {
    spaceInCargo = selectedShip.cargo.capacity - selectedShip.cargo.units;
  }

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
      <Slider
        disabled={selectedShip === null || spaceInCargo === 0}
        // disabled={selectedShip === null || amountInCargo !== 0}
        // max={100}
        min={spaceInCargo > 0 ? 1 : 0}
        max={spaceInCargo}
        onChange={(val) => setAmount(val)}
      ></Slider>

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

const MarketInfo = (props: { waypoint: SystemWaypoint; ships: Ship[] }) => {
  const [market, setMarket] = useState<Market | null>(null);
  useEffect(() => {
    api.system
      .getMarket(getSystemSymbol(props.waypoint.symbol), props.waypoint.symbol)
      .then((s) => {
        setMarket(s.data.data);
      });
  }, [props.ships]);

  if (market) {
    const items: TabsProps["items"] = [
      {
        key: "imports",
        label: "Import/export",
        children: (
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
                    {market.imports.map((i, idx) => (
                      <HoverTag
                        color="blue"
                        key={idx}
                        tooltip={i.description}
                        text={i.name}
                      />
                    ))}
                  </td>
                  <td>
                    {market.exports.map((i, idx) => (
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
        ),
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
    ];

    if (market.tradeGoods) {
      const columns: ColumnsType<MarketTradeGood> = [
        {
          title: "Item",
          dataIndex: "symbol",
          key: "item",
          className: "bold small",
          sorter: (a, b) => {
            if (a.symbol > b.symbol) return 1;
            if (b.symbol > a.symbol) return -1;
            return 0;
          },
        },
        {
          title: "Supply",
          dataIndex: "supply",
          key: "supply",
          className: "small",
          render: (v) => <p style={{ padding: 0 }}>{v}</p>,
        },
        {
          title: "Sell",
          dataIndex: "sellPrice",
          key: "sell",
          className: "small",
          sorter: (a, b) => a.sellPrice - b.sellPrice,
          render: (price, good) => (
            <Popover
              trigger="click"
              title={`Sell ${good.symbol}`}
              content={
                <SellGoodShipSelect sellGood={good} ships={props.ships} />
              }
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
          sorter: (a, b) => a.purchasePrice - b.purchasePrice,
          render: (price, good) => (
            <Popover
              trigger="click"
              title={`Purchase ${good.symbol}`}
              content={
                <PurchaseGoodShipSelect
                  purchaseGood={good}
                  ships={props.ships}
                />
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
        },
      ];
      items.unshift({
        key: "goods",
        label: "Goods",
        children: (
          <>
            <Table
              className="tradegoods-table"
              size="small"
              columns={columns}
              dataSource={market.tradeGoods.map((g, idx) => ({
                ...g,
                key: idx,
              }))}
              rowClassName="table-row"
              pagination={false}
              style={{ fontSize: 6 }}
            ></Table>
          </>
        ),
      });
    }

    return (
      <Tabs
        tabBarStyle={{
          fontSize: 9,
          marginTop: -10,
          marginBottom: 5,
        }}
        // renderTabBar={() => <div>qwe</div>}
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
