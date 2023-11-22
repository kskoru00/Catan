import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import {
  usePlayersContext,
  useTileContext,
  useViewsContext,
} from "providers/hooks";

import {
  generateRandomNumber,
  getResourcesTotalToKeep,
  getResourcesTotal,
  calculatePlayerLongestRoad,
} from "helpers";

import {
  Views,
  Layers,
  TerrainTypes,
  MIN_DICE_ROLL,
  MAX_DICE_ROLL,
  ROBBER_TOKEN_NUMBER,
  TOTAL_NUMBER_OF_EACH_RESOURCE,
  MIN_LARGEST_ARMY,
  MIN_LONGEST_ROAD,
} from "consts";

import SettlementsLayer from "components/BoardLayers/SettlementsLayer";
import TilesLayer from "components/BoardLayers/TilesLayer";
import RoadsLayer from "components/BoardLayers/RoadsLayer";
import Legend from "components/Legend";
import PlayersBoard from "components/PlayersBoard";
import PlayerCards from "components/PlayerCards";
import Panel from "components/Panel";
import Error from "components/UI/Error";

import classes from "./Board.module.css";

const Board = () => {
  const router = useRouter();

  const { view, setActiveView, setActiveLayer, setUpdateMessage } =
    useViewsContext();
  const {
    filteredPlayers: players,
    addResourceCard,
    removeResourceCard,

    setDevelopmentCardAsUsed,
  } = usePlayersContext();
  const { tiles } = useTileContext();

  const activePlayer = players.find((player) => player.isActive);

  const [diceRoll, setDiceRoll] = useState(new Array(2).fill(null));

  const [
    positionOfPlayerDeductingResources,
    setPositionOfPlayerDeductingResources,
  ] = useState(null);
  const [totalPlayersResourcesToKeep, setTotalPlayersResourcesToKeep] =
    useState([0, 0, 0]);

  const [playersWithSettlementOnTile, setPlayersWithSettlementOnTile] =
    useState(null);

  const [viewBeforeKnight, setViewBeforeKnight] = useState(null);

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
    if (positionOfPlayerDeductingResources === null) {
      return;
    }

    const resourcesTotal = getResourcesTotal(
      Object.values(players[positionOfPlayerDeductingResources].resourceCards)
    );

    if (
      resourcesTotal ===
      totalPlayersResourcesToKeep[positionOfPlayerDeductingResources]
    ) {
      if (positionOfPlayerDeductingResources === players.length - 1) {
        setActiveView(Views.robberViewPhase2);
        setActiveLayer(Layers.tilesLayer);
        setTotalPlayersResourcesToKeep([0, 0, 0]);
        setPositionOfPlayerDeductingResources(null);

        return;
      }

      setPositionOfPlayerDeductingResources(
        positionOfPlayerDeductingResources + 1
      );
    }
  }, [players, positionOfPlayerDeductingResources]);

  const removeRandomResource = (player) => {
    const availableCards = Object.entries(player.resourceCards).filter(
      ([_, value]) => value > 0
    );

    const random = generateRandomNumber(0, availableCards.length - 1);
    if (availableCards.length === 0) {
      return;
    }
    const randomCardKey = availableCards[random][0];

    removeResourceCard(randomCardKey, player.name);
    setUpdateMessage(
      `Removed random resource ${randomCardKey} for player ${player.name}`
    );
    setPlayersWithSettlementOnTile(null);
    if (viewBeforeKnight) {
      setActiveView(viewBeforeKnight);
      setViewBeforeKnight(null);

      return;
    } else {
      setActiveView(Views.tradeView);
    }
  };

  const handleKnight = () => {
    setDevelopmentCardAsUsed();
    setViewBeforeKnight(view.activeView);
    setActiveView(Views.robberViewPhase2);
    setActiveLayer(Layers.tilesLayer);

    const countUsedKnights =
      activePlayer.developmentCards.filter(
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

  const handleSelectedTile = (id) => {
    const tile = tiles.flat().find((tile) => tile.id === id);

    const filteredPlayers = players.filter(
      (player) =>
        !player.isActive &&
        player.settlements.some((settlement) =>
          tile.settlements.some(
            (tileSettlement) => tileSettlement === settlement
          )
        )
    );

    if (filteredPlayers.length === 0) {
      setUpdateMessage(
        "There are no players who have settlement on selected tile."
      );
      setActiveView(Views.tradeView);
    } else if (filteredPlayers.length === 1) {
      removeRandomResource(filteredPlayers[0]);
    } else {
      setPlayersWithSettlementOnTile(filteredPlayers);
    }
  };

  const deductPlayersResources = () => {
    if (
      players.every(
        (player) =>
          getResourcesTotal(Object.values(player.resourceCards)) <=
          ROBBER_TOKEN_NUMBER
      )
    ) {
      setUpdateMessage(
        `There are no players who has more than ${ROBBER_TOKEN_NUMBER} resource cards.`
      );
      setActiveView(Views.robberViewPhase2);
      setActiveLayer(Layers.tilesLayer);

      return;
    } else {
      setTotalPlayersResourcesToKeep((prevAmount) => {
        const newAmount = [...prevAmount];
        players.forEach((player, i) => {
          newAmount[i] = getResourcesTotalToKeep(
            Object.values(player.resourceCards)
          );
        });
        return newAmount;
      });
      setPositionOfPlayerDeductingResources(0);
    }
  };

  const increasePlayersResources = (diceRollSum) => {
    const playersNewResources = players.map((player) => ({
      name: player.name,
      newResource: {},
    }));

    const filteredTiles = tiles
      .flat()
      .filter((tile) => tile.tokenNumber === diceRollSum && tile.isActive);

    filteredTiles.forEach((tile) => {
      const resource = TerrainTypes.find(
        (type) => type.id === tile.terrainId
      ).produce;

      tile.settlements.forEach((settlement) => {
        const playerName = players.find(
          (player) =>
            player.settlements.find(
              (playerSettlement) => playerSettlement === settlement
            ) || player.cities.find((playerCity) => playerCity === settlement)
        )?.name;

        if (playerName) {
          const playerPosition = playersNewResources.findIndex(
            (player) => player.name === playerName
          );

          let amount = players[playerPosition].settlements.find(
            (playerSettlement) => playerSettlement === settlement
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

    const resources = TerrainTypes.map((terrain) => terrain.produce).filter(
      (produce) => produce !== null
    );

    resources.forEach((resource) => {
      const playersToAddResource = playersNewResources.filter((player) =>
        Object.keys(player.newResource).some(
          (playerResource) => playerResource === resource
        )
      );

      const amountResourceToAdd = playersToAddResource.reduce(
        (sum, player) => sum + player.newResource[resource],
        0
      );
      const amountTakenResource = players.reduce(
        (sum, player) => sum + player.resourceCards[resource],
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
      Object.entries(player.newResource).forEach(([key, value]) => {
        addResourceCard(key, player.name, value);
      });
    });

    const message = playersNewResources.every((player) =>
      Object.keys(player.newResource).every((key) => key === 0)
    )
      ? `There are no resources to add.`
      : `Added resources:` +
        "\n\n" +
        playersNewResources
          .filter((el) => Object.values(el.newResource).length > 0)
          .map(
            (el) => `${el.name} :  
            ${Object.entries(el.newResource)
              .map(([key, value]) =>
                value === 0
                  ? `There are no available resources for ${key}`
                  : `${key} : ${value}`
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

    const diceRollSum = newDiceRoll.reduce((sum, curr) => sum + curr, 0);

    if (diceRollSum !== ROBBER_TOKEN_NUMBER) {
      increasePlayersResources(diceRollSum);
    }

    setTimeout(() => {
      setDiceRoll(diceRoll.map(() => null));

      if (diceRollSum === ROBBER_TOKEN_NUMBER) {
        setActiveView(Views.robberView);
        deductPlayersResources();
      } else {
        setActiveView(Views.tradeView);
      }
    }, 2000);
  };

  const setLongestRoad = () => {
    if (
      longestRoadOwner &&
      longestRoadOwner !== players.find((player) => player.isActive).name
    ) {
      const ownersNewLongestRoad = calculatePlayerLongestRoad(
        longestRoadOwner,
        players
      );

      if (ownersNewLongestRoad < longestRoadLength) {
        const playersRoadLength = players.map((player) =>
          player.name === longestRoadOwner
            ? ownersNewLongestRoad
            : calculatePlayerLongestRoad(player, players)
        );

        const maxRoadLength = Math.max(...playersRoadLength);

        if (
          ownersNewLongestRoad === maxRoadLength &&
          ownersNewLongestRoad >= MIN_LONGEST_ROAD
        ) {
          setLongestRoadLength(ownersNewLongestRoad);
        } else if (
          playersRoadLength.filter((road) => road === maxRoadLength).length ===
            1 &&
          maxRoadLength >= MIN_LONGEST_ROAD
        ) {
          const index = playersRoadLength.findIndex(
            (road) => road === maxRoadLength
          );
          setLongestRoadLength(maxRoadLength);
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
      const playerLongestRoad = calculatePlayerLongestRoad(
        activePlayer.name,
        players
      );

      if (
        (!longestRoadOwner && playerLongestRoad >= longestRoadLength) ||
        (longestRoadOwner && playerLongestRoad > longestRoadLength)
      ) {
        setLongestRoadOwner(activePlayer.name);
        setLongestRoadLength(playerLongestRoad);
      }
    }
  };

  const handleNewRound = () => {
    setlargestArmyOwner(null);
    setLongestRoadOwner(null);
    setLongestRoadLength(MIN_LONGEST_ROAD);
  };

  const showResourceCard =
    (view.activeView === Views.robberView &&
      positionOfPlayerDeductingResources !== null) ||
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
            <PlayerCards
              playerName={players[positionOfPlayerDeductingResources]?.name}
            />
          )}
        </div>
        <div>
          <div className={classes.layersContainer}>
            <div
              className={`${classes.layer} ${
                view.activeLayer === Layers.tilesLayer ? classes.topLayer : ""
              }`}
            >
              <TilesLayer onClick={handleSelectedTile} />
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
          <Panel
            playersWithSettlementOnTile={playersWithSettlementOnTile}
            playerDeductingResources={{
              position: positionOfPlayerDeductingResources,
              total:
                totalPlayersResourcesToKeep[positionOfPlayerDeductingResources],
            }}
            dice={diceRoll}
            onDiceRoll={handleDiceRoll}
            onKnight={handleKnight}
            onSetLongestRoad={setLongestRoad}
            onNewRound={handleNewRound}
            onRemoveRandomResource={removeRandomResource}
          />
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
