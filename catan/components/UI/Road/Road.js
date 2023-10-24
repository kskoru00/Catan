import classes from "./Road.module.css";

const Road = ({ id, row, position }) => {
  let className = `${classes.button}`;
  let containerClassName = `${classes.container}`;

  if (row % 2 === 0) {
    if ((position % 2 === 0 && row < 5) || (position % 2 !== 0 && row > 5)) {
      className += ` ${classes.left}`;
    } else if (position % 2 !== 0 || (position % 2 === 0 && row > 5)) {
      className += ` ${classes.right}`;
    }
  } else {
    containerClassName += ` ${classes.verticalContainer}`;
    className += ` ${classes.vertical}`;
  }
  return (
    <div className={containerClassName}>
      <button className={className}></button>
    </div>
  );
};

export default Road;
