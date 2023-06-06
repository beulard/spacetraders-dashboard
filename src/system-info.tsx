import { CodeBlock } from "@atlaskit/code";
import ArrowRightIcon from "@atlaskit/icon/glyph/arrow-right";
import {
  Button,
  Collapse,
  Popover,
  Select,
  Space,
  Tabs,
  TabsProps,
  Tag,
  Tooltip,
} from "antd";
import { AxiosError } from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Ship,
  System,
  SystemWaypoint,
  Waypoint,
  WaypointTraitSymbolEnum,
  WaypointType,
} from "spacetraders-sdk";
import api from "./api";
import { Accordion } from "./components/accordion";
import FleetDB from "./fleet-db";
import { MarketInfo } from "./market-info";
import { ShipyardInfo } from "./shipyard-info";
import { SystemEvent } from "./system-db";
import WaypointDB from "./waypoint-db";
import { SizeType } from "antd/es/config-provider/SizeContext";
const { Panel } = Collapse;

const ShipSelector = (props: { destinationSymbol: string; size: SizeType }) => {
  const [sendShips, setSendShips] = useState<string[]>([]);

  const fleet = FleetDB.getMyShips();

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <div style={{ flexGrow: 1, paddingRight: "5px" }}>
        <Select
          mode="multiple"
          size={props.size}
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
      <Button
        size={props.size}
        icon={<ArrowRightIcon label="" />}
        onClick={() => {
          sendShips.forEach((ship) => {
            console.log(`Navigating ${ship} to ${props.destinationSymbol}`);
            api.fleet
              .navigateShip(ship, {
                waypointSymbol: props.destinationSymbol,
              })
              .then((res) => {
                console.log(res);
                toast.success(
                  `Navigating ${ship} to ${props.destinationSymbol}`
                );
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
  );
};

const WaypointShipTag = (props: { ship: Ship }) => {
  const [isDocked, setIsDocked] = useState(props.ship.nav.status === "DOCKED");
  function handleDock() {
    if (isDocked) return;
    api.fleet
      .dockShip(props.ship.symbol)
      .then((res) => {
        console.log(res);
        FleetDB.update().then(() =>
          setIsDocked(res.data.data.nav.status === "DOCKED")
        );
      })
      .catch((err) => {
        toast.error("Dock/undock unsuccessful. Check console.");
        console.log(err);
      });
  }
  return (
    <Tooltip
      title={isDocked ? "Docked" : "Dock ship"}
      color="gray"
      mouseEnterDelay={0.3}
    >
      <Button
        size="small"
        type="default"
        disabled={props.ship.nav.status === "IN_TRANSIT"}
        onClick={handleDock}
      >
        {props.ship.symbol} ({props.ship.nav.status})
      </Button>
    </Tooltip>
  );
};

const WaypointList = (props: { waypoints: Waypoint[] }) => {
  return (
    <Collapse size="small" className="system-info-collapse">
      {props.waypoints.length > 0 &&
        props.waypoints.map((waypoint) => (
          <Panel
            key={waypoint.symbol}
            header={`${waypoint.symbol} [${waypoint.type}]`}
            extra={
              <span
                style={{ display: "block", minWidth: "15em" }}
                onClick={(evt) => evt.stopPropagation()} // Prevent panel collapse on click
              >
                <ShipSelector
                  size="small"
                  destinationSymbol={waypoint.symbol}
                />
              </span>
            }
          >
            <WaypointInfo
              key={waypoint.symbol}
              waypoint={waypoint}
              details={waypoint}
            />
          </Panel>
        ))}
    </Collapse>
  );
};

const MarketList = (props: { waypoints: Waypoint[] }) => {
  const [ships, setShips] = useState<Ship[]>(FleetDB.getMyShips());

  const marketWaypoints = props.waypoints.filter((w) =>
    w.traits.map((t) => t.symbol).includes(WaypointTraitSymbolEnum.Marketplace)
  );

  useEffect(() => {
    const onFleetUpdate = (s: Ship[]) => setShips(s);
    FleetDB.on("update", onFleetUpdate);

    return () => {
      FleetDB.off("update", onFleetUpdate);
    };
  }, []);

  return (
    <Collapse
      size="small"
      defaultActiveKey={marketWaypoints.map((w) => w.symbol)}
      className="system-info-collapse"
    >
      {marketWaypoints.length > 0 &&
        marketWaypoints.map((waypoint) => (
          <Panel
            showArrow={true}
            key={waypoint.symbol}
            header={
              <div>
                {waypoint.symbol} [{waypoint.type}]
              </div>
            }
            extra={
              <span
                style={{ display: "block", minWidth: "15em" }}
                onClick={(evt) => evt.stopPropagation()} // Prevent panel collapse on click
              >
                <ShipSelector
                  size="small"
                  destinationSymbol={waypoint.symbol}
                />
              </span>
            }
          >
            <MarketInfo
              key={waypoint.symbol}
              waypoint={waypoint}
              ships={ships}
            />
          </Panel>
        ))}
    </Collapse>
  );
};

const ShipyardList = (props: { waypoints: Waypoint[] }) => {
  const shipyardWaypoints = props.waypoints.filter((w) =>
    w.traits.map((t) => t.symbol).includes(WaypointTraitSymbolEnum.Shipyard)
  );
  return (
    <Collapse
      size="small"
      defaultActiveKey={shipyardWaypoints.map((w) => w.symbol)}
      className="system-info-collapse"
    >
      {shipyardWaypoints.length > 0 &&
        shipyardWaypoints.map((waypoint) => (
          <Panel
            key={waypoint.symbol}
            header={`${waypoint.symbol} [${waypoint.type}]`}
          >
            <ShipyardInfo
              key={waypoint.symbol}
              waypoint={waypoint}
              ships={FleetDB.getMyShips()}
            />
          </Panel>
        ))}
    </Collapse>
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

  const hasMarket = props.details?.traits.reduce(
    (pHas, v) => pHas || v.symbol === WaypointTraitSymbolEnum.Marketplace,
    false
  );

  const hasShipyard = props.details?.traits.reduce(
    (pHas, v) => pHas || v.symbol === WaypointTraitSymbolEnum.Shipyard,
    false
  );

  const isJumpgate = props.waypoint.type === WaypointType.JumpGate;

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
        <Space>
          Ships:
          {localShips.map((ship, idx) => (
            <WaypointShipTag ship={ship} key={idx} />
          ))}
        </Space>
      )}
      {/* Navigate ships */}
      <ShipSelector size="middle" destinationSymbol={props.waypoint.symbol} />

      {(hasMarket || hasShipyard || isJumpgate) && (
        <Collapse size="small">
          {/* Get market */}
          {hasMarket && (
            <Panel key="market" header="Market">
              <MarketInfo waypoint={props.waypoint} ships={localShips} />
            </Panel>
          )}

          {/* Get shipyard */}
          {hasShipyard && (
            <Panel key="shipyard" header="Shipyard">
              <ShipyardInfo waypoint={props.waypoint} ships={localShips} />
            </Panel>
          )}

          {/* Get jump gate (connected systems) */}
          {isJumpgate && <Panel key="jumpgate" header="Jumpgate"></Panel>}
        </Collapse>
      )}

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

  useEffect(() => {
    // Listen to select system messages
    const selectCallback = (system: System) => {
      setSystem(system);
    };
    SystemEvent.on("select", selectCallback);

    // Clean up
    return () => {
      SystemEvent.off("select", selectCallback);
    };
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

  // TODO More practical to add a browsable list of markets and shipyards in the system?
  const tabItems: TabsProps["items"] = [
    {
      key: "waypoints",
      label: `Waypoints`,
      children: <WaypointList waypoints={waypoints} />,
    },
    {
      key: "markets",
      label: `Markets`,
      children: <MarketList waypoints={waypoints} />,
    },
    {
      key: "shipyards",
      label: `Shipyards`,
      children: <ShipyardList waypoints={waypoints} />,
    },
  ];

  return (
    <span>
      {system ? (
        <div>
          <div
            style={{
              marginBottom: "0em",
              padding: 0,
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
                  SystemEvent.emit("locate", system);
                }}
                type="text"
                size="small"
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

          <Tabs size="small" items={tabItems} />

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
