import classes from "./Button.module.css";

const Button = ({ children, onClick, isDisabled }) => {
  return (
    <div>
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
