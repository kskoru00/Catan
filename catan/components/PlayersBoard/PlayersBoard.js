import { useEffect } from "react";

import {
  usePlayersContext,
  useTileContext,
  useViewsContext,
} from "providers/hooks";

import { terrainTypes } from "consts";

import classes from "./PlayersBoard.module.css";

const PlayersBoard = () => {
  const { filteredPlayers, changeActivePlayer, addResourceCard } =
    usePlayersContext();
  const { view, changeView, changeActiveLayer, setUpdateMessage } =
    useViewsContext();
  const { tiles } = useTileContext();

  const activePlayer = filteredPlayers.find((player) => player.isActive);

  useEffect(() => {
    if (!activePlayer || view.activeView !== "setupGameView") {
      return;
    }

    if (
      filteredPlayers.every(
        (player) => player.settlements.length === 2 && player.roads.length === 2
      )
    ) {
      setPlayersSetupResources();
      changeView("resourceProductionView");
      changeActiveLayer("none");

      return;
    } else if (
      filteredPlayers.every(
        (player) => player.settlements.length === 1 && player.roads.length === 1
      )
    ) {
      return;
    } else if (
      activePlayer.settlements.length === 2 &&
      activePlayer.roads.length === 2
    ) {
      changeActivePlayer();
    } else if (
      !filteredPlayers.find(
        (player) => player.settlements.length === 2 && player.roads.length === 2
      ) &&
      activePlayer.settlements.length === 1 &&
      activePlayer.roads.length === 1
    ) {
      changeActivePlayer();
    }
  }, [activePlayer]);

  const setPlayersSetupResources = () => {
    const playersNewResources = filteredPlayers.map((player) => ({
      name: player.name,
      newResource: [],
    }));
    filteredPlayers.forEach((player) => {
      player.settlements.forEach((settlement) => {
        const resourceCards = tiles
          .flat()
          .filter((type) => type.settlements.find((el) => el === settlement))
          .map((tile) => terrainTypes[tile.terrainId].name)
          .filter((card) => card !== "dessert");

        resourceCards.forEach((card) => {
          addResourceCard(card, player.name);
          playersNewResources
            .find((el) => el.name === player.name)
            .newResource.push(card);
        });
      });
    });
    const message = playersNewResources.every(
      (player) => player.newResource.length === 0
    )
      ? `There are no resources to add.`
      : `Added resources:` +
        "\n" +
        "\n" +
        playersNewResources
          .filter((players) => players.newResource.length > 0)
          .map(
            (el) => `${el.name} :  
            ${el.newResource.join(", ")}`
          )
          .join("\n");

    setUpdateMessage(message);
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
