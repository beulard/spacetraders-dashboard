import Badge from "@atlaskit/badge";
import Button from "@atlaskit/button";
import { CheckboxSelect, OptionType } from "@atlaskit/select";
import Tooltip from "@atlaskit/tooltip";
import { useEffect, useState } from "react";
import { Ship, System, SystemWaypoint } from "spacetraders-sdk";
import api from "./api";
import { Accordion } from "./components/accordion";
import ArrowRightIcon from "@atlaskit/icon/glyph/arrow-right";
import toast from "react-hot-toast";
import { MultiValue } from "react-select";

const ShipSelector = (props: { destinationSymbol: string }) => {
  const [fleet, setFleet] = useState<Array<Ship>>([]);
  const [sendShips, setSendShips] = useState<MultiValue<OptionType>>([]);

  // TODO replace by local DB?
  useEffect(() => {
    api.fleet
      .getMyShips()
      .then((res) => {
        setFleet(res.data.data);
        // console.log("ships", res.data.meta, res.data.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  return (
    <>
      <label htmlFor="checkbox-select-ship">Send ships</label>
      <div style={{ display: "flex", alignItems: "center" }}>
        <div style={{ flexGrow: 1 }}>
          <CheckboxSelect
            inputId="checkbox-select-ship"
            placeholder="SH1P-1"
            options={fleet.map((ship) => ({
              label: ship.symbol,
              value: ship.symbol,
            }))}
            onChange={(ships) => {
              console.log(ships);
              console.log(ships.map((ship) => ship.value));
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

const SystemInfoActions = (props: { waypoint: SystemWaypoint }) => {
  return (
    <Accordion
      isOpen={false}
      header={props.waypoint.symbol}
      body={<ShipSelector destinationSymbol={props.waypoint.symbol} />}
    />
  );
};

/**
 * Shows a list of waypoints in `props.system`. Each waypoint is a dropdown menu
 * which allows the user to pick an action (e.g. send ship, fetch market, ...)
 */
const SystemInfo = (props: { system: System | null }) => {
  const system = props.system;

  return (
    <span
      style={{
        float: "left",
        textAlign: "left",
        width: "30%",
      }}
    >
      {system && (
        <div>
          <div style={{ marginBottom: "0.25em", display: "inline-block" }}>
            <Tooltip content="Locate on map" delay={100} position="top">
              {(tooltipProps) => (
                <Button
                  {...tooltipProps}
                  onClick={() => {
                    alert("TODO");
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
                <SystemInfoActions waypoint={waypoint} key={idx} />
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
      )}
    </span>
  );
};

export { SystemInfo };
