import { createContext, useReducer } from "react";

import { Players, TerrainTypes } from "consts";

import { generateRandomColor, generateRandomNumber } from "helpers";

const terrainResources = TerrainTypes.filter((terrain) => terrain.produce).map(
  (terrain) => terrain.produce
);

const resourceCards = terrainResources.reduce(
  (obj, key) => ((obj[key] = 0), obj),
  {}
);

const initialObject = {
  name: "",
  color: null,
  isActive: false,
  settlements: [],
  cities: [],
  roads: [],
  resourceCards,
  developmentCards: [],
};

const initialState = Object.keys(Players).reduce(
  (obj, key) => ((obj[key] = initialObject), obj),
  {}
);

const SET_PLAYER = "SET_PLAYER";
const SET_PLAYER_AS_ACTIVE = "SET_PLAYER_AS_ACTIVE";
const SET_PLAYER_AS_INACTIVE = "SET_PLAYER_AS_INACTIVE";
const ADD_PLAYER_SETTLEMENT = "ADD_PLAYER_SETTLEMENT";
const REMOVE_PLAYER_SETTLEMENT = "REMOVE_PLAYER_SETTLEMENT";
const ADD_PLAYER_CITY = "ADD_PLAYER_CITY";
const UPDATE_PLAYERS_ROADS = "UPDATE_PLAYERS_ROADS";
const ADD_RESOURCE_CARD = "ADD_RESOURCE_CARD";
const REMOVE_RESOURCE_CARD = "REMOVE_RESOURCE_CARD";
const ADD_DEVELOPMENT_CARD = "ADD_DEVELOPMENT_CARD";
const SET_DEVELOPMENT_CARD_AS_ACTIVE = "SET_DEVELOPMENT_CARD_AS_ACTIVE";
const SET_DEVELOPMENT_CARD_AS_USED = "SET_DEVELOPMENT_CARD_AS_USED";
const RESET_PLAYER = "RESET_PLAYER";

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
  updatePlayersOnFinishTurn: () => {},
  setDevelopmentCardAsUsed: () => {},
  initializePlayersForNewRound: () => {},
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
    case SET_PLAYER_AS_INACTIVE: {
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
          settlements: [
            ...state[action.payload.player].settlements.filter(
              (settlement) => settlement !== action.payload.settlementId
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
              ] + action.payload.amount,
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
    case SET_DEVELOPMENT_CARD_AS_USED:
      return {
        ...state,
        [action.payload.player]: {
          ...state[action.payload.player],
          developmentCards: [
            ...state[action.payload.player].developmentCards.map((card, i) =>
              i === action.payload.position
                ? {
                    ...card,
                    isUsed: true,
                  }
                : { ...card }
            ),
          ],
        },
      };
    case RESET_PLAYER:
      return {
        ...state,
        [action.payload.player]: {
          ...state[action.payload.player],
          isActive: false,
          settlements: [],
          cities: [],
          roads: [],
          resourceCards,
          developmentCards: [],
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
    const activePlayer = Object.keys(playersArr[randomPlayerPosition])[0];

    dispatch({
      type: SET_PLAYER_AS_ACTIVE,
      payload: {
        player: activePlayer,
      },
    });
  };

  const filteredPlayers = Object.values(players).filter(
    (player) => player.name.length > 0
  );

  const activePlayer = Object.keys(players).find(
    (key) => players[key].isActive
  );

  const addPlayerSettlement = (settlementId) => {
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
    dispatch({
      type: REMOVE_PLAYER_SETTLEMENT,
      payload: {
        player: activePlayer,
        settlementId,
      },
    });
  };

  const addPlayerCity = (cityId) => {
    dispatch({
      type: ADD_PLAYER_CITY,
      payload: {
        player: activePlayer,
        cityId,
      },
    });
  };

  const changeActivePlayer = (direction = 1) => {
    const activePlayerIndex = Object.values(filteredPlayers).findIndex(
      (player) => player.isActive
    );

    const nextActivePlayerIndex =
      direction === -1 && activePlayerIndex === 0
        ? filteredPlayers.length - 1
        : direction === 1 && activePlayerIndex === filteredPlayers.length - 1
        ? 0
        : activePlayerIndex + direction;

    const newActivePlayerName = filteredPlayers[nextActivePlayerIndex].name;

    const newActivePlayer = Object.keys(players).find(
      (key) => players[key].name === newActivePlayerName
    );

    dispatch({
      type: SET_PLAYER_AS_INACTIVE,
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
    dispatch({
      type: UPDATE_PLAYERS_ROADS,
      payload: {
        player: activePlayer,
        roadId,
      },
    });
  };

  const addResourceCard = (resourceType, playerName, amount = 1) => {
    const player = Object.keys(players).find(
      (key) => players[key].name === playerName
    );

    dispatch({
      type: ADD_RESOURCE_CARD,
      payload: {
        player,
        resourceType,
        amount,
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
  const updatePlayersOnFinishTurn = () => {
    dispatch({
      type: SET_DEVELOPMENT_CARD_AS_ACTIVE,
      payload: {
        player: activePlayer,
      },
    });

    changeActivePlayer();
  };

  const setDevelopmentCardAsUsed = () => {
    const position = filteredPlayers
      .find((player) => player.isActive)
      .developmentCards.findIndex(
        (card) => card.type === "knights" && card.isActive && !card.isUsed
      );

    dispatch({
      type: SET_DEVELOPMENT_CARD_AS_USED,
      payload: {
        player: activePlayer,
        position,
      },
    });
  };

  const initializePlayersForNewRound = () => {
    filteredPlayers.forEach((player) => {
      const key = Object.keys(players).find(
        (key) => players[key].name === player.name
      );

      dispatch({
        type: RESET_PLAYER,
        payload: {
          player: key,
        },
      });
    });

    const randomPlayerPosition = generateRandomNumber(
      0,
      filteredPlayers.length - 1
    );
    const activePlayer = Object.keys(players)[randomPlayerPosition];

    dispatch({
      type: SET_PLAYER_AS_ACTIVE,
      payload: {
        player: activePlayer,
      },
    });
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
    updatePlayersOnFinishTurn,
    setDevelopmentCardAsUsed,
    initializePlayersForNewRound,
  };

  return (
    <PlayersContext.Provider value={value}>{children}</PlayersContext.Provider>
  );
};

export default PlayersProvider;
