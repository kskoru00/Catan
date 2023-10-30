import { NUMBER_OF_TILES_IN_ROW, NUMBER_OF_SETTLEMENTS_IN_ROW } from "consts";

export const setInitialTiles = () => {
  const tiles = new Array(NUMBER_OF_TILES_IN_ROW.length).fill([]).map((_, i) =>
    new Array(NUMBER_OF_TILES_IN_ROW[i]).fill({
      id: null,
      terrainId: null,
      tokenNumber: null,
      isActive: true,
    })
  );

  const settlements = setInitialSettlements();

  tiles.forEach((row, rowIndex) => {
    const rowSettlements = settlements.slice(2 * rowIndex, 2 * rowIndex + 4);

    row.forEach((tile, tileIndex) => {
      tile.settlements = rowSettlements
        .map((settlement, settlementIndex) => {
          if (settlementIndex === 0) {
            if (rowIndex <= 2) {
              return settlement[tileIndex].id;
            }
            return settlement[tileIndex + 1].id;
          } else if (settlementIndex === rowSettlements.length - 1) {
            if (rowIndex < 2) {
              return settlement[tileIndex + 1].id;
            }

            return settlement[tileIndex].id;
          } else {
            return [settlement[tileIndex].id, settlement[tileIndex + 1].id];
          }
        })
        .flat();

      const id = tiles.flat().filter((el) => el.id !== null).length;

      tiles[rowIndex][tileIndex] = {
        ...tile,
        id,
      };
    });
  });
  return tiles;
};

export const setInitialSettlements = () => {
  const settlements = new Array(NUMBER_OF_SETTLEMENTS_IN_ROW.length)
    .fill([])
    .map((_, i) =>
      new Array(NUMBER_OF_SETTLEMENTS_IN_ROW[i]).fill({ neighbours: [] })
    );

  settlements.forEach((row, rowIndex) => {
    row.forEach((settlement, settlementIndex) => {
      const id =
        rowIndex === 0
          ? settlementIndex
          : settlements[rowIndex - 1][settlements[rowIndex - 1].length - 1].id +
            settlementIndex +
            1;
      let neighbours =
        rowIndex === 0
          ? []
          : settlements[rowIndex - 1]
              .filter((el) => el.neighbours.find((number) => number === id))
              .map((el) => el.id);

      if (rowIndex !== settlements.length - 1) {
        if (rowIndex % 2 === 0) {
          if (rowIndex === 0) {
            neighbours = [rowIndex + id + 3, rowIndex + id + 4];
          } else if (settlementIndex === 0) {
            const prevRow = settlements[rowIndex - 1];
            const lastElementInPrevROw = prevRow[prevRow.length - 1];
            const lastNeighbourId =
              lastElementInPrevROw.neighbours[
                lastElementInPrevROw.neighbours.length - 1
              ];

            if (rowIndex >= 6) {
              neighbours.push(lastNeighbourId + 1);
            } else {
              neighbours.push(lastNeighbourId + 1);
              neighbours.push(lastNeighbourId + 2);
            }
          } else {
            const lastElementInCurrRow = row[settlementIndex - 1];
            const lastNeighbourId =
              lastElementInCurrRow.neighbours[
                lastElementInCurrRow.neighbours.length - 1
              ];

            if (rowIndex >= 6 && settlementIndex === row.length - 1) {
              neighbours.push(lastNeighbourId);
            } else {
              neighbours.push(lastNeighbourId);
              neighbours.push(lastNeighbourId + 1);
            }
          }
        } else {
          if (settlementIndex === 0) {
            const prevRow = settlements[rowIndex - 1];
            const lastElementInPrevROw = prevRow[prevRow.length - 1];
            const lastNeighbourId =
              lastElementInPrevROw.neighbours[
                lastElementInPrevROw.neighbours.length - 1
              ];
            neighbours.push(lastNeighbourId + 1);
          } else {
            const lastElementInCurrRow = row[settlementIndex - 1];
            const lastNeighbourId =
              lastElementInCurrRow.neighbours[
                lastElementInCurrRow.neighbours.length - 1
              ];
            neighbours.push(lastNeighbourId + 1);
          }
        }
      }

      settlements[rowIndex][settlementIndex] = {
        ...settlement,
        id,
        neighbours: neighbours,
      };
    });
  });
  return settlements;
};

export const setInitialRoads = () => {
  const settlements = setInitialSettlements();
  const roads = [];

  settlements.forEach((row) => {
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
