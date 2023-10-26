import { useState } from "react";

import City from "components/UI/Settlement";
import { setInitialSettlements } from "helpers/initializeBoardElements";

import classes from "./SettlementsLayer.module.css";

const SettlementsLayer = ({ isLayerActive }) => {
  const [settlements, setSettlements] = useState(setInitialSettlements());

  return (
    <div className={classes.container}>
      {settlements.map((row, i) => (
        <div key={i} className={classes.row}>
          {row.map((settlement, j) => (
            <City
              isDisabled={!isLayerActive}
              key={i - j}
              id={settlement.id}
              neighbours={settlement.neighbours}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default SettlementsLayer;
