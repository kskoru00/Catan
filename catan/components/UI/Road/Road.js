import { usePlayersContext, useViewsContext } from "providers/hooks";

import classes from "./Road.module.css";

const Road = ({ id, row, position }) => {
  const { filteredPlayers, updatePlayersRoads } = usePlayersContext();
  const { view, changeActiveLayer, setError } = useViewsContext();

  const [roadStart, roadEnd] = id
    .split("-")
    .map((settlement) => Number(settlement));

  const activePlayer = filteredPlayers.find((player) => player.isActive);

  const color = filteredPlayers.find((player) =>
    player.roads.find((road) => road === id)
  )?.color;

  let buttonClassName = `${classes.button} ${classes[color]}`;
  let containerClassName = ``;

  if (row % 2 === 0) {
    if ((position % 2 === 0 && row < 5) || (position % 2 !== 0 && row > 5)) {
      buttonClassName += ` ${classes.left}`;
    } else if (position % 2 !== 0 || (position % 2 === 0 && row > 5)) {
      buttonClassName += ` ${classes.right}`;
    }
  } else {
    containerClassName += ` ${classes.verticalContainer}`;
    buttonClassName += ` ${classes.vertical}`;
  }

  const handleClick = () => {
    if (
      !activePlayer.settlements.find(
        (settlement) => settlement === roadStart || settlement === roadEnd
      )
    ) {
      setError("You can't select this road.");
      return;
    }

    if (view.activeView === "setupGameView" && activePlayer.roads.length > 0) {
      const [activePlayerPrevRoadStart, activePlayerPrevRoadEnd] =
        activePlayer.roads[0]
          ?.split("-")
          .map((settlement) => Number(settlement));
      if (
        activePlayerPrevRoadStart === roadStart ||
        activePlayerPrevRoadEnd === roadEnd
      ) {
        setError(
          "You can't select this road. In setup phase every city must have one selected road."
        );
        return;
      }
    }
    setError("");
    updatePlayersRoads(id);
    changeActiveLayer("settlementsLayer");
  };

  return (
    <div className={containerClassName}>
      <button
        disabled={view.activeLayer !== "roadsLayer"}
        onClick={handleClick}
        className={buttonClassName}
      ></button>
    </div>
  );
};

export default Road;
