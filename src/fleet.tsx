import Button from "@atlaskit/button";
import ProgressBar from "@atlaskit/progress-bar";
import Select from "@atlaskit/select";
import { useEffect } from "react";
import "./index.css";

import { useState } from "react";
import toast from "react-hot-toast";
import {
  Market,
  Ship,
  ShipCargoItem,
  ShipNavRoute,
  TradeGood,
} from "spacetraders-sdk";

import api from "./api";

import { Accordion } from "./components/accordion";

const ColorSet = {
  "1": "#FC440F",
  "2": "#1E96FC",
  "3": "#1EFFBC",
  "4": "#FCF300",
  "5": "#FFC600",
};

const Navigation = (props: { ship: Ship; refresh: () => void }) => {
  const FuelStatus = () => {
    return <></>;
  };

  useEffect(() => {}, [props.ship]);

  const NavStatus = () => {
    const [routeProgress, setRouteProgress] = useState<number>(1);
    const [navRoute, setNavRoute] = useState<ShipNavRoute>();

    const updateRouteProgress = () => {
      if (navRoute) {
        const beginning = new Date(navRoute?.departureTime!).getTime();
        const now = Date.now();
        const end = new Date(navRoute?.arrival!).getTime();

        if (now > end) {
          setRouteProgress(1);
        } else {
          setRouteProgress(1 - (end - now) / (end - beginning));
          setTimeout(updateRouteProgress, 100);
        }
      }
    };

    useEffect(() => {
      updateRouteProgress();
    }, [navRoute]);

    const SelectWaypoint = () => {
      const [selectedWaypoint, setSelectedWayPoint] = useState("");
      const systemList = JSON.parse(
        '{"data":[{"symbol":"X1-ZA40","sectorSymbol":"X1","type":"RED_STAR","x":34,"y":40,"waypoints":[{"symbol":"X1-ZA40-15970B","type":"PLANET","x":10,"y":0},{"symbol":"X1-ZA40-69371X","type":"MOON","x":10,"y":0},{"symbol":"X1-ZA40-97262C","type":"MOON","x":10,"y":0},{"symbol":"X1-ZA40-11513D","type":"MOON","x":10,"y":0},{"symbol":"X1-ZA40-34964E","type":"PLANET","x":5,"y":0},{"symbol":"X1-ZA40-99095A","type":"ASTEROID_FIELD","x":-9,"y":29},{"symbol":"X1-ZA40-23636D","type":"GAS_GIANT","x":-44,"y":-22},{"symbol":"X1-ZA40-68707C","type":"ORBITAL_STATION","x":-44,"y":-22},{"symbol":"X1-ZA40-41138D","type":"PLANET","x":0,"y":70},{"symbol":"X1-ZA40-28549E","type":"JUMP_GATE","x":2,"y":75}],"factions":[]},{"symbol":"X1-TQ4","sectorSymbol":"X1","type":"BLUE_STAR","x":24,"y":5,"waypoints":[{"symbol":"X1-TQ4-38810X","type":"PLANET","x":29,"y":11},{"symbol":"X1-TQ4-79811D","type":"MOON","x":29,"y":11},{"symbol":"X1-TQ4-41212D","type":"GAS_GIANT","x":-43,"y":-25},{"symbol":"X1-TQ4-43213E","type":"ORBITAL_STATION","x":-43,"y":-25},{"symbol":"X1-TQ4-76314C","type":"JUMP_GATE","x":-19,"y":-67}],"factions":[]},{"symbol":"X1-KS23","sectorSymbol":"X1","type":"RED_STAR","x":38,"y":3,"waypoints":[{"symbol":"X1-KS23-56900X","type":"PLANET","x":27,"y":0},{"symbol":"X1-KS23-35171B","type":"MOON","x":27,"y":0},{"symbol":"X1-KS23-29152X","type":"PLANET","x":-36,"y":44},{"symbol":"X1-KS23-14583F","type":"MOON","x":-36,"y":44},{"symbol":"X1-KS23-39184B","type":"JUMP_GATE","x":42,"y":48}],"factions":[]},{"symbol":"X1-JP80","sectorSymbol":"X1","type":"RED_STAR","x":8,"y":18,"waypoints":[{"symbol":"X1-JP80-50230F","type":"PLANET","x":20,"y":-25},{"symbol":"X1-JP80-20451D","type":"MOON","x":20,"y":-25},{"symbol":"X1-JP80-01332B","type":"MOON","x":20,"y":-25},{"symbol":"X1-JP80-72983A","type":"MOON","x":20,"y":-25},{"symbol":"X1-JP80-73494D","type":"PLANET","x":-43,"y":-17},{"symbol":"X1-JP80-74165C","type":"MOON","x":-43,"y":-17},{"symbol":"X1-JP80-15496X","type":"GAS_GIANT","x":-56,"y":13},{"symbol":"X1-JP80-14117Z","type":"ASTEROID_FIELD","x":-62,"y":-60}],"factions":[]},{"symbol":"X1-JZ40","sectorSymbol":"X1","type":"ORANGE_STAR","x":53,"y":35,"waypoints":[{"symbol":"X1-JZ40-30300C","type":"PLANET","x":17,"y":35},{"symbol":"X1-JZ40-01001E","type":"MOON","x":17,"y":35},{"symbol":"X1-JZ40-80062E","type":"ASTEROID_FIELD","x":-55,"y":21}],"factions":[]},{"symbol":"X1-HA21","sectorSymbol":"X1","type":"BLUE_STAR","x":11,"y":5,"waypoints":[{"symbol":"X1-HA21-10230D","type":"GAS_GIANT","x":-27,"y":-18},{"symbol":"X1-HA21-42531B","type":"ASTEROID_FIELD","x":-1,"y":59}],"factions":[]},{"symbol":"X1-VK49","sectorSymbol":"X1","type":"ORANGE_STAR","x":2,"y":28,"waypoints":[{"symbol":"X1-VK49-75850F","type":"PLANET","x":42,"y":-1},{"symbol":"X1-VK49-11761F","type":"GAS_GIANT","x":-15,"y":-57}],"factions":[]},{"symbol":"X1-AZ83","sectorSymbol":"X1","type":"BLUE_STAR","x":0,"y":33,"waypoints":[{"symbol":"X1-AZ83-08750E","type":"GAS_GIANT","x":1,"y":32}],"factions":[]},{"symbol":"X1-JJ48","sectorSymbol":"X1","type":"BLUE_STAR","x":12,"y":-3,"waypoints":[{"symbol":"X1-JJ48-87750D","type":"PLANET","x":-19,"y":-28},{"symbol":"X1-JJ48-30941E","type":"MOON","x":-19,"y":-28},{"symbol":"X1-JJ48-02932F","type":"PLANET","x":0,"y":-41},{"symbol":"X1-JJ48-59753F","type":"MOON","x":0,"y":-41},{"symbol":"X1-JJ48-28044F","type":"ASTEROID_FIELD","x":63,"y":-24}],"factions":[]},{"symbol":"X1-KJ21","sectorSymbol":"X1","type":"UNSTABLE","x":-1,"y":16,"waypoints":[],"factions":[]}],"meta":{"total":7000,"page":1,"limit":10}}'
      );
      const waypointLists = [].concat(
        ...systemList.data.map((system: any) => {
          const waypointList = system.waypoints.map((waypoint: any) => {
            return { label: waypoint.symbol, value: waypoint.symbol };
          });

          return waypointList;
        })
      );

      return (
        <div>
          <span>
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
          </span>
          <span>
            <Button
              appearance="warning"
              style={{
                alignSelf: "center",
              }}
              onClick={() => {
                api.fleet
                  .navigateShip(props.ship.symbol, {
                    waypointSymbol: selectedWaypoint,
                  })
                  .then((res) => {
                    const data = res.data.data;
                    props.ship.nav.route = data.nav.route;
                    setNavRoute(data.nav.route);

                    const duration =
                      new Date(data.nav.route.arrival).getTime() -
                      new Date().getTime();
                    setTimeout(props.refresh, duration);
                  })
                  .catch((err) => {
                    console.log(err);
                  });
              }}
            >
              GO
            </Button>
          </span>
        </div>
      );
    };

    if (routeProgress != 1) {
      return (
        <>
          <ProgressBar value={routeProgress} />
          <div> Transit to {navRoute?.destination.symbol} </div>
        </>
      );
    } else {
      switch (props.ship.nav.status) {
        case "IN_TRANSIT":
          break;
        case "DOCKED":
          return (
            <>
              <span>Docked at {props.ship.nav.route.destination.symbol}</span>
              <Button
                appearance="primary"
                onClick={() => {
                  const promise = api.fleet.dockShip(props.ship.symbol);
                  promise
                    .then((res) => {
                      props.refresh();
                    })
                    .catch((err) => {
                      console.log(err);
                    });
                }}
              >
                Orbit
              </Button>
              <SelectWaypoint />
            </>
          );
        case "IN_ORBIT":
          return (
            <>
              <span>
                Orbitting around {props.ship.nav.route.destination.symbol}
              </span>
              <Button
                appearance="primary"
                onClick={() => {
                  const promise = api.fleet.dockShip(props.ship.symbol);
                  promise
                    .then((res) => {
                      props.refresh();
                    })
                    .catch((err) => {
                      console.log(err);
                    });
                }}
              >
                Dock
              </Button>
              <SelectWaypoint />
            </>
          );
        default:
          <></>;
      }
    }

    return <></>;
  };

  return (
    <div
      style={{
        margin: 10,
        padding: 10,
        backgroundColor: ColorSet[2],
        borderRadius: 4,
      }}
    >
      <h3>Navigation</h3>
      <FuelStatus />
      <NavStatus />
    </div>
  );
};

