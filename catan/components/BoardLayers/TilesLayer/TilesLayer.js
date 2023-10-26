import { useState, useEffect } from "react";

import { useViewsContext } from "providers/hooks";

import { generateRandomTerrainType, generateRandomTokenNumber } from "helpers";
import { setInitialTiles } from "helpers/initializeBoardElements";

import Tile from "components/UI/Tile";

import classes from "./TilesLayer.module.css";

const TilesLayer = () => {
  const [boardTiles, setBoardTiles] = useState(setInitialTiles());
  const { view } = useViewsContext();

  useEffect(() => {
    if (
      view.activeView === "setupGameView" &&
      boardTiles.every((row) =>
        row.every(
          (tile) => tile.tokenNumber === null && tile.terrainId === null
        )
      )
    ) {
      boardTiles.forEach((row, i) => {
        row.forEach((_, j) => {
          setBoardTiles((prevTiles) => {
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
    }
  }, [view]);

  return (
    <div className={classes.container}>
      {boardTiles.map((row, i) => (
        <div key={i} className={classes.row}>
          {row.map((_, j) => (
            <Tile
              terrainId={boardTiles[i][j].terrainId}
              tokenNumber={boardTiles[i][j].tokenNumber}
              key={i - j}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default TilesLayer;
