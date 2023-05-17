import React, { ChangeEvent, useEffect, useRef } from "react";
import ReactDOM from "react-dom/client";
import Button from "@atlaskit/button";
import TableTree, {
  Cell,
  Header,
  Headers,
  Row,
  Rows,
} from "@atlaskit/table-tree";
import Select from "@atlaskit/select";
import "./index.css";

import toast from "react-hot-toast";
import { useState } from "react";
import player from "./player";
import { Configuration, FleetApi, Ship, System } from "spacetraders-sdk";

type Props = {
  title: string;
  children?: JSX.Element[] | JSX.Element;
};

const CollapsibleElement = ({ title, children }: Props) => {
  const [collapsed, setCollapsed] = useState(true);
  const [maxHeight, setMaxHeight] = useState<number>(1);

  const toCollapse = useRef<any>(null);

  const toggleExpansion = () => {
    setCollapsed(!collapsed);
  };

  useEffect(() => {
    if (toCollapse.current) {
      const height = toCollapse.current.scrollHeight;
      setMaxHeight(height);
    }
  });

  return (
    <div>
      <h2 onClick={toggleExpansion}>{title}</h2>
      <div
        ref={toCollapse}
        style={{
          transition: "all 0.2s ease-in-out",
          overflow: collapsed ? "hidden " : "visible",
          maxHeight: collapsed ? 0 : maxHeight,
          display: "grid",
          gridTemplateColumns: "auto auto auto",
        }}
      >
        {children}
      </div>
    </div>
  );
};

