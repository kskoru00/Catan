import { createContext, useReducer } from "react";

import { Players, terrainTypes } from "consts";

import { generateRandomColor, generateRandomNumber } from "helpers";

const terrainResources = terrainTypes.map((terrain) => terrain.produce);
const resourceCards = {};
terrainResources.forEach((resource) => {
  if (resource !== "nothing") {
    resourceCards[resource] = 0;
  }
});

const initialState = {
  [Players.playerOne]: {
    name: "",
    color: null,
    score: 0,
    isActive: false,
    settlements: [],
    cities: [],
    roads: [],
    resourceCards,
  },
  [Players.playerTwo]: {
    name: "",
    color: null,
    score: 0,
    isActive: false,
    settlements: [],
    cities: [],
    roads: [],
    resourceCards,
  },
  [Players.playerThree]: {
    name: "",
    color: null,
    score: 0,
    isActive: false,
    settlements: [],
    cities: [],
    roads: [],
    resourceCards,
  },
  [Players.playerFour]: {
    name: "",
    color: null,
    score: 0,
    isActive: false,
    settlements: [],
    cities: [],
    roads: [],
    resourceCards,
  },
};

const SET_PLAYER = "SET_PLAYER";
const SET_PLAYER_AS_ACTIVE = "SET_PLAYER_AS_ACTIVE";
const SET_PLAYER_AS_UNACTIVE = "SET_PLAYER_AS_UNACTIVE";
const UPDATE_PLAYERS_SETTLEMENTS = "UPDATE_PLAYERS_SETTLEMENTS";
const UPDATE_PLAYERS_ROADS = "UPDATE_PLAYERS_ROADS";
const ADD_RESOURCE_CARD = "ADD_RESOURCE_CARD";
const REMOVE_RESOURCE_CARD = "REMOVE_RESOURCE_CARD";

export const PlayersContext = createContext({
  state: { ...initialState },
  initializePlayers: () => {},
  changeActivePlayer: () => {},
  setPlayerAsActive: () => {},
  setPlayerScore: () => {},
  setPlayersToInitialState: () => {},
  updatePlayersSettlements: () => {},
  updatePlayersRoads: () => {},
  addResourceCard: () => {},
  removeResourceCard: () => {},
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
    case SET_PLAYER_AS_UNACTIVE: {
      return {
        ...state,
        [action.payload.player]: {
          ...state[action.payload.player],
          isActive: false,
        },
      };
    }
    case UPDATE_PLAYERS_SETTLEMENTS:
      return {
        ...state,
        [action.payload.player]: {
          ...state[action.payload.player],
          settlements: [
            ...state[action.payload.player].settlements,
            action.payload.settlementId,
          ],
        },
      };
    case UPDATE_PLAYERS_ROADS:
      return {
        ...state,
        [action.payload.player]: {
          ...state[action.payload.player],
          roads: [...state[action.payload.player].roads, action.payload.roadId],
        },
      };
    case ADD_RESOURCE_CARD:
      return {
        ...state,
        [action.payload.player]: {
          ...state[action.payload.player],
          resourceCards: {
            ...state[action.payload.player].resourceCards,
            [action.payload.resourceType]:
              state[action.payload.player].resourceCards[
                action.payload.resourceType
              ] + 1,
          },
        },
      };
    case REMOVE_RESOURCE_CARD:
      return {
        ...state,
        [action.payload.player]: {
          ...state[action.payload.player],
          resourceCards: {
            ...state[action.payload.player].resourceCards,
            [action.payload.resourceType]:
              state[action.payload.player].resourceCards[
                action.payload.resourceType
              ] - action.payload.value,
          },
        },
      };
  }
};

const PlayersProvider = ({ children }) => {
  const [players, dispatch] = useReducer(reducer, initialState);

  const initializePlayers = (playersArr) => {
    playersArr.forEach((player) => {
      dispatch({
        type: SET_PLAYER,
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
      type: SET_PLAYER_AS_ACTIVE,
      payload: {
        player: Object.keys(activePlayer)[0],
      },
    });
  };

  const filteredPlayers = Object.values(players).filter(
    (player) => player.name.length > 0
  );

  const updatePlayersSettlements = (settlementId) => {
    const activePlayer = Object.keys(players).find(
      (key) => players[key].isActive
    );
    dispatch({
      type: UPDATE_PLAYERS_SETTLEMENTS,
      payload: {
        player: activePlayer,
        settlementId,
      },
    });
  };

  const changeActivePlayer = (position) => {
    const activePlayer = Object.keys(players).find(
      (key) => players[key].isActive
    );
    const activePlayerIndex = Object.values(filteredPlayers).findIndex(
      (player) => player.isActive
    );
    const value = position ? position : 1;
    const nextActivePlayerIndex =
      position && activePlayerIndex === 0
        ? filteredPlayers.length - 1
        : !position && activePlayerIndex === filteredPlayers.length - 1
        ? 0
        : activePlayerIndex + value;

    const newActivePlayerName = filteredPlayers[nextActivePlayerIndex].name;

    const newActivePlayer = Object.keys(players).find(
      (key) => players[key].name === newActivePlayerName
    );

    dispatch({
      type: SET_PLAYER_AS_UNACTIVE,
      payload: {
        player: activePlayer,
      },
    });
    dispatch({
      type: SET_PLAYER_AS_ACTIVE,
      payload: {
        player: newActivePlayer,
      },
    });
  };

  const updatePlayersRoads = (roadId) => {
    const activePlayer = Object.keys(players).find(
      (key) => players[key].isActive
    );
    dispatch({
      type: UPDATE_PLAYERS_ROADS,
      payload: {
        player: activePlayer,
        roadId,
      },
    });
  };

  const addResourceCard = (resourceType, playerName) => {
    const player = Object.keys(players).find(
      (key) => players[key].name === playerName
    );

    dispatch({
      type: ADD_RESOURCE_CARD,
      payload: {
        player,
        resourceType,
      },
    });
  };
  const removeResourceCard = (resourceType, playerName, amount) => {
    const player = Object.keys(players).find(
      (key) => players[key].name === playerName
    );
    const value = amount ? amount : 1;
    dispatch({
      type: REMOVE_RESOURCE_CARD,
      payload: {
        player,
        resourceType,
        value,
      },
    });
  };

  const value = {
    players,
    filteredPlayers,
    initializePlayers,
    updatePlayersSettlements,
    updatePlayersRoads,
    changeActivePlayer,
    addResourceCard,
    removeResourceCard,
  };

  return (
    <PlayersContext.Provider value={value}>{children}</PlayersContext.Provider>
  );
};

export default PlayersProvider;
