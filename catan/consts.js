export const MIN_NUMBER_OF_PLAYERS = 3;
export const MAX_NUMBER_OF_PLAYERS = 4;

export const Players = {
  playerOne: "playerOne",
  playerTwo: "playerTwo",
  playerThree: "playerThree",
  playerFour: "playerFour",
};

export const playerColors = [
  { id: 0, color: "white" },
  { id: 1, color: "blue" },
  { id: 2, color: "orange" },
  { id: 3, color: "red" },
];

export const NUMBER_OF_TILES_IN_ROW = [3, 4, 5, 4, 3];
export const NUMBER_OF_SETTLEMENTS_IN_ROW = [
  3, 4, 4, 5, 5, 6, 6, 5, 5, 4, 4, 3,
];

export const terrainTypes = [
  {
    id: 0,
    name: "hills",
    amount: 3,
    produce: "brick",
    color: "orange",
  },
  {
    id: 1,
    name: "forest",
    amount: 4,
    produce: "wool",
    color: "green",
  },
  {
    id: 2,
    name: "mountains",
    amount: 3,
    produce: "ore",
    color: "gray",
  },
  {
    id: 3,
    name: "fields",
    amount: 4,
    produce: "grain",
    color: "yellow",
  },
  {
    id: 4,
    name: "pasture",
    amount: 4,
    produce: "wool",
    color: "lightGreen",
  },
  {
    id: 5,
    name: "dessert",
    amount: 1,
    produce: "nothing",
    color: "brown",
  },
];

export const tokenNumbers = [
  { value: 2, amount: 1 },
  { value: 3, amount: 2 },
  { value: 4, amount: 2 },
  { value: 5, amount: 2 },
  { value: 6, amount: 2 },
  { value: 8, amount: 2 },
  { value: 9, amount: 2 },
  { value: 10, amount: 2 },
  { value: 11, amount: 2 },
  { value: 12, amount: 1 },
];

export const TOTAL_NUMBER_OF_EACH_RESOURCE = 95 / 5;

export const NUMBER_OF_RESOURCES_TO_GIVE_TO_BANK = 4;
export const NUMBER_OF_RESOURCES_RECEIVING_FROM_BANK = 1;

export const MAX_AMOUNT_SETTLEMENTS = 5;
export const MAX_AMOUNT_CITIES = 4;
export const MAX_AMOUNT_ROADS = 15;

export const resourcesForBuild = {
  road: {
    brick: 1,
    lumber: 1,
  },
  settlement: {
    brick: 1,
    lumber: 1,
    wool: 1,
    grain: 1,
  },
  city: {
    ore: 3,
    grain: 2,
  },
  developmentCard: {
    ore: 1,
    wool: 1,
    grain: 1,
  },
};
