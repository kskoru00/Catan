import { useViewsContext } from "providers/hooks";

import { Roads } from "helpers";

import { Layers } from "consts";

import Road from "components/UI/Road";

import classes from "./RoadsLayer.module.css";

const RoadsLayer = () => {
  const { view } = useViewsContext();

  return (
    <>
      {view.activeLayer !== Layers.tilesLayer &&
        Roads.map((row, i) => (
          <div key={i} className={classes.row}>
            {row.map((road, j) => (
              <Road key={road} id={road} row={i} positionInRow={j} />
            ))}
          </div>
        ))}
    </>
  );
};

export default RoadsLayer;
