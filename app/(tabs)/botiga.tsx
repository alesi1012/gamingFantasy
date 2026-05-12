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

type BoostCatalogItem = {
    id: string;
    name: string;
    description: string;
    price: number;
    multiplier?: number;
};

export default function Botiga() {
    const { user } = useUser();

    const [ligas, setLigas] = useState<Liga[]>([]);
    const [selectedLigaId, setSelectedLigaId] = useState<number | null>(null);
    const [catalogo, setCatalogo] = useState<BoostCatalogItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [buyingId, setBuyingId] = useState<string | null>(null);

    useEffect(() => {
        const cargarDatos = async () => {
            if (!user?.id) return;
            try {
                setLoading(true);
                const [ligasRes, boostsRes] = await Promise.all([
                    fetch(`${API_URL}/mis-ligas-id/${user.id}`),
                    fetch(`${API_URL}/Boosts/Catalogo`)
                ]);
                const ligasJson = await ligasRes.json();
                const boostsJson = await boostsRes.json();
                const ligasData = Array.isArray(ligasJson) ? ligasJson : [];
                const boostsData = boostsJson?.boosts || [];
                setLigas(ligasData);
                setCatalogo(boostsData);
                if (ligasData.length > 0) {
                    setSelectedLigaId(Number(ligasData[0].id));
                }
            } catch (error) {
                console.error("Error cargando tienda:", error);
                Alert.alert("Error", "No se pudieron cargar las ligas o los boosts");
            } finally {
                setLoading(false);
            }
        };
        cargarDatos();
    }, [user?.id]);

    const ligaSeleccionada = useMemo(() => {
        return ligas.find((l) => l.id === selectedLigaId) || null;
    }, [ligas, selectedLigaId]);

    const comprarBoost = async (boostId: string, price: number) => {
        if (!user?.id || selectedLigaId === null) {
            Alert.alert("Error", "Selecciona una liga");
            return;
        }
        if ((ligaSeleccionada?.puntos ?? 0) < price) {
            Alert.alert("Puntos insuficientes", "No tienes suficientes puntos en esta liga");
            return;
        }
        try {
            setBuyingId(boostId);
            const res = await fetch(`${API_URL}/Boosts/Comprar`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: user.id, ligaId: selectedLigaId, boostId })
            });
            const data = await res.json();
            if (!res.ok || !data?.ok) {
                Alert.alert("Error", data?.error || "No se pudo comprar el boost");
                return;
            }
            setLigas((prev) =>
                prev.map((liga) =>
                    liga.id === selectedLigaId
                        ? { ...liga, puntos: Number(data.nuevosPuntos ?? liga.puntos) }
                        : liga
                )
            );
            Alert.alert("Compra correcta", "Boost comprado y guardado en el inventario de esta liga");
        } catch (error) {
            console.error("Error comprando boost:", error);
            Alert.alert("Error", "No se pudo comprar el boost");
        } finally {
            setBuyingId(null);
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text style={styles.loadingText}>Cargando tienda...</Text>
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
            <Text style={styles.title}>Tienda</Text>

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

            <Text style={styles.sectionTitle}>Boosts disponibles</Text>
            <View style={styles.statsGrid}>
                {catalogo.map((boost) => {
                    const disabled =
                        buyingId === boost.id ||
                        (ligaSeleccionada?.puntos ?? 0) < boost.price;

                    return (
                        <View key={boost.id} style={styles.statBox}>
                            <Text style={styles.statLabel}>Boost</Text>
                            <Text style={styles.statTitle}>{boost.name}</Text>

                            <Text style={styles.statLabel}>Descripción</Text>
                            <Text style={styles.statDescription}>{boost.description}</Text>

                            <View style={styles.statRow}>
                                <View style={styles.statChip}>
                                    <Text style={styles.statChipLabel}>Precio</Text>
                                    <Text style={styles.statChipValue}>{boost.price} pts</Text>
                                </View>
                                <View style={styles.statChip}>
                                    <Text style={styles.statChipLabel}>Efecto</Text>
                                    <Text style={styles.statChipValue}>×{boost.multiplier || 1}</Text>
                                </View>
                            </View>

                            <Pressable
                                style={[styles.button, disabled && styles.buttonDisabled]}
                                onPress={() => comprarBoost(boost.id, boost.price)}
                                disabled={disabled}
                            >
                                <Text style={styles.buttonText}>
                                    {buyingId === boost.id ? "Comprando..." : "Comprar"}
                                </Text>
                            </Pressable>
                        </View>
                    );
                })}
            </View>
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