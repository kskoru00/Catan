import { useContext } from "react";

import { PlayersContext } from "./players";
import { ViewContext } from "./views";
import { TilesContext } from "./tiles";

export const usePlayersContext = () => {
  return useContext(PlayersContext);
};

export const useViewsContext = () => {
  return useContext(ViewContext);
};

export const useTileContext = () => {
  return useContext(TilesContext);
};
