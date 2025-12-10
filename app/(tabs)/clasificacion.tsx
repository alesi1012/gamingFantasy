import React, { JSX, useEffect, useState, useContext, useMemo } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { LigaContext } from "./_layout";

type Miembro = {
    id: string;
    nombre: string;
    codigo_cr?: string;
    puntos: number;
};

const API_BASE = "http://localhost:3000";
const USUARIO_ACTUAL = "34d84e35-c84c-4590-8331-3d8e5318f42d";

export default function Clasificacion(): JSX.Element {
    const params = useLocalSearchParams();
    const router = useRouter();

    const { liga: ligaGlobal } = useContext(LigaContext);

    // --- NORMALIZAR PARAMS (compatibilidad completa) ---
    const rawLiga =
        typeof params.liga === "string"
            ? params.liga
            : Array.isArray(params.liga)
                ? params.liga[0]
                : null;

    // ----------------------------------------------------------------
    // CAMBIO IMPORTANTE: damos **prioridad al LigaContext (ligaGlobal)**.
    // Si existe ligaGlobal la usamos (es la selección más reciente del inicio).
    // Si no existe, entonces intentamos parsear params.liga para compatibilidad.
    // ----------------------------------------------------------------
    const ligaObj = useMemo(() => {
        if (ligaGlobal) {
            return ligaGlobal;
        }

        if (rawLiga) {
            try {
                return JSON.parse(rawLiga);
            } catch {
                return null;
            }
        }

        return null;
    }, [rawLiga, ligaGlobal]);

    const [miembros, setMiembros] = useState<Miembro[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMiembros = async () => {
            if (!ligaObj?.id) return;

            setLoading(true);
            setError(null);

            try {
                const res = await fetch(`${API_BASE}/liga/${ligaObj.id}/miembros`);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);

                const data: Miembro[] = await res.json();

                const ordenados = Array.isArray(data)
                    ? data.slice().sort((a, b) => (b.puntos ?? 0) - (a.puntos ?? 0))
                    : [];

                setMiembros(ordenados);

            } catch (err) {
                console.error("Error cargando miembros:", err);
                setError("No se pudieron cargar los miembros.");
                setMiembros([]);
            } finally {
                setLoading(false);
            }
        };

        fetchMiembros();
    }, [ligaObj?.id]);

    if (!ligaObj) {
        return (
            <View style={styles.center}>
                <Text style={styles.errorText}>Error: no se recibió liga válida.</Text>
            </View>
        );
    }

    return (
        <View style={styles.screen}>
            <View style={styles.headerRow}>
                <Text style={styles.title}>Clasificación — {ligaObj.nombre}</Text>

                <TouchableOpacity
                    onPress={() => AlertInvitar()}
                    style={styles.inviteButton}
                    accessibilityLabel="Invitar a la liga"
                >
                    <Ionicons name="person-add" size={20} color="white" />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.loadingRow}>
                    <ActivityIndicator size="large" color="#fff" />
                    <Text style={styles.loadingText}>Cargando miembros...</Text>
                </View>
            ) : error ? (
                <View style={styles.center}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            ) : miembros.length === 0 ? (
                <View style={styles.center}>
                    <Text style={styles.noMembersText}>No hay miembros en esta liga.</Text>
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.listContainer}>
                    {miembros.map((m, idx) => {
                        const esYo = m.id === USUARIO_ACTUAL;

                        return (
                            <View
                                key={m.id}
                                style={[styles.card, esYo ? styles.cardMe : styles.cardOther]}
                            >
                                <View style={styles.left}>
                                    <View style={styles.positionCircle}>
                                        <Text style={styles.positionText}>{idx + 1}</Text>
                                    </View>

                                    <View style={styles.info}>
                                        <Text style={styles.playerName}>{m.nombre}</Text>
                                        <Text style={styles.playerPoints}>{m.puntos} pts</Text>
                                    </View>
                                </View>

                                <View style={styles.actions}>
                                    {!esYo && (
                                        <TouchableOpacity
                                            onPress={() => AlertRetar(m)}
                                            style={styles.actionBtn}
                                        >
                                            <Ionicons name="flash" size={18} color="white" />
                                        </TouchableOpacity>
                                    )}

                                    <TouchableOpacity
                                        onPress={() =>
                                            router.push({
                                                pathname: "estadistiques",
                                                params: { codigo_cr: m.codigo_cr ?? "" },
                                            })
                                        }
                                        style={styles.actionBtn}
                                    >
                                        <Ionicons name="eye" size={18} color="white" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        );
                    })}
                </ScrollView>
            )}
        </View>
    );

    // Helpers
    function AlertRetar(m: Miembro) {
        alert(`Retando usuario ${m.nombre}`);
    }

    function AlertInvitar() {
        alert("Invitando usuarios...");
    }
}


const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: "#000",
        paddingTop: 20,
        paddingHorizontal: 16,
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    title: {
        color: "white",
        fontSize: 22,
        fontWeight: "700",
    },
    inviteButton: {
        backgroundColor: "#3684B5",
        padding: 8,
        borderRadius: 8,
    },
    loadingRow: {
        marginTop: 20,
        alignItems: "center",
    },
    loadingText: {
        color: "white",
        marginTop: 8,
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        backgroundColor: "#000",
    },
    errorText: {
        color: "#ff6666",
        fontSize: 16,
    },
    noMembersText: {
        color: "white",
        fontSize: 16,
    },
    listContainer: {
        paddingBottom: 40,
        gap: 12,
    },
    card: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 12,
        borderRadius: 12,
    },
    cardMe: {
        backgroundColor: "#2E3BFF",
    },
    cardOther: {
        backgroundColor: "#1565C0",
    },
    left: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    positionCircle: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    positionText: {
        fontWeight: "700",
    },
    info: {
        flexShrink: 1,
    },
    playerName: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
    },
    playerPoints: {
        color: "#e0e0e0",
        fontSize: 13,
    },
    actions: {
        flexDirection: "row",
        alignItems: "center",
    },
    actionBtn: {
        padding: 8,
        marginLeft: 8,
        backgroundColor: "rgba(255,255,255,0.08)",
        borderRadius: 8,
    },
});