const MoveElement = (props: {
  fleetApi: FleetApi;
  ship: Ship;
  refresh: () => void;
}) => {
  const [selectedWaypoint, setSelectedWayPoint] = useState("");
  const [navigating, setNavigating] = useState(false);
  const [arrival, setArrival] = useState("");

  const systemList = JSON.parse(
    '{"data":[{"symbol":"X1-ZA40","sectorSymbol":"X1","type":"RED_STAR","x":34,"y":40,"waypoints":[{"symbol":"X1-ZA40-15970B","type":"PLANET","x":10,"y":0},{"symbol":"X1-ZA40-69371X","type":"MOON","x":10,"y":0},{"symbol":"X1-ZA40-97262C","type":"MOON","x":10,"y":0},{"symbol":"X1-ZA40-11513D","type":"MOON","x":10,"y":0},{"symbol":"X1-ZA40-34964E","type":"PLANET","x":5,"y":0},{"symbol":"X1-ZA40-99095A","type":"ASTEROID_FIELD","x":-9,"y":29},{"symbol":"X1-ZA40-23636D","type":"GAS_GIANT","x":-44,"y":-22},{"symbol":"X1-ZA40-68707C","type":"ORBITAL_STATION","x":-44,"y":-22},{"symbol":"X1-ZA40-41138D","type":"PLANET","x":0,"y":70},{"symbol":"X1-ZA40-28549E","type":"JUMP_GATE","x":2,"y":75}],"factions":[]},{"symbol":"X1-TQ4","sectorSymbol":"X1","type":"BLUE_STAR","x":24,"y":5,"waypoints":[{"symbol":"X1-TQ4-38810X","type":"PLANET","x":29,"y":11},{"symbol":"X1-TQ4-79811D","type":"MOON","x":29,"y":11},{"symbol":"X1-TQ4-41212D","type":"GAS_GIANT","x":-43,"y":-25},{"symbol":"X1-TQ4-43213E","type":"ORBITAL_STATION","x":-43,"y":-25},{"symbol":"X1-TQ4-76314C","type":"JUMP_GATE","x":-19,"y":-67}],"factions":[]},{"symbol":"X1-KS23","sectorSymbol":"X1","type":"RED_STAR","x":38,"y":3,"waypoints":[{"symbol":"X1-KS23-56900X","type":"PLANET","x":27,"y":0},{"symbol":"X1-KS23-35171B","type":"MOON","x":27,"y":0},{"symbol":"X1-KS23-29152X","type":"PLANET","x":-36,"y":44},{"symbol":"X1-KS23-14583F","type":"MOON","x":-36,"y":44},{"symbol":"X1-KS23-39184B","type":"JUMP_GATE","x":42,"y":48}],"factions":[]},{"symbol":"X1-JP80","sectorSymbol":"X1","type":"RED_STAR","x":8,"y":18,"waypoints":[{"symbol":"X1-JP80-50230F","type":"PLANET","x":20,"y":-25},{"symbol":"X1-JP80-20451D","type":"MOON","x":20,"y":-25},{"symbol":"X1-JP80-01332B","type":"MOON","x":20,"y":-25},{"symbol":"X1-JP80-72983A","type":"MOON","x":20,"y":-25},{"symbol":"X1-JP80-73494D","type":"PLANET","x":-43,"y":-17},{"symbol":"X1-JP80-74165C","type":"MOON","x":-43,"y":-17},{"symbol":"X1-JP80-15496X","type":"GAS_GIANT","x":-56,"y":13},{"symbol":"X1-JP80-14117Z","type":"ASTEROID_FIELD","x":-62,"y":-60}],"factions":[]},{"symbol":"X1-JZ40","sectorSymbol":"X1","type":"ORANGE_STAR","x":53,"y":35,"waypoints":[{"symbol":"X1-JZ40-30300C","type":"PLANET","x":17,"y":35},{"symbol":"X1-JZ40-01001E","type":"MOON","x":17,"y":35},{"symbol":"X1-JZ40-80062E","type":"ASTEROID_FIELD","x":-55,"y":21}],"factions":[]},{"symbol":"X1-HA21","sectorSymbol":"X1","type":"BLUE_STAR","x":11,"y":5,"waypoints":[{"symbol":"X1-HA21-10230D","type":"GAS_GIANT","x":-27,"y":-18},{"symbol":"X1-HA21-42531B","type":"ASTEROID_FIELD","x":-1,"y":59}],"factions":[]},{"symbol":"X1-VK49","sectorSymbol":"X1","type":"ORANGE_STAR","x":2,"y":28,"waypoints":[{"symbol":"X1-VK49-75850F","type":"PLANET","x":42,"y":-1},{"symbol":"X1-VK49-11761F","type":"GAS_GIANT","x":-15,"y":-57}],"factions":[]},{"symbol":"X1-AZ83","sectorSymbol":"X1","type":"BLUE_STAR","x":0,"y":33,"waypoints":[{"symbol":"X1-AZ83-08750E","type":"GAS_GIANT","x":1,"y":32}],"factions":[]},{"symbol":"X1-JJ48","sectorSymbol":"X1","type":"BLUE_STAR","x":12,"y":-3,"waypoints":[{"symbol":"X1-JJ48-87750D","type":"PLANET","x":-19,"y":-28},{"symbol":"X1-JJ48-30941E","type":"MOON","x":-19,"y":-28},{"symbol":"X1-JJ48-02932F","type":"PLANET","x":0,"y":-41},{"symbol":"X1-JJ48-59753F","type":"MOON","x":0,"y":-41},{"symbol":"X1-JJ48-28044F","type":"ASTEROID_FIELD","x":63,"y":-24}],"factions":[]},{"symbol":"X1-KJ21","sectorSymbol":"X1","type":"UNSTABLE","x":-1,"y":16,"waypoints":[],"factions":[]}],"meta":{"total":7000,"page":1,"limit":10}}'
  );

  useEffect(() => {
    console.log(new Date().getTime());
    if (props.ship.nav.status != "IN_TRANSIT") {
      setNavigating(false);
    }
  }, [props.ship]);

  const waypointLists = [].concat(
    ...systemList.data.map((system: any) => {
      const waypointList = system.waypoints.map((waypoint: any) => {
        return { label: waypoint.symbol, value: waypoint.symbol };
      });

      return waypointList;
    })
  );

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "auto auto",
      }}
    >
      {navigating ? (
        <div>
          <span>Navigating to {props.ship.nav.route.destination.symbol}</span>
          <span>Arrival : {arrival}</span>
        </div>
      ) : (
        <></>
      )}
      <Select
        inputId={props.ship.symbol + "WaypointSelect"}
        className="single-select"
        classNamePrefix="react-select"
        options={waypointLists}
        placeholder="Choose a waypoint"
        onChange={(value: any) => {
          setSelectedWayPoint(value.value);
        }}
      />
      <Button
        appearance="warning"
        style={{
          alignSelf: "center",
        }}
        onClick={() => {
          props.fleetApi
            .navigateShip(props.ship.symbol, {
              waypointSymbol: selectedWaypoint,
            })
            .then((res) => {
              const data = res.data.data;

              setNavigating(data.nav.status == "IN_TRANSIT");
              setArrival(data.nav.route.arrival);

              const duration =
                new Date(data.nav.route.arrival).getTime() -
                new Date().getTime();
              console.log("Duration of travel : " + duration);
              setTimeout(props.refresh, duration);
            })
            .catch((err) => {
              console.log(err);
            });
        }}
      >
        GO
      </Button>
    </div>
  );
};

export default () => {
  const [fleet, setFleet] = useState(Array<Ship>);

  const config = new Configuration({
    accessToken: player.apiToken,
  });
  const fleetApi = new FleetApi(config);

  const refresh = () => {
    const promise = fleetApi.getMyShips();

    toast.promise(promise, {
      loading: "Fetching fleet",
      success: "Fetched fleet",
      error: "Error (check console)",
    });

    promise
      .then((res) => {
        const data = res.data.data;
        setFleet(data);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  useEffect(refresh, []);

  return (
    <div>
      <h1> Fleet </h1>
      {fleet.map((ship) => {
        return (
          <CollapsibleElement title={ship.symbol}>
            <div
              style={{
                display: "grid",
                gridTemplateAreas: '"a a""b c""d e"',
              }}
            >
              <div style={{ gridArea: "a" }}> Navigation</div>
              <div style={{ gridArea: "b" }}>Status : </div>
              <div style={{ gridArea: "c" }}>{ship.nav.status}</div>
              <div style={{ gridArea: "d" }}>
                <MoveElement
                  fleetApi={fleetApi}
                  ship={ship}
                  refresh={refresh}
                ></MoveElement>
              </div>
            </div>
            <div className="tab2">TAB2</div>
            <div className="tab3">TAB3</div>
          </CollapsibleElement>
        );
      })}
    </div>
  );
};
