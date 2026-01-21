import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, ScrollView, ActivityIndicator } from "react-native";
import { useUser } from "../UserContext";

interface Arena {
    name: string;
}
interface Clan {
    name: string;
}
interface FavoriteCard {
    name: string;
}
interface Card {
    name: string;
    id: number;
    level: number;
    iconUrls: { medium: string };
}
interface PlayerData {
    name: string;
    trophies: number;
    wins: number;
    threeCrownWins: number;
    bestTrophies: number;
    totalDonations: number;
    role: string;
    warDayWins: number;
    arena?: Arena;
    clan?: Clan;
    currentDeck?: Card[];
    cards?: Card[];
    currentFavouriteCard?: FavoriteCard;
}

export default function Estadistiques() {
    const { user } = useUser();
    const [data, setData] = useState<PlayerData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            if (!user?.nombre) {
                setError("No hay usuario logueado.");
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const res = await fetch(`http://localhost:3000/players/${user.nombre}`);

                if (!res.ok) {
                    if (res.status === 400) {
                        setError("El usuario no tiene código Clash Royale registrado.");
                    } else if (res.status === 404) {
                        setError("Usuario no encontrado en la base de datos.");
                    } else {
                        setError(`Error al obtener estadísticas: ${res.status}`);
                    }
                    setData(null);
                    setLoading(false);
                    return;
                }

                const json = await res.json();
                setData(json);
            } catch (e) {
                setError("Error de conexión con el servidor.");
                setData(null);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [user]);

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

    if (!data) {
        return (
            <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
                <Text style={{ color: "white" }}>No se pudieron cargar los datos</Text>
            </View>
        );
    }

    // Valores seguros con fallback
    const arenaName = data.arena?.name ?? "Desconocida";
    const clanName = data.clan?.name ?? "Sin clan";
    const favCardName = data.currentFavouriteCard?.name ?? "Ninguna";

    return (
        <ScrollView style={styles.container}>
            {/* MAZO */}
            <View style={{ flexDirection: "row", marginBottom: 20 }}>
                {data.currentDeck?.map((card) => (
                    <View key={card.id} style={styles.card}>
                        <Image source={{ uri: card.iconUrls.medium }} style={styles.image} />
                        <Text style={styles.cardName}>{card.name}</Text>
                        <Text style={styles.cardLevel}>Level {card.level}</Text>
                    </View>
                )) || <Text style={{ color: "white" }}>No hay mazo activo</Text>}
            </View>

            <Text style={styles.title}>{data.name}</Text>

            <Text style={styles.sectionTitle}>Copas</Text>

            <View style={styles.box}>
                <Text style={styles.boxText}>Trofeos: {data.trophies}</Text>
                <Text style={styles.boxText}>Arena: {arenaName}</Text>
            </View>

            <View style={styles.statsGrid}>
                <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Victorias</Text>
                    <Text style={styles.statValue}>{data.wins}</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={styles.statLabel}>3 coronas</Text>
                    <Text style={styles.statValue}>{data.threeCrownWins}</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Máximo de trofeos</Text>
                    <Text style={styles.statValue}>{data.bestTrophies}</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Donaciones</Text>
                    <Text style={styles.statValue}>{data.totalDonations}</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Cartas encontradas</Text>
                    <Text style={styles.statValue}>
                        {data.cards ? data.cards.length : 0}/121
                    </Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Favorita</Text>
                    <Text style={styles.statValue}>{favCardName}</Text>
                </View>
            </View>

            <View style={styles.box}>
                <Text style={styles.boxText}>Clan: {clanName}</Text>
            </View>

            <View style={styles.statsRow}>
                <View style={styles.statRowBox}>
                    <Text style={styles.statLabel}>Guerras ganadas</Text>
                    <Text style={styles.statValue}>{data.warDayWins}</Text>
                </View>
                <View style={styles.statRowBox}>
                    <Text style={styles.statLabel}>Rol</Text>
                    <Text style={styles.statValue}>{data.role}</Text>
                </View>
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
    box: {
        backgroundColor: "#263fa0",
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
    },
    boxText: {
        color: "white",
        fontSize: 18,
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
    statsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    statRowBox: {
        width: "48%",
        backgroundColor: "#ececec",
        padding: 14,
        borderRadius: 12,
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
