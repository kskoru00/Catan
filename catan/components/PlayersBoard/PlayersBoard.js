import { usePlayersContext, useViewsContext } from "providers/hooks";

import classes from "./PlayersBoard.module.css";
import { MIN_SCORE_FOR_WIN } from "consts";

const PlayersBoard = ({ largestArmyOwner, longestRoadOwner }) => {
  const { filteredPlayers } = usePlayersContext();
  const { view, changeView, setUpdateMessage } = useViewsContext();

  const handleCalculateScore = () => {
    const player = filteredPlayers.find((player) => player.isActive);

    const settlementsScore = player.settlements.length;
    const citiesScore = player.cities.length * 2;
    const victoryPoints = player.developmentCards.filter(
      (card) => card.type === "victoryPoint"
    ).length;
    const largestArmyScore = largestArmyOwner?.name === player.name ? 2 : 0;
    const longestRoadScore = longestRoadOwner?.name === player.name ? 2 : 0;

    const score =
      settlementsScore +
      citiesScore +
      victoryPoints +
      largestArmyScore +
      longestRoadScore;

    if (score < MIN_SCORE_FOR_WIN) {
      setUpdateMessage(
        `${player.name} your score is : ${score}. For winning you need at least 10 points.`
      );
    } else {
      changeView("finishedGameView");
    }
  };

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
            {player.isActive && (
              <button
                disabled={
                  view.activeView === "startGameView" ||
                  view.activeView === "setupGameView"
                }
                onClick={handleCalculateScore}
                className={`${classes.button} ${classes[player.color]}`}
              >
                Get my score
              </button>
            )}
            <span
              className={`${classes.bigDot} ${classes[player.color]}`}
            ></span>
            <span className={classes.specialCards}>
              {largestArmyOwner?.name === player.name && <span>LA</span>}
            </span>
            <span className={classes.specialCards}>
              {longestRoadOwner?.name === player.name && <span>LR</span>}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PlayersBoard;
