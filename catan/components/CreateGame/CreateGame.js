import { useState } from "react";
import { useRouter } from "next/router";

import { MIN_NUMBER_OF_PLAYERS, Players } from "consts";

import Input from "components/UI/Input";
import Button from "components/UI/Button";
import Error from "components/UI/Error";

import classes from "./CreateGame.module.css";

const CreateGame = () => {
  const router = useRouter();

  const [playerNames, setPlayerNames] = useState({
    [Players.playerOne]: "",
    [Players.playerTwo]: "",
    [Players.playerThree]: "",
    [Players.playerFour]: "",
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

    console.log(modifiedPlayerNames);

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
      <Button value="Create new game" />
    </form>
  );
};

export default CreateGame;
