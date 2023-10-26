import { useState } from "react";

import Road from "components/UI/Road";
import { setInitialRoads } from "helpers/initializeBoardElements";

import classes from "./RoadsLayer.module.css";

const RoadsLayer = ({ isLayerActive }) => {
  const [roads, setRoads] = useState(setInitialRoads());

  return (
    <div className={classes.container}>
      {roads.map((row, i) => (
        <div key={i} className={classes.row}>
          {row.map((road, j) => (
            <Road
              isDisabled={!isLayerActive}
              key={i - j}
              id={road}
              row={i}
              position={j}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default RoadsLayer;
