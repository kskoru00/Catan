import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import {
  usePlayersContext,
  useTileContext,
  useViewsContext,
} from "providers/hooks";

import { generateRandomNumber } from "helpers";

import {
  Views,
  Layers,
  TerrainTypes,
  ResourcesForBuild,
  MIN_DICE_ROLL,
  MAX_DICE_ROLL,
  ROBBER_TOKEN_NUMBER,
  TOTAL_NUMBER_OF_EACH_RESOURCE,
  MIN_LARGEST_ARMY,
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
import SelectButton from "components/UI/SelectButton";
import Error from "components/UI/Error";

import classes from "./Board.module.css";

const Board = () => {
  const router = useRouter();

  const { view, setActiveView, setActiveLayer, setUpdateMessage, setError } =
    useViewsContext();
  const {
    filteredPlayers: players,
    addResourceCard,
    removeResourceCard,
    addDevelopmentCard,
    updatePlayersOnFinishedTurn,
    setDevelopmentCardAsUsed,
    initializePlayersForNewRound,
  } = usePlayersContext();
  const { tiles, setInitialTiles, initializeTilesForNewRound } =
    useTileContext();

  const activePlayer = players.find((player) => player.isActive);

  const [diceRoll, setDiceRoll] = useState(new Array(2).fill(null));
  const isDiceRolled = diceRoll.every((dice) => dice !== null);

  const [playerToSelectResources, setPlayerToSelectResources] = useState(null);

  const [
    amountOfRemainingResourcesForPlayers,
    setAmountOfRemainingResourcesForPlayers,
  ] = useState([0, 0, 0]);

  const [viewBeforeKnight, setViewBeforeKnight] = useState(null);
  const [isKnightUsed, setIsKnightUsed] = useState(false);

  const [panelMessage, setPanelMessage] = useState("");

  const [largestArmyOwner, setlargestArmyOwner] = useState(null);
  const [longestRoadOwner, setLongestRoadOwner] = useState(null);
  const [longestRoadLength, setLongestRoadLength] = useState(MIN_LONGEST_ROAD);

  useEffect(() => {
    if (players.length === 0) {
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
      players[playerToSelectResources].resourceCards
    ).reduce((sum, el) => el + sum, 0);

    if (
      count === amountOfRemainingResourcesForPlayers[playerToSelectResources] &&
      view.activeView === Views.robberView
    ) {
      if (playerToSelectResources + 1 === players.length) {
        setActiveView(Views.robberViewPhase2);
        setActiveLayer(Layers.tilesLayer);
        setAmountOfRemainingResourcesForPlayers([0, 0, 0]);
        setPlayerToSelectResources(null);

        return;
      }

      setPlayerToSelectResources(playerToSelectResources + 1);
    }
  }, [players, playerToSelectResources]);

  const handleTileClicked = (id) => {
    const tile = tiles.flat().find((tile) => tile.id === id);

    const playersWithSettlementOnTile = players.filter(
      (el) =>
        !el.isActive &&
        el.settlements.find((settlement) =>
          tile.settlements.find((el) => el === settlement)
        )
    );

    if (playersWithSettlementOnTile.length === 0) {
      setUpdateMessage(
        "There are no players who have settlement on selected tile."
      );
      setActiveView(Views.tradeView);
    } else if (playersWithSettlementOnTile.length === 1) {
      setPanelMessage(
        `Only ${playersWithSettlementOnTile[0].name} has property on choosen tile.`
      );
      removeRandomResource(playersWithSettlementOnTile[0]);
    } else if (playersWithSettlementOnTile.length > 1) {
      setPanelMessage(
        <div>
          <p className={classes.panelParagraph}>
            Select from which player you want to take resource card
          </p>
          <div className={classes.panelButtonsContainer}>
            {playersWithSettlementOnTile.map((el, i) => (
              <SelectButton
                onClick={() => {
                  removeRandomResource(el);
                }}
                key={i}
              >
                {el.name}
              </SelectButton>
            ))}
          </div>
        </div>
      );
    }
  };

  const removeRandomResource = (player) => {
    const availableCards = Object.entries(player.resourceCards).filter(
      ([_, value]) => value > 0
    );

    const random = generateRandomNumber(0, availableCards.length - 1);
    const randomCardKey = availableCards[random][0];

    removeResourceCard(randomCardKey, player.name);
    setUpdateMessage(
      `Removed random resource ${randomCardKey} for player ${player.name}`
    );

    if (viewBeforeKnight) {
      setActiveView(viewBeforeKnight);
      setViewBeforeKnight(null);

      return;
    }

    setActiveView(Views.tradeView);
  };

  const handleKnight = () => {
    setDevelopmentCardAsUsed();
    setIsKnightUsed(true);
    setViewBeforeKnight(view.activeView);
    setActiveView(Views.robberViewPhase2);
    setActiveLayer(Layers.tilesLayer);

    const countUsedKnights =
      players
        .find((player) => player.isActive)
        .developmentCards.filter(
          (card) => card.type === "knights" && card.isUsed
        ).length + 1;

    const maxUsedKnights = Math.max(
      ...players.map(
        (player) =>
          player.developmentCards.filter(
            (card) => card.type === "knights" && card.isUsed
          ).length
      )
    );

    if (
      countUsedKnights >= MIN_LARGEST_ARMY &&
      countUsedKnights > maxUsedKnights
    ) {
      setlargestArmyOwner(activePlayer.name);
    }
  };

  const handleActiveRobber = () => {
    if (view.activeView === Views.resourceProductionView) {
      setDiceRoll(diceRoll.map(() => null));
    }

    setActiveView(Views.robberView);

    if (
      players.every(
        (player) =>
          Object.values(player.resourceCards).reduce(
            (sum, el) => el + sum,
            0
          ) <= ROBBER_TOKEN_NUMBER
      )
    ) {
      setUpdateMessage(
        `There are no players who has more than ${ROBBER_TOKEN_NUMBER} resource cards.`
      );
      setActiveView(Views.robberViewPhase2);
      setActiveLayer(Layers.tilesLayer);

      return;
    }

    const cardsToKeep = [...amountOfRemainingResourcesForPlayers];

    players.forEach((player, i) => {
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

  const setResourcesFromRolledTokenNumber = (rolledTile) => {
    const playersNewResources = players.map((player) => ({
      name: player.name,
      newResource: {},
    }));

    const filteredTiles = tiles
      .flat()
      .filter((tile) => tile.tokenNumber === rolledTile);

    filteredTiles.forEach((tile) => {
      if (!tile.isActive) {
        return;
      }

      const resource = TerrainTypes.find(
        (type) => type.id === tile.terrainId
      ).produce;

      tile.settlements.forEach((settlement) => {
        const playerName = players.find(
          (player) =>
            player.settlements.find((el) => el === settlement) ||
            player.cities.find((el) => el === settlement)
        )?.name;

        if (playerName) {
          const playerPosition = playersNewResources.findIndex(
            (el) => el.name === playerName
          );

          let amount = players[playerPosition].settlements.find(
            (el) => el === settlement
          )
            ? 1
            : 2;

          if (playersNewResources[playerPosition].newResource[resource]) {
            amount += playersNewResources[playerPosition].newResource[resource];
          }

          playersNewResources[playerPosition] = {
            ...playersNewResources[playerPosition],
            newResource: {
              ...playersNewResources[playerPosition].newResource,
              [resource]: amount,
            },
          };
        }
      });
    });

    const resources = TerrainTypes.map((el) => el.produce).filter(
      (el) => el !== "nothing"
    );

    resources.forEach((resource) => {
      const playersToAddResource = playersNewResources.filter((player) =>
        Object.keys(player.newResource).some((el) => el === resource)
      );
      const amountResourceToAdd = playersNewResources.reduce(
        (count, player) => count + player.newResource[resource],
        0
      );
      const amountTakenResource = players.reduce(
        (count, player) => count + player.resourceCards[resource],
        0
      );

      if (
        amountTakenResource === TOTAL_NUMBER_OF_EACH_RESOURCE ||
        (amountTakenResource + amountResourceToAdd >=
          TOTAL_NUMBER_OF_EACH_RESOURCE &&
          playersToAddResource.length > 1)
      ) {
        playersNewResources.forEach((_, i) => {
          playersNewResources[i].newResource[resource] = 0;
        });

        return;
      } else if (
        amountResourceToAdd + amountTakenResource >
          TOTAL_NUMBER_OF_EACH_RESOURCE &&
        playersToAddResource.length === 1
      ) {
        const amount = TOTAL_NUMBER_OF_EACH_RESOURCE - amountTakenResource;
        amount;
        const position = playersNewResources.findIndex(
          (player) => playersToAddResource[0].name === player.name
        );
        playersNewResources[position].newResource[resource] = amount;
      }
    });

    playersNewResources.forEach((player) => {
      player;
      Object.entries(player.newResource).forEach(([key, value]) => {
        key, player.name, value;
        addResourceCard(key, player.name, value);
      });
    });

    const message = playersNewResources.every((player) =>
      Object.keys(player.newResource).every((key) => key === 0)
    )
      ? `There are no resources to add.`
      : `Added resources:` +
        "\n" +
        "\n" +
        playersNewResources
          .filter((el) => Object.values(el.newResource).length > 0)
          .map(
            (el) => `${el.name} :  
            ${Object.entries(el.newResource)
              .map(
                ([key, value]) =>
                  `${
                    key === 0 ? "There are no available resources." : key
                  } : ${value}`
              )
              .join(", ")}`
          )
          .join("\n");

    setUpdateMessage(message);
  };

  const handleDiceRoll = () => {
    const newDiceRoll = diceRoll.map(() =>
      generateRandomNumber(MIN_DICE_ROLL, MAX_DICE_ROLL)
    );

    setDiceRoll(newDiceRoll);

    const rolledTile = newDiceRoll.reduce((sum, curr) => sum + curr, 0);

    if (rolledTile === ROBBER_TOKEN_NUMBER) {
      setTimeout(() => {
        handleActiveRobber();
      }, 2000);

      return;
    } else {
      setResourcesFromRolledTokenNumber(rolledTile);

      setTimeout(() => {
        setDiceRoll(diceRoll.map(() => null));
        setActiveView(Views.tradeView);
      }, 2000);
    }
  };

  const handleBuildSettlementOrCity = () => {
    setError("");
    setActiveLayer(Views.settlementsLayer);
    setActiveView(Views.buildElementView);
  };

  const handleBuildRoad = () => {
    setError("");
    setActiveLayer(Layers.roadsLayer);
    setActiveView(Views.buildElementView);
  };

  const handleBuyDevelopmentCard = () => {
    const hasPlayerEnoughResources = Object.entries(
      ResourcesForBuild.developmentCard
    ).every(([key, value]) => activePlayer.resourceCards[key] >= value);

    if (!hasPlayerEnoughResources) {
      setError("You don't have enough resources to buy development card");
      return;
    }

    const countOfTakenKnightCards = players.reduce(
      (count, player) =>
        count +
        player.developmentCards.filter((card) => card.type === "knights")
          .length,
      0
    );
    const countOfTakenVictoryPointCards = players.reduce(
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

    Object.entries(ResourcesForBuild.developmentCard).forEach(([key, value]) =>
      removeResourceCard(key, activePlayer.name, value)
    );

    setActiveView(Views.buildView);
  };

  const handleChangeViewToBuildPhase = () => {
    setPanelMessage("");
    setError("");
    setActiveLayer(Layers.none);
    setActiveView(Views.buildView);
    setLongestRoad();
  };

  const handleFinishedTurn = () => {
    setError("");
    setIsKnightUsed(false);
    updatePlayersOnFinishedTurn();
    setActiveView(Views.resourceProductionView);
  };

  const setLongestRoad = () => {
    if (
      longestRoadOwner &&
      longestRoadOwner !== players.find((player) => player.isActive).name
    ) {
      const playerLongestRoad = getPlayerLongestRoad(longestRoadOwner);

      if (playerLongestRoad < longestRoadLength) {
        const playersRoadLength = players.map((player) =>
          player.name === longestRoadOwner
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
          setLongestRoadOwner(players[index].name);
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
      const playerLongestRoad = getPlayerLongestRoad(activePlayer.name);

      if (
        (!longestRoadOwner && playerLongestRoad >= longestRoadLength) ||
        (longestRoadOwner && playerLongestRoad > longestRoadLength)
      ) {
        setLongestRoadOwner(activePlayer.name);
        setLongestRoadLength(playerLongestRoad);
      }
    }
  };

  const getPlayerLongestRoad = (playerName) => {
    let longestRoad = 0;

    const player = players.find((player) => player.name === playerName);

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
          players.find(
            (play) =>
              play.name !== player.name &&
              (play.settlements.some(
                (settlement) => settlement === Number(findConnection)
              ) ||
                play.cities.some((city) => city === Number(findConnection)))
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
    setActiveView(Views.setupGameView);
    setActiveLayer(Layers.settlementsLayer);
  };

  const handleNewRound = () => {
    initializePlayersForNewRound();
    initializeTilesForNewRound();
    setlargestArmyOwner(null);
    setLongestRoadOwner(null);
    setLongestRoadLength(MIN_LONGEST_ROAD);
    setPanelMessage("");
    setActiveView(Views.startGameView);
  };

  const getPanelActionButtons = () => {
    if (view.activeView === Views.startGameView) {
      return <Button onClick={handleStartGame}>Start game</Button>;
    } else if (view.activeView === Views.finishedGameView) {
      return <Button onClick={handleNewRound}>Play new round</Button>;
    } else if (
      view.activeView === Views.resourceProductionView ||
      view.activeView === Views.tradeView ||
      view.activeView === Views.buildView
    ) {
      if (isDiceRolled) {
        return;
      }

      return (
        <div className={classes.panelActionsContainer}>
          {!isKnightUsed &&
            activePlayer.developmentCards.some(
              (card) => card.type === "knights" && card.isActive && !card.isUsed
            ) && <Button onClick={handleKnight}>Use knight</Button>}

          {view.activeView === "tradeView" && (
            <Button onClick={handleChangeViewToBuildPhase}>
              Go to build phase
            </Button>
          )}
          {view.activeView === "buildView" && (
            <>
              <Button
                onClick={() => {
                  setError("");
                  setActiveView("tradeView");
                }}
              >
                Go to trade phase
              </Button>
              <Button onClick={handleFinishedTurn}>Finish your turn</Button>
            </>
          )}
        </div>
      );
    }
  };

  const getPanelView = () => {
    if (view.activeView === Views.setupGameView) {
      return (
        <>
          <h3 className={classes.panelTitle}>Setup: </h3>
          <p>
            Please {activePlayer.name} choose{" "}
            {view.activeLayer === Layers.settlementsLayer
              ? "settlement"
              : "road"}{" "}
          </p>
        </>
      );
    } else if (view.activeView === Views.resourceProductionView) {
      return (
        <>
          <h3 className={classes.panelTitle}>Resource production :</h3>
          <div className={classes.diceWrapper}>
            <Button isDisabled={isDiceRolled} onClick={handleDiceRoll}>
              Roll dice
            </Button>
            <div className={`${classes.die} ${classes.red}`}>
              <span>{diceRoll[0]}</span>
            </div>
            <div className={`${classes.die} ${classes.yellow}`}>
              <span>{diceRoll[1]}</span>
            </div>
          </div>
        </>
      );
    } else if (view.activeView === Views.robberView) {
      return (
        <>
          <p>
            {players[playerToSelectResources]?.name} you can keep{" "}
            {amountOfRemainingResourcesForPlayers[playerToSelectResources]}{" "}
            resource cards. Please click on resources you want to give to the
            bank.
          </p>
        </>
      );
    } else if (view.activeView === Views.robberViewPhase2) {
      return (
        <>
          <p>
            Time to move robber. Please {activePlayer.name} click on the tile on
            which you want to place robber.
          </p>
        </>
      );
    } else if (view.activeView === Views.robberViewPhase3) {
      return <>{panelMessage}</>;
    } else if (
      view.activeView === Views.tradeView ||
      view.activeView === Views.tradeViewPhase2
    ) {
      return (
        <>
          <h3 className={classes.panelTitle}>Trade with bank :</h3>
          {view.activeView === Views.tradeView && (
            <>
              <p className={classes.panelParagraph}>
                {Object.values(activePlayer.resourceCards).find(
                  (card) => card >= 4
                )
                  ? `${activePlayer.name} click on resource which you want to trade`
                  : "You don't have enough resources for trading."}
              </p>
            </>
          )}
          {view.activeView === Views.tradeViewPhase2 && (
            <p>Click on resource which you want to add</p>
          )}
        </>
      );
    } else if (view.activeView === Views.buildView) {
      return (
        <>
          <h3 className={classes.panelTitle}>Build :</h3>
          {panelMessage !== "" && panelMessage}
          {panelMessage === "" && (
            <>
              <p className={classes.panelParagraph}>
                Choose what you want to build/buy
              </p>
              <div className={classes.panelButtonsContainer}>
                <SelectButton onClick={handleBuildSettlementOrCity}>
                  Settlement/city
                </SelectButton>
                <SelectButton onClick={handleBuildRoad}>Road</SelectButton>
                <SelectButton onClick={handleBuyDevelopmentCard}>
                  Development card
                </SelectButton>
              </div>
            </>
          )}
        </>
      );
    } else if (view.activeView === Views.buildElementView) {
      return (
        <>
          <p className={classes.panelParagraph}>
            Click on{" "}
            {view.activeLayer === Layers.settlementsLayer
              ? "settlement"
              : "road"}{" "}
            you want to choose.
          </p>
          <Button onClick={handleChangeViewToBuildPhase}>
            Go back to build menu
          </Button>
        </>
      );
    } else if (view.activeView === Views.finishedGameView) {
      return (
        <>
          <p className={classes.panelParagraph}>
            Winner is {activePlayer.name}
          </p>
        </>
      );
    }
  };

  const showResourceCard =
    (view.activeView === Views.robberView &&
      playerToSelectResources !== null) ||
    view.activeView === Views.tradeView ||
    view.activeView === Views.tradeViewPhase2 ||
    view.activeView === Views.buildView ||
    view.activeView === Views.buildElementView;

  return (
    <div className={classes.container}>
      <div className={classes.wrapper}>
        <div className={classes.playersContainer}>
          <PlayersBoard
            largestArmyOwner={largestArmyOwner}
            longestRoadOwner={longestRoadOwner}
          />
          {showResourceCard && (
            <PlayerCards playerName={players[playerToSelectResources]?.name} />
          )}
        </div>
        <div>
          <div className={classes.layersContainer}>
            <div className={classes.layersWrapper}>
              <div
                className={`${classes.layer} ${
                  view.activeLayer === Layers.tilesLayer ? classes.topLayer : ""
                }`}
              >
                <TilesLayer onClick={handleTileClicked} />
              </div>
              <div
                className={`${classes.layer} ${
                  view.activeLayer === Layers.roadsLayer ? classes.topLayer : ""
                }`}
              >
                <RoadsLayer
                  isLayerActive={view.activeLayer === Layers.roadsLayer}
                />
              </div>
              <div
                className={`${classes.layer} ${
                  view.activeLayer === Layers.settlementsLayer
                    ? classes.topLayer
                    : ""
                }`}
              >
                <SettlementsLayer
                  isLayerActive={view.activeLayer === Layers.settlementsLayer}
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
          <div className={classes.panelContainer}>
            <div className={classes.panelContainer}>{getPanelView()}</div>
            {getPanelActionButtons()}
          </div>
        </div>
        <Legend />
        <div className={classes.updateMessageContainer}>
          {view.updateMessage !== "" && <p>{view.updateMessage}</p>}
        </div>
      </div>
    </div>
  );
};

export default Board;
