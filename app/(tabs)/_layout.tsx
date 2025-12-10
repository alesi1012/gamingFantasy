import React, { createContext, useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";

/**
 * Context para compartir la liga seleccionada entre todas las tabs.
 * Lo exportamos aquí para importarlo en Inicio/Clasificacion fácilmente.
 */
export type LigaShape = { id?: string | number; nombre?: string } | null;

export const LigaContext = createContext<{
    liga: LigaShape;
    setLiga: (l: LigaShape) => void;
}>({
    liga: null,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    setLiga: () => {},
});

export default function TabLayout() {
    const [liga, setLiga] = useState<LigaShape>(null);

    return (
        <LigaContext.Provider value={{ liga, setLiga }}>
            <Tabs
                screenOptions={{
                    tabBarInactiveTintColor: "#FFF",
                    tabBarActiveBackgroundColor: "#0D1D87",
                    tabBarActiveTintColor: "#FFFFFF",
                    headerShadowVisible: false,
                    headerTintColor: "#fff",
                    tabBarStyle: {
                        backgroundColor: "#3684B5",
                    },
                }}
            >
                <Tabs.Screen
                    name="inicio"
                    options={{
                        title: "Home",
                        tabBarIcon: ({ color, focused }) => (
                            <Ionicons name={focused ? "home" : "home-outline"} size={24} color={color} />
                        ),
                    }}
                />

                <Tabs.Screen
                    name="clasificacion"
                    options={{
                        title: "Clasificación",
                        tabBarIcon: ({ color, focused }) => (
                            <Ionicons name={focused ? "list" : "list-outline"} size={24} color={color} />
                        ),
                    }}
                />

                <Tabs.Screen
                    name="estadistiques"
                    options={{
                        title: "Estadísticas",
                        tabBarIcon: ({ color, focused }) => (
                            <Ionicons
                                name={focused ? "stats-chart" : "stats-chart-outline"}
                                size={24}
                                color={color}
                            />
                        ),
                    }}
                />

                <Tabs.Screen
                    name="inventari"
                    options={{
                        title: "Inventario",
                        tabBarIcon: ({ color, focused }) => (
                            <Ionicons name={focused ? "cube" : "cube-outline"} size={24} color={color} />
                        ),
                    }}
                />

                <Tabs.Screen
                    name="botiga"
                    options={{
                        title: "Tienda",
                        tabBarIcon: ({ color, focused }) => (
                            <Ionicons name={focused ? "cart" : "cart-outline"} size={24} color={color} />
                        ),
                    }}
                />
            </Tabs>
        </LigaContext.Provider>
    );
}
