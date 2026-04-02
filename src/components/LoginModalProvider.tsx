import { createContext, useContext, useState, ReactNode } from "react";
import LoginModal from "./LoginModal";

const LoginModalContext = createContext<{
  openLoginModal: () => void;
}>({ openLoginModal: () => {} });

export function useLoginModal() {
  return useContext(LoginModalContext);
}

export function LoginModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <LoginModalContext.Provider value={{ openLoginModal: () => setIsOpen(true) }}>
      {children}
      <LoginModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </LoginModalContext.Provider>
  );
}
