import TilesProvider from "providers/tiles";
import ViewsProvider from "providers/views";

import Board from "components/Board";

const Game = () => {
  return (
    <ViewsProvider>
      <TilesProvider>
        <Board />
      </TilesProvider>
    </ViewsProvider>
  );
};

export default Game;
