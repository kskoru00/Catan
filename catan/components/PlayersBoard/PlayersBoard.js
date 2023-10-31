import { usePlayersContext } from "providers/hooks";

import classes from "./PlayersBoard.module.css";

const PlayersBoard = () => {
  const { filteredPlayers } = usePlayersContext();

  return (
    <div className={classes.container}>
      <h2 className={classes.title}>Players:</h2>
      {Object.values(filteredPlayers).map((player, i) => (
        <div key={i} className={classes.playerContainer}>
          <div className={classes.playerWrapper}>
            <span
              className={
                player.isActive
                  ? `${classes.dot} ${classes.active}`
                  : classes.dot
              }
            ></span>
            <span>{player.name}</span>
          </div>
          <div className={classes.playerWrapper}>
            <span>{player.score}</span>
            <span
              className={`${classes.bigDot} ${classes[player.color]}`}
            ></span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PlayersBoard;
