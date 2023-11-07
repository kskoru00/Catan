import { useViewsContext } from "providers/hooks";

import { setInitialSettlements } from "helpers/initializeBoardElements";

import { Layers } from "consts";

import Settlement from "components/UI/Settlement";

import classes from "./SettlementsLayer.module.css";

const SettlementsLayer = () => {
  const settlements = setInitialSettlements();
  const { view } = useViewsContext();

  return (
    <div className={classes.container}>
      {settlements.map((row, i) => (
        <div key={i} className={classes.row}>
          {view.activeLayer !== Layers.tilesLayer &&
            row.map((settlement, j) => (
              <Settlement
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
