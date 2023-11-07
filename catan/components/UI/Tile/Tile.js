import { useTileContext, useViewsContext } from "providers/hooks";

import { Views, Layers, TerrainTypes } from "consts";

import classes from "./Tile.module.css";

const Tile = ({ id, onClick }) => {
  const { tiles, toggleTileIsActive } = useTileContext();
  const { view, setActiveView, setActiveLayer } = useViewsContext();

  const tile = tiles.flat().find((tile) => tile.id === id);

  const terrainColor = TerrainTypes.find(
    (type) => type.id === tile.terrainId
  )?.color;

  const unactiveTile = tiles.flat().find((tile) => !tile.isActive);

  const handleClick = () => {
    if (unactiveTile) {
      toggleTileIsActive(unactiveTile.id);
    }

    if (tile.tokenNumber !== 7) {
      toggleTileIsActive(id);
    }

    setActiveLayer(Layers.none);
    setActiveView(Views.robberViewPhase3);
    onClick(id);
  };

  return (
    <div className={classes.container}>
      <button
        onClick={handleClick}
        className={`${classes.polygon} ${classes[terrainColor]}`}
      ></button>
      <div className={classes.numberContainer}>
        {tile.tokenNumber === 7 ? (
          <span>{!unactiveTile ? "robber" : ""}</span>
        ) : (
          <span className={classes.number}>
            {view.activeView === Views.startGameView
              ? ""
              : tile.isActive
              ? `${tile.tokenNumber}`
              : "robber"}
          </span>
        )}
      </div>
    </div>
  );
};

export default Tile;
