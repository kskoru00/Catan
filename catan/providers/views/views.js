import { createContext, useState } from "react";

import { Views, Layers } from "consts";

const initialState = {
  activeView: Views.startGameView,
  activeLayer: Layers.none,
  error: "",
  updateMessage: "",
};

export const ViewsContext = createContext({
  view: { ...initialState },
  setActiveView: () => {},
  setActiveLayer: () => {},
  setError: () => {},
  setUpdateMessage: () => {},
});

const ViewsProvider = ({ children }) => {
  const [view, setView] = useState(initialState);

  const setActiveView = (view) => {
    setView((prevView) => ({ ...prevView, activeView: Views[view] }));
  };

  const setActiveLayer = (layer) => {
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
    setActiveView,
    setActiveLayer,
    setError,
    setUpdateMessage,
  };

  return (
    <ViewsContext.Provider value={value}>{children}</ViewsContext.Provider>
  );
};

export default ViewsProvider;
