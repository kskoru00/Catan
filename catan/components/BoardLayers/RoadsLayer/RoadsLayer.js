import { useViewsContext } from "providers/hooks";

import { setInitialRoads } from "helpers/initializeBoardElements";

import { Layers } from "consts";

import Road from "components/UI/Road";

import classes from "./RoadsLayer.module.css";

const RoadsLayer = () => {
  const roads = setInitialRoads();

  const { view } = useViewsContext();

  return (
    <div className={classes.container}>
      {view.activeLayer !== Layers.tilesLayer &&
        roads.map((row, i) => (
          <div key={i} className={classes.row}>
            {row.map((road, j) => (
              <Road key={road} id={road} row={i} positionInRow={j} />
            ))}
          </div>
        ))}
    </div>
  );
};

export default RoadsLayer;
