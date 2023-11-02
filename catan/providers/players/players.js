import { createContext, useReducer } from "react";

import { Players, terrainTypes } from "consts";

import { generateRandomColor, generateRandomNumber } from "helpers";
import Settlement from "components/UI/Settlement";

const terrainResources = terrainTypes.map((terrain) => terrain.produce);
const resourceCards = {};
terrainResources.forEach((resource) => {
  if (resource !== "nothing") {
    resourceCards[resource] = 0;
  }
});

/*const developmentCards = {
  knight: [],
  victoryPoints: [],
};*/

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
    developmentCards: [],
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
    developmentCards: [],
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
    developmentCards: [],
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
    developmentCards: [],
  },
};

const SET_PLAYER = "SET_PLAYER";
const SET_PLAYER_AS_ACTIVE = "SET_PLAYER_AS_ACTIVE";
const SET_PLAYER_AS_UNACTIVE = "SET_PLAYER_AS_UNACTIVE";
const ADD_PLAYER_SETTLEMENT = "ADD_PLAYER_SETTLEMENT";
const REMOVE_PLAYER_SETTLEMENT = "REMOVE_PLAYER_SETTLEMENT";
const ADD_PLAYER_CITY = "ADD_PLAYER_CITY";
const UPDATE_PLAYERS_ROADS = "UPDATE_PLAYERS_ROADS";
const ADD_RESOURCE_CARD = "ADD_RESOURCE_CARD";
const REMOVE_RESOURCE_CARD = "REMOVE_RESOURCE_CARD";
const ADD_DEVELOPMENT_CARD = "ADD_DEVELOPMENT_CARD";
const SET_DEVELOPMENT_CARD_AS_ACTIVE = "SET_DEVELOPMENT_CARD_AS_ACTIVE";

export const PlayersContext = createContext({
  state: { ...initialState },
  initializePlayers: () => {},
  changeActivePlayer: () => {},
  setPlayerAsActive: () => {},
  setPlayerScore: () => {},
  setPlayersToInitialState: () => {},
  addPlayerSettlement: () => {},
  updateSettlementToCity: () => {},
  updatePlayersRoads: () => {},
  addResourceCard: () => {},
  removeResourceCard: () => {},
  addDevelopmentCard: () => {},
  updatePlayersOnFinishedTurn: () => {},
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
    case ADD_PLAYER_SETTLEMENT:
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

    case REMOVE_PLAYER_SETTLEMENT: {
      return {
        ...state,
        [action.payload.player]: {
          ...state[action.payload.player],
          cities: [
            ...state[action.payload.player].cities.filter(
              (city) => city !== action.payload.settlementId
            ),
          ],
        },
      };
    }
    case ADD_PLAYER_CITY:
      return {
        ...state,
        [action.payload.player]: {
          ...state[action.payload.player],
          cities: [
            ...state[action.payload.player].cities,
            action.payload.cityId,
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
              ] - action.payload.amount,
          },
        },
      };
    case ADD_DEVELOPMENT_CARD:
      return {
        ...state,
        [action.payload.player]: {
          ...state[action.payload.player],
          developmentCards: [
            ...state[action.payload.player].developmentCards,
            {
              type: action.payload.developmentCardType,
              isActive: false,
              isUsed: false,
            },
          ],
        },
      };
    case SET_DEVELOPMENT_CARD_AS_ACTIVE:
      return {
        ...state,
        [action.payload.player]: {
          ...state[action.payload.player],
          developmentCards: [
            ...state[action.payload.player].developmentCards.map((card) => ({
              ...card,
              isActive: true,
            })),
          ],
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

  const addPlayerSettlement = (settlementId) => {
    const activePlayer = Object.keys(players).find(
      (key) => players[key].isActive
    );
    dispatch({
      type: ADD_PLAYER_SETTLEMENT,
      payload: {
        player: activePlayer,
        settlementId,
      },
    });
  };

  const updateSettlementToCity = (settlementId) => {
    removePlayerSettlement(settlementId);
    addPlayerCity(settlementId);
  };
  const removePlayerSettlement = (settlementId) => {
    const activePlayer = Object.keys(players).find(
      (key) => players[key].isActive
    );
    dispatch({
      type: REMOVE_PLAYER_SETTLEMENT,
      payload: {
        player: activePlayer,
        settlementId,
      },
    });
  };

  const addPlayerCity = (cityId) => {
    const activePlayer = Object.keys(players).find(
      (key) => players[key].isActive
    );
    dispatch({
      type: ADD_PLAYER_CITY,
      payload: {
        player: activePlayer,
        cityId,
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
  const removeResourceCard = (resourceType, playerName, amount = 1) => {
    const player = Object.keys(players).find(
      (key) => players[key].name === playerName
    );
    dispatch({
      type: REMOVE_RESOURCE_CARD,
      payload: {
        player,
        resourceType,
        amount,
      },
    });
  };

  const addDevelopmentCard = (developmentCardType, playerName) => {
    const player = Object.keys(players).find(
      (key) => players[key].name === playerName
    );

    dispatch({
      type: ADD_DEVELOPMENT_CARD,
      payload: {
        player,
        developmentCardType,
      },
    });
  };
  const updatePlayersOnFinishedTurn = () => {
    const activePlayer = Object.keys(players).find(
      (key) => players[key].isActive
    );
    dispatch({
      type: SET_DEVELOPMENT_CARD_AS_ACTIVE,
      payload: {
        player: activePlayer,
      },
    });
    changeActivePlayer();
  };

  const value = {
    players,
    filteredPlayers,
    initializePlayers,
    addPlayerSettlement,
    addResourceCard,
    removeResourceCard,
    addPlayerCity,
    updatePlayersRoads,
    changeActivePlayer,
    updateSettlementToCity,
    addDevelopmentCard,
    updatePlayersOnFinishedTurn,
  };

  return (
    <PlayersContext.Provider value={value}>{children}</PlayersContext.Provider>
  );
};

export default PlayersProvider;
