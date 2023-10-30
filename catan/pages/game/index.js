import Board from "components/Board";
import TilesProvider from "providers/tiles";
import ViewsProvider from "providers/views";

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
