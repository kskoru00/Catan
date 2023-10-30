import { useEffect } from "react";

import { useTileContext, useViewsContext } from "providers/hooks";

import Tile from "components/UI/Tile";

import classes from "./TilesLayer.module.css";

const TilesLayer = () => {
  const { tiles, setInitialTiles } = useTileContext();
  const { view } = useViewsContext();

  useEffect(() => {
    if (
      view.activeView === "setupGameView" &&
      tiles.every((row) =>
        row.every(
          (tile) => tile.tokenNumber === null && tile.terrainId === null
        )
      )
    ) {
      setInitialTiles();
    }
  }, [view.activeView]);

  return (
    <div className={classes.container}>
      {tiles.map((row, i) => (
        <div key={i} className={classes.row}>
          {row.map((tile, j) => (
            <Tile key={i - j} id={tile.id} />
          ))}
        </div>
      ))}
    </div>
  );
};

export default TilesLayer;
