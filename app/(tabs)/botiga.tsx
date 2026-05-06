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
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    userId: user.id,
                    ligaId: selectedLigaId,
                    boostId
                })
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
                <ActivityIndicator size="large" color="#fff" />
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
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Tienda</Text>

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
                    Puntos disponibles: {ligaSeleccionada?.puntos ?? 0}
                </Text>
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

                            <Text style={styles.statLabel}>Precio</Text>
                            <Text style={styles.statValue}>{boost.price} pts</Text>

                            <Text style={styles.statLabel}>Efecto</Text>
                            <Text style={styles.statValue}>
                                x{boost.multiplier || 1} en misiones de hoy
                            </Text>

                            <Pressable
                                style={[
                                    styles.button,
                                    disabled && styles.buttonDisabled
                                ]}
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