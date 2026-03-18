import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useUser } from "./UserContext";

interface PlayerData {
    name: string;
    trophies: number;
    wins: number;
    threeCrownWins: number;
    bestTrophies: number;
    totalDonations: number;
    warDayWins: number;
}

export default function EstadisticasMultiUser() {
    const params = useLocalSearchParams();
    const { user } = useUser();

    const nombresParam = params.usuarios
        ? (params.usuarios as string).split(",")
        : [];

    const nombres = [
        ...new Set([
            ...nombresParam,
            user?.nombre,
        ].filter(Boolean))
    ];

    const [players, setPlayers] = useState<PlayerData[]>([]);
    const [loading, setLoading] = useState(true);

    async function fetchPlayer(nombre: string) {
        try {
            const res = await fetch(`http://localhost:3000/players/${encodeURIComponent(nombre)}`);
            if (!res.ok) return null;
            return await res.json();
        } catch {
            return null;
        }
    }

    useEffect(() => {
        async function cargar() {
            setLoading(true);


            const nombresParam = params.usuarios
                ? (params.usuarios as string).split(",")
                : [];

            const nombresUnicos = [
                ...new Set([
                    ...nombresParam,
                    user?.nombre,
                ].filter(Boolean))
            ];

            const resultados = await Promise.all(
                nombresUnicos.map((n) => fetchPlayer(n))
            );

            setPlayers(resultados.filter(Boolean));
            setLoading(false);
        }

        cargar();
    }, [params.usuarios, user?.nombre]);

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#fff" />
            </View>
        );
    }

    if (players.length === 0) {
        return (
            <View style={styles.center}>
                <Text style={{ color: "white" }}>No hay datos</Text>
            </View>
        );
    }

    function ranking(statKey: keyof PlayerData, label: string) {
        const ordenados = [...players]
            .sort((a, b) => (b[statKey] ?? 0) - (a[statKey] ?? 0));

        return (
            <View style={styles.statBlock}>
                <Text style={styles.statTitle}>{label}</Text>

                {ordenados.map((p, i) => (
                    <Text key={p.name} style={styles.rank}>
                        #{i + 1} {p.name} — {p[statKey]}
                    </Text>
                ))}
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Comparación de jugadores</Text>

            {ranking("trophies", "Trofeos")}
            {ranking("wins", "Victorias")}
            {ranking("threeCrownWins", "3 coronas")}
            {ranking("bestTrophies", "Máx trofeos")}
            {ranking("totalDonations", "Donaciones")}
            {ranking("warDayWins", "Guerras ganadas")}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#1e1e1e",
        padding: 16,
    },
    center: {
        flex: 1,
        backgroundColor: "#1e1e1e",
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        color: "white",
        fontSize: 28,
        fontWeight: "bold",
        marginBottom: 20,
    },
    statBlock: {
        backgroundColor: "#2a2a2a",
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
    },
    statTitle: {
        color: "white",
        fontSize: 18,
        marginBottom: 10,
    },
    rank: {
        color: "white",
        marginBottom: 4,
    },
});