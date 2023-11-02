import classes from "./ResourceCard.module.css";

const Resource = ({ type, amount, onClick, isDisabled }) => {
  return (
    <button
      disabled={isDisabled}
      onClick={() => {
        onClick(type);
      }}
      className={classes.resourceItem}
    >
      <span>{type}: </span>
      <span>{amount}</span>
    </button>
  );
};

export default Resource;
