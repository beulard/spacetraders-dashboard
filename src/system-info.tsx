import { CodeBlock } from "@atlaskit/code";
import ArrowRightIcon from "@atlaskit/icon/glyph/arrow-right";
import { Button, Collapse, Popover, Select, Space, Tag, Tooltip } from "antd";
import { AxiosError } from "axios";
import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Ship,
  System,
  SystemWaypoint,
  Waypoint,
  WaypointTraitSymbolEnum,
} from "spacetraders-sdk";
import api from "./api";
import { Accordion } from "./components/accordion";
import { FleetContext } from "./fleet-context";
import { MessageContext, MessageType } from "./message-queue";
import WaypointDB from "./waypoint-db";
import FleetDB from "./fleet-db";
const { Panel } = Collapse;

const ShipPurchase = () => {
  return <Button type="primary">Purchase ship</Button>;
};

const ShipSelector = (props: { destinationSymbol: string }) => {
  const [sendShips, setSendShips] = useState<string[]>([]);

  const fleet = FleetDB.getMyShips();

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <div style={{ flexGrow: 1 }}>
        <Select
          mode="multiple"
          allowClear
          style={{ width: "100%" }}
          placeholder="Navigate ships"
          onChange={(value) => setSendShips(value)}
          value={sendShips}
          options={fleet
            .filter((ship) => !sendShips.includes(ship.symbol)) // Filter out already selected ships
            .map((ship) => ({
              label: ship.symbol,
              value: ship.symbol,
            }))}
        />
      </div>
      <div style={{ width: "3em", padding: "0 0 0 0.5em" }}>
        <Button
          icon={<ArrowRightIcon label="" />}
          onClick={() => {
            sendShips.forEach((ship) => {
              console.log(`Navigating ${ship} to ${props.destinationSymbol}`);
              api.fleet
                .navigateShip(ship, {
                  waypointSymbol: props.destinationSymbol,
                })
                .then((res) => {
                  // TODO properly process, store, display response (ETA, fuel, nav)
                  console.log(res);
                  toast.success(
                    `Navigating ${ship} to ${props.destinationSymbol}`
                  );
                  // const updatedShip = {
                  //   ...fleet.find((s) => s.symbol === ship),
                  //   nav: res.data.data.nav,
                  //   fuel: res.data.data.fuel,
                  // };
                  // const updatedFleet = fleet.map((s) =>
                  //   s.symbol === ship ? (updatedShip as Ship) : s
                  // );
                  // setFleet(updatedFleet);
                  FleetDB.update();
                })
                .catch((err: AxiosError<any>) => {
                  console.log(err);
                  toast.error(err.response?.data.error.message);
                });
            });
            setSendShips([]);
          }}
        ></Button>
      </div>
    </div>
  );
};

