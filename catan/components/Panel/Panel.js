import { useState } from "react";

import {
  usePlayersContext,
  useTileContext,
  useViewsContext,
} from "providers/hooks";

import { generateRandomNumber, hasPlayerEnoughResources } from "helpers";

import {
  Views,
  Layers,
  ResourcesForBuild,
  MAX_AMOUNT_KNIGHT_CARDS,
  MAX_AMOUNT_VICTORY_POINT_CARDS,
  NUMBER_OF_RESOURCES_TO_GIVE_TO_BANK,
} from "consts";

import Button from "components/UI/Button";
import SelectButton from "components/UI/SelectButton";

import classes from "./Panel.module.css";

const Panel = ({
  playerDeductingResources,
  playersWithSettlementOnTile,
  dice,
  onKnight,
  onDiceRoll,
  onSetLongestRoad,
  onNewRound,
  onRemoveRandomResource,
}) => {
  const { initializeTilesForNewRound, setInitialTiles } = useTileContext();
  const { view, setActiveLayer, setActiveView, setError, setUpdateMessage } =
    useViewsContext();
  const {
    filteredPlayers: players,
    initializePlayersForNewRound,
    updatePlayersOnFinishTurn,
    addDevelopmentCard,
    removeResourceCard,
  } = usePlayersContext();

  const isDiceRolled = dice.every((die) => die !== null);
  const [isKnightUsed, setIsKnightUsed] = useState(false);

  const activePlayer = players.find((player) => player.isActive);

  const handleBuildSettlementOrCity = () => {
    setError("");
    setActiveLayer(Layers.settlementsLayer);
    setActiveView(Views.buildElementView);
  };

  const handleBuildRoad = () => {
    setError("");
    setActiveLayer(Layers.roadsLayer);
    setActiveView(Views.buildElementView);
  };

  const handleBuyDevelopmentCard = () => {
    if (!hasPlayerEnoughResources("developmentCard", activePlayer)) {
      setError("You don't have enough resources to buy development card.");

      return;
    }

    const dealtKnightCardsSum = players.reduce(
      (sum, player) =>
        sum +
        player.developmentCards.filter((card) => card.type === "knights")
          .length,
      0
    );
    const dealtVictoryPointCardsSum = players.reduce(
      (sum, player) =>
        sum +
        player.developmentCards.filter((card) => card.type === "victoryPoint")
          .length,
      0
    );

    let cardType = "";

    if (
      dealtKnightCardsSum >= MAX_AMOUNT_KNIGHT_CARDS &&
      dealtVictoryPointCardsSum >= MAX_AMOUNT_VICTORY_POINT_CARDS
    ) {
      setError("There are no more available development cards");
    } else if (dealtKnightCardsSum >= MAX_AMOUNT_KNIGHT_CARDS) {
      cardType = "victoryPoint";
    } else if (dealtVictoryPointCardsSum >= MAX_AMOUNT_VICTORY_POINT_CARDS) {
      cardType = "knights";
    } else {
      const random = generateRandomNumber(0, 1);
      cardType = random === 0 ? "knights" : "victoryPoint";
    }

    addDevelopmentCard(cardType, activePlayer.name);
    setUpdateMessage(`${activePlayer.name} bought ${cardType} card.`);

    Object.entries(ResourcesForBuild.developmentCard).forEach(([key, value]) =>
      removeResourceCard(key, activePlayer.name, value)
    );

    setActiveView(Views.buildView);
  };

  const handleFinishTurn = () => {
    setError("");
    setIsKnightUsed(false);
    updatePlayersOnFinishTurn();
    setActiveView(Views.resourceProductionView);
  };

  const handleStartTradePhase = () => {
    setError("");
    setActiveView("tradeView");
  };

  const handleStartBuildPhase = () => {
    setError("");
    setActiveLayer(Layers.none);
    setActiveView(Views.buildView);
    onSetLongestRoad();
  };

  const handleKnight = () => {
    onKnight();
    setIsKnightUsed(true);
  };

  const handleNewRound = () => {
    initializePlayersForNewRound();
    initializeTilesForNewRound();
    setActiveView(Views.startGameView);
    onNewRound();
  };

  const handleStartGame = () => {
    setInitialTiles();
    setActiveView(Views.setupGameView);
    setActiveLayer(Layers.settlementsLayer);
  };

  const getPanelActionButtons = () => {
    if (view.activeView === Views.startGameView) {
      return <Button onClick={handleStartGame}>Start game</Button>;
    } else if (view.activeView === Views.finishedGameView) {
      return <Button onClick={handleNewRound}>Play new round</Button>;
    } else if (
      (view.activeView === Views.resourceProductionView && !isDiceRolled) ||
      view.activeView === Views.tradeView ||
      view.activeView === Views.buildView
    ) {
      return (
        <div className={classes.panelActionsContainer}>
          {!isKnightUsed &&
            activePlayer.developmentCards.some(
              (card) => card.type === "knights" && card.isActive && !card.isUsed
            ) && <Button onClick={handleKnight}>Use knight</Button>}

          {view.activeView === "tradeView" && (
            <Button onClick={handleStartBuildPhase}>Go to build phase</Button>
          )}
          {view.activeView === "buildView" && (
            <>
              <Button onClick={handleStartTradePhase}>Go to trade phase</Button>
              <Button onClick={handleFinishTurn}>Finish your turn</Button>
            </>
          )}
        </div>
      );
    }
  };

  const getPanelView = () => {
    switch (view.activeView) {
      case Views.setupGameView:
        return (
          <>
            <h3 className={classes.panelTitle}>Setup: </h3>
            <p>
              Please {activePlayer.name} choose{" "}
              {view.activeLayer === Layers.settlementsLayer
                ? "settlement"
                : "road"}
            </p>
          </>
        );
      case Views.resourceProductionView:
        return (
          <>
            <h3 className={classes.panelTitle}>Resource production :</h3>
            <div className={classes.diceWrapper}>
              <Button
                isDisabled={isDiceRolled}
                onClick={() => {
                  onDiceRoll();
                }}
              >
                Roll dice
              </Button>
              <div className={`${classes.die} ${classes.red}`}>
                <span>{dice[0]}</span>
              </div>
              <div className={`${classes.die} ${classes.yellow}`}>
                <span>{dice[1]}</span>
              </div>
            </div>
          </>
        );
      case Views.robberView:
        return (
          <p>
            {players[playerDeductingResources.position].name} you can keep{" "}
            {playerDeductingResources.total} resource cards. Please click on
            resources you want to give to the bank.
          </p>
        );

      case Views.robberViewPhase2:
        return (
          <p>
            Time to move robber. Please {activePlayer.name} click on the tile on
            which you want to place robber.
          </p>
        );
      case Views.robberViewPhase3: {
        return (
          <>
            <p className={classes.panelParagraph}>
              Select from which player you want to take resource card
            </p>
            <div className={classes.panelButtonsContainer}>
              {playersWithSettlementOnTile.map((player, i) => (
                <SelectButton
                  onClick={() => {
                    onRemoveRandomResource(player);
                  }}
                  key={i}
                >
                  {player.name}
                </SelectButton>
              ))}
            </div>
          </>
        );
      }
      case Views.tradeView:
        return (
          <>
            <h3 className={classes.panelTitle}>Trade with bank :</h3>
            <p className={classes.panelParagraph}>
              {Object.values(activePlayer.resourceCards).find(
                (card) => card >= NUMBER_OF_RESOURCES_TO_GIVE_TO_BANK
              )
                ? `${activePlayer.name} click on resource which you want to trade`
                : "You don't have enough resources for trading."}
            </p>
          </>
        );
      case Views.tradeViewPhase2:
        return (
          <>
            <h3 className={classes.panelTitle}>Trade with bank :</h3>
            <p>Click on resource which you want to add</p>
          </>
        );
      case Views.buildView:
        return (
          <>
            <h3 className={classes.panelTitle}>Build :</h3>
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
        );
      case Views.buildElementView:
        return (
          <>
            <p className={classes.panelParagraph}>
              Click on{" "}
              {view.activeLayer === Layers.settlementsLayer
                ? "settlement"
                : "road"}{" "}
              you want to choose.
            </p>
            <Button onClick={handleStartBuildPhase}>
              Go back to build menu
            </Button>
          </>
        );
      case Views.finishedGameView:
        return (
          <p className={classes.panelParagraph}>
            Winner is {activePlayer.name}
          </p>
        );
    }
  };

  return (
    <div className={classes.panelContainer}>
      <div className={classes.panelContainer}>{getPanelView()}</div>
      {getPanelActionButtons()}
    </div>
  );
};

export default Panel;
