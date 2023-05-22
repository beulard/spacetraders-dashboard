import Badge from "@atlaskit/badge";
import Button from "@atlaskit/button";
import { CodeBlock } from "@atlaskit/code";
import ArrowRightIcon from "@atlaskit/icon/glyph/arrow-right";
import Popup from "@atlaskit/popup";
import { CheckboxSelect, OptionType } from "@atlaskit/select";
import { SimpleTag } from "@atlaskit/tag";
import TagGroup from "@atlaskit/tag-group";
import Tooltip from "@atlaskit/tooltip";
import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { MultiValue } from "react-select";
import { Ship, System, SystemWaypoint, Waypoint } from "spacetraders-sdk";
import api from "./api";
import { Accordion } from "./components/accordion";
import { MessageContext, MessageType } from "./message-queue";

const ShipSelector = (props: { destinationSymbol: string; fleet: Ship[] }) => {
  const [sendShips, setSendShips] = useState<MultiValue<OptionType>>([]);

  return (
    <>
      <label htmlFor="checkbox-select-ship">Send ships</label>
      <div style={{ display: "flex", alignItems: "center" }}>
        <div style={{ flexGrow: 1 }}>
          <CheckboxSelect
            inputId="checkbox-select-ship"
            placeholder="SH1P-1"
            options={props.fleet.map((ship) => ({
              label: ship.symbol,
              value: ship.symbol,
            }))}
            onChange={(ships) => {
              // console.log(ships);
              // console.log(ships.map((ship) => ship.value));
              setSendShips(ships);
            }}
            value={sendShips}
          />
        </div>
        <div style={{ width: "3em", padding: "0 0 0 0.5em" }}>
          <Button
            shouldFitContainer={true}
            iconAfter={<ArrowRightIcon label="" />}
            onClick={() => {
              sendShips.forEach((ship) => {
                console.log(
                  `Navigating ${ship.label} to ${props.destinationSymbol}`
                );
                api.fleet
                  .navigateShip(ship.label, {
                    waypointSymbol: props.destinationSymbol,
                  })
                  .then((res) => {
                    // TODO properly process, store, display response (ETA, fuel, nav)
                    console.log(res);
                    toast.success(
                      `Navigating ${ship.label} to ${props.destinationSymbol}`
                    );
                  })
                  .catch((err) => {
                    console.log(err);
                    toast.error(err.response.data.error.message);
                  });
              });
              setSendShips([]);
            }}
          ></Button>
        </div>
      </div>
    </>
  );
};

const WaypointInfo = (props: {
  waypoint: SystemWaypoint;
  fleet: Ship[];
  details: Waypoint | null;
}) => {
  const [popupOpen, setPopupOpen] = useState(false);

  return (
    <Accordion
      isOpen={false}
      header={
        <>
          <span>
            {props.waypoint.symbol} [{props.waypoint.type}]
          </span>
        </>
      }
      body={
        <>
          {props.details && (
            <TagGroup>
              {props.details.traits.map((trait) => (
                <Tooltip content={trait.description}>
                  <SimpleTag key={trait.symbol} text={trait.name} />
                </Tooltip>
              ))}
            </TagGroup>
          )}
          <ShipSelector
            destinationSymbol={props.waypoint.symbol}
            fleet={props.fleet}
          />
          <div className="pv-half">
            <Popup
              placement="auto"
              isOpen={popupOpen}
              onClose={() => setPopupOpen(false)}
              content={() => (
                <CodeBlock
                  language="JSON"
                  showLineNumbers={false}
                  text={JSON.stringify(props.details, null, 2)}
                />
              )}
              trigger={(triggerProps) => (
                <Button
                  // style={{ width: "4.5em" }}
                  {...triggerProps}
                  appearance="subtle"
                  isSelected={popupOpen}
                  onClick={() => setPopupOpen(!popupOpen)}
                >
                  {popupOpen ? "Hide JSON" : "Show JSON"}
                </Button>
              )}
            ></Popup>
          </div>
        </>
      }
    />
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
  const [fleet, setFleet] = useState<Ship[]>([]);
  const { msgQueue } = useContext(MessageContext);

  useEffect(() => {
    // Listen to select system messages
    msgQueue.listen(MessageType.SelectSystem, (payload: { system: System }) => {
      setSystem(payload.system);
    });

    // TODO replace by local DB?
    api.fleet
      .getMyShips()
      .then((res) => {
        setFleet(res.data.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  useEffect(() => {
    if (system) {
      // Get detailed waypoint data
      api.system.getSystemWaypoints(system.symbol).then((res) => {
        setWaypoints(res.data.data);
      });
    }
  }, [system]);

  // TODO Menu instead of accordions?
  return (
    <span
      style={{
        float: "left",
        textAlign: "left",
        width: "40%",
      }}
    >
      {system ? (
        <div>
          <div style={{ marginBottom: "0.25em", display: "inline-block" }}>
            <Tooltip content="Locate on map" delay={100} position="top">
              {(tooltipProps) => (
                <Button
                  {...tooltipProps}
                  onClick={() => {
                    msgQueue.post(MessageType.LocateSystem, {
                      x: system.x,
                      y: system.y,
                      symbol: system.symbol,
                    });
                  }}
                  appearance="subtle"
                  style={{ display: "inline", height: "100%" }}
                >
                  <big>
                    {system.symbol} [{system.type}]
                  </big>
                </Button>
              )}
            </Tooltip>
          </div>

          <Accordion
            isOpen={true}
            header={
              <h6 style={{ display: "inline" }}>
                Waypoints
                <span className="waypoint-count">
                  <Badge>{system.waypoints.length}</Badge>
                </span>
              </h6>
            }
            body={
              system.waypoints.length > 0 &&
              system.waypoints.map((waypoint, idx) => (
                <WaypointInfo
                  key={waypoint.symbol}
                  waypoint={waypoint}
                  fleet={fleet}
                  details={waypoints[idx] || null}
                />
              ))
            }
          />

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
