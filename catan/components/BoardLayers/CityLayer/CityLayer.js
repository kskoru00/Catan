import { useState } from "react";

import City from "components/UI/City";
import { setInitialCities } from "components/helpers/initializeBoardElements";

import classes from "./CityLayer.module.css";

const CityLayer = () => {
  const [cities, setCities] = useState(setInitialCities());
  return (
    <div className={classes.container}>
      {cities.map((row, i) => (
        <div key={i} className={classes.row}>
          {row.map((_, j) => (
            <City key={i - j} id={i - j} />
          ))}
        </div>
      ))}
    </div>
  );
};

export default CityLayer;
