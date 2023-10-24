import { terrainTypes } from "consts";

import classes from "./Tile.module.css";

const Tile = ({ terrainId, tokenNumber }) => {
  const terrainColor = terrainId
    ? terrainTypes.find((type) => type.id === terrainId).color
    : "";

  return (
    <div className={classes.container}>
      <div className={`${classes.polygon} ${classes[terrainColor]}`}></div>
      <div className={classes.numberContainer}>
        <span className={classes.number}>{tokenNumber}</span>
      </div>
    </div>
  );
};

export default Tile;
