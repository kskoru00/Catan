import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import CityLayer from "components/BoardLayers/CityLayer";
import TileLayer from "components/BoardLayers/TileLayer";
import RoadsLayer from "components/BoardLayers/RoadsLayer";
import PlayersBoard from "components/PlayersBoard";
import Button from "components/UI/Button";

import { usePlayersContext } from "providers/hooks";

import classes from "./Board.module.css";

const Board = () => {
  const router = useRouter();

  const [isGameActive, setIsGameActive] = useState(false);

  const { filterPlayersWhoPlay } = usePlayersContext();

  useEffect(() => {
    if (filterPlayersWhoPlay.length === 0) {
      router.push("/");
      return;
    }
  }, []);
  return (
    <div className={classes.board}>
      <PlayersBoard />
      <div className={classes.wrapper}>
        <div className={classes.container}>
          <div className={classes.layer}>
            <TileLayer isGameActive={isGameActive} />
          </div>
          <div className={classes.layer}>
            <RoadsLayer />
          </div>
          <div className={classes.layer}>
            <CityLayer />
          </div>
        </div>
      </div>

      <div className={classes.panel}>
        <Button
          onClick={() => {
            setIsGameActive(true);
          }}
          value="Start game"
        />
      </div>
    </div>
  );
};

export default Board;
