import classes from "./Button.module.css";

const Button = ({ value }) => {
  return (
    <div>
      <button className={classes.button}>{value}</button>
    </div>
  );
};

export default Button;
