import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import {
  usePlayersContext,
  useTileContext,
  useViewsContext,
} from "providers/hooks";

import { generateRandomNumber } from "helpers";
import { terrainTypes } from "consts";

import SettlementsLayer from "components/BoardLayers/SettlementsLayer";
import TilesLayer from "components/BoardLayers/TilesLayer";
import RoadsLayer from "components/BoardLayers/RoadsLayer";
import PlayersBoard from "components/PlayersBoard";
import Legend from "components/Legend";
import ResourceCard from "components/ResourceCard";
import Button from "components/UI/Button";
import Error from "components/UI/Error";

import classes from "./Board.module.css";

const Board = () => {
  const router = useRouter();

  const { view, changeView, changeActiveLayer, setUpdateMessage } =
    useViewsContext();
  const { filteredPlayers, addResourceCard, removeResourceCard } =
    usePlayersContext();
  const { tiles, setInitialTiles } = useTileContext();

  const activePlayer = filteredPlayers.find((player) => player.isActive);

  const [diceRoll, setDiceRoll] = useState(new Array(2).fill(null));

  const [playerToSelectResources, setPlayerToSelectResources] = useState(null);

  const [
    amountOfRemainingResourcesForPlayers,
    setAmountOfRemainingResourcesForPlayers,
  ] = useState([0, 0, 0]);

  const [panelMessage, setPanelMessage] = useState("");

  useEffect(() => {
    if (filteredPlayers.length === 0) {
      router.push("/");
      return;
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (view.updateMessage !== "") {
        setUpdateMessage("");
      }
    }, 10000);

    return () => clearTimeout(timer);
  }, [view.updateMessage]);

  useEffect(() => {
    if (playerToSelectResources === null) {
      return;
    }
    const count = Object.values(
      filteredPlayers[playerToSelectResources].resourceCards
    ).reduce((sum, el) => el + sum, 0);

    if (
      count === amountOfRemainingResourcesForPlayers[playerToSelectResources] &&
      view.activeView === "robberView"
    ) {
      if (playerToSelectResources + 1 === filteredPlayers.length) {
        changeView("robberViewPhase2");
        changeActiveLayer("tilesLayer");
        return;
      }
      setPlayerToSelectResources(playerToSelectResources + 1);
    }
  }, [filteredPlayers, playerToSelectResources]);

  const handleTileClicked = (id) => {
    //vidit jel bolje useeffect

    const occupiedTile = tiles.flat().find((tile) => tile.id === id);

    const playersWhoseSettlementIsOccupied = filteredPlayers.filter(
      (players) =>
        !players.isActive &&
        players.settlements.find((settlement) =>
          occupiedTile.settlements.find((el) => el === settlement)
        )
    );

    if (playersWhoseSettlementIsOccupied.length === 0) {
      setUpdateMessage("No players have settlement on selected tile");
      changeView("tradeView");
    } else if (playersWhoseSettlementIsOccupied.length === 1) {
      setPanelMessage(
        `Only ${playersWhoseSettlementIsOccupied[0].name} has property on choosen tile.`
      );
      chooseRandomForRobber(playersWhoseSettlementIsOccupied[0]);
    } else if (playersWhoseSettlementIsOccupied.length > 1) {
      setPanelMessage(
        <div>
          <p>Select from which player you want to take resource card</p>
          <div className={classes.buttonsContainer}>
            {playersWhoseSettlementIsOccupied.map((el, i) => (
              <Button
                onClick={() => {
                  chooseRandomForRobber(el);
                }}
                key={i}
                value={el.name}
              ></Button>
            ))}
          </div>
        </div>
      );
    }
  };

  const chooseRandomForRobber = (player) => {
    const cards = player.resourceCards;
    const availableCards = Object.entries(cards).filter(
      ([_, value]) => value > 0
    );
    const random = generateRandomNumber(0, availableCards.length - 1);
    removeResourceCard(availableCards[random][0], player.name);
    setUpdateMessage(
      `Removed random resource ${availableCards[random][0]} for player ${player.name}`
    );
    changeView("tradeView");
  };

  const handleActiveRobber = () => {
    changeView("robberView");
    if (
      filteredPlayers.every(
        (player) =>
          Object.values(player.resourceCards).reduce(
            (sum, el) => el + sum,
            0
          ) <= 7
      )
    ) {
      setUpdateMessage(
        "There is no player who has more than 7 resource cards."
      );
      changeView("robberViewPhase2");
      changeActiveLayer("tilesLayer");
      return;
    }
    const cardsToKeep = [...amountOfRemainingResourcesForPlayers];
    filteredPlayers.forEach((player, i) => {
      const count = Object.values(player.resourceCards).reduce(
        (sum, el) => el + sum,
        0
      );

      if (count <= 7) {
        cardsToKeep[i] = count;
      } else {
        cardsToKeep[i] = count - Math.trunc(count / 2);
      }
    });
    setAmountOfRemainingResourcesForPlayers(cardsToKeep);
    setPlayerToSelectResources(0);
  };

  const handleDiceRoll = () => {
    const playersNewResources = filteredPlayers.map((player) => ({
      name: player.name,
      newResource: [],
    }));

    const newDiceRoll = diceRoll.map(() => generateRandomNumber(1, 6));
    setDiceRoll(newDiceRoll);

    const rolledTile = newDiceRoll.reduce((sum, curr) => sum + curr, 0);

    if (rolledTile === 7) {
      handleActiveRobber();

      return;
    }

    const filteredTiles = tiles
      .flat()
      .filter((tile) => tile.tokenNumber === rolledTile);

    filteredTiles.forEach((tile) => {
      if (!tile.isActive) {
        return;
      }
      const resource = terrainTypes.find(
        (type) => type.id === tile.terrainId
      ).produce;
      tile.settlements.forEach((settlement) => {
        const player = filteredPlayers.find((player) =>
          player.settlements.find((el) => el === settlement)
        );
        if (player) {
          addResourceCard(resource, player.name);
          playersNewResources
            .find((el) => el.name === player.name)
            .newResource.push(resource);
        }
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

  const handleStartGame = () => {
    setInitialTiles();
    changeView("setupGameView");
    changeActiveLayer("settlementsLayer");
  };

  const getPanelView = () => {
    if (view.activeView === "startGameView") {
      return <Button onClick={handleStartGame} value="Start game" />;
    } else if (view.activeView === "setupGameView") {
      return (
        <div className={classes.panelContainer}>
          <h3 className={classes.title}>Setup: </h3>
          {view.activeLayer === "settlementsLayer" && (
            <p>Please {activePlayer.name} choose settlement</p>
          )}
          {view.activeLayer === "roadsLayer" && (
            <p>Please {activePlayer.name} choose road</p>
          )}
        </div>
      );
    } else if (view.activeView === "resourceProductionView") {
      return (
        <div className={classes.panelContainer}>
          <h3 className={classes.title}>Resource production :</h3>
          <div className={classes.panelWrapper}>
            <Button onClick={handleDiceRoll} value="Roll dice" />
            <div className={`${classes.die} ${classes.red}`}>
              <span>{diceRoll[0]}</span>
            </div>
            <div className={`${classes.die} ${classes.yellow}`}>
              <span>{diceRoll[1]}</span>
            </div>
          </div>
        </div>
      );
    } else if (view.activeView === "robberView") {
      return (
        <>
          <p>
            {filteredPlayers[playerToSelectResources]?.name} you can keep
            {amountOfRemainingResourcesForPlayers[playerToSelectResources]}
            resource cards. Please click on resources you want to give to the
            bank.
          </p>
        </>
      );
    } else if (view.activeView === "robberViewPhase2") {
      return (
        <>
          <p>
            Time to move robber. Please {activePlayer.name} click on the tile on
            which you want to place robber.
          </p>
        </>
      );
    } else if (view.activeView === "robberViewPhase3") {
      return <>{panelMessage}</>;
    } else if (
      view.activeView === "tradeView" ||
      view.activeView === "tradeViewPhase2"
    ) {
      return (
        <div className={classes.panelContainer}>
          <h3 className={classes.title}>Trade with bank :</h3>
          {view.activeView === "tradeView" && (
            <>
              <p>
                {Object.values(activePlayer.resourceCards).find(
                  (card) => card >= 4
                )
                  ? `${activePlayer.name} click on resource which you want to trade`
                  : "You don't have enough resources for trading."}
              </p>
              <Button
                value="Go to build phase"
                onClick={() => {
                  changeView("buildView");
                }}
              />
            </>
          )}
          {view.activeView === "tradeViewPhase2" && (
            <p>Click on resource which you want to add</p>
          )}
        </div>
      );
    }
  };
  return (
    <div className={classes.container}>
      <div className={classes.wrapper}>
        <div className={classes.playersContainer}>
          <PlayersBoard />
          {((view.activeView === "robberView" &&
            playerToSelectResources !== null) ||
            view.activeView === "tradeView" ||
            view.activeView === "tradeViewPhase2") && (
            <ResourceCard
              player={
                view.activeView === "robberView"
                  ? filteredPlayers[playerToSelectResources]
                  : activePlayer
              }
            />
          )}
        </div>
        <div className={classes.layersContainer}>
          <div className={classes.layersWrapper}>
            <div
              className={`${classes.layer} ${
                view.activeLayer === "tilesLayer" ? classes.top : ""
              }`}
            >
              <TilesLayer onClick={handleTileClicked} />
            </div>
            <div
              className={`${classes.layer} ${
                view.activeLayer === "roadsLayer" ? classes.top : ""
              }`}
            >
              <RoadsLayer isLayerActive={view.activeLayer === "roadsLayer"} />
            </div>
            <div
              className={`${classes.layer} ${
                view.activeLayer === "settlementsLayer" ? classes.top : ""
              }`}
            >
              <SettlementsLayer
                isLayerActive={view.activeLayer === "settlements"}
              />
            </div>
          </div>
        </div>
        <div>
          <Legend />
          <div className={classes.updatePanel}>
            {view.updateMessage !== "" && <p>{view.updateMessage}</p>}
          </div>
        </div>
      </div>
      <div className={classes.errorContainer}>
        {view.error !== "" && (
          <Error>
            <p>
              **
              {view.error}
            </p>
          </Error>
        )}
      </div>
      <div className={classes.panel}>{getPanelView()}</div>
    </div>
  );
};

export default Board;
