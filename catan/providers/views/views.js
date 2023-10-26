import { createContext, useState } from "react";

const Views = Object.freeze({
  startGameView: "startGameView",
  setupGameView: "setupGameView",
  resourceProductionView: "resourceProductionView",
});

const initialState = {
  activeView: Views.startGameView,
  error: "",
};

export const ViewContext = createContext({
  view: { ...initialState },
  changeView: () => {},
  setError: () => {},
});

const ViewsProvider = ({ children }) => {
  const [view, setView] = useState(initialState);

  const changeView = (view) => {
    setView((prevView) => ({ ...prevView, activeView: Views[view] }));
  };

  const setError = (errorMessage) => {
    setView((prevView) => ({ ...prevView, error: errorMessage }));
  };

  const value = {
    view,
    changeView,
    setError,
  };

  return <ViewContext.Provider value={value}>{children}</ViewContext.Provider>;
};

export default ViewsProvider;
