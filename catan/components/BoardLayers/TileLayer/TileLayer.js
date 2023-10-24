import { useState, useEffect } from "react";

import {
  generateRandomTerrainType,
  generateRandomTokenNumber,
} from "components/helpers";
import { setInitialTiles } from "components/helpers/initializeBoardElements";
import Tile from "components/UI/Tile";

import classes from "./TileLayer.module.css";

const TileLayer = ({ isGameActive }) => {
  const [boardTiles, setBoardTiles] = useState(setInitialTiles());

  useEffect(() => {
    if (isGameActive) {
      setBoardTiles((prevTiles) => {
        const newBoardTiles = [...prevTiles];
        boardTiles.forEach((row, i) => {
          row.forEach((tile, j) => {
            const generatedRandomNumber = generateRandomTerrainType(
              prevTiles.flat()
            );

            newBoardTiles[i][j] = {
              ...tile,
              terrainId: generatedRandomNumber,
              tokenNumber: generateRandomTokenNumber(
                prevTiles.flat(),
                generatedRandomNumber
              ),
            };
          });
        });
        return newBoardTiles;
      });
    }
  }, [isGameActive]);

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

export default TileLayer;
