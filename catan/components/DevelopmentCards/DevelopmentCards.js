import classes from "./DevelopmentCards.module.css";

const DevelopmentCards = ({ id, isActive, isUsed }) => {
  return (
    <div>
      <h5 className={classes.title}>{id + 1}. knight</h5>
      <div className={classes.developmentInfoContainer}>
        <span className={classes.developmentInfo}>
          Active: {isActive ? "yes" : "no"}
        </span>
        <span className={classes.developmentInfo}>
          Used: {isUsed ? "yes" : "no"}
        </span>
      </div>
    </div>
  );
};

export default DevelopmentCards;
