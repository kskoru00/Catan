import {
  usePlayersContext,
  useViewsContext,
  useTileContext,
} from "providers/hooks";

import { terrainTypes } from "consts";

import classes from "./Road.module.css";

const Road = ({ id, row, position }) => {
  const {
    filteredPlayers,
    updatePlayersRoads,
    changeActivePlayer,
    addResourceCard,
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

  let buttonClassName = `${classes.button} ${classes[color]}`;
  let containerClassName = ``;

  if (row % 2 === 0) {
    if ((position % 2 === 0 && row < 5) || (position % 2 !== 0 && row > 5)) {
      buttonClassName += ` ${classes.left}`;
    } else if (position % 2 !== 0 || (position % 2 === 0 && row > 5)) {
      buttonClassName += ` ${classes.right}`;
    }
  } else {
    containerClassName += ` ${classes.verticalContainer}`;
    buttonClassName += ` ${classes.vertical}`;
  }

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
          .filter((card) => card !== "dessert")
          .map(
            (tileType) =>
              terrainTypes.find((type) => type.name === tileType).produce
          );

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

  const handleClick = () => {
    if (
      !activePlayer.settlements.some(
        (settlement) => settlement === roadStart || settlement === roadEnd
      )
    ) {
      setError("You can't select this road.");
      return;
    }

    if (view.activeView === "setupGameView" && activePlayer.roads.length > 0) {
      const oneDirection = activePlayer.settlements.find((settlement) =>
        activePlayer.roads[0]
          .split("-")
          .every((roadCity) => Number(roadCity) !== settlement)
      );

      if (oneDirection !== roadStart && oneDirection !== roadEnd) {
        setError(
          "You can't select this road. In setup phase every city must have one selected road."
        );
        return;
      }
    }
    setError("");
    updatePlayersRoads(id);
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

  return (
    <div className={containerClassName}>
      <button
        disabled={view.activeLayer !== "roadsLayer"}
        onClick={handleClick}
        className={buttonClassName}
      ></button>
    </div>
  );
};

export default Road;
