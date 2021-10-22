import { createContext, ReactNode } from "react";

const AuthContext = createContext(null);

type AuthProvider = {
  children: ReactNode;
};

export function AuthProvider(props: AuthProvider) {
  return (
    <AuthContext.Provider value={null}>{props.children}</AuthContext.Provider>
  );
}
