import React, {useEffect, useState} from "react";
import { View, Text, StyleSheet, Image, ScrollView, ActivityIndicator } from "react-native";
import {json} from "node:stream/consumers";
interface Arena {
    id: number;
    name: string;
}
interface Clan{
    badgeId: number;
    name: string;
}
interface FavoriteCard{
    name:string;
    id:number;
}
interface Card {
    name: string;
    id: number;
    level: number;
    rarity: string;
    elixirCost: number;
    iconUrls: {
        medium: string;
        evolutionMedium?: string;
    };
}
interface PlayerData {
    name: string;
    trophies: number;
    expLevel: number;
    wins: number;
    threeCrownWins: number;
    bestTrophies: number;
    battleCount: number;
    totalDonations: number;
    role:string;
    warDayWins:number;
    currentDeck:Card[];
    arena: Arena;
    clan: Clan;
    currentFavouriteCard:FavoriteCard;
}

export default  function Estadistiques() {
    const [data, setData] = useState<PlayerData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch("http://localhost:3000/player/%23VQCPYYPQG");
                const json = await res.json();
                console.log("Datos recibidos de la API:", JSON.stringify(json, null, 2));
                setData(json);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#fff" />
            </View>
        );
    }
    if (!data) {
        return (
            <View style={{ flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'#1e1e1e' }}>
                <Text style={{ color: 'white' }}>No se pudieron cargar los datos</Text>
            </View>
        );
    }


    return (

        <ScrollView style={styles.container}>
            {data.currentDeck.map((card) => (
                <View key={card.id} style={styles.card}>
                    <Image source={{ uri: card.iconUrls.medium }} style={styles.image} />
                    <Text style={styles.cardName}>{card.name}</Text>
                    <Text style={styles.cardLevel}>Level {card.level}</Text>
                </View>
            ))}

            <Text style={styles.title}>{data.name}</Text>

            <Text style={styles.sectionTitle}>Copas</Text>

            <View style={styles.box}>
                <Text style={styles.boxText}>Trofeos: {data.trophies}   Arena:  {data.arena.name}</Text>
            </View>

            <View style={styles.statsGrid}>
                <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Victorias</Text>
                    <Text style={styles.statValue}>{data.wins}</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Victorias de 3 coronas</Text>
                    <Text style={styles.statValue}>{data.threeCrownWins}</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Máximo de trofeos</Text>
                    <Text style={styles.statValue}>{data.bestTrophies}</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Cartas encontradas</Text>
                    <Text style={styles.statValue}>121/121</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Donaciones totales</Text>
                    <Text style={styles.statValue}>{data.totalDonations}</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Carta favorita actual</Text>
                    <Text style={styles.statValue}>{data.currentFavouriteCard.name}</Text>
                </View>
            </View>

            <View style={styles.box}>
                <Text style={styles.boxText}>{data.clan.name}</Text>
            </View>

            <View style={styles.statsRow}>
                <View style={styles.statRowBox}>
                    <Text style={styles.statLabel}>Batallas de guerra ganadas</Text>
                    <Text style={styles.statValue}>{data.warDayWins}</Text>
                </View>
                <View style={styles.statRowBox}>
                    <Text style={styles.statLabel}>Rol del clan</Text>
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
        alignItems: 'center',
        justifyContent: 'center'
    },
    sectionTitle: {
        color: "white",
        fontSize: 20,
        marginBottom: 10,
    },
    deckGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        marginBottom: 20,
    },
    cardPlaceholder: {
        width: "23%",
        height: 70,
        backgroundColor: "#3a3a3a",
        borderRadius: 8,
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
        color: "#000",
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
    cardImage: {
        width: "23%",
        height: 70,
        borderRadius: 8,
        marginBottom: 10,
    },
    card: {
        width: 100,
        marginRight: 12,
        backgroundColor: '#ececec',
        borderRadius: 8,
        padding: 6,
        alignItems: 'center',
    },
    image: {
        width: 64,
        height: 64,
        marginBottom: 4,
    },
    cardName: {
        fontWeight: 'bold',
        textAlign: 'center',
    },
    cardLevel: {
        color: '#555',
        fontSize: 12,
    },
});
