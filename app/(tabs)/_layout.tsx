import React, { createContext, useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { UserContext, UserShape } from "../UserContext";

export type LigaShape = { id?: string | number; nombre?: string } | null;

export const LigaContext = createContext<{
    liga: LigaShape;
    setLiga: (l: LigaShape) => void;
}>({
    liga: null,
    setLiga: () => {},
});

const BRAND_DARK = "#0A1628";
const BRAND_BLUE = "#1A3A5C";
const BRAND_ACCENT = "#3B82F6";
const BRAND_INACTIVE = "#6B8BA4";

export default function TabLayout() {
    const [liga, setLiga] = useState<LigaShape>(null);
    const [user, setUser] = useState<UserShape | null>(null);

    return (
        <LigaContext.Provider value={{ liga, setLiga }}>

            <StatusBar style="light" backgroundColor={BRAND_DARK} translucent={false} />

            <Tabs
                screenOptions={{

                    headerShown: false,


                    tabBarStyle: {
                        backgroundColor: BRAND_DARK,
                        borderTopWidth: 0,
                        elevation: 0,
                        shadowOpacity: 0,
                        height: 62,
                        paddingBottom: 8,
                        paddingTop: 6,
                    },
                    tabBarActiveTintColor: BRAND_ACCENT,
                    tabBarInactiveTintColor: BRAND_INACTIVE,
                    tabBarActiveBackgroundColor: "transparent",
                    tabBarInactiveBackgroundColor: "transparent",
                    tabBarLabelStyle: {
                        fontSize: 10,
                        fontWeight: "600",
                        letterSpacing: 0.3,
                        marginTop: 2,
                    },
                    tabBarIconStyle: {
                        marginTop: 2,
                    },
                }}
            >
                <Tabs.Screen
                    name="inicio"
                    options={{
                        title: "Home",
                        tabBarIcon: ({ color, focused }) => (
                            <Ionicons
                                name={focused ? "home" : "home-outline"}
                                size={focused ? 26 : 23}
                                color={color}
                            />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="clasificacion"
                    options={{
                        title: "Clasificación",
                        tabBarIcon: ({ color, focused }) => (
                            <Ionicons
                                name={focused ? "list" : "list-outline"}
                                size={focused ? 26 : 23}
                                color={color}
                            />
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
                                size={focused ? 26 : 23}
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
                            <Ionicons
                                name={focused ? "cube" : "cube-outline"}
                                size={focused ? 26 : 23}
                                color={color}
                            />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="botiga"
                    options={{
                        title: "Tienda",
                        tabBarIcon: ({ color, focused }) => (
                            <Ionicons
                                name={focused ? "cart" : "cart-outline"}
                                size={focused ? 26 : 23}
                                color={color}
                            />
                        ),
                    }}
                />
            </Tabs>
        </LigaContext.Provider>
    );
}