import React, {
    createContext,
    useState,
    ReactNode,
    useContext,
    useEffect
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { UserBoost } from "./boosts";
import { TODAY_MISSIONS_BOOST, createTodayMissionBoost, getTodayKey } from "./boosts";
export interface UserShape {
    id: string;
    nombre: string;
    codigo_cr: string;
}

type BoostActivoLiga = {
    dayKey: string;
    multiplier: number;
};

type LigaConPuntos = {
    id: string | number;
    puntos?: number;
};

interface UserContextType {
    user: UserShape | null;
    setUser: (user: UserShape | null) => Promise<void>;
    updateUser: (updates: Partial<UserShape>) => Promise<void>;
    logout: () => Promise<void>;

    inventario: UserBoost[];
    setInventario: React.Dispatch<React.SetStateAction<UserBoost[]>>;

    puntosPorLiga: Record<string, number>;
    setPuntosPorLiga: React.Dispatch<React.SetStateAction<Record<string, number>>>;

    boostActivoPorLiga: Record<string, BoostActivoLiga>;
    setBoostActivoPorLiga: React.Dispatch<React.SetStateAction<Record<string, BoostActivoLiga>>>;

    syncLeaguePoints: (ligas: LigaConPuntos[]) => void;
    comprarBoostEnLiga: (ligaId: string) => { ok: boolean; error?: string };
    activarBoostEnLiga: (inventoryId: string, ligaId: string) => { ok: boolean; error?: string };
    getMissionMultiplier: (ligaId: string) => number;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

const STORAGE_KEYS = {
    user: "user",
    inventario: "user_inventario",
    puntosPorLiga: "user_puntos_por_liga",
    boostActivoPorLiga: "user_boost_activo_por_liga"
};

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUserState] = useState<UserShape | null>(null);
    const [inventario, setInventario] = useState<UserBoost[]>([]);
    const [puntosPorLiga, setPuntosPorLiga] = useState<Record<string, number>>({});
    const [boostActivoPorLiga, setBoostActivoPorLiga] = useState<Record<string, BoostActivoLiga>>({});
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [userData, inventarioData, puntosData, boostData] = await Promise.all([
                    AsyncStorage.getItem(STORAGE_KEYS.user),
                    AsyncStorage.getItem(STORAGE_KEYS.inventario),
                    AsyncStorage.getItem(STORAGE_KEYS.puntosPorLiga),
                    AsyncStorage.getItem(STORAGE_KEYS.boostActivoPorLiga)
                ]);

                if (userData) setUserState(JSON.parse(userData));
                if (inventarioData) setInventario(JSON.parse(inventarioData));
                if (puntosData) setPuntosPorLiga(JSON.parse(puntosData));
                if (boostData) setBoostActivoPorLiga(JSON.parse(boostData));
            } catch (e) {
                console.error("Error cargando datos guardados", e);
            } finally {
                setIsHydrated(true);
            }
        };

        loadData();
    }, []);

    useEffect(() => {
        if (!isHydrated) return;
        AsyncStorage.setItem(STORAGE_KEYS.inventario, JSON.stringify(inventario))
            .catch((e) => console.error("Error guardando inventario", e));
    }, [inventario, isHydrated]);

    useEffect(() => {
        if (!isHydrated) return;
        AsyncStorage.setItem(STORAGE_KEYS.puntosPorLiga, JSON.stringify(puntosPorLiga))
            .catch((e) => console.error("Error guardando puntos por liga", e));
    }, [puntosPorLiga, isHydrated]);

    useEffect(() => {
        if (!isHydrated) return;
        AsyncStorage.setItem(STORAGE_KEYS.boostActivoPorLiga, JSON.stringify(boostActivoPorLiga))
            .catch((e) => console.error("Error guardando boost activo por liga", e));
    }, [boostActivoPorLiga, isHydrated]);

    const setUser = async (userData: UserShape | null) => {
        try {
            if (userData) {
                await AsyncStorage.setItem(STORAGE_KEYS.user, JSON.stringify(userData));
            } else {
                await AsyncStorage.removeItem(STORAGE_KEYS.user);
            }
            setUserState(userData);
        } catch (e) {
            console.error("Error guardando usuario", e);
        }
    };

    const updateUser = async (updates: Partial<UserShape>) => {
        try {
            if (!user) return;
            const updatedUser: UserShape = { ...user, ...updates };
            await AsyncStorage.setItem(STORAGE_KEYS.user, JSON.stringify(updatedUser));
            setUserState(updatedUser);
        } catch (e) {
            console.error("Error actualizando usuario", e);
        }
    };

    const syncLeaguePoints = (ligas: LigaConPuntos[]) => {
        setPuntosPorLiga((prev) => {
            const next = { ...prev };

            for (const liga of ligas) {
                const ligaId = String(liga.id);
                if (next[ligaId] === undefined) {
                    next[ligaId] = Number(liga.puntos ?? 0);
                }
            }

            return next;
        });
    };

    const comprarBoostEnLiga = (ligaId: string) => {
        const puntosActuales = puntosPorLiga[ligaId] ?? 0;

        if (puntosActuales < TODAY_MISSIONS_BOOST.price) {
            return { ok: false, error: "No tienes puntos suficientes en esta liga" };
        }

        const nuevoBoost = createTodayMissionBoost(ligaId);

        setPuntosPorLiga((prev) => ({
            ...prev,
            [ligaId]: (prev[ligaId] ?? 0) - TODAY_MISSIONS_BOOST.price
        }));

        setInventario((prev) => [...prev, nuevoBoost]);

        return { ok: true };
    };

    const activarBoostEnLiga = (inventoryId: string, ligaId: string) => {
        const boost = inventario.find((item) => item.inventoryId === inventoryId && item.ligaId === ligaId);

        if (!boost) {
            return { ok: false, error: "Boost no encontrado en esta liga" };
        }

        const todayKey = getTodayKey();
        const activoHoy = boostActivoPorLiga[ligaId];

        if (activoHoy && activoHoy.dayKey === todayKey) {
            return { ok: false, error: "Ya tienes este boost activo hoy en esta liga" };
        }

        setBoostActivoPorLiga((prev) => ({
            ...prev,
            [ligaId]: {
                dayKey: todayKey,
                multiplier: 2
            }
        }));

        setInventario((prev) => prev.filter((item) => item.inventoryId !== inventoryId));

        return { ok: true };
    };

    const getMissionMultiplier = (ligaId: string) => {
        const boost = boostActivoPorLiga[ligaId];
        if (!boost) return 1;
        if (boost.dayKey !== getTodayKey()) return 1;
        return boost.multiplier;
    };

    const logout = async () => {
        try {
            await Promise.all([
                AsyncStorage.removeItem(STORAGE_KEYS.user),
                AsyncStorage.removeItem(STORAGE_KEYS.inventario),
                AsyncStorage.removeItem(STORAGE_KEYS.puntosPorLiga),
                AsyncStorage.removeItem(STORAGE_KEYS.boostActivoPorLiga)
            ]);

            setUserState(null);
            setInventario([]);
            setPuntosPorLiga({});
            setBoostActivoPorLiga({});
        } catch (e) {
            console.error("Error cerrando sesión", e);
        }
    };

    return (
        <UserContext.Provider
            value={{
                user,
                setUser,
                updateUser,
                logout,
                inventario,
                setInventario,
                puntosPorLiga,
                setPuntosPorLiga,
                boostActivoPorLiga,
                setBoostActivoPorLiga,
                syncLeaguePoints,
                comprarBoostEnLiga,
                activarBoostEnLiga,
                getMissionMultiplier
            }}
        >
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