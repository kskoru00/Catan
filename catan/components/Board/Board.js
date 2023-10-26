import { useEffect } from "react";
import { useRouter } from "next/router";

import { usePlayersContext, useViewsContext } from "providers/hooks";

import CityLayer from "components/BoardLayers/SettlementsLayer";
import TileLayer from "components/BoardLayers/TilesLayer";
import RoadsLayer from "components/BoardLayers/RoadsLayer";
import PlayersBoard from "components/PlayersBoard";
import Button from "components/UI/Button";
import Error from "components/UI/Error";

import classes from "./Board.module.css";

const Board = () => {
  const router = useRouter();

  const { view, changeView } = useViewsContext();
  const { filteredPlayers, changeActivePlayer } = usePlayersContext();

  const activePlayer = filteredPlayers.find((player) => player.isActive);
  const isRoadLayerOnTop = activePlayer
    ? activePlayer.settlements.length > activePlayer.roads.length
    : null;

  useEffect(() => {
    if (filteredPlayers.length === 0) {
      router.push("/");
      return;
    }
  }, []);

  useEffect(() => {
    if (!activePlayer) {
      return;
    }

    if (
      filteredPlayers.every(
        (player) => player.settlements.length === 2 && player.roads.length === 2
      )
    ) {
      changeView("resourceProductionView");

      return;
    } else if (
      filteredPlayers.every(
        (player) => player.settlements.length === 1 && player.roads.length === 1
      )
    ) {
      return;
    } else if (
      activePlayer.settlements.length === 2 &&
      activePlayer.roads.length === 2
    ) {
      changeActivePlayer();
    } else if (
      !filteredPlayers.find(
        (player) => player.settlements.length === 2 && player.roads.length === 2
      ) &&
      activePlayer.settlements.length === 1 &&
      activePlayer.roads.length === 1
    ) {
      changeActivePlayer();
    }
  }, [activePlayer]);

  const getPanelView = () => {
    if (view.error !== "") {
      return (
        <Error>
          <p>
            **
            {view.error}
          </p>
        </Error>
      );
    } else if (view.activeView === "startGameView") {
      return (
        <Button
          onClick={() => {
            changeView("setupGameView");
          }}
          value="Start game"
        />
      );
    } else if (view.activeView === "setupGameView") {
      return (
        <div>
          <h3>Setup: </h3>
          {!isRoadLayerOnTop && (
            <p>Please {activePlayer.name} choose settlement</p>
          )}
          {isRoadLayerOnTop && <p>Please {activePlayer.name} choose road</p>}
        </div>
      );
    }
  };
  return (
    <div>
      <PlayersBoard />
      <div className={classes.layersContainer}>
        <div className={classes.container}>
          <div className={classes.layer}>
            <TileLayer />
          </div>
          <div
            className={`${classes.layer} ${
              isRoadLayerOnTop ? classes.top : ""
            }`}
          >
            <RoadsLayer isLayerActive={isRoadLayerOnTop} />
          </div>
          <div
            className={`${classes.layer} ${
              !isRoadLayerOnTop ? classes.top : ""
            }`}
          >
            <CityLayer isLayerActive={!isRoadLayerOnTop} />
          </div>
        </div>
      </div>

      <div className={classes.panel}>{getPanelView()}</div>
    </div>
  );
};

export default Board;
