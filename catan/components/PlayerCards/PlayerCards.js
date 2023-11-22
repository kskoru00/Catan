import { useState } from "react";

import { usePlayersContext, useViewsContext } from "providers/hooks";

import {
  NUMBER_OF_RESOURCES_TO_GIVE_TO_BANK,
  NUMBER_OF_RESOURCES_RECEIVING_FROM_BANK,
  Views,
} from "consts";

import ResourceCard from "components/ResourceCard";
import DevelopmentCards from "components/DevelopmentCards";

import classes from "./PlayerCards.module.css";

const PlayerCards = ({ playerName }) => {
  const { filteredPlayers: players } = usePlayersContext();
  const { addResourceCard, removeResourceCard } = usePlayersContext();
  const { view, setActiveView, setUpdateMessage, setError } = useViewsContext();

  const [disabledResource, setDisabledResource] = useState(null);
  const [showKnightsDetails, setShowKnightsDetails] = useState(false);

  const player = players.find((player) =>
    playerName ? player.name === playerName : player.isActive
  );

  const countKnightCards = player.developmentCards.filter(
    (card) => card.type === "knights"
  ).length;

  const handleResourceClick = (type) => {
    if (view.activeView === Views.robberView) {
      if (player.resourceCards[type] > 0) {
        removeResourceCard(type, player.name);
        setUpdateMessage(`Removed 1 ${type} for ${player.name}`);
      }
    } else if (view.activeView === Views.tradeView) {
      if (player.resourceCards[type] < NUMBER_OF_RESOURCES_TO_GIVE_TO_BANK) {
        setError(
          `You can't trade with ${type}. Minimum trade amount of resource is ${NUMBER_OF_RESOURCES_TO_GIVE_TO_BANK}.`
        );

        return;
      }

      removeResourceCard(
        type,
        player.name,
        NUMBER_OF_RESOURCES_TO_GIVE_TO_BANK
      );

      setError("");
      setDisabledResource(type);

      setUpdateMessage(
        `Removed ${NUMBER_OF_RESOURCES_TO_GIVE_TO_BANK} ${type} for ${player.name}`
      );
      setActiveView(Views.tradeViewPhase2);
    } else if (view.activeView === Views.tradeViewPhase2) {
      addResourceCard(type, player.name);

      setUpdateMessage(
        `Added ${NUMBER_OF_RESOURCES_RECEIVING_FROM_BANK} ${type} for ${player.name}`
      );
      setActiveView(Views.tradeView);
      setDisabledResource(null);
    }
  };

  return (
    <div className={`${classes.container} ${classes[player.color]}`}>
      <h3 className={classes.title}>Player: {player.name}</h3>
      <div className={classes.cards}>
        <h4 className={classes.subtitle}>Resource cards:</h4>
        {Object.entries(player.resourceCards).map(([key, value]) => (
          <ResourceCard
            onClick={handleResourceClick}
            key={key}
            id={key}
            type={key}
            amount={value}
            isDisabled={
              disabledResource === key ||
              (view.activeView !== Views.tradeViewPhase2 && value === 0)
            }
          />
        ))}
      </div>
      <div className={classes.cards}>
        <h4 className={classes.subtitle}>Development cards:</h4>
        <div className={classes.developmentContainer}>
          <span className={classes.developmentItem}>
            victory points:{" "}
            {player &&
              player?.developmentCards.filter(
                (card) => card.type === "victoryPoint"
              ).length}
          </span>
        </div>
        <div className={classes.developmentContainer}>
          <span className={classes.developmentItem}>
            knights: {countKnightCards}
          </span>
          <button
            disabled={countKnightCards === 0}
            className={`${classes.button} ${classes[player.color]}`}
            onClick={() => {
              setShowKnightsDetails(!showKnightsDetails);
            }}
          >
            {!showKnightsDetails ? "Show details" : "Hide details"}
          </button>
        </div>
        {showKnightsDetails && (
          <div className={classes.knightsContainer}>
            {player.developmentCards
              .filter((card) => card.type === "knights")
              .map((value, i) => (
                <DevelopmentCards
                  key={i}
                  id={i}
                  type={value.type}
                  isActive={value.isActive}
                  isUsed={value.isUsed}
                  color={player.color}
                />
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerCards;
