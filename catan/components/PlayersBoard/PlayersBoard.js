import { usePlayersContext, useViewsContext } from "providers/hooks";

import { Views, MIN_SCORE_FOR_WIN } from "consts";

import classes from "./PlayersBoard.module.css";

const PlayersBoard = ({ largestArmyOwner, longestRoadOwner }) => {
  const { filteredPlayers: players } = usePlayersContext();
  const { view, setActiveView, setUpdateMessage } = useViewsContext();

  const handleCalculateScore = () => {
    const player = players.find((player) => player.isActive);

    const settlementsScore = player.settlements.length;
    const citiesScore = player.cities.length * 2;
    const victoryPoints = player.developmentCards.filter(
      (card) => card.type === "victoryPoint"
    ).length;
    const largestArmyScore = largestArmyOwner === player.name ? 2 : 0;
    const longestRoadScore = longestRoadOwner === player.name ? 2 : 0;

    const score =
      settlementsScore +
      citiesScore +
      victoryPoints +
      largestArmyScore +
      longestRoadScore;

    if (score < MIN_SCORE_FOR_WIN) {
      setUpdateMessage(
        `${player.name} your score is : ${score}. For winning you need at least ${MIN_SCORE_FOR_WIN} points.`
      );
    } else {
      setActiveView(Views.finishedGameView);
    }
  };

  return (
    <div className={classes.container}>
      <h2 className={classes.title}>Players:</h2>
      {Object.values(players).map((player, i) => (
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
                  view.activeView === Views.startGameView ||
                  view.activeView === Views.setupGameView
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
              {largestArmyOwner === player.name && (
                <span className={classes.specialCard}>LA</span>
              )}
              {longestRoadOwner === player.name && (
                <span className={classes.specialCard}>LR</span>
              )}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PlayersBoard;
