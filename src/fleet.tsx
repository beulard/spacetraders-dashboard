import {
  Badge,
  Button,
  List,
  Progress,
  Space,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import { useEffect, useState } from "react";
import { Ship } from "spacetraders-sdk";
import api from "./api";
import { RefreshButton } from "./components/refresh-button";

const ShipList = () => {
  const [ships, setShips] = useState<Ship[]>([]);

  async function getShipPage(index: number) {
    const page = await api.fleet.getMyShips(index);
    return page;
  }

  async function fetchShipsRecursive(index: number = 1): Promise<Ship[]> {
    const page = await getShipPage(index);
    console.log(page.data.meta);
    if (index * page.data.meta.limit >= page.data.meta.total) {
      return page.data.data;
    }
    return [...page.data.data, ...(await fetchShipsRecursive(++index))];
  }

  function refresh(onDone: Function = () => {}) {
    fetchShipsRecursive().then((shipList) => {
      setShips(shipList);
      console.log(shipList);
      onDone();
    });
  }

  useEffect(refresh, []);

  return (
    <div>
      <List
        header={
          <Space size="middle" style={{ height: "30px" }}>
            <h4>Fleet</h4>
            <RefreshButton onClick={refresh} />
          </Space>
        }
        itemLayout="horizontal"
      >
        {ships.map((ship) => (
          <List.Item actions={[<Button>qwe</Button>, <a href="..">qwes</a>]}>
            <List.Item.Meta
              title={ship.symbol}
              description={`${ship.nav.waypointSymbol} (${ship.nav.status})`}
            />
            {ship.cargo.inventory.map((item) => (
              <Space size="large">
                <Tooltip title={item.description}>
                  <Tag>
                    {item.name}
                    <Badge count={item.units} color="blue" offset={[5, -5]} />
                  </Tag>
                </Tooltip>
                <p>
                  Fuel: {ship.fuel.current} / {ship.fuel.capacity}
                </p>
                {/* <div style={{ paddingTop: "5px", width: 160 }}> */}
                <Progress
                  style={{ width: 160, paddingTop: 6 }}
                  size="small"
                  percent={
                    Math.round(
                      (ship.fuel.current / ship.fuel.capacity) * 100 * 10
                    ) / 10
                  }
                />
                {/* </div> */}
              </Space>
            ))}
          </List.Item>
        ))}
      </List>
    </div>
  );
};

export { ShipList };
