import * as ex from "excalibur";

const SystemTypeColor: { [id: string]: ex.Color } = {
  NEUTRON_STAR: ex.Color.Cyan,
  RED_STAR: ex.Color.Red,
  ORANGE_STAR: ex.Color.Orange,
  BLUE_STAR: ex.Color.Blue,
  YOUNG_STAR: ex.Color.ExcaliburBlue,
  WHITE_DWARF: ex.Color.White,
  BLACK_HOLE: ex.Color.Black,
  HYPERGIANT: ex.Color.Violet,
  NEBULA: ex.Color.Green,
  UNSTABLE: ex.Color.Rose,
};

const WaypointTypeStyle: { [id: string]: { color: ex.Color; size: number } } = {
  PLANET: { color: ex.Color.Blue, size: 3 },
  GAS_GIANT: { color: ex.Color.Violet, size: 4 },
  MOON: { color: ex.Color.Gray, size: 1 },
  ORBITAL_STATION: { color: ex.Color.Yellow, size: 2 },
  JUMP_GATE: { color: ex.Color.White, size: 1.5 },
  ASTEROID_FIELD: { color: ex.Color.Viridian, size: 3 },
  NEBULA: { color: ex.Color.Vermilion, size: 4 },
  DEBRIS_FIELD: { color: ex.Color.LightGray, size: 3 },
  GRAVITY_WELL: { color: ex.Color.Cyan, size: 3 },
};

export { SystemTypeColor, WaypointTypeStyle };
