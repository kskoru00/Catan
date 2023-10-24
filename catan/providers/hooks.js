import { useContext } from "react";

import { PlayersContext } from "./players";

export const usePlayersContext = () => {
  return useContext(PlayersContext);
};
