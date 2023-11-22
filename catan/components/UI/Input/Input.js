import classes from "./Input.module.css";

const Input = ({ label, onChange }) => {
  const handleInputChange = (e) => {
    onChange(e.target.value);
  };

  return (
    <label className={classes.container}>
      <span className={classes.title}>{label}</span>
      <input
        className={classes.input}
        type="text"
        onChange={handleInputChange}
      />
    </label>
  );
};

export default Input;
