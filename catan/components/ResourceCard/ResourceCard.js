import SelectButton from "components/UI/SelectButton";

import classes from "./ResourceCard.module.css";

const Resource = ({ type, amount, onClick, isDisabled }) => {
  return (
    <div className={classes.resourceItem}>
      <SelectButton
        isDisabled={isDisabled}
        onClick={() => {
          onClick(type);
        }}
      >
        <span>{type}: </span>
        <span>{amount}</span>
      </SelectButton>
    </div>
  );
};

export default Resource;
