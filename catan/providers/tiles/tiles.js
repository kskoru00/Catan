import { setInitialTiles } from "helpers/initializeBoardElements";
import { createContext, useState } from "react";

import { generateRandomTerrainType, generateRandomTokenNumber } from "helpers";

const initialState = setInitialTiles();

export const TilesContext = createContext({
  tiles: { ...initialState },
  setInitialTiles: () => {},
  toggleTileIsActive: () => {},
});

const TilesProvider = ({ children }) => {
  const [tiles, setTiles] = useState(initialState);

  const setInitialTiles = () => {
    tiles.forEach((row, i) => {
      row.forEach((_, j) => {
        setTiles((prevTiles) => {
          const newBoardTiles = prevTiles.map((row) => [...row]);
          const terrainId = generateRandomTerrainType(prevTiles.flat());
          const tokenNumber = generateRandomTokenNumber(
            prevTiles.flat(),
            terrainId
          );

          newBoardTiles[i][j] = {
            ...newBoardTiles[i][j],
            terrainId,
            tokenNumber,
          };

          return newBoardTiles;
        });
      });
    });
  };

  const toggleTileIsActive = (id) => {
    setTiles((prevTiles) => {
      const newTiles = prevTiles.map((row) => {
        const newRow = [...row].map((el) =>
          el.id === id ? (el = { ...el, isActive: !el.isActive }) : el
        );
        return newRow;
      });
      return newTiles;
    });
  };

  const value = {
    tiles,
    setTiles,
    setInitialTiles,
    toggleTileIsActive,
  };

  return (
    <TilesContext.Provider value={value}>{children}</TilesContext.Provider>
  );
};

export default TilesProvider;
