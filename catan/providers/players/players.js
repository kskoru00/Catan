import { createContext, useReducer } from "react";

import { Players } from "consts";

import { generateRandomColor, generateRandomNumber } from "components/helpers";

const initialState = {
  [Players.playerOne]: {
    name: "",
    color: null,
    score: 0,
    isActive: false,
  },
  [Players.playerTwo]: {
    name: "",
    color: null,
    score: 0,
    isActive: false,
  },
  [Players.playerThree]: {
    name: "",
    color: null,
    score: 0,
    isActive: false,
  },
  [Players.playerFour]: {
    name: "",
    color: null,
    score: 0,
    isActive: false,
  },
};

const SET_PLAYER = "SET_PLAYER";
const SET_PLAYER_AS_ACTIVE = "SET_PLAYER_AS_ACTIVE";

export const PlayersContext = createContext({
  state: { ...initialState },
  initializePlayers: () => {},
  switchActivePlayer: () => {},
  setPlayerAsActive: () => {},
  setPlayerScore: () => {},
  setPlayersToInitialState: () => {},
});

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_PLAYER:
      return {
        ...state,
        [action.payload.player]: {
          ...state[action.payload.player],
          name: action.payload.name,
          color: generateRandomColor(
            Object.values(state)
              .map((players) => players.color)
              .filter((colors) => colors !== null),
            action.payload.playersNumber
          ),
        },
      };
    case SET_PLAYER_AS_ACTIVE:
      return {
        ...state,
        [action.payload.player]: {
          ...state[action.payload.player],
          isActive: true,
        },
      };
  }
};

const PlayersProvider = ({ children }) => {
  const [players, dispatch] = useReducer(reducer, initialState);

  const initializePlayers = (playersArr) => {
    playersArr.forEach((player) => {
      dispatch({
        type: "SET_PLAYER",
        payload: {
          player: Object.keys(player)[0],
          name: Object.values(player)[0],
          playersNumber: playersArr.length,
        },
      });
    });
    const randomPlayerPosition = generateRandomNumber(0, playersArr.length - 1);
    const activePlayer = playersArr[randomPlayerPosition];

    dispatch({
      type: "SET_PLAYER_AS_ACTIVE",
      payload: {
        player: Object.keys(activePlayer)[0],
      },
    });
  };

  const filterPlayersWhoPlay = Object.values(players).filter(
    (player) => player.name.length > 0
  );

  const value = {
    players,
    filterPlayersWhoPlay,
    initializePlayers,
  };

  return (
    <PlayersContext.Provider value={value}>{children}</PlayersContext.Provider>
  );
};

export default PlayersProvider;
