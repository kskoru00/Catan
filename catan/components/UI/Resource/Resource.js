import { usePlayersContext } from "providers/hooks";

import classes from "./Resource.module.css";

const Resource = ({ type, amount, playerName }) => {
  const { removeResourceCard } = usePlayersContext();

  const handleClick = () => {
    if (amount > 0) {
      removeResourceCard(type, playerName);
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
