import { useContext } from "react";

import { PlayersContext } from "./players";
import { ViewsContext } from "./views";
import { TilesContext } from "./tiles";

export const usePlayersContext = () => {
  return useContext(PlayersContext);
};

export const useViewsContext = () => {
  return useContext(ViewsContext);
};

export const useTileContext = () => {
  return useContext(TilesContext);
};
