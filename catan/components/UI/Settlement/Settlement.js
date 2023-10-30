import { usePlayersContext, useViewsContext } from "providers/hooks";

import classes from "./Settlement.module.css";

const Settlement = ({ id, neighbours }) => {
  const { filteredPlayers, updatePlayersSettlements } = usePlayersContext();
  const { view, changeActiveLayer, setError } = useViewsContext();

  const color = filteredPlayers.find((player) =>
    player.settlements.find((settlement) => settlement === id)
  )?.color;

  const handleClick = () => {
    const isSettlementUnavailable = neighbours.find((el) =>
      filteredPlayers.find((player) =>
        player.settlements.find((settlement) => settlement === el)
      )
    );

    if (isSettlementUnavailable) {
      setError("You can't select this settlement.");
      return;
    }

    setError("");
    updatePlayersSettlements(id);
    changeActiveLayer("roadsLayer");
  };

  return (
    <button
      disabled={view.activeLayer !== "settlementsLayer"}
      onClick={handleClick}
      className={`${classes.container} ${classes[color]}`}
    ></button>
  );
};

export default Settlement;
