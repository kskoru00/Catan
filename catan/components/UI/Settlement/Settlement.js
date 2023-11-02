import { usePlayersContext, useViewsContext } from "providers/hooks";

import classes from "./Settlement.module.css";
import {
  MAX_AMOUNT_CITIES,
  MAX_AMOUNT_SETTLEMENTS,
  resourcesForBuild,
} from "consts";
import { useState } from "react";

const Settlement = ({ id, neighbours }) => {
  const {
    filteredPlayers,
    addPlayerSettlement,
    updateSettlementToCity,
    removeResourceCard,
  } = usePlayersContext();
  const { view, changeActiveLayer, setError } = useViewsContext();

  const [typeOfBuild, setTypeOfBuild] = useState(
    filteredPlayers.find((player) => player.cities.some((city) => city === id))
      ? "city"
      : "settlement"
  );

  const color = filteredPlayers.find(
    (player) =>
      player.settlements.some((settlement) => settlement === id) ||
      player.cites?.some((city) => city === id)
  )?.color;

  const activePlayer = filteredPlayers.find((player) => player.isActive);

  const handleClick = () => {
    const isNeighboursSettlementSettled = neighbours.find((el) =>
      filteredPlayers.find((player) =>
        player.settlements.find((settlement) => settlement === el)
      )
    );
    const isSettlementSettled = filteredPlayers
      .filter((player) => player.name !== activePlayer.name)
      .some((player) =>
        player.settlements.some((settlement) => settlement === id)
      );

    if (isSettlementSettled || isNeighboursSettlementSettled) {
      setError("You can't select this settlement.");
      return;
    }

    if (
      view.activeView === "buildView" &&
      activePlayer.settlements.some((settlement) => settlement === id)
    ) {
      if (activePlayer.cities.length > MAX_AMOUNT_CITIES) {
        setError("You have no more cities available.");
        return;
      }
      const hasPlayerEnoughResources = Object.entries(
        resourcesForBuild.city
      ).every(([key, value]) => activePlayer.resourceCards[key] >= value);

      if (!hasPlayerEnoughResources) {
        setError(
          "You don't have enough resources for building city. Please go back to trade or finish your turn."
        );
        return;
      }
      Object.entries(resourcesForBuild.city).forEach(([key, value]) =>
        removeResourceCard(key, activePlayer.name, value)
      );
      updateSettlementToCity(id);
      setTypeOfBuild("city");
      changeActiveLayer("none");
      return;
    }
    if (activePlayer.settlements.length > MAX_AMOUNT_SETTLEMENTS) {
      setError("You have no more settlements available.");
      return;
    }

    if (view.activeView === "buildView") {
      const hasPlayerEnoughResources = Object.entries(
        resourcesForBuild.settlement
      ).every(([key, value]) => activePlayer.resourceCards[key] >= value);

      if (!hasPlayerEnoughResources) {
        setError(
          "You don't have enough resources for building settlement. Please go back to trade or finish your turn."
        );
        return;
      }

      Object.entries(resourcesForBuild.settlement).forEach(([key, value]) =>
        removeResourceCard(key, activePlayer.name, value)
      );
      changeActiveLayer("none");
    }
    setError("");
    addPlayerSettlement(id);
    if (view.activeView === "setupGameView") {
      changeActiveLayer("roadsLayer");
    }
  };

  return (
    <div className={classes.container}>
      <button
        disabled={view.activeLayer !== "settlementsLayer"}
        onClick={handleClick}
        className={`${classes[typeOfBuild]} ${classes[color]}`}
      ></button>
    </div>
  );
};

export default Settlement;
