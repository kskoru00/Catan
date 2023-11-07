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

  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleNameChange = (player) => (value) => {
    if (isError) {
      setIsError(false);
      setErrorMessage("");
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
      setIsError(true);
      setErrorMessage(
        `Number of players is below minimum(${MIN_NUMBER_OF_PLAYERS})! Please add more players.`
      );

      return;
    } else if (!areAllNamesUniqe) {
      setIsError(true);
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
    <form onSubmit={handleSubmit} className={classes.form}>
      {isError && (
        <Error>
          <p>
            **
            {errorMessage}
          </p>
        </Error>
      )}
      <div className={classes.container}>
        <Input
          label="Player one"
          value={playerNames[Players.playerOne]}
          onChange={handleNameChange(Players.playerOne)}
        />
        <Input
          label="Player two"
          value={playerNames[Players.playerTwo]}
          onChange={handleNameChange(Players.playerTwo)}
        />
        <Input
          label="Player three"
          value={playerNames[Players.playerThree]}
          onChange={handleNameChange(Players.playerThree)}
        />
        <Input
          label="Player four"
          value={playerNames[Players.playerFour]}
          onChange={handleNameChange(Players.playerFour)}
        />
      </div>
      <Button>Create new game</Button>
    </form>
  );
};

export default CreateGame;
