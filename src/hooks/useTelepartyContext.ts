import { useContext } from "react";
import {
  TelepartyContext,
  type TelepartyContextType,
} from "../contexts/TelepartyContext";

export const useTelepartyContext = (): TelepartyContextType => {
  const context = useContext(TelepartyContext);
  if (!context) {
    throw new Error(
      "useTelepartyContext must be used within TelepartyProvider"
    );
  }
  return context;
};
