import { Dispatch, SetStateAction, createContext } from "react";
import { Ship } from "spacetraders-sdk";
import api from "./api";

async function getShipPage(index: number) {
  const page = await api.fleet.getMyShips(index);
  return page;
}

async function fetchShipsRecursive(index: number = 1): Promise<Ship[]> {
  const page = await getShipPage(index);
  if (index * page.data.meta.limit >= page.data.meta.total) {
    return page.data.data;
  }
  return [...page.data.data, ...(await fetchShipsRecursive(++index))];
}

export type Fleet = Ship[];

type FleetState = [Fleet, Dispatch<SetStateAction<Fleet>>];

const FleetContext = createContext<FleetState>([[], () => {}]);

export { FleetContext, fetchShipsRecursive };
