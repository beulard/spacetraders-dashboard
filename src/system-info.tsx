import { CodeBlock } from "@atlaskit/code";
import ArrowRightIcon from "@atlaskit/icon/glyph/arrow-right";
import {
  Button,
  Collapse,
  Popover,
  Select,
  Space,
  Spin,
  Tag,
  Tooltip,
} from "antd";
import { AxiosError } from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Ship,
  Shipyard,
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
import { SystemEvent } from "./system";
import { getSystemSymbol } from "./utils";
import WaypointDB from "./waypoint-db";
const { Panel } = Collapse;

const ShipyardInfo = (props: { waypoint: SystemWaypoint }) => {
  const [shipyard, setShipyard] = useState<Shipyard | null>(null);

  useEffect(() => {
    api.system
      .getShipyard(
        getSystemSymbol(props.waypoint.symbol),
        props.waypoint.symbol
      )
      .then((s) => setShipyard(s.data.data));
  }, []);

  if (shipyard) {
    return <div>Shipyard {shipyard.symbol}</div>;
  } else {
    return <Spin />;
  }
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
      <ShipSelector destinationSymbol={props.waypoint.symbol} />

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
              <Popover
                trigger="click"
                // disabled={localShips.length === 0}
                // onClick={toggleMarketInfo}
                content={<ShipyardInfo waypoint={props.waypoint} />}
              >
                <Button type="primary">Shipyard</Button>
              </Popover>
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
                  SystemEvent.emit("locate", system);
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
