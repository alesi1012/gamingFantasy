import React, { createContext, useState, ReactNode, useContext } from "react";

export interface UserShape {
    nombre: string;
    codigo_cr: string;
}

interface UserContextType {
    user: UserShape | null;
    setUser: (user: UserShape | null) => void;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<UserShape | null>(null);

    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUser debe usarse dentro de un UserProvider");
    }
    return context;
};
