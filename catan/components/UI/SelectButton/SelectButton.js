import classes from "./SelectButton.module.css";

const SelectButton = ({ children, onClick, isDisabled }) => {
  return (
    <button
      onClick={() => {
        onClick();
      }}
      disabled={isDisabled}
      className={classes.button}
    >
      {children}
    </button>
  );
};

export default SelectButton;
