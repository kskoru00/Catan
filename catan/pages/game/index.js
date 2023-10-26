import Board from "components/Board";
import ViewsProvider from "providers/views";

const Game = () => {
  return (
    <ViewsProvider>
      <Board />
    </ViewsProvider>
  );
};

export default Game;