const WaypointInfo = (props: {
  waypoint: SystemWaypoint;
  details: Waypoint | null;
}) => {
  const [fleet, setFleet] = useState<Ship[]>(FleetDB.getMyShips());

  // Ships in orbit, docked, etc
  const localShips = fleet.filter(
    (ship) => ship.nav.waypointSymbol === props.waypoint.symbol
  );

  useEffect(() => {
    // Subscribe to fleet update events
    const updateCallback = (ships: Ship[]) => {
      setFleet(ships);
    };
    FleetDB.on("update", updateCallback);

    // Unsubscribe on unmount
    return () => {
      FleetDB.off("update", updateCallback);
    };
  }, []);

  // TODO market info popover
  const hasMarket = true;
  // const hasMarket = props.details?.traits.includes(WaypointTraitSymbolEnum.Marketplace)

  return (
    <Space direction="vertical" size="small" style={{ width: "100%" }}>
      {props.details && (
        <div>
          <Space wrap size={[0, 2]}>
            {props.details.traits.map((trait, idx) => (
              <Tooltip
                key={idx}
                title={trait.description}
                mouseEnterDelay={0.3}
              >
                <Tag>
                  <small>{trait.name}</small>
                </Tag>
              </Tooltip>
            ))}
          </Space>
        </div>
      )}
      {localShips.length > 0 && (
        <p>
          Ships:{" "}
          {localShips.map((ship, idx) => (
            <Tag key={idx}>
              {ship.symbol} ({ship.nav.status})
            </Tag>
          ))}
        </p>
      )}
      {/* Navigate ships */}
      <ShipSelector destinationSymbol={props.waypoint.symbol} />
      {/* Purchase ships (shipyard trait) */}
      {props.details?.traits
        .map((trait) => trait.symbol)
        .includes("SHIPYARD") && <ShipPurchase />}

      {/* Get market */}
      {hasMarket && (
        <Popover
          trigger="click"
          // disabled={localShips.length === 0}
          // onClick={toggleMarketInfo}
        >
          <Button type="primary">Market</Button>
        </Popover>
      )}

      {/* Get shipyard -> TODO merge with ShipPurchase */}

      {/* Get jump gate (connected systems) */}

      {/* (debug) Show JSON */}
      <Popover
        trigger="click"
        mouseEnterDelay={0.3}
        content={
          <CodeBlock
            language="json"
            text={JSON.stringify(props.details, null, 2)}
            showLineNumbers={false}
          />
        }
      >
        <Button type="dashed">Show JSON</Button>
      </Popover>
    </Space>
  );
};

/**
 * Shows a list of waypoints in `props.system`. Each waypoint is a dropdown menu
 * which allows the user to pick an action (e.g. send ship, fetch market, ...)
 */
const SystemInfo = () => {
  const [system, setSystem] = useState<System | null>(null);
  // Detailed waypoint data, to be fetched at render
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const { msgQueue } = useContext(MessageContext);

  useEffect(() => {
    // Listen to select system messages
    msgQueue.listen(MessageType.SelectSystem, (payload: { system: System }) => {
      setSystem(payload.system);
    });
  }, []);

  useEffect(() => {
    if (system) {
      // Get detailed waypoint data
      // WaypointDB.getSystemWaypoints(system.symbol).then((res) => {
      //   setWaypoints(res.data.data);
      // });
      WaypointDB.getSystemWaypoints(system.symbol).then((wps) =>
        setWaypoints(wps)
      );
    }
  }, [system]);

  return (
    <span
      style={{
        float: "left",
        textAlign: "left",
        width: "40%",
        paddingRight: "2%",
      }}
    >
      {system ? (
        <div>
          <div
            style={{
              marginBottom: "0.25em",
              width: "100%",
              display: "inline-block",
            }}
          >
            <Tooltip
              title="Locate on map"
              mouseEnterDelay={0.1}
              placement="top"
            >
              <Button
                onClick={() => {
                  msgQueue.post(MessageType.LocateSystem, {
                    x: system.x,
                    y: system.y,
                    symbol: system.symbol,
                  });
                }}
                type="text"
                style={{
                  display: "inline",
                  width: "100%",
                  height: "100%",
                  textAlign: "center",
                }}
              >
                <big>
                  {system.symbol} [{system.type}]
                </big>
              </Button>
            </Tooltip>
          </div>

          <Collapse
            size="small"
            style={{
              maxHeight: "400px",
              overflowY: "auto",
              scrollbarWidth: "thin",
            }}
          >
            {system.waypoints.length > 0 &&
              system.waypoints.map((waypoint, idx) => (
                <Panel
                  key={waypoint.symbol}
                  header={`${waypoint.symbol} [${waypoint.type}]`}
                >
                  <WaypointInfo
                    key={waypoint.symbol}
                    waypoint={waypoint}
                    details={waypoints[idx] || null}
                  />
                </Panel>
              ))}
          </Collapse>

          {system.factions.length > 0 && (
            <Accordion
              isOpen={true}
              header={<h6>Factions</h6>}
              body={system.factions.map((faction, idx) => (
                <p key={idx}>{faction.symbol}</p>
              ))}
            ></Accordion>
          )}
        </div>
      ) : (
        <div>No selected system</div>
      )}
    </span>
  );
};

export { SystemInfo };
