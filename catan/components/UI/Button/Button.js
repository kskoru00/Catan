import classes from "./Button.module.css";

const Button = ({ children, onClick, isDisabled }) => {
  return (
    <div className={classes.container}>
      <button
        disabled={isDisabled}
        onClick={onClick}
        className={classes.button}
      >
        {children}
      </button>
    </div>
  );
};

export default Button;
