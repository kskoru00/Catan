import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import {
  usePlayersContext,
  useTileContext,
  useViewsContext,
} from "providers/hooks";

import { generateRandomNumber } from "helpers";
import {
  terrainTypes,
  resourcesForBuild,
  MIN_LONGEST_ARMY,
  MIN_LONGEST_ROAD,
  MAX_AMOUNT_KNIGHT_CARDS,
  MAX_AMOUNT_VICTORY_POINT_CARDS,
} from "consts";

import SettlementsLayer from "components/BoardLayers/SettlementsLayer";
import TilesLayer from "components/BoardLayers/TilesLayer";
import RoadsLayer from "components/BoardLayers/RoadsLayer";
import Legend from "components/Legend";
import PlayersBoard from "components/PlayersBoard";
import PlayerCards from "components/PlayerCards";
import Button from "components/UI/Button";
import Error from "components/UI/Error";

import classes from "./Board.module.css";

const Board = () => {
  const router = useRouter();

  const { view, changeView, changeActiveLayer, setUpdateMessage, setError } =
    useViewsContext();
  const {
    filteredPlayers,
    addResourceCard,
    removeResourceCard,
    addDevelopmentCard,
    updatePlayersOnFinishedTurn,
    setDevelopmentCardAsUsed,
  } = usePlayersContext();
  const { tiles, setInitialTiles } = useTileContext();

  const activePlayer = filteredPlayers.find((player) => player.isActive);

  const [diceRoll, setDiceRoll] = useState(new Array(2).fill(null));
  const isDiceRolled = diceRoll.every((dice) => dice !== null);

  const [playerToSelectResources, setPlayerToSelectResources] = useState(null);

  const [
    amountOfRemainingResourcesForPlayers,
    setAmountOfRemainingResourcesForPlayers,
  ] = useState([0, 0, 0]);

  const [viewBeforeKnight, setViewBeforeKnight] = useState(null);

  const [panelMessage, setPanelMessage] = useState("");

  const [longestArmyOwner, setLongestArmyOwner] = useState(null);
  const [longestRoadOwner, setLongestRoadOwner] = useState(null);
  const [longestRoadLength, setLongestRoadLength] = useState(MIN_LONGEST_ROAD);

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
      removeRandomResource(playersWhoseSettlementIsOccupied[0]);
    } else if (playersWhoseSettlementIsOccupied.length > 1) {
      setPanelMessage(
        <div>
          <p>Select from which player you want to take resource card</p>
          <div className={classes.buttonsContainer}>
            {playersWhoseSettlementIsOccupied.map((el, i) => (
              <Button
                onClick={() => {
                  removeRandomResource(el);
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

  const removeRandomResource = (player) => {
    const cards = player.resourceCards;
    const availableCards = Object.entries(cards).filter(
      ([_, value]) => value > 0
    );
    const random = generateRandomNumber(0, availableCards.length - 1);
    removeResourceCard(availableCards[random][0], player.name);
    setUpdateMessage(
      `Removed random resource ${availableCards[random][0]} for player ${player.name}`
    );
    if (viewBeforeKnight) {
      changeView(viewBeforeKnight);
      setViewBeforeKnight(null);
      return;
    }
    changeView("tradeView");
  };

  const handleKnight = () => {
    setDevelopmentCardAsUsed();
    setViewBeforeKnight(view.activeView);
    changeView("robberViewPhase2");
    changeActiveLayer("tilesLayer");

    const countUsedKnights =
      filteredPlayers
        .find((player) => player.isActive)
        .developmentCards.filter(
          (card) => card.type === "knights" && card.isUsed
        ).length + 1;

    const maxUsedKnights = Math.max(
      ...filteredPlayers.map(
        (player) =>
          player.developmentCards.filter(
            (card) => card.type === "knights" && card.isUsed
          ).length
      )
    );

    if (
      countUsedKnights >= MIN_LONGEST_ARMY &&
      countUsedKnights > maxUsedKnights
    ) {
      setLongestArmyOwner(activePlayer);
    }
  };

  const handleActiveRobber = () => {
    changeView("robberView");
    setDiceRoll(diceRoll.map(() => null));
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
      setTimeout(() => {
        handleActiveRobber();
      }, 2000);

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

    setTimeout(() => {
      setDiceRoll(diceRoll.map(() => null));
      changeView("tradeView");
    }, 2000);
  };
  const handleBuildSettlementOrCity = () => {
    changeActiveLayer("settlementsLayer");
    setPanelMessage(
      <>
        <p className={classes.paragraph}>
          Click on settlement you want to choose.
        </p>
        <Button
          onClick={handleChangeViewToBuildPhase}
          value="Go back to build menu"
        ></Button>
      </>
    );
  };

  const handleBuildRoad = () => {
    changeActiveLayer("roadsLayer");
    setPanelMessage(
      <>
        <p className={classes.paragraph}>Click on road you want to choose.</p>
        <Button
          onClick={handleChangeViewToBuildPhase}
          value="Go back to build menu"
        ></Button>
      </>
    );
  };

  const handleBuyDevelopmentCard = () => {
    const hasPlayerEnoughResources = Object.entries(
      resourcesForBuild.developmentCard
    ).every(([key, value]) => activePlayer.resourceCards[key] >= value);

    if (!hasPlayerEnoughResources) {
      setError("You don't have enough resources to buy development card");
      return;
    }

    const countOfTakenKnightCards = filteredPlayers.reduce(
      (count, player) =>
        count +
        player.developmentCards.filter((card) => card.type === "knights")
          .length,
      0
    );
    const countOfTakenVictoryPointCards = filteredPlayers.reduce(
      (count, player) =>
        count +
        player.developmentCards.filter((card) => card.type === "victoryPoint")
          .length,
      0
    );

    let cardType = "";

    if (
      countOfTakenKnightCards >= MAX_AMOUNT_KNIGHT_CARDS &&
      countOfTakenVictoryPointCards >= MAX_AMOUNT_VICTORY_POINT_CARDS
    ) {
      setError("There are no more available development cards");
    } else if (countOfTakenKnightCards >= MAX_AMOUNT_KNIGHT_CARDS) {
      cardType = "victoryPoint";
    } else if (
      countOfTakenVictoryPointCards >= MAX_AMOUNT_VICTORY_POINT_CARDS
    ) {
      cardType = "knights";
    } else {
      const random = generateRandomNumber(0, 1);
      cardType = random === 0 ? "knights" : "victoryPoint";
    }

    addDevelopmentCard(cardType, activePlayer.name);
    Object.entries(resourcesForBuild.developmentCard).forEach(([key, value]) =>
      removeResourceCard(key, activePlayer.name, value)
    );
    changeView("buildView");
  };

  const handleChangeViewToBuildPhase = () => {
    setError("");
    changeActiveLayer("none");
    setPanelMessage(
      <>
        <p className={classes.paragraph}>Choose what you want to build/buy</p>
        <div className={classes.buttonsContainer}>
          <Button
            onClick={handleBuildSettlementOrCity}
            value="Settlement/City"
          ></Button>
          <Button onClick={handleBuildRoad} value="Road"></Button>
          <Button
            onClick={handleBuyDevelopmentCard}
            value="Development card"
          ></Button>
        </div>
        <Button
          onClick={() => {
            changeView("tradeView");
          }}
          value="Go to trade phase"
        ></Button>
      </>
    );
    changeView("buildView");
  };

  const handleFinishedTurn = () => {
    setLongestRoad();
    updatePlayersOnFinishedTurn();
    changeView("resourceProductionView");
  };

  const setLongestRoad = () => {
    if (
      longestRoadOwner &&
      longestRoadOwner !== filteredPlayers.find((player) => player.isActive)
    ) {
      const playerLongestRoad = getPlayerLongestRoad(longestRoadOwner);

      if (playerLongestRoad < longestRoadLength) {
        const playersRoadLength = filteredPlayers.map((player) =>
          player.name === longestRoadOwner.name
            ? playerLongestRoad
            : getPlayerLongestRoad(player)
        );

        const maxRoadLength = Math.max(...playersRoadLength);

        if (
          playerLongestRoad === maxRoadLength &&
          playerLongestRoad >= MIN_LONGEST_ROAD
        ) {
          setLongestRoadLength(playerLongestRoad);
        } else if (
          playersRoadLength.filter((road) => road === maxRoadLength).length ===
            1 &&
          maxRoadLength >= MIN_LONGEST_ROAD
        ) {
          const index = playersRoadLength.findIndex(
            (road) => road === maxRoadLength
          );
          setLongestRoadLength(playerLongestRoad);
          setLongestRoadOwner(filteredPlayers[index]);
        } else {
          setLongestRoadLength(MIN_LONGEST_ROAD);
          setLongestRoadOwner(null);
        }
      }
    }

    if (
      (!longestRoadOwner && longestRoadLength <= activePlayer.roads.length) ||
      longestRoadLength < activePlayer.roads.length
    ) {
      const playerLongestRoad = getPlayerLongestRoad(activePlayer);

      if (
        (!longestRoadOwner && playerLongestRoad >= longestRoadLength) ||
        (longestRoadOwner && playerLongestRoad > longestRoadLength)
      ) {
        setLongestRoadOwner(activePlayer);
        setLongestRoadLength(playerLongestRoad);
      }
    }
  };

  const getPlayerLongestRoad = (player) => {
    let longestRoad = 0;

    player.roads.forEach((playerRoad) => {
      const roadsMappedByDistance = [[playerRoad]];

      let isComplete = false;

      while (!isComplete) {
        const remainingRoads = player.roads.filter(
          (road) => !roadsMappedByDistance.flat().find((el) => el === road)
        );
        const nextNeighbours = remainingRoads.filter((road) =>
          roadsMappedByDistance[roadsMappedByDistance.length - 1].find(
            (neighbour) =>
              road.split("-")[0] === neighbour.split("-")[1] ||
              road.split("-")[1] === neighbour.split("-")[1] ||
              road.split("-")[0] === neighbour.split("-")[0] ||
              road.split("-")[1] === neighbour.split("-")[0]
          )
        );

        const findConnection = nextNeighbours
          .map((el) => el.split("-"))
          .flat()
          .filter((el) =>
            roadsMappedByDistance[roadsMappedByDistance.length - 1]
              .map((el) => el.split("-"))
              .flat()
              .some((num) => num === el)
          );

        if (
          nextNeighbours.length === 0 ||
          filteredPlayers.find(
            (play) =>
              play.name !== player.name &&
              play.settlements.some(
                (settlement) => settlement === Number(findConnection)
              )
          )
        ) {
          isComplete = true;
          if (roadsMappedByDistance.length > longestRoad) {
            longestRoad = roadsMappedByDistance.length;
          }
        }

        if (nextNeighbours.length > 0 && isComplete === false) {
          roadsMappedByDistance.push(nextNeighbours);
        }
      }
    });

    return longestRoad;
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
          <p>
            Please {activePlayer.name} choose{" "}
            {view.activeLayer === "settlementsLayer" ? "settlement" : "road"}{" "}
          </p>
        </div>
      );
    } else if (view.activeView === "resourceProductionView") {
      return (
        <div className={classes.panelContainer}>
          <h3 className={classes.title}>Resource production :</h3>
          <div className={classes.panelWrapper}>
            <Button
              isDisabled={isDiceRolled}
              onClick={handleDiceRoll}
              value="Roll dice"
            />
            <div className={`${classes.die} ${classes.red}`}>
              <span>{diceRoll[0]}</span>
            </div>
            <div className={`${classes.die} ${classes.yellow}`}>
              <span>{diceRoll[1]}</span>
            </div>
          </div>
          {!isDiceRolled &&
            activePlayer.developmentCards.some(
              (card) => card.type === "knights" && card.isActive && !card.isUsed
            ) && <Button onClick={handleKnight} value="Use knight"></Button>}
        </div>
      );
    } else if (view.activeView === "robberView") {
      return (
        <>
          <p>
            {filteredPlayers[playerToSelectResources]?.name} you can keep{" "}
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
              <p className={classes.paragraph}>
                {Object.values(activePlayer.resourceCards).find(
                  (card) => card >= 4
                )
                  ? `${activePlayer.name} click on resource which you want to trade`
                  : "You don't have enough resources for trading."}
              </p>
              <Button
                value="Go to build phase"
                onClick={handleChangeViewToBuildPhase}
              />
              {activePlayer.developmentCards.some(
                (card) =>
                  card.type === "knights" && card.isActive && !card.isUsed
              ) && <Button onClick={handleKnight} value="Use knight"></Button>}
            </>
          )}
          {view.activeView === "tradeViewPhase2" && (
            <p>Click on resource which you want to add</p>
          )}
        </div>
      );
    } else if (view.activeView === "buildView") {
      return (
        <div className={classes.panelContainer}>
          <h3 className={classes.title}>Build :</h3>
          {panelMessage}
          {activePlayer.developmentCards.some(
            (card) => card.type === "knights" && card.isActive && !card.isUsed
          ) && <Button onClick={handleKnight} value="Use knight"></Button>}
          <Button onClick={handleFinishedTurn} value="Finish your turn" />
        </div>
      );
    }
  };
  return (
    <div className={classes.container}>
      <div className={classes.wrapper}>
        <div className={classes.playersContainer}>
          <PlayersBoard
            longestArmyOwner={longestArmyOwner}
            longestRoadOwner={longestRoadOwner}
          />
          {((view.activeView === "robberView" &&
            playerToSelectResources !== null) ||
            view.activeView === "tradeView" ||
            view.activeView === "tradeViewPhase2" ||
            view.activeView === "buildView") && (
            <PlayerCards
              player={
                view.activeView === "robberView"
                  ? filteredPlayers[playerToSelectResources]
                  : activePlayer
              }
            />
          )}
        </div>
        <div>
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
        <Legend />
        <div className={classes.updatePanel}>
          {view.updateMessage !== "" && <p>{view.updateMessage}</p>}
        </div>
      </div>
    </div>
  );
};

export default Board;
