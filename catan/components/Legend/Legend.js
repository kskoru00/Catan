import { terrainTypes } from "consts";

import classes from "./Legend.module.css";

const Legend = () => {
  return (
    <div className={classes.container}>
      <h3 className={classes.title}>Board legend:</h3>
      <div className={classes.wrapper}>
        {terrainTypes.map((type, i) => (
          <div key={i} className={classes.elementContainer}>
            <div className={`${classes.polygon} ${classes[type.color]}`}> </div>
            <span>{type.name}</span>
          </div>
        ))}
        <div className={classes.elementContainer}>
          <div className={classes.settlement}></div>
          <span>settlement</span>
        </div>
      </div>
    </div>
  );
};

export default Legend;
