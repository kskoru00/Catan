import {
  usePlayersContext,
  useViewsContext,
  useTileContext,
} from "providers/hooks";

import { MAX_AMOUNT_ROADS, resourcesForBuild, terrainTypes } from "consts";

import classes from "./Road.module.css";

const Road = ({ id, row, positionInRow }) => {
  const {
    filteredPlayers,
    updatePlayersRoads,
    changeActivePlayer,
    addResourceCard,
    removeResourceCard,
  } = usePlayersContext();
  const { view, changeView, changeActiveLayer, setUpdateMessage, setError } =
    useViewsContext();
  const { tiles } = useTileContext();

  const [roadStart, roadEnd] = id
    .split("-")
    .map((settlement) => Number(settlement));

  const activePlayer = filteredPlayers.find((player) => player.isActive);

  const color = filteredPlayers.find((player) =>
    player.roads.find((road) => road === id)
  )?.color;

  const getPosition = () => {
    if (row % 2 === 0) {
      if (
        (positionInRow % 2 === 0 && row < 5) ||
        (positionInRow % 2 !== 0 && row > 5)
      ) {
        return "left";
      } else if (
        positionInRow % 2 !== 0 ||
        (positionInRow % 2 === 0 && row > 5)
      ) {
        return "right";
      }
    } else {
      return "vertical";
    }
  };

  const position = getPosition();

  let buttonClassName = `${classes.button} ${classes[color]} ${classes[position]}`;

  const handleClick = () => {
    if (
      filteredPlayers.some((player) => player.roads.some((road) => road === id))
    ) {
      setError("This road is already selected.");
      return;
    }
    if (view.activeView === "setupGameView") {
      handleAddRoadOnSetup();
    } else if (view.activeView === "buildView") {
      handleAddRoadOnBuild();
    }
  };

  const handleAddRoadOnBuild = () => {
    if (activePlayer.roads.length >= MAX_AMOUNT_ROADS) {
      setError("You have no more roads available.");
      return;
    }
    const hasPlayerEnoughResources = Object.entries(
      resourcesForBuild.road
    ).every(([key, value]) => activePlayer.resourceCards[key] >= value);

    if (!hasPlayerEnoughResources) {
      setError(
        "You don't have enough resources for building road. Please go back to trade or finish your turn."
      );
      return;
    }
    const isRoadConnectedToPlayersSettlement = activePlayer.settlements.some(
      (settlement) => settlement === roadStart || settlement === roadEnd
    );
    const isRoadConnectToPlayersRoad = activePlayer.roads.some((road) =>
      road
        .split("-")
        .some((el) => Number(el) === roadEnd || Number(el) === roadStart)
    );
    if (!isRoadConnectToPlayersRoad && !isRoadConnectedToPlayersSettlement) {
      setError("You can't choose this road");
      return;
    }
    setError("");
    updatePlayersRoads(id);
    Object.entries(resourcesForBuild.road).forEach(([key, value]) =>
      removeResourceCard(key, activePlayer.name, value)
    );
  };

  const setPlayersSetupResources = () => {
    const playersSetupResources = filteredPlayers.map((player) => ({
      name: player.name,
      resources: [],
    }));

    filteredPlayers.forEach((player) => {
      player.settlements.forEach((settlement) => {
        const resourceCards = tiles
          .flat()
          .filter((type) => type.settlements.find((el) => el === settlement))
          .map((tile) => terrainTypes[tile.terrainId].name)
          .filter((card) => card !== "dessert")
          .map(
            (tileType) =>
              terrainTypes.find((type) => type.name === tileType).produce
          );

        resourceCards.forEach((card) => {
          addResourceCard(card, player.name);
          playersSetupResources
            .find((el) => el.name === player.name)
            .resources.push(card);
        });
      });
    });
    const message =
      `Added resources:` +
      "\n\n" +
      playersSetupResources
        .map(
          (player) => `${player.name} :  
            ${player.resources.join(", ")}`
        )
        .join("\n");

    setUpdateMessage(message);
  };

  const setForNextSetupStep = () => {
    setError("");
    changeActiveLayer("settlementsLayer");

    if (filteredPlayers.every((player) => player.settlements.length === 2)) {
      setPlayersSetupResources();
      changeView("resourceProductionView");
      changeActiveLayer("none");
      return;
    } else if (
      filteredPlayers.every((player) => player.settlements.length === 1)
    ) {
      return;
    } else if (activePlayer.settlements.length === 2) {
      changeActivePlayer(-1);
    } else if (
      !filteredPlayers.find(
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
          "You can't select this road. In setup phase every city must have one selected road."
        );

        return;
      }
    }
    updatePlayersRoads(id);
    setForNextSetupStep();
  };

  return (
    <div className={position === "vertical" ? classes.verticalContainer : ""}>
      <button
        disabled={view.activeLayer !== "roadsLayer"}
        onClick={handleClick}
        className={buttonClassName}
      ></button>
    </div>
  );
};

export default Road;
