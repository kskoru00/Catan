import ResourceCard from "components/ResourceCard";
import classes from "./PlayerCards.module.css";
import DevelopmentCards from "components/DevelopmentCards";

import { usePlayersContext, useViewsContext } from "providers/hooks";
import { NUMBER_OF_RESOURCES_TO_GIVE_TO_BANK } from "consts";
import { useState } from "react";

const PlayerCards = ({ player }) => {
  const { filteredPlayers } = usePlayersContext();
  const { addResourceCard, removeResourceCard } = usePlayersContext();
  const { view, changeView, setUpdateMessage, setError } = useViewsContext();

  const [disabledResource, setDisabledResource] = useState(null);
  const [showKnightsDetails, setShowKnightsDetails] = useState(false);

  const activePlayer = player
    ? filteredPlayers.find((el) => el.name === player.name)
    : null;

  const countKnightCards = activePlayer.developmentCards.filter(
    (card) => card.type === "knights"
  ).length;

  const handleResourceClick = (type) => {
    if (view.activeView === "robberView") {
      if (activePlayer.resourceCards[type] > 0) {
        console.log("je");

        removeResourceCard(type, activePlayer.name);
        setUpdateMessage(`Removed 1 ${type} for ${activePlayer.name}`);
      }
    } else if (view.activeView === "tradeView") {
      if (activePlayer.resourceCards[type] < 4) {
        setError(
          `You cant trade with ${type}. For trading min amount of resource is 4.`
        );
        return;
      }
      setError("");
      removeResourceCard(
        type,
        activePlayer.name,
        NUMBER_OF_RESOURCES_TO_GIVE_TO_BANK
      );
      setDisabledResource(type);

      setUpdateMessage(`Removed 4 ${type} for ${activePlayer.name}`);
      changeView("tradeViewPhase2");
    } else if (view.activeView === "tradeViewPhase2") {
      addResourceCard(type, activePlayer.name);
      setUpdateMessage(`Added 1 ${type} for ${activePlayer.name}`);
      changeView("tradeView");
      setDisabledResource(null);
    }
  };

  return (
    <div className={`${classes.wrapper} ${classes[activePlayer.color]}`}>
      <h3 className={classes.title}>Player : {activePlayer?.name}</h3>
      <div className={classes.resourceCard}>
        <h4 className={classes.subtitle}>Resource cards:</h4>
        {activePlayer &&
          Object.entries(activePlayer?.resourceCards).map(([key, value]) => (
            <ResourceCard
              onClick={handleResourceClick}
              key={key}
              id={key}
              type={key}
              amount={value}
              isDisabled={disabledResource === key}
            />
          ))}
      </div>
      <div className={classes.resourceCard}>
        <h4 className={classes.subtitle}>Development cards:</h4>
        <span className={classes.developmentItem}>
          victory points:{" "}
          {activePlayer &&
            activePlayer?.developmentCards.filter(
              (card) => card.type === "victoryPoint"
            ).length}
        </span>
        <div className={classes.container}>
          <span className={classes.developmentItem}>
            knights: {countKnightCards}
          </span>
          <button
            disabled={countKnightCards === 0}
            className={`${classes.button} ${classes[activePlayer.color]}`}
            onClick={() => {
              setShowKnightsDetails(!showKnightsDetails);
            }}
          >
            {!showKnightsDetails ? " Show details" : "Hide details"}
          </button>
        </div>
        {showKnightsDetails && (
          <div className={classes.developmentCardsContainer}>
            {activePlayer?.developmentCards
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
