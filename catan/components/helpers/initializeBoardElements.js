import { NUMBER_OF_TILES_IN_ROW, NUMBER_OF_CITIES_IN_ROW } from "consts";

export const setInitialTiles = () => {
  const tiles = new Array(NUMBER_OF_TILES_IN_ROW.length).fill([]).map((_, i) =>
    new Array(NUMBER_OF_TILES_IN_ROW[i]).fill({
      id: i,
      terrainId: null,
      tokenNumber: null,
    })
  );

  const cities = setInitialCities();

  tiles.forEach((row, rowIndex) => {
    const rowCities = cities.slice(2 * rowIndex, 2 * rowIndex + 4);

    row.forEach((tile, tileIndex) => {
      tile.cities = rowCities
        .map((city, cityIndex) => {
          if (cityIndex === 0) {
            if (rowIndex <= 2) {
              return city[tileIndex].id;
            }
            return city[tileIndex + 1].id;
          } else if (cityIndex === rowCities.length - 1) {
            if (rowIndex < 2) {
              return city[tileIndex + 1].id;
            }

            return city[tileIndex].id;
          } else {
            return [city[tileIndex].id, city[tileIndex + 1].id];
          }
        })
        .flat();
    });
  });

  return tiles;
};

export const setInitialCities = () => {
  const cities = new Array(NUMBER_OF_CITIES_IN_ROW.length)
    .fill([])
    .map((_, i) =>
      new Array(NUMBER_OF_CITIES_IN_ROW[i]).fill({ neighbours: [] })
    );

  cities.forEach((row, rowIndex) => {
    row.forEach((city, cityIndex) => {
      const id =
        rowIndex === 0
          ? cityIndex
          : cities[rowIndex - 1][cities[rowIndex - 1].length - 1].id +
            cityIndex +
            1;
      let neighbours =
        rowIndex === 0
          ? []
          : cities[rowIndex - 1]
              .filter((el) => el.neighbours.find((number) => number === id))
              .map((el) => el.id);

      if (rowIndex !== cities.length - 1) {
        if (rowIndex % 2 === 0) {
          if (rowIndex === 0) {
            neighbours = [rowIndex + id + 3, rowIndex + id + 4];
          } else if (cityIndex === 0) {
            const prevRow = cities[rowIndex - 1];
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
            const lastElementInCurrRow = row[cityIndex - 1];
            const lastNeighbourId =
              lastElementInCurrRow.neighbours[
                lastElementInCurrRow.neighbours.length - 1
              ];

            if (rowIndex >= 6 && cityIndex === row.length - 1) {
              neighbours.push(lastNeighbourId);
            } else {
              neighbours.push(lastNeighbourId);
              neighbours.push(lastNeighbourId + 1);
            }
          }
        } else {
          if (cityIndex === 0) {
            const prevRow = cities[rowIndex - 1];
            const lastElementInPrevROw = prevRow[prevRow.length - 1];
            const lastNeighbourId =
              lastElementInPrevROw.neighbours[
                lastElementInPrevROw.neighbours.length - 1
              ];
            neighbours.push(lastNeighbourId + 1);
          } else {
            const lastElementInCurrRow = row[cityIndex - 1];
            const lastNeighbourId =
              lastElementInCurrRow.neighbours[
                lastElementInCurrRow.neighbours.length - 1
              ];
            neighbours.push(lastNeighbourId + 1);
          }
        }
      }

      cities[rowIndex][cityIndex] = {
        ...city,
        id,
        neighbours: neighbours,
      };
    });
  });
  return cities;
};

export const setInitialRoads = () => {
  const cities = setInitialCities();

  const roads = [];

  cities.forEach((row) => {
    const roadsRow = [];

    row.forEach((city) => {
      city.neighbours.forEach((neighbour) => {
        if (city.id < neighbour) {
          roadsRow.push(`${city.id}-${neighbour}`);
        }
      });
    });
    roads.push(roadsRow);
  });

  return roads;
};
