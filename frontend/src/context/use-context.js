import { useState, useContext, createContext } from "react";

const StateContext = createContext();
const SetStateContext = createContext();

export const StateProvider = ({ children }) => {
  const cookie = window.localStorage.getItem("jwt");

  const [state, setState] = useState({ jwt: cookie ? cookie : "" });
  return (
    <SetStateContext.Provider value={setState}>
      <StateContext.Provider value={state}>{children}</StateContext.Provider>
    </SetStateContext.Provider>
  );
};

export const useStateCtx = () => useContext(StateContext);
export const useSetStateCtx = () => useContext(SetStateContext);
