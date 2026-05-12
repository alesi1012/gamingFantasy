import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    ActivityIndicator,
    TouchableOpacity,
    Modal,
    Platform,
} from "react-native";
import { useUser } from "../UserContext";
import { useLocalSearchParams } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";


const API_BASE = Platform.OS === "android" ? "http://10.0.2.2:3000" : "http://localhost:3000";

type Carta = {
    id: string;
    name: string;
    elixir: number;
};

type IaData = {
    score: number;
    puntos: number;
    evaluacion: string;
};

type IaResult = {
    mazo: Carta[];
    ia: IaData;
};

export default function Estadistiques() {
    const { user } = useUser();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const params = useLocalSearchParams<{ playerName?: string }>();

    const [iaModalVisible, setIaModalVisible] = useState(false);
    const [iaResult, setIaResult] = useState<IaResult | null>(null);
    const [iaLoading, setIaLoading] = useState(false);

    useEffect(() => {
        async function fetchData() {
            const targetPlayer = params.playerName ?? user?.nombre;

            if (!targetPlayer) {
                setError("No hi ha usuari seleccionat.");
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const res = await fetch(`${API_BASE}/players/${targetPlayer}`);
                if (!res.ok) throw new Error("Usuari no trobat");
                const json = await res.json();
                setData(json);
            } catch (e: any) {
                setError(e.message);
                setData(null);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [user, params.playerName]);

    const analizarMazoIA = async () => {
        if (!user?.id) return;
        setIaLoading(true);
        setIaModalVisible(true);
        try {
            const res = await fetch(`${API_BASE}/analizar-mazo/${user.id}`);
            const json = await res.json();
            setIaResult(json);
        } catch {
            setIaResult({ ia: { score: 0, puntos: 0, evaluacion: "Error en l'anàlisi" }, mazo: [] });
        } finally {
            setIaLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#3B82F6" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.center}>
                <Ionicons name="alert-circle-outline" size={48} color="#EF4444" style={{ marginBottom: 12 }} />
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    const arenaName = data.arena?.name ?? "Desconeguda";
    const clanName = data.clan?.name ?? "Sense clan";
    const favCardName = data.currentFavouriteCard?.name ?? "Cap";

    const scoreColor =
        (iaResult?.ia?.score ?? 0) >= 75
            ? "#22C55E"
            : (iaResult?.ia?.score ?? 0) >= 50
                ? "#F97316"
                : "#EF4444";

    return (
        <View style={styles.screen}>
            <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>

                <View style={styles.playerHeader}>
                    <View style={styles.playerAvatarCircle}>
                        <Ionicons name="person" size={32} color="#3B82F6" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.playerName}>{data.name}</Text>
                        <Text style={styles.playerSub}>
                            <Ionicons name="trophy-outline" size={13} color="#FFD700" /> {data.trophies} trofeus · {arenaName}
                        </Text>
                    </View>
                    <TouchableOpacity style={styles.iaBtn} onPress={analizarMazoIA}>
                        <Ionicons name="flash" size={16} color="#FFD700" />
                        <Text style={styles.iaBtnText}>Anàlisi IA</Text>
                    </TouchableOpacity>
                </View>

                {/* MAZO ACTIU */}
                <Text style={styles.sectionLabel}>Mazo actiu</Text>
                {data.currentDeck?.length > 0 ? (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
                        {data.currentDeck.map((card: any) => (
                            <View key={card.id} style={styles.deckCard}>
                                <Image source={{ uri: card.iconUrls.medium }} style={styles.deckCardImage} />
                                <Text style={styles.deckCardName} numberOfLines={1}>{card.name}</Text>
                                <View style={styles.deckCardLevel}>
                                    <Text style={styles.deckCardLevelText}>Nv. {card.level}</Text>
                                </View>
                            </View>
                        ))}
                    </ScrollView>
                ) : (
                    <View style={[styles.card, { marginBottom: 20, justifyContent: "center", alignItems: "center", paddingVertical: 20 }]}>
                        <Text style={{ color: "#6B8BA4" }}>No hi ha mazo actiu</Text>
                    </View>
                )}

                {/* STATS GRID */}
                <Text style={styles.sectionLabel}>Estadístiques</Text>
                <View style={styles.statsGrid}>
                    {[
                        { label: "Victòries", value: data.wins, icon: "checkmark-circle-outline", color: "#22C55E" },
                        { label: "3 corones", value: data.threeCrownWins, icon: "star-outline", color: "#FFD700" },
                        { label: "Màx. trofeus", value: data.bestTrophies, icon: "trophy-outline", color: "#F97316" },
                        { label: "Donacions", value: data.totalDonations, icon: "gift-outline", color: "#3B82F6" },
                        { label: "Cartes", value: `${data.cards?.length ?? 0}/121`, icon: "layers-outline", color: "#A855F7" },
                        { label: "Favorita", value: favCardName, icon: "heart-outline", color: "#EF4444" },
                    ].map((stat) => (
                        <View key={stat.label} style={styles.statCard}>
                            <Ionicons name={stat.icon as any} size={20} color={stat.color} style={{ marginBottom: 6 }} />
                            <Text style={styles.statValue}>{stat.value}</Text>
                            <Text style={styles.statLabel}>{stat.label}</Text>
                        </View>
                    ))}
                </View>

                {/* CLAN & GUERRA */}
                <Text style={styles.sectionLabel}>Clan</Text>
                <View style={styles.card}>
                    <View style={styles.cardRow}>
                        <Ionicons name="shield-outline" size={18} color="#3B82F6" />
                        <Text style={styles.cardRowText}>{clanName}</Text>
                    </View>
                    <View style={styles.cardRow}>
                        <Ionicons name="ribbon-outline" size={18} color="#FFD700" />
                        <Text style={styles.cardRowText}>Rol: {data.role ?? "—"}</Text>
                    </View>
                    <View style={styles.cardRow}>
                        <Ionicons name="flash-outline" size={18} color="#22C55E" />
                        <Text style={styles.cardRowText}>Guerres guanyades: {data.warDayWins}</Text>
                    </View>
                </View>

            </ScrollView>

            {/* MODAL ANÀLISI IA */}
            <Modal
                visible={iaModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => !iaLoading && setIaModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>⚡ Anàlisi del Mazo</Text>

                        {iaLoading ? (
                            <View style={{ paddingVertical: 40, alignItems: "center" }}>
                                <ActivityIndicator size="large" color="#3B82F6" />
                                <Text style={{ color: "#6B8BA4", marginTop: 12 }}>Analitzant el teu mazo...</Text>
                            </View>
                        ) : (
                            <>
                                {/* SCORE */}
                                <View style={styles.scoreCircleContainer}>
                                    <View style={[styles.scoreCircle, { borderColor: scoreColor }]}>
                                        <Text style={[styles.scoreNumber, { color: scoreColor }]}>
                                            {iaResult?.ia?.score ?? 0}
                                        </Text>
                                        <Text style={styles.scorePercent}>/ 100</Text>
                                    </View>
                                    <View style={styles.scoreMeta}>
                                        <Text style={styles.sectionLabel}>Puntuació IA</Text>
                                        <View style={[styles.puntsBadge, { borderColor: scoreColor }]}>
                                            <Ionicons name="flash" size={13} color={scoreColor} />
                                            <Text style={[styles.puntsBadgeText, { color: scoreColor }]}>
                                                +{iaResult?.ia?.puntos ?? 0} pts
                                            </Text>
                                        </View>
                                    </View>
                                </View>

                                {/* AVALUACIÓ */}
                                <View style={styles.evaluacioBox}>
                                    <Text style={styles.evaluacioText}>
                                        {iaResult?.ia?.evaluacion ?? "Sense avaluació"}
                                    </Text>
                                </View>

                                {/* CARTES DEL MAZO */}
                                {(iaResult?.mazo?.length ?? 0) > 0 && (
                                    <>
                                        <Text style={[styles.sectionLabel, { marginTop: 12 }]}>Cartes analitzades</Text>
                                        {iaResult!.mazo.map((c) => (
                                            <View key={c.id} style={styles.cartaRow}>
                                                <View style={styles.elixirBadge}>
                                                    <Text style={styles.elixirText}>{c.elixir}</Text>
                                                </View>
                                                <Text style={styles.cartaNom}>{c.name}</Text>
                                            </View>
                                        ))}
                                    </>
                                )}

                                <TouchableOpacity
                                    style={[styles.modalBtn, styles.btnCancel, { marginTop: 20 }]}
                                    onPress={() => setIaModalVisible(false)}
                                >
                                    <Text style={styles.btnText}>Tancar</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: "#0A1628" },
    center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0A1628" },
    errorText: { color: "#EF4444", fontSize: 16, textAlign: "center" },
    listContainer: { padding: 16, paddingBottom: 40 },

    playerHeader: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#111D35",
        borderRadius: 14,
        padding: 14,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "#1E3A5F",
        gap: 12,
    },
    playerAvatarCircle: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: "#0A1628",
        borderWidth: 2,
        borderColor: "#3B82F6",
        justifyContent: "center",
        alignItems: "center",
    },
    playerName: { color: "white", fontSize: 18, fontWeight: "700" },
    playerSub: { color: "#6B8BA4", fontSize: 13, marginTop: 3 },

    iaBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        backgroundColor: "#1E2A3A",
        borderWidth: 1,
        borderColor: "#FFD700",
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 10,
    },
    iaBtnText: { color: "#FFD700", fontWeight: "700", fontSize: 12 },

    sectionLabel: {
        color: "#3B82F6",
        fontSize: 13,
        fontWeight: "700",
        textTransform: "uppercase",
        letterSpacing: 0.5,
        marginBottom: 10,
    },

    deckCard: {
        width: 80,
        marginRight: 10,
        backgroundColor: "#111D35",
        borderRadius: 10,
        padding: 8,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#1E3A5F",
    },
    deckCardImage: { width: 52, height: 52, marginBottom: 6 },
    deckCardName: { color: "white", fontSize: 10, fontWeight: "600", textAlign: "center" },
    deckCardLevel: {
        marginTop: 4,
        backgroundColor: "#1E3A5F",
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
    },
    deckCardLevelText: { color: "#6B8BA4", fontSize: 10 },


    statsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
        marginBottom: 20,
    },
    statCard: {
        width: "30.5%",
        backgroundColor: "#111D35",
        borderRadius: 12,
        padding: 12,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#1E3A5F",
    },
    statValue: { color: "white", fontSize: 15, fontWeight: "700", textAlign: "center" },
    statLabel: { color: "#6B8BA4", fontSize: 11, marginTop: 3, textAlign: "center" },


    card: {
        backgroundColor: "#111D35",
        borderRadius: 14,
        padding: 14,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "#1E3A5F",
        gap: 10,
    },
    cardRow: { flexDirection: "row", alignItems: "center", gap: 10 },
    cardRowText: { color: "white", fontSize: 14 },


    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.85)",
        justifyContent: "center",
        padding: 16,
    },
    modalContent: {
        backgroundColor: "#111D35",
        borderRadius: 16,
        padding: 20,
        maxHeight: "90%",
        borderWidth: 1,
        borderColor: "#1E3A5F",
    },
    modalTitle: {
        color: "white",
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center",
    },


    scoreCircleContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
        marginBottom: 16,
    },
    scoreCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 3,
        backgroundColor: "#0A1628",
        justifyContent: "center",
        alignItems: "center",
    },
    scoreNumber: { fontSize: 26, fontWeight: "900" },
    scorePercent: { color: "#6B8BA4", fontSize: 11 },
    scoreMeta: { flex: 1, gap: 8 },
    puntsBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        borderWidth: 1,
        borderRadius: 20,
        paddingVertical: 4,
        paddingHorizontal: 10,
        alignSelf: "flex-start",
    },
    puntsBadgeText: { fontWeight: "700", fontSize: 13 },


    evaluacioBox: {
        backgroundColor: "#0A1628",
        borderRadius: 10,
        padding: 14,
        borderWidth: 1,
        borderColor: "#1E3A5F",
    },
    evaluacioText: { color: "#CBD5E1", fontSize: 14, lineHeight: 22 },


    cartaRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingVertical: 6,
        borderBottomWidth: 1,
        borderBottomColor: "#1E3A5F",
    },
    elixirBadge: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: "#A855F7",
        justifyContent: "center",
        alignItems: "center",
    },
    elixirText: { color: "white", fontWeight: "700", fontSize: 13 },
    cartaNom: { color: "white", fontSize: 14 },


    modalBtn: { padding: 14, borderRadius: 10, alignItems: "center" },
    btnCancel: { backgroundColor: "#1E2A3A", borderWidth: 1, borderColor: "#1E3A5F" },
    btnText: { color: "white", fontWeight: "bold", fontSize: 15 },
});