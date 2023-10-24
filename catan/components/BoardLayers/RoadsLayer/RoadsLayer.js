import { useState } from "react";

import { setInitialRoads } from "components/helpers/initializeBoardElements";
import Road from "components/UI/Road";

import classes from "./RoadsLayer.module.css";

const RoadsLayer = () => {
  const [roads, setRoads] = useState(setInitialRoads());

  return (
    <div className={classes.container}>
      {roads.map((row, i) => (
        <div key={i} className={classes.row}>
          {row.map((_, j) => (
            <Road key={i - j} id={i - j} row={i} position={j} />
          ))}
        </div>
      ))}
    </div>
  );
};

export default RoadsLayer;
