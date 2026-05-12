import React, { useEffect, useMemo, useState } from "react";
import {
    View,
    Text,
    Pressable,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
    Alert, Platform
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useUser } from "../UserContext";


const API_URL = Platform.OS === "android" ? "http://10.0.2.2:3000" : "http://localhost:3000";

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
                const res = await fetch(`${API_URL}/Boosts/Inventario/${user.id}/${selectedLigaId}`);
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
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: user.id, ligaId: selectedLigaId, inventoryId })
            });
            const data = await res.json();
            if (!res.ok || !data?.ok) {
                Alert.alert("Error", data?.error || "No se pudo activar el boost");
                return;
            }
            setInventario(data.inventario || []);
            setActivoHoy(data.boost || null);
            Alert.alert("Boost activado", "Las misiones de hoy de esta liga tendrán recompensa duplicada");
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
                <ActivityIndicator size="large" color="#3B82F6" />
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
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
            <Text style={styles.title}>Inventario</Text>

            {/* LIGA SELECTOR */}
            <Text style={styles.sectionTitle}>Liga seleccionada</Text>
            <View style={styles.box}>
                <Text style={styles.boxLabel}>Elige una liga</Text>
                <View style={styles.pickerWrapper}>
                    <Picker
                        selectedValue={selectedLigaId}
                        onValueChange={(value) => setSelectedLigaId(Number(value))}
                        style={styles.picker}
                        dropdownIconColor="#263fa0"
                    >
                        {ligas.map((liga) => (
                            <Picker.Item key={liga.id} label={liga.nombre} value={liga.id} color="#111" />
                        ))}
                    </Picker>
                </View>
                <View style={styles.infoRow}>
                    <View style={styles.infoChip}>
                        <Text style={styles.infoChipLabel}>Liga</Text>
                        <Text style={styles.infoChipValue}>{ligaSeleccionada?.nombre || "-"}</Text>
                    </View>
                    <View style={styles.infoChip}>
                        <Text style={styles.infoChipLabel}>Puntos</Text>
                        <Text style={styles.infoChipValue}>{ligaSeleccionada?.puntos ?? 0}</Text>
                    </View>
                </View>
            </View>

            {/* BOOST ACTIVO */}
            <Text style={styles.sectionTitle}>Boost activo</Text>
            {activoHoy ? (
                <View style={styles.boostActiveBox}>
                    <View style={styles.boostActiveHeader}>
                        <Text style={styles.boostActiveBadge}>ACTIVO</Text>
                        <Text style={styles.boostActiveTimer}>⏱ {formatTimeLeft(activoHoy.expires_at)}</Text>
                    </View>
                    <Text style={styles.boostActiveName}>{activoHoy.name}</Text>
                    <Text style={styles.boostActiveDesc}>{activoHoy.description || "Boost activo"}</Text>
                    <View style={styles.boostActiveFooter}>
                        <Text style={styles.boostActiveMult}>×{activoHoy.multiplier || 1} puntos</Text>
                    </View>
                </View>
            ) : (
                <View style={styles.boxMuted}>
                    <Text style={styles.boxMutedText}>No tienes ningún boost activo hoy en esta liga.</Text>
                </View>
            )}

            {/* BOOSTS GUARDADOS */}
            <Text style={styles.sectionTitle}>Boosts guardados</Text>
            {boostsInventario.length === 0 ? (
                <View style={styles.boxMuted}>
                    <Text style={styles.boxMutedText}>No tienes boosts en el inventario de esta liga.</Text>
                </View>
            ) : (
                <View style={styles.statsGrid}>
                    {boostsInventario.map((item) => (
                        <View key={item.id} style={styles.statBox}>
                            <Text style={styles.statLabel}>Boost</Text>
                            <Text style={styles.statTitle}>{item.name}</Text>

                            <Text style={styles.statLabel}>Descripción</Text>
                            <Text style={styles.statDescription}>{item.description}</Text>

                            <View style={styles.statRow}>
                                <View style={styles.statChip}>
                                    <Text style={styles.statChipLabel}>Precio</Text>
                                    <Text style={styles.statChipValue}>{item.price} pts</Text>
                                </View>
                                <View style={styles.statChip}>
                                    <Text style={styles.statChipLabel}>Mult.</Text>
                                    <Text style={styles.statChipValue}>×{item.multiplier || 1}</Text>
                                </View>
                            </View>

                            <Pressable
                                style={[styles.button, activatingId === item.id && styles.buttonDisabled]}
                                onPress={() => activarBoost(item.id)}
                                disabled={activatingId === item.id}
                            >
                                <Text style={styles.buttonText}>
                                    {activatingId === item.id ? "Activando..." : "Activar boost"}
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
        backgroundColor: "#0A1628",
        paddingHorizontal: 16,
        paddingTop: 20,
    },
    center: {
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        marginTop: 12,
        color: "#6B8BA4",
        fontSize: 15,
    },
    title: {
        fontSize: 26,
        fontWeight: "bold",
        color: "#FFFFFF",
        marginBottom: 24,
        letterSpacing: 0.3,
    },
    sectionTitle: {
        color: "#6B8BA4",
        fontSize: 12,
        fontWeight: "700",
        letterSpacing: 1.2,
        textTransform: "uppercase",
        marginBottom: 10,
    },

    // LIGA BOX
    box: {
        backgroundColor: "#111D35",
        padding: 16,
        borderRadius: 14,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: "#1E3A5F",
    },
    boxLabel: {
        color: "#6B8BA4",
        fontSize: 13,
        marginBottom: 10,
    },
    infoRow: {
        flexDirection: "row",
        gap: 10,
        marginTop: 14,
    },
    infoChip: {
        flex: 1,
        backgroundColor: "#0A1628",
        borderRadius: 10,
        padding: 10,
        borderWidth: 1,
        borderColor: "#1E3A5F",
    },
    infoChipLabel: {
        color: "#6B8BA4",
        fontSize: 11,
        marginBottom: 2,
    },
    infoChipValue: {
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: "600",
    },

    // BOOST ACTIVO
    boostActiveBox: {
        backgroundColor: "#0F2A1A",
        borderRadius: 14,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: "#22C55E",
    },
    boostActiveHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },
    boostActiveBadge: {
        backgroundColor: "#22C55E",
        color: "#000",
        fontSize: 11,
        fontWeight: "800",
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        letterSpacing: 0.8,
    },
    boostActiveTimer: {
        color: "#22C55E",
        fontSize: 14,
        fontWeight: "600",
    },
    boostActiveName: {
        color: "#FFFFFF",
        fontSize: 17,
        fontWeight: "bold",
        marginBottom: 4,
    },
    boostActiveDesc: {
        color: "#6B8BA4",
        fontSize: 13,
        marginBottom: 12,
    },
    boostActiveFooter: {
        alignSelf: "flex-start",
        backgroundColor: "#163D24",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    boostActiveMult: {
        color: "#22C55E",
        fontWeight: "700",
        fontSize: 14,
    },

    // MUTED BOX
    boxMuted: {
        backgroundColor: "#111D35",
        padding: 16,
        borderRadius: 14,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: "#1E3A5F",
    },
    boxMutedText: {
        color: "#6B8BA4",
        fontSize: 14,
    },

    // PICKER
    pickerWrapper: {
        width: "100%",
        height: 44,
        backgroundColor: "#ffffff",
        borderRadius: 10,
        overflow: "hidden",
        justifyContent: "center",
    },
    picker: {
        width: "100%",
        height: 44,
        color: "#111",
        backgroundColor: "#ffffff",
    },

    // GRID BOOSTS
    statsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        marginBottom: 20,
    },
    statBox: {
        width: "48%",
        backgroundColor: "#111D35",
        borderRadius: 14,
        padding: 14,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#1E3A5F",
    },
    statLabel: {
        fontSize: 11,
        color: "#6B8BA4",
        marginBottom: 3,
        fontWeight: "600",
        letterSpacing: 0.5,
        textTransform: "uppercase",
    },
    statTitle: {
        fontSize: 15,
        fontWeight: "bold",
        color: "#FFFFFF",
        marginBottom: 10,
    },
    statDescription: {
        fontSize: 12,
        color: "#6B8BA4",
        marginBottom: 12,
        lineHeight: 17,
    },
    statRow: {
        flexDirection: "row",
        gap: 8,
        marginBottom: 12,
    },
    statChip: {
        flex: 1,
        backgroundColor: "#0A1628",
        borderRadius: 8,
        padding: 8,
        borderWidth: 1,
        borderColor: "#1E3A5F",
    },
    statChipLabel: {
        color: "#6B8BA4",
        fontSize: 10,
        marginBottom: 2,
    },
    statChipValue: {
        color: "#3B82F6",
        fontWeight: "700",
        fontSize: 14,
    },
    button: {
        backgroundColor: "#3B82F6",
        paddingVertical: 11,
        borderRadius: 10,
        alignItems: "center",
    },
    buttonDisabled: {
        opacity: 0.4,
    },
    buttonText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 13,
    },
    emptyText: {
        color: "#6B8BA4",
        fontSize: 15,
        textAlign: "center",
    },
});