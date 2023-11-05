import { useState } from "react";

import { usePlayersContext, useViewsContext } from "providers/hooks";

import {
  MAX_AMOUNT_CITIES,
  MAX_AMOUNT_SETTLEMENTS,
  resourcesForBuild,
} from "consts";

import classes from "./Settlement.module.css";

const Settlement = ({ id, neighbours }) => {
  const {
    filteredPlayers,
    addPlayerSettlement,
    updateSettlementToCity,
    removeResourceCard,
  } = usePlayersContext();
  const { view, changeActiveLayer, setError } = useViewsContext();

  const [type, setType] = useState(
    filteredPlayers.find((player) => player.cities.some((city) => city === id))
      ? "city"
      : "settlement"
  );

  const color = filteredPlayers.find(
    (player) =>
      player.settlements.some((settlement) => settlement === id) ||
      player.cities.some((city) => city === id)
  )?.color;

  const activePlayer = filteredPlayers.find((player) => player.isActive);

  const handleClick = () => {
    const isThereSettledNeighbour = neighbours.some((el) =>
      filteredPlayers.some((player) =>
        player.settlements.some((settlement) => settlement === el)
      )
    );
    const isSettlementSettled = filteredPlayers
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

    if (view.activeView === "setupGameView") {
      if (activePlayer.settlements.some((settlement) => settlement === id)) {
        setError("This settlement already belongs to you.");
        return;
      }
      setError("");
      addPlayerSettlement(id);
      changeActiveLayer("roadsLayer");
    } else if (view.activeView === "buildView") {
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
        resourcesForBuild[typeForBuild]
      ).every(([key, value]) => activePlayer.resourceCards[key] >= value);

      if (!hasPlayerEnoughResources) {
        setError(
          `You don't have enough resources for building ${type}. Please go back to trade or finish your turn.`
        );
        return;
      }

      Object.entries(resourcesForBuild[typeForBuild]).forEach(([key, value]) =>
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
    }
  };

  return (
    <div className={classes.container}>
      <button
        disabled={view.activeLayer !== "settlementsLayer"}
        onClick={handleClick}
        className={`${classes[type]} ${classes[color]}`}
      ></button>
    </div>
  );
};

export default Settlement;
