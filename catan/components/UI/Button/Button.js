import classes from "./Button.module.css";

const Button = ({ value, onClick }) => {
  return (
    <div>
      <button onClick={onClick} className={classes.button}>
        {value}
      </button>
    </div>
  );
};

export default Button;
