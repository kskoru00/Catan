import { usePlayersContext, useViewsContext } from "providers/hooks";

import classes from "./Resource.module.css";

const Resource = ({ type, amount, playerName }) => {
  const { addResourceCard, removeResourceCard } = usePlayersContext();
  const { view, changeView, setUpdateMessage, setError } = useViewsContext();

  const handleClick = () => {
    if (view.activeView === "robberView") {
      if (amount > 0) {
        removeResourceCard(type, playerName);
        setUpdateMessage(`Removed 1 ${type} for ${playerName}`);
      }
    } else if (view.activeView === "tradeView") {
      if (amount < 4) {
        setError(
          `You cant trade with ${type}. For trading min amount of resource is 4.`
        );
        return;
      }
      setError("");
      removeResourceCard(type, playerName, 4);

      setUpdateMessage(`Removed 4 ${type} for ${playerName}`);
      changeView("tradeViewPhase2");
    } else if (view.activeView === "tradeViewPhase2") {
      addResourceCard(type, playerName);
      setUpdateMessage(`Added 1 ${type} for ${playerName}`);
      changeView("tradeView");
    }
  };

  return (
    <button onClick={handleClick} className={classes.resourceItem}>
      <span>{type}: </span>
      <span>{amount}</span>
    </button>
  );
};

export default Resource;