const Inventory = (props: { ship: Ship; refresh: () => void }) => {
  return (
    <div
      style={{
        margin: 10,
        padding: 10,
        backgroundColor: ColorSet[4],
        borderRadius: 4,
      }}
    >
      {props.ship.cargo.inventory.map((value: ShipCargoItem) => {
        return (
          <div>
            <h3>Inventory</h3>
            <span>{value.units} - </span>
            <span>{value.name}</span>
            <span> ({value.symbol})</span>
          </div>
        );
      })}
    </div>
  );
};

const MarketInfo = (props: { ship: Ship; refresh: () => void }) => {
  const [marketInfo, setMarketInfo] = useState<Market>();

  const refresh = () => {
    const promise = api.system.getMarket(
      props.ship.nav.systemSymbol,
      props.ship.nav.waypointSymbol
    );
    promise
      .then((res) => {
        const data = res.data.data;
        setMarketInfo(data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(refresh, [props.ship.nav.waypointSymbol]);

  return (
    <div
      style={{
        margin: 10,
        padding: 10,
        backgroundColor: ColorSet[1],
        borderRadius: 4,
      }}
    >
      <h3>Market</h3>
      <div
        style={{
          display: "flex",
        }}
      >
        <div>
          <h4>Buying</h4>
          {marketInfo?.imports.map((value: TradeGood) => {
            return (
              <div>
                <span>
                  {value.name} ({value.symbol})
                </span>
              </div>
            );
          })}
        </div>
        <div>
          <h4>Selling</h4>
          {marketInfo?.exports.map((value: TradeGood) => {
            return (
              <div>
                <span>
                  {value.name} ({value.symbol})
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default () => {
  const [fleet, setFleet] = useState(Array<Ship>);

  const refresh = () => {
    const promise = api.fleet.getMyShips();

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
      {fleet.map((ship) => {
        return (
          <Accordion
            isOpen={false}
            header={<div>{ship.symbol}</div>}
            body={
              <div style={{ display: "flex" }}>
                <Navigation ship={ship} refresh={refresh} />
                <Inventory ship={ship} refresh={refresh} />
                <MarketInfo ship={ship} refresh={refresh}></MarketInfo>
              </div>
            }
          />
        );
      })}
    </div>
  );
};
