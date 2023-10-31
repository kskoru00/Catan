import { useTileContext, useViewsContext } from "providers/hooks";

import { terrainTypes } from "consts";

import classes from "./Tile.module.css";

const Tile = ({ id, onClick }) => {
  const { tiles, toggleTileIsActive } = useTileContext();
  const { view, changeView, changeActiveLayer } = useViewsContext();

  const tile = tiles.flat().find((tile) => tile.id === id);

  const terrainColor = terrainTypes.find(
    (type) => type.id === tile.terrainId
  )?.color;

  const unactiveTile = tiles.flat().find((tile) => !tile.isActive);

  const handleClick = () => {
    if (unactiveTile) {
      toggleTileIsActive(unactiveTile.id);
    }
    if (id !== 7) {
      toggleTileIsActive(id);
    }

    changeActiveLayer("none");
    changeView("robberViewPhase3");
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
            {view.activeView === "startGameView"
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
