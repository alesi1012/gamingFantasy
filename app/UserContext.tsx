import React, { createContext, useState, ReactNode, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface UserShape {
    id: string;
    nombre: string;
    codigo_cr: string;
}

interface UserContextType {
    user: UserShape | null;
    setUser: (user: UserShape | null) => Promise<void>;
    updateUser: (updates: Partial<UserShape>) => Promise<void>;
    logout: () => Promise<void>;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUserState] = useState<UserShape | null>(null);

    useEffect(() => {
        const loadUser = async () => {
            try {
                const userData = await AsyncStorage.getItem("user");
                if (userData) {
                    setUserState(JSON.parse(userData));
                }
            } catch (e) {
                console.error("Error cargando usuario guardado", e);
            }
        };
        loadUser();
    }, []);

    const setUser = async (userData: UserShape | null) => {
        try {
            if (userData) {
                await AsyncStorage.setItem("user", JSON.stringify(userData));
            } else {
                await AsyncStorage.removeItem("user");
            }
            setUserState(userData);
        } catch (e) {
            console.error("Error guardando usuario", e);
        }
    };

    const updateUser = async (updates: Partial<UserShape>) => {
        try {
            const updatedUser = { ...user, ...updates } as UserShape;
            await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
            setUserState(updatedUser);
        } catch (e) {
            console.error("Error actualizando usuario", e);
        }
    };

    const logout = async () => {
        await setUser(null);
    };

    return (
        <UserContext.Provider value={{ user, setUser, updateUser, logout }}>
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