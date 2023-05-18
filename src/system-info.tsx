import Badge from "@atlaskit/badge";
import Button from "@atlaskit/button";
import Tooltip from "@atlaskit/tooltip";
import DropdownMenu, {
  DropdownItem,
  DropdownItemGroup,
} from "@atlaskit/dropdown-menu";
import { System } from "spacetraders-sdk";
import {
  Accordion,
  AccordionBody,
  AccordionHeader,
} from "./components/accordion";
import { ShipSelector, WaypointInfo } from "./map";

const SystemInfo = (props: { system: System | null }) => {
  const system = props.system;

  return (
    <span
      style={{
        float: "left",
        textAlign: "left",
        // minWidth: "35%",
        // maxWidth: "35%",
        width: "30%",
        // marginRight: "2em",
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
          {system.waypoints.length > 0 && (
            <Accordion>
              <AccordionHeader setShown={() => {}} shown={true}>
                <h6 style={{ display: "inline" }}>
                  Waypoints
                  <span className="waypointCount">
                    <Badge>{system.waypoints.length}</Badge>
                  </span>
                </h6>
              </AccordionHeader>
              <AccordionBody setShown={() => {}} shown={true}>
                {system.waypoints.map((waypoint) => (
                  <div style={{ width: "100%" }}>
                    <DropdownMenu
                      trigger={({ triggerRef, ...props }) => (
                        <div style={{ width: "100%" }}>
                          <Button
                            shouldFitContainer
                            style={{
                              textAlign: "left",
                            }}
                            {...props}
                            ref={triggerRef}
                          >
                            <WaypointInfo waypoint={waypoint} />
                          </Button>
                        </div>
                      )}
                    >
                      <DropdownItemGroup>
                        <DropdownItem>
                          <ShipSelector />
                        </DropdownItem>
                      </DropdownItemGroup>
                    </DropdownMenu>

                    {/* <Button
                                      onClick={() => {
                                        console.log("Not yet implemented");
                                      }}
                                    >
                                      Send ship
                                    </Button> */}
                  </div>
                ))}
              </AccordionBody>
            </Accordion>
          )}

          {system.factions.length > 0 && (
            <Accordion>
              <AccordionHeader setShown={() => {}} shown={true}>
                <h6>Factions</h6>
              </AccordionHeader>
              <AccordionBody setShown={() => {}} shown={true}>
                {system.factions.map((faction) => (
                  <p>{faction.symbol}</p>
                ))}
              </AccordionBody>
            </Accordion>
          )}
        </div>
      )}
    </span>
  );
};

export { SystemInfo };
