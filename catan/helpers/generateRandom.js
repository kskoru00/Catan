import {
  TerrainTypes,
  PlayerColors,
  TokenNumbers,
  ROBBER_TOKEN_NUMBER,
} from "consts";

export const generateRandomTerrainType = (boardTiles) => {
  const availableTerrainTypes = TerrainTypes.filter(
    (type) =>
      boardTiles.filter((tile) => tile.terrainId === type.id).length <
      type.amount
  );

  const randomNumber = generateRandomNumber(
    0,
    availableTerrainTypes.length - 1
  );

  return availableTerrainTypes[randomNumber].id;
};

export const generateRandomTokenNumber = (boardTiles, terrainType) => {
  const dessertId = Object.values(TerrainTypes).find(
    (type) => type.name === "dessert"
  ).id;

  if (terrainType === dessertId) {
    return ROBBER_TOKEN_NUMBER;
  }

  const availableTokenNumbers = TokenNumbers.filter(
    (number) =>
      boardTiles.filter((tile) => tile.tokenNumber === number.value).length <
      number.amount
  );

  const randomNumber = generateRandomNumber(
    0,
    availableTokenNumbers.length - 1
  );
  return availableTokenNumbers[randomNumber].value;
};

export const generateRandomColor = (takenColors, playersNumber) => {
  const colors = PlayerColors.slice(0, playersNumber).map(
    (playerColor) => playerColor.color
  );

  const availableColors = colors.filter((color) =>
    takenColors.every((takenColor) => takenColor !== color)
  );

  const randomNumber = generateRandomNumber(0, availableColors.length - 1);

  return availableColors[randomNumber];
};

export const generateRandomNumber = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};
