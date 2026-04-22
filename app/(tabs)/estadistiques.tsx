import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, ScrollView, ActivityIndicator, TouchableOpacity, Modal } from "react-native";
import { useUser } from "../UserContext";
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
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estado para IA
    const [iaModalVisible, setIaModalVisible] = useState(false);
    const [iaResult, setIaResult] = useState<IaResult | null>(null);
    const [iaLoading, setIaLoading] = useState(false);

    // Fetch datos del jugador
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
                if (!res.ok) throw new Error("Usuario no encontrado o sin código CR");
                const json = await res.json();
                setData(json);
            } catch (e) {
                setError(e.message);
                setData(null);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [user]);

    // Función para llamar a la IA
    const analizarMazoIA = async () => {
        if (!user?.id) return;
        setIaLoading(true);
        setIaModalVisible(true);
        try {
            const res = await fetch(`http://localhost:3000/analizar-mazo/${user.id}`);
            const json = await res.json();
            setIaResult(json);
        } catch (err) {
            setIaResult({ ia: { score: 0, evaluacion: "Error ❌" }, mazo: [] });
        } finally {
            setIaLoading(false);
        }
    };

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
                <Text style={{ color: "white", fontSize: 16 }}>{error}</Text>
            </View>
        );
    }

    const arenaName = data.arena?.name ?? "Desconocida";
    const clanName = data.clan?.name ?? "Sin clan";
    const favCardName = data.currentFavouriteCard?.name ?? "Ninguna";

    return (
        <ScrollView style={styles.container}>
            {/* Botón IA */}
            <TouchableOpacity style={styles.iaButton} onPress={analizarMazoIA}>
                <Text style={styles.iaButtonText}>Analizar Mazo 🧠</Text>
            </TouchableOpacity>

            {/* Modal IA */}
            <Modal
                visible={iaModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setIaModalVisible(false)}
            >
                <View style={styles.modalBackground}>
                    <View style={styles.modalContainer}>
                        {iaLoading ? (
                            <ActivityIndicator size="large" color="#4B0082" />
                        ) : (
                            <>
                                <Text style={styles.title}>Resultado IA</Text>

                                <Text style={styles.score}>
                                    Score: {iaResult?.ia?.score ?? 0}%
                                </Text>

                                <Text style={styles.score}>
                                    Puntos: {iaResult?.ia?.puntos ?? 0}
                                </Text>

                                <Text style={styles.evaluacion}>
                                    {iaResult?.ia?.evaluacion ?? "Sin evaluación"}
                                </Text>

                                {iaResult?.mazo?.length > 0 ? (
                                    <>
                                        <Text style={styles.subTitle}>Cartas en el mazo:</Text>
                                        {iaResult.mazo.map((c) => (
                                            <Text key={c.id} style={styles.carta}>
                                                {c.name} (Elixir: {c.elixir})
                                            </Text>
                                        ))}
                                    </>
                                ) : (
                                    <Text>No hay mazo disponible</Text>
                                )}

                                <TouchableOpacity
                                    style={styles.closeButton}
                                    onPress={() => setIaModalVisible(false)}
                                >
                                    <Text style={styles.closeButtonText}>Cerrar</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            </Modal>

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

            {/* Stats y demás */}
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
                    <Text style={styles.statValue}>{data.cards ? data.cards.length : 0}/121</Text>
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
    container: { flex: 1, backgroundColor: "#1e1e1e", padding: 16 },
    title: { fontSize: 28, fontWeight: "bold", color: "white", marginBottom: 20 },
    sectionTitle: { color: "white", fontSize: 20, marginBottom: 10 },
    box: { backgroundColor: "#263fa0", padding: 16, borderRadius: 12, marginBottom: 20 },
    boxText: { color: "white", fontSize: 18 },
    statsGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginBottom: 20 },
    statBox: { width: "48%", backgroundColor: "#ececec", borderRadius: 12, padding: 14, marginBottom: 12 },
    statLabel: { fontSize: 14, color: "#444" },
    statValue: { fontSize: 18, fontWeight: "bold" },
    statsRow: { flexDirection: "row", justifyContent: "space-between" },
    statRowBox: { width: "48%", backgroundColor: "#ececec", padding: 14, borderRadius: 12 },
    card: { width: 100, marginRight: 12, backgroundColor: "#ececec", borderRadius: 8, padding: 6, alignItems: "center" },
    image: { width: 64, height: 64, marginBottom: 4 },
    cardName: { fontWeight: "bold", textAlign: "center" },
    cardLevel: { color: "#555", fontSize: 12 },


    iaButton: { backgroundColor: "#4B0082", padding: 12, borderRadius: 12, alignItems: "center", marginBottom: 20 },
    iaButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
    modalBackground: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
    modalContainer: { width: "80%", backgroundColor: "#fff", borderRadius: 20, padding: 20, alignItems: "center" },
    score: { fontSize: 18, marginBottom: 5 },
    evaluacion: { fontSize: 16, marginBottom: 10 },
    subTitle: { fontWeight: "bold", marginBottom: 5 },
    carta: { fontSize: 14 },
    closeButton: { marginTop: 20, backgroundColor: "#FF4500", paddingVertical: 8, paddingHorizontal: 16, borderRadius: 10 },
    closeButtonText: { color: "#fff", fontWeight: "bold" },
});