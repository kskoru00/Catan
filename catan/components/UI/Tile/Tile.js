import { useTileContext, useViewsContext } from "providers/hooks";

import { Views, Layers, TerrainTypes, ROBBER_TOKEN_NUMBER } from "consts";

import classes from "./Tile.module.css";

const Tile = ({ id, onClick }) => {
  const { tiles, toggleTileIsActive } = useTileContext();
  const { view, setActiveView, setActiveLayer, setError } = useViewsContext();

  const tile = tiles.flat().find((tile) => tile.id === id);

  const inactiveTileId = tiles
    .flat()
    .find((tile) => tile.isActive === false)?.id;

  const terrainColor = TerrainTypes.find(
    (type) => type.id === tile.terrainId
  )?.color;

  const tileNumber =
    view.activeView === Views.startGameView ||
    (tile.tokenNumber === 7 && inactiveTileId !== undefined)
      ? ""
      : tile.isActive
      ? tile.tokenNumber
      : "robber";

  const handleClick = () => {
    setError("");

    if (tileNumber === "robber") {
      setError("You can't place robber on this tile.");
      return;
    }

    if (inactiveTileId !== undefined) {
      toggleTileIsActive(inactiveTileId);
    }

    if (tile.tokenNumber !== ROBBER_TOKEN_NUMBER) {
      toggleTileIsActive(id);
    }

    setActiveLayer(Layers.none);
    setActiveView(Views.robberViewPhase3);
    onClick(id);
  };

  return (
    <button
      onClick={handleClick}
      className={`${classes.polygon} ${classes[terrainColor]}`}
    >
      {tileNumber}
    </button>
  );
};

export default Tile;
