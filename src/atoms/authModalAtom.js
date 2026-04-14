import { atom } from "recoil";

const initalAuthModalState = {
  isOpen: false,
  type: "login",
};

export const authModalState = atom({
  key: "authModalState",
  default: initalAuthModalState,
});