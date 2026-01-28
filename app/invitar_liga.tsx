import React, { JSX, useEffect, useMemo, useState } from "react";
import {
    View,
    Text,
    ActivityIndicator,
    StyleSheet,
} from "react-native";
import { useLocalSearchParams } from "expo-router";

const API_BASE = "http://localhost:3000";

export default function InvitarLiga(): JSX.Element {
    const params = useLocalSearchParams();

    const rawLiga =
        typeof params.liga === "string"
            ? params.liga
            : Array.isArray(params.liga)
                ? params.liga[0]
                : null;

    const ligaObj = useMemo(() => {
        if (!rawLiga) return null;

        try {
            return JSON.parse(rawLiga);
        } catch {
            return null;
        }
    }, [rawLiga]);

    const [codigo, setCodigo] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!ligaObj?.id) return;

        const fetchCodigo = async () => {
            setLoading(true);
            setError(null);

            try {
                const res = await fetch(
                    `${API_BASE}/liga/${ligaObj.id}/codigo`
                );
                if (!res.ok) throw new Error(`HTTP ${res.status}`);

                const data = await res.json();
                setCodigo(data.codigo ?? null);

            } catch (err) {
                console.error("Error cargando código de liga:", err);
                setError("No se pudo obtener el código de la liga.");
                setCodigo(null);
            } finally {
                setLoading(false);
            }
        };

        fetchCodigo();
    }, [ligaObj?.id]);

    if (!ligaObj) {
        return (
            <View style={styles.center}>
                <Text style={styles.errorText}>
                    Error: no se recibió liga válida.
                </Text>
            </View>
        );
    }

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={styles.loadingText}>
                    Cargando código de la liga...
                </Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.center}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Código de invitación</Text>
            <Text style={styles.codigo}>
                {codigo ?? "No disponible"}
            </Text>
        </View>
    );
}
const styles = StyleSheet.create({
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#000",
        padding: 20,
    },
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#000",
    },
    label: {
        color: "#aaa",
        fontSize: 16,
        marginBottom: 6,
    },
    codigo: {
        color: "white",
        fontSize: 26,
        fontWeight: "700",
        letterSpacing: 2,
    },
    loadingText: {
        color: "white",
        marginTop: 8,
    },
    errorText: {
        color: "#ff6666",
        fontSize: 16,
    },
});
