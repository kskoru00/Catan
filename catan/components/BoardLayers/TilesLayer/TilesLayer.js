import { useTileContext } from "providers/hooks";

import Tile from "components/UI/Tile";

import classes from "./TilesLayer.module.css";

const TilesLayer = ({ onClick }) => {
  const { tiles } = useTileContext();

  return (
    <div className={classes.container}>
      {tiles.map((row, i) => (
        <div key={i} className={classes.row}>
          {row.map((tile, j) => (
            <Tile
              key={i - j}
              id={tile.id}
              onClick={(id) => {
                onClick(id);
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default TilesLayer;
