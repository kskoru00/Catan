const TileSettlements = [
  [
    [0, 3, 4, 7, 8, 12],
    [1, 4, 5, 8, 9, 13],
    [2, 5, 6, 9, 10, 14],
  ],
  [
    [7, 11, 12, 16, 17, 22],
    [8, 12, 13, 17, 18, 23],
    [9, 13, 14, 18, 19, 24],
    [10, 14, 15, 19, 20, 25],
  ],
  [
    [16, 21, 22, 27, 28, 33],
    [17, 22, 23, 28, 29, 34],
    [18, 23, 24, 29, 30, 35],
    [19, 24, 25, 30, 31, 36],
    [20, 25, 26, 31, 32, 37],
  ],
  [
    [28, 33, 34, 38, 39, 43],
    [29, 34, 35, 39, 40, 44],
    [30, 35, 36, 40, 41, 45],
    [31, 36, 37, 41, 42, 46],
  ],
  [
    [39, 43, 44, 47, 48, 51],
    [40, 44, 45, 48, 49, 52],
    [41, 45, 46, 49, 50, 53],
  ],
];

export const Tiles = TileSettlements.map((row) => [
  ...row.map((tileSettlements) => ({
    settlements: [...tileSettlements],
    id: TileSettlements.flat().findIndex((el) => el === tileSettlements),
    terrainId: null,
    tokenNumber: null,
    isActive: null,
  })),
]);

const SettlementNeighbours = [
  [
    [3, 4],
    [4, 5],
    [5, 6],
  ],
  [
    [0, 7],
    [0, 1, 8],
    [1, 2, 9],
    [2, 10],
  ],
  [
    [3, 11, 12],
    [4, 12, 13],
    [5, 13, 14],
    [6, 14, 15],
  ],
  [
    [7, 16],
    [7, 8, 17],
    [8, 9, 18],
    [9, 10, 19],
    [10, 20],
  ],
  [
    [11, 21, 22],
    [12, 22, 23],
    [13, 23, 24],
    [14, 24, 25],
    [15, 25, 26],
  ],
  [
    [16, 27],
    [16, 17, 28],
    [17, 18, 29],
    [18, 19, 30],
    [19, 20, 31],
    [20, 32],
  ],
  [
    [21, 33],
    [22, 33, 34],
    [23, 34, 35],
    [24, 35, 36],
    [25, 36, 37],
    [26, 37],
  ],
  [
    [27, 28, 38],
    [28, 29, 39],
    [29, 30, 40],
    [30, 31, 41],
    [31, 32, 42],
  ],
  [
    [33, 43],
    [34, 43, 44],
    [35, 44, 45],
    [36, 45, 46],
    [37, 46],
  ],
  [
    [38, 39, 47],
    [39, 40, 48],
    [40, 41, 49],
    [41, 42, 50],
  ],
  [
    [43, 51],
    [44, 51, 52],
    [45, 52, 53],
    [46, 53],
  ],
  [
    [47, 48],
    [48, 49],
    [49, 50],
  ],
];

export const Settlements = SettlementNeighbours.map((row) => [
  ...row.map((settlement) => ({
    neighbours: [...settlement],
    id: SettlementNeighbours.flat().findIndex((el) => el === settlement),
  })),
]);

export const setInitialRoads = () => {
  const roads = [];

  Settlements.forEach((row) => {
    const roadsRow = [];

    row.forEach((settlement) => {
      settlement.neighbours.forEach((neighbour) => {
        if (settlement.id < neighbour) {
          roadsRow.push(`${settlement.id}-${neighbour}`);
        }
      });
    });

    if (roadsRow.length > 0) {
      roads.push(roadsRow);
    }
  });

  return roads;
};

export const Roads = setInitialRoads();

export const getRoadPosition = (row, positionInRow) => {
  if (row % 2 === 0) {
    if (
      (positionInRow % 2 === 0 && row < 5) ||
      (positionInRow % 2 !== 0 && row > 5)
    ) {
      return "left";
    } else if (
      positionInRow % 2 !== 0 ||
      (positionInRow % 2 === 0 && row > 5)
    ) {
      return "right";
    }
  } else {
    return "vertical";
  }
};
