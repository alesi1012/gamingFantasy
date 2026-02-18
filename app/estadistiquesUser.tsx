import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    ActivityIndicator,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useUser } from "./UserContext";

interface PlayerData { /* tu interfaz aquí igual que antes */ }

export default function EstadistiquesUser() {
    const params = useLocalSearchParams();
    const nombre = params.nombre as string | undefined;
    const { user } = useUser();

    const [dataUserParam, setDataUserParam] = useState<PlayerData | null>(null);
    const [dataUserLogged, setDataUserLogged] = useState<PlayerData | null>(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    async function fetchPlayerStats(nombreUsuario: string | undefined) {
        if (!nombreUsuario) return null;
        try {
            const res = await fetch(`http://localhost:3000/players/${encodeURIComponent(nombreUsuario)}`);
            if (!res.ok) throw new Error(`Error ${res.status}`);
            return await res.json();
        } catch {
            return null;
        }
    }

    useEffect(() => {
        async function fetchBoth() {
            setLoading(true);
            setError(null);

            const datosParam = await fetchPlayerStats(nombre);
            const datosLogged = user ? await fetchPlayerStats(user.nombre) : null;

            if (!datosParam && !datosLogged) {
                setError("No se pudieron cargar las estadísticas de ninguno de los usuarios.");
            }

            setDataUserParam(datosParam);
            setDataUserLogged(datosLogged);
            setLoading(false);
        }
        fetchBoth();
    }, [nombre, user]);

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
                <ActivityIndicator size="large" color="#fff" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
                <Text style={{ color: "white", fontSize: 16, textAlign: "center" }}>{error}</Text>
            </View>
        );
    }

    if (!dataUserParam && !dataUserLogged) {
        return (
            <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
                <Text style={{ color: "white" }}>No hay datos para mostrar</Text>
            </View>
        );
    }

    // Función para comparar y devolver el mejor valor con su dueño
    function mejorEstadistica(
        statKey: keyof PlayerData,
        label: string,
    ) {
        const val1 = dataUserParam?.[statKey] ?? -Infinity;
        const val2 = dataUserLogged?.[statKey] ?? -Infinity;

        if (val1 === -Infinity && val2 === -Infinity) return null;

        const mejorValor = val1 >= val2 ? val1 : val2;
        const dueño = val1 >= val2 ? dataUserParam?.name : dataUserLogged?.name;

        return (
            <View style={styles.statBox}>
                <Text style={styles.statLabel}>{label}</Text>
                <Text style={styles.statValue}>
                    {mejorValor} ({dueño})
                </Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>

            {/* Mostrar mazos, clanes y carta favorita para ambos */}
            {[dataUserParam, dataUserLogged].map((data, idx) =>
                data ? (
                    <View key={idx} style={{ marginBottom: 30 }}>
                        <Text style={styles.title}>Estadísticas de {data.name}</Text>

                        <Text style={styles.sectionTitle}>Mazo activo</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
                            {data.currentDeck?.map((card) => (
                                <View key={card.id} style={styles.card}>
                                    <Image source={{ uri: card.iconUrls.medium }} style={styles.image} />
                                    <Text style={styles.cardName}>{card.name}</Text>
                                    <Text style={styles.cardLevel}>Level {card.level}</Text>
                                </View>
                            )) || <Text style={{ color: "white" }}>No hay mazo activo</Text>}
                        </ScrollView>

                        <Text style={styles.sectionTitle}>Clan</Text>
                        <Text style={{ color: "white", marginBottom: 10 }}>
                            {data.clan?.name ?? "Sin clan"}
                        </Text>

                        <Text style={styles.sectionTitle}>Carta favorita</Text>
                        <Text style={{ color: "white", marginBottom: 10 }}>
                            {data.currentFavouriteCard?.name ?? "Ninguna"}
                        </Text>
                    </View>
                ) : null
            )}

            {/* Comparar estadísticas y mostrar solo la mejor */}
            <Text style={styles.title}>Comparación de estadísticas</Text>
            <View style={styles.statsGrid}>
                {mejorEstadistica("trophies", "Trofeos")}
                {mejorEstadistica("wins", "Victorias")}
                {mejorEstadistica("threeCrownWins", "3 coronas")}
                {mejorEstadistica("bestTrophies", "Máximo de trofeos")}
                {mejorEstadistica("totalDonations", "Donaciones")}
                {mejorEstadistica("warDayWins", "Guerras ganadas")}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#1e1e1e",
        padding: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "white",
        marginBottom: 20,
    },
    sectionTitle: {
        color: "white",
        fontSize: 20,
        marginBottom: 10,
    },
    statsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        marginBottom: 20,
    },
    statBox: {
        width: "48%",
        backgroundColor: "#ececec",
        borderRadius: 12,
        padding: 14,
        marginBottom: 12,
    },
    statLabel: {
        fontSize: 14,
        color: "#444",
    },
    statValue: {
        fontSize: 18,
        fontWeight: "bold",
    },
    card: {
        width: 100,
        marginRight: 12,
        backgroundColor: "#ececec",
        borderRadius: 8,
        padding: 6,
        alignItems: "center",
    },
    image: {
        width: 64,
        height: 64,
        marginBottom: 4,
    },
    cardName: {
        fontWeight: "bold",
        textAlign: "center",
    },
    cardLevel: {
        color: "#555",
        fontSize: 12,
    },
});
