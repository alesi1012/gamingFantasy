import React, { useEffect, useMemo, useState } from "react";
import {
    View,
    Text,
    Pressable,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
    Alert
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useUser } from "../UserContext";

const API_URL = "http://localhost:3000";

type Liga = {
    id: number;
    nombre: string;
    puntos: number;
};

type InventarioBoost = {
    id: number;
    boostId: string;
    name: string;
    ligaId: number;
    status: "INVENTORY" | "ACTIVE" | "EXPIRED";
    purchased_at: string;
    activated_at?: string | null;
    expires_at?: string | null;
    dayKey?: string | null;
    price: number;
    multiplier?: number;
    description?: string;
};

export default function Inventari() {
    const { user } = useUser();

    const [ligas, setLigas] = useState<Liga[]>([]);
    const [selectedLigaId, setSelectedLigaId] = useState<number | null>(null);
    const [inventario, setInventario] = useState<InventarioBoost[]>([]);
    const [activoHoy, setActivoHoy] = useState<InventarioBoost | null>(null);
    const [loading, setLoading] = useState(true);
    const [activatingId, setActivatingId] = useState<number | null>(null);
    const [, setTick] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setTick((prev) => prev + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const cargarLigas = async () => {
            if (!user?.id) return;

            try {
                setLoading(true);

                const res = await fetch(`${API_URL}/mis-ligas-id/${user.id}`);
                const data = await res.json();

                const ligasData = Array.isArray(data) ? data : [];
                setLigas(ligasData);

                if (ligasData.length > 0) {
                    setSelectedLigaId(Number(ligasData[0].id));
                }
            } catch (error) {
                console.error("Error cargando ligas:", error);
                Alert.alert("Error", "No se pudieron cargar las ligas");
            } finally {
                setLoading(false);
            }
        };

        cargarLigas();
    }, [user?.id]);

    useEffect(() => {
        const cargarInventario = async () => {
            if (!user?.id || selectedLigaId === null) return;

            try {
                setLoading(true);

                const res = await fetch(
                    `${API_URL}/Boosts/Inventario/${user.id}/${selectedLigaId}`
                );
                const data = await res.json();

                if (!res.ok || !data?.ok) {
                    Alert.alert("Error", data?.error || "No se pudo cargar el inventario");
                    return;
                }

                setInventario(data.inventario || []);
                setActivoHoy(data.activoHoy || null);
            } catch (error) {
                console.error("Error cargando inventario:", error);
                Alert.alert("Error", "No se pudo cargar el inventario");
            } finally {
                setLoading(false);
            }
        };

        cargarInventario();
    }, [user?.id, selectedLigaId]);

    const ligaSeleccionada = useMemo(() => {
        return ligas.find((l) => l.id === selectedLigaId) || null;
    }, [ligas, selectedLigaId]);

    const boostsInventario = useMemo(() => {
        return inventario.filter((item) => item.status === "INVENTORY");
    }, [inventario]);

    const formatTimeLeft = (expiresAt?: string | null) => {
        if (!expiresAt) return "00:00:00";

        const diff = new Date(expiresAt).getTime() - Date.now();

        if (diff <= 0) return "00:00:00";

        const totalSeconds = Math.floor(diff / 1000);
        const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
        const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
        const seconds = String(totalSeconds % 60).padStart(2, "0");

        return `${hours}:${minutes}:${seconds}`;
    };

    const activarBoost = async (inventoryId: number) => {
        if (!user?.id || selectedLigaId === null) {
            Alert.alert("Error", "Selecciona una liga");
            return;
        }

        try {
            setActivatingId(inventoryId);

            const res = await fetch(`${API_URL}/Boosts/Activar`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    userId: user.id,
                    ligaId: selectedLigaId,
                    inventoryId
                })
            });

            const data = await res.json();

            if (!res.ok || !data?.ok) {
                Alert.alert("Error", data?.error || "No se pudo activar el boost");
                return;
            }

            setInventario(data.inventario || []);
            setActivoHoy(data.boost || null);

            Alert.alert(
                "Boost activado",
                "Las misiones de hoy de esta liga tendrán recompensa duplicada"
            );
        } catch (error) {
            console.error("Error activando boost:", error);
            Alert.alert("Error", "No se pudo activar el boost");
        } finally {
            setActivatingId(null);
        }
    };

    if (loading && selectedLigaId === null) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={styles.loadingText}>Cargando inventario...</Text>
            </View>
        );
    }

    if (ligas.length === 0) {
        return (
            <View style={[styles.container, styles.center]}>
                <Text style={styles.emptyText}>No estás en ninguna liga.</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Inventario</Text>

            <Text style={styles.sectionTitle}>Liga seleccionada</Text>
            <View style={styles.box}>
                <Text style={styles.boxText}>Elige una liga</Text>

                <View style={styles.pickerWrapper}>
                    <Picker
                        selectedValue={selectedLigaId}
                        onValueChange={(value) => setSelectedLigaId(Number(value))}
                        style={styles.picker}
                        dropdownIconColor="#263fa0"
                    >
                        {ligas.map((liga) => (
                            <Picker.Item
                                key={liga.id}
                                label={liga.nombre}
                                value={liga.id}
                                color="#111"
                            />
                        ))}
                    </Picker>
                </View>

                <Text style={styles.boxSubText}>
                    Liga actual: {ligaSeleccionada?.nombre || "-"}
                </Text>
                <Text style={styles.boxSubText}>
                    Puntos en liga: {ligaSeleccionada?.puntos ?? 0}
                </Text>
            </View>

            <Text style={styles.sectionTitle}>Boost activo</Text>
            {activoHoy ? (
                <View style={styles.box}>
                    <Text style={styles.boxText}>{activoHoy.name}</Text>
                    <Text style={styles.boxSubText}>
                        {activoHoy.description || "Boost activo"}
                    </Text>
                    <Text style={styles.boxSubText}>
                        Multiplicador: x{activoHoy.multiplier || 1}
                    </Text>
                    <Text style={styles.boxSubText}>
                        Expira en: {formatTimeLeft(activoHoy.expires_at)}
                    </Text>
                </View>
            ) : (
                <View style={styles.boxMuted}>
                    <Text style={styles.boxMutedText}>
                        No tienes ningún boost activo hoy en esta liga.
                    </Text>
                </View>
            )}

            <Text style={styles.sectionTitle}>Boosts guardados</Text>

            {boostsInventario.length === 0 ? (
                <View style={styles.boxMuted}>
                    <Text style={styles.boxMutedText}>
                        No tienes boosts en el inventario de esta liga.
                    </Text>
                </View>
            ) : (
                <View style={styles.statsGrid}>
                    {boostsInventario.map((item) => (
                        <View key={item.id} style={styles.statBox}>
                            <Text style={styles.statLabel}>Boost</Text>
                            <Text style={styles.statTitle}>{item.name}</Text>

                            <Text style={styles.statLabel}>Descripción</Text>
                            <Text style={styles.statDescription}>
                                {item.description}
                            </Text>

                            <Text style={styles.statLabel}>Precio</Text>
                            <Text style={styles.statValue}>{item.price} pts</Text>

                            <Text style={styles.statLabel}>Multiplicador</Text>
                            <Text style={styles.statValue}>x{item.multiplier || 1}</Text>

                            <Pressable
                                style={[
                                    styles.button,
                                    activatingId === item.id && styles.buttonDisabled
                                ]}
                                onPress={() => activarBoost(item.id)}
                                disabled={activatingId === item.id}
                            >
                                <Text style={styles.buttonText}>
                                    {activatingId === item.id ? "Activando..." : "Activar"}
                                </Text>
                            </Pressable>
                        </View>
                    ))}
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#1e1e1e",
        padding: 16
    },
    center: {
        justifyContent: "center",
        alignItems: "center"
    },
    loadingText: {
        marginTop: 10,
        color: "white",
        fontSize: 16
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "white",
        marginBottom: 20
    },
    sectionTitle: {
        color: "white",
        fontSize: 20,
        marginBottom: 10
    },
    box: {
        backgroundColor: "#263fa0",
        padding: 16,
        borderRadius: 12,
        marginBottom: 20
    },
    boxText: {
        color: "white",
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10
    },
    boxSubText: {
        color: "white",
        fontSize: 16,
        marginTop: 8
    },
    boxMuted: {
        backgroundColor: "#2c2c2c",
        padding: 16,
        borderRadius: 12,
        marginBottom: 20
    },
    boxMutedText: {
        color: "white",
        fontSize: 15
    },
    pickerWrapper: {
        width: 180,
        height: 40,
        backgroundColor: "#ffffff",
        borderRadius: 10,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#d9d9d9",
        justifyContent: "center",
        alignSelf: "flex-start"
    },
    picker: {
        width: 180,
        height: 40,
        color: "#111",
        backgroundColor: "#ffffff"
    },
    statsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        marginBottom: 20
    },
    statBox: {
        width: "48%",
        backgroundColor: "#ececec",
        borderRadius: 12,
        padding: 14,
        marginBottom: 12
    },
    statLabel: {
        fontSize: 13,
        color: "#555",
        marginBottom: 4
    },
    statTitle: {
        fontSize: 17,
        fontWeight: "bold",
        marginBottom: 10
    },
    statDescription: {
        fontSize: 14,
        color: "#333",
        marginBottom: 10
    },
    statValue: {
        fontSize: 17,
        fontWeight: "bold",
        marginBottom: 10
    },
    button: {
        marginTop: 8,
        backgroundColor: "#263fa0",
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: "center"
    },
    buttonDisabled: {
        opacity: 0.5
    },
    buttonText: {
        color: "#fff",
        fontWeight: "700"
    },
    emptyText: {
        color: "white",
        fontSize: 16,
        textAlign: "center"
    }
});