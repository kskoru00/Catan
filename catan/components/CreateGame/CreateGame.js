import { useState } from "react";
import { useRouter } from "next/router";

import { MIN_NUMBER_OF_PLAYERS, Players } from "consts";

import { usePlayersContext } from "providers/hooks";

import Input from "components/UI/Input";
import Button from "components/UI/Button";
import Error from "components/UI/Error";

import classes from "./CreateGame.module.css";

const CreateGame = () => {
  const router = useRouter();

  const { players, initializePlayers } = usePlayersContext();

  const [playerNames, setPlayerNames] = useState({
    [Players.playerOne]: players.playerOne.name,
    [Players.playerTwo]: players.playerTwo.name,
    [Players.playerThree]: players.playerThree.name,
    [Players.playerFour]: players.playerFour.name,
  });

  const [errorMessage, setErrorMessage] = useState(null);

  const handleNameChange = (player) => (value) => {
    if (errorMessage) {
      setErrorMessage(null);
    }

    setPlayerNames((prevPlayerNames) => ({
      ...prevPlayerNames,
      [player]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const playerNamesArray = Object.values(playerNames);
    const playersIdentifiers = Object.keys(playerNames);
    const filteredPlayerNames = playerNamesArray.filter(
      (playerName) => playerName.length > 0
    );

    const areAllNamesUniqe = filteredPlayerNames.every(
      (playerName, index) =>
        filteredPlayerNames.findLastIndex(
          (name) => name.toUpperCase() === playerName.toUpperCase()
        ) === index
    );

    if (filteredPlayerNames.length < MIN_NUMBER_OF_PLAYERS) {
      setErrorMessage(
        `Number of players is below minimum(${MIN_NUMBER_OF_PLAYERS})! Please add more players.`
      );

      return;
    } else if (!areAllNamesUniqe) {
      setErrorMessage("All players must have uniqe names!");

      return;
    }

    const modifiedPlayerNames = filteredPlayerNames.map(
      (playerName) =>
        playerName.charAt(0).toUpperCase() +
        playerName.slice(1).toLocaleLowerCase()
    );

    const playersToInitialize = modifiedPlayerNames.map((player, i) => ({
      [playersIdentifiers[i]]: player,
    }));

    initializePlayers(playersToInitialize);
    router.push("/game");
  };

  return (
    <div className={classes.container}>
      {errorMessage && (
        <Error>
          <p>
            **
            {errorMessage}
          </p>
        </Error>
      )}
      <form onSubmit={handleSubmit}>
        {Object.entries(playerNames).map(([key, value], i) => (
          <Input
            key={key}
            label={`Player ${i + 1}:`}
            value={value}
            onChange={handleNameChange(key)}
          />
        ))}
        <Button>Create new game</Button>
      </form>
    </div>
  );
};

export default CreateGame;
