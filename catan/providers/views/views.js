import { createContext, useState } from "react";

const Views = Object.freeze({
  startGameView: "startGameView",
  setupGameView: "setupGameView",
  resourceProductionView: "resourceProductionView",
  robberView: "robberView",
  robberViewPhase2: "robberViewPhase2",
  robberViewPhase3: "robberViewPhase3",
  tradeView: "tradeView",
  tradeViewPhase2: "tradeViewPhase2",
  buildView: "buildView",
});

const Layers = Object.freeze({
  tilesLayer: "tilesLayer",
  roadsLayer: "roadsLayer",
  settlementsLayer: "settlementsLayer",
  none: "none",
});

const initialState = {
  activeView: Views.startGameView,
  activeLayer: Layers.none,
  error: "",
  updateMessage: "",
};

export const ViewContext = createContext({
  view: { ...initialState },
  changeView: () => {},
  changeActiveLayer: () => {},
  setError: () => {},
  setUpdateMessage: () => {},
});

const ViewsProvider = ({ children }) => {
  const [view, setView] = useState(initialState);

  const changeView = (view) => {
    setView((prevView) => ({ ...prevView, activeView: Views[view] }));
  };

  const changeActiveLayer = (layer) => {
    setView((prevLayer) => ({ ...prevLayer, activeLayer: Layers[layer] }));
  };

  const setError = (errorMessage) => {
    setView((prevView) => ({ ...prevView, error: errorMessage }));
  };

  const setUpdateMessage = (updateMessage) => {
    setView((prevView) => ({ ...prevView, updateMessage }));
  };

  const value = {
    view,
    changeView,
    changeActiveLayer,
    setError,
    setUpdateMessage,
  };

  return <ViewContext.Provider value={value}>{children}</ViewContext.Provider>;
};

export default ViewsProvider;
