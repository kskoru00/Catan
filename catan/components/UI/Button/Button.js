import classes from "./Button.module.css";

const Button = ({ value, onClick, isDisabled }) => {
  return (
    <div>
      <button
        disabled={isDisabled}
        onClick={onClick}
        className={classes.button}
      >
        {value}
      </button>
    </div>
  );
};

export default Button;
