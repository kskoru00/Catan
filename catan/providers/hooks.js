import { useContext } from "react";

import { PlayersContext } from "./players";
import { ViewContext } from "./views";

export const usePlayersContext = () => {
  return useContext(PlayersContext);
};

export const useViewsContext = () => {
  return useContext(ViewContext);
};
