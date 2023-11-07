import { useEffect, useState } from "react";

import { usePlayersContext, useViewsContext } from "providers/hooks";

import {
  Views,
  Layers,
  MAX_AMOUNT_CITIES,
  MAX_AMOUNT_SETTLEMENTS,
  ResourcesForBuild,
} from "consts";

import classes from "./Settlement.module.css";

const Settlement = ({ id, neighbours }) => {
  const {
    filteredPlayers: players,
    addPlayerSettlement,
    updateSettlementToCity,
    removeResourceCard,
  } = usePlayersContext();
  const { view, setActiveLayer, setError } = useViewsContext();

  const [type, setType] = useState(
    players.find((player) => player.cities.some((city) => city === id))
      ? "city"
      : "settlement"
  );

  const color = players.find(
    (player) =>
      player.settlements.some((settlement) => settlement === id) ||
      player.cities.some((city) => city === id)
  )?.color;

  const activePlayer = players.find((player) => player.isActive);

  useEffect(() => {
    if (view.activeView === Views.startGameView) {
      setType("settlement");
    }
  }, [view.activeView]);

  const handleClick = () => {
    const isThereSettledNeighbour = neighbours.some((el) =>
      players.some((player) =>
        player.settlements.some((settlement) => settlement === el)
      )
    );
    const isSettlementSettled = players
      .filter((player) => player.name !== activePlayer.name)
      .some(
        (player) =>
          player.settlements.some((settlement) => settlement === id) ||
          player.cities.some((city) => city === id)
      );

    if (isSettlementSettled || isThereSettledNeighbour) {
      setError(`You can't select this ${type}`);

      return;
    }

    if (activePlayer.cities.some((city) => city === id)) {
      setError("This is already your city. Please select something else.");

      return;
    }

    if (view.activeView === Views.setupGameView) {
      handleAddSettlementOnSetup();
    } else if (view.activeView === ViewsbuildElementView) {
      handleAddSettlmentOrCityOnBuild();
    }
  };

  const handleAddSettlementOnSetup = () => {
    if (activePlayer.settlements.some((settlement) => settlement === id)) {
      setError("This settlement already belongs to you.");

      return;
    }

    setError("");
    addPlayerSettlement(id);
    setActiveLayer(Layers.roadsLayer);
  };

  const handleAddSettlmentOrCityOnBuild = () => {
    const hasPlayerRoadOnSettlement = activePlayer.roads.some(
      (road) =>
        Number(road.split("-")[0]) === id || Number(road.split("-")[1]) === id
    );

    if (!hasPlayerRoadOnSettlement) {
      setError(
        `You can't build this settlement. Your new settlement must connect to at least 1 of your own roads.`
      );

      return;
    }

    const typeForBuild = activePlayer.settlements.some(
      (settlement) => settlement === id
    )
      ? "city"
      : "settlement";

    if (
      (typeForBuild === "city" &&
        activePlayer.cities.length >= MAX_AMOUNT_CITIES) ||
      (typeForBuild === "settlement" &&
        activePlayer.settlements.length >= MAX_AMOUNT_SETTLEMENTS)
    ) {
      setError(`You don't have ${typeForBuild} elements available.`);

      return;
    }

    const hasPlayerEnoughResources = Object.entries(
      ResourcesForBuild[typeForBuild]
    ).every(([key, value]) => activePlayer.resourceCards[key] >= value);

    if (!hasPlayerEnoughResources) {
      setError(
        `You don't have enough resources for building ${type}. Please go back to trade or finish your turn.`
      );

      return;
    }

    Object.entries(ResourcesForBuild[typeForBuild]).forEach(([key, value]) =>
      removeResourceCard(key, activePlayer.name, value)
    );

    setError("");

    if (typeForBuild === "city") {
      updateSettlementToCity(id);
      setType("city");
    } else {
      addPlayerSettlement(id);
    }

    return;
  };

  return (
    <div className={classes.container}>
      <button
        disabled={view.activeLayer !== Layers.settlementsLayer}
        onClick={handleClick}
        className={`${classes[type]} ${classes[color]}`}
      ></button>
    </div>
  );
};

export default Settlement;
