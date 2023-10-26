import { usePlayersContext, useViewsContext } from "providers/hooks";

import classes from "./Settlement.module.css";

const Settlement = ({ id, isDisabled, neighbours }) => {
  const { filteredPlayers, updatePlayersSettlements } = usePlayersContext();
  const { setError } = useViewsContext();

  const color = filteredPlayers.find((player) =>
    player.settlements.find((settlement) => settlement === id)
  )?.color;

  const handleClick = () => {
    if (
      neighbours.find((el) =>
        filteredPlayers.find((player) =>
          player.settlements.find((settlement) => settlement === el)
        )
      )
    ) {
      setError("You can't select this settlement.");
      return;
    }
    setError("");
    updatePlayersSettlements(id);
  };

  return (
    <button
      disabled={isDisabled}
      onClick={handleClick}
      className={`${classes.container} ${classes[color]}`}
    ></button>
  );
};

export default Settlement;
