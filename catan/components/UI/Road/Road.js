import {
  usePlayersContext,
  useViewsContext,
  useTileContext,
} from "providers/hooks";

import {
  Views,
  Layers,
  MAX_AMOUNT_ROADS,
  TerrainTypes,
  ResourcesForBuild,
} from "consts";

import { getRoadPosition, hasPlayerEnoughResources } from "helpers";

import classes from "./Road.module.css";

const Road = ({ id, row, positionInRow }) => {
  const {
    filteredPlayers: players,
    updatePlayersRoads,
    changeActivePlayer,
    addResourceCard,
    removeResourceCard,
  } = usePlayersContext();
  const { view, setActiveView, setActiveLayer, setUpdateMessage, setError } =
    useViewsContext();
  const { tiles } = useTileContext();

  const [roadStart, roadEnd] = id
    .split("-")
    .map((settlement) => Number(settlement));

  const activePlayer = players.find((player) => player.isActive);

  const color = players.find((player) =>
    player.roads.find((road) => road === id)
  )?.color;

  const position = getRoadPosition(row, positionInRow);

  let buttonClassName = `${classes.button} ${classes[color]} ${classes[position]}`;

  const handleClick = () => {
    if (players.some((player) => player.roads.some((road) => road === id))) {
      setError("This road is already selected.");
      return;
    }

    if (view.activeView === Views.setupGameView) {
      handleAddRoadOnSetup();
    } else if (view.activeView === Views.buildElementView) {
      handleAddRoadOnBuild();
    }
  };

  const handleAddRoadOnBuild = () => {
    if (activePlayer.roads.length >= MAX_AMOUNT_ROADS) {
      setError("You have no more roads available.");

      return;
    }

    if (!hasPlayerEnoughResources("road", activePlayer)) {
      setError("You don't have enough resources for building road.");

      return;
    }

    const isRoadConnectedToPlayersSettlement = activePlayer.settlements.some(
      (settlement) => settlement === roadStart || settlement === roadEnd
    );
    const isRoadConnectToPlayersRoad = activePlayer.roads.some((road) =>
      road
        .split("-")
        .some(
          (roadEdge) =>
            Number(roadEdge) === roadEnd || Number(roadEdge) === roadStart
        )
    );
    if (!isRoadConnectToPlayersRoad && !isRoadConnectedToPlayersSettlement) {
      setError("You can't choose this road");

      return;
    }

    setError("");
    updatePlayersRoads(id);

    Object.entries(ResourcesForBuild.road).forEach(([key, value]) =>
      removeResourceCard(key, activePlayer.name, value)
    );
  };

  const setPlayersSetupResources = () => {
    const playersSetupResources = players.map((player) => ({
      name: player.name,
      setupResources: {},
    }));

    players.forEach((player, playerPosition) => {
      player.settlements.forEach((settlement) => {
        const resourceCards = tiles
          .flat()
          .filter((tile) =>
            tile.settlements.find(
              (tileSettlement) => tileSettlement === settlement
            )
          )
          .map((tile) => TerrainTypes[tile.terrainId].produce)
          .filter((card) => card !== null);

        resourceCards.forEach((resource) => {
          if (playersSetupResources[playerPosition].setupResources[resource]) {
            playersSetupResources[playerPosition].setupResources[resource] += 1;
          } else {
            playersSetupResources[playerPosition].setupResources[resource] = 1;
          }
        });
      });
    });

    playersSetupResources.forEach((player) => {
      Object.entries(player.setupResources).forEach(([key, value]) => {
        addResourceCard(key, player.name, value);
      });
    });

    const message =
      `Added resources:` +
      "\n\n" +
      playersSetupResources
        .map(
          (player) => `${player.name} :  
            ${Object.entries(player.setupResources)
              .map(([key, value]) => `${key} : ${value}`)
              .join(", ")}`
        )
        .join("\n");

    setUpdateMessage(message);
  };

  const setForNextSetupStep = () => {
    setError("");
    setActiveLayer(Layers.settlementsLayer);

    if (players.every((player) => player.settlements.length === 2)) {
      setPlayersSetupResources();
      setActiveView(Views.resourceProductionView);
      setActiveLayer("none");
      return;
    } else if (players.every((player) => player.settlements.length === 1)) {
      return;
    } else if (activePlayer.settlements.length === 2) {
      changeActivePlayer(-1);
    } else if (
      !players.find(
        (player) => player.settlements.length === 2 && player.roads.length === 2
      ) &&
      activePlayer.settlements.length < 2 &&
      activePlayer.roads.length < 2
    ) {
      changeActivePlayer();
    }
  };

  const handleAddRoadOnSetup = () => {
    if (
      !activePlayer.settlements.some(
        (settlement) => settlement === roadStart || settlement === roadEnd
      )
    ) {
      setError("You can't select this road.");
      return;
    }

    if (activePlayer.roads.length > 0) {
      const settlementWithoutRoad = activePlayer.settlements.find(
        (settlement) =>
          activePlayer.roads[0]
            .split("-")
            .every((roadCity) => Number(roadCity) !== settlement)
      );

      if (
        settlementWithoutRoad !== roadStart &&
        settlementWithoutRoad !== roadEnd
      ) {
        setError(
          "You can't select this road.\n In setup phase every city must have one selected road."
        );

        return;
      }
    }

    updatePlayersRoads(id);
    setForNextSetupStep();
  };

  return (
    <div
      className={
        position === "vertical" ? classes.verticalContainer : classes.container
      }
    >
      <button
        disabled={view.activeLayer !== Layers.roadsLayer}
        onClick={handleClick}
        className={buttonClassName}
      ></button>
    </div>
  );
};

export default Road;
