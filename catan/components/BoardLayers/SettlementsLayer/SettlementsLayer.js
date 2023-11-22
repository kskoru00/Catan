import { useViewsContext } from "providers/hooks";

import { Settlements } from "helpers";

import { Layers } from "consts";

import Settlement from "components/UI/Settlement";

import classes from "./SettlementsLayer.module.css";

const SettlementsLayer = () => {
  const { view } = useViewsContext();

  return (
    <>
      {Settlements.map((row, i) => (
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
    </>
  );
};

export default SettlementsLayer;
