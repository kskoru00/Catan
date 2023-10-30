import { usePlayersContext } from "providers/hooks";

import Resource from "components/UI/Resource/Resource";

import classes from "./ResourceCard.module.css";

const ResourceCard = ({ player }) => {
  const { filteredPlayers } = usePlayersContext();

  const activePlayer = player
    ? filteredPlayers.find((el) => el.name === player.name)
    : null;

  return (
    <div className={`${classes.wrapper} ${classes[activePlayer.color]}`}>
      <h3 className={classes.title}>{activePlayer?.name} resource card</h3>
      <div className={classes.resourceCard}>
        {activePlayer &&
          Object.entries(activePlayer?.resourceCards).map(([key, value]) => (
            <Resource
              key={key}
              id={key}
              type={key}
              amount={value}
              playerName={player.name}
            />
          ))}
      </div>
    </div>
  );
};

export default ResourceCard;
