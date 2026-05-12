import React, { useEffect, useState, useContext } from 'react';
import { View, Text, TouchableOpacity, StatusBar, Platform, StyleSheet, ScrollView, Modal, TextInput } from 'react-native';
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { LigaContext } from "./_layout";
import { useUser } from "../UserContext";

const isWeb = Platform.OS === 'web';
const API_URL = Platform.OS === "android" ? "http://10.0.2.2:3000" : "http://localhost:3000";

export default function Inicio() {
    const [ligas, setLigas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [ligaSeleccionada, setLigaSeleccionada] = useState(null);
    const router = useRouter();

    const { setLiga } = useContext(LigaContext);
    const { user, logout } = useUser();

    const [modalCrearVisible, setModalCrearVisible] = useState(false);
    const [nombreNuevaLiga, setNombreNuevaLiga] = useState("");

    const [modalUnirseVisible, setModalUnirseVisible] = useState(false);
    const [codigoLiga, setCodigoLiga] = useState("");
    const [refreshKey, setRefreshKey] = useState(0);

    const fetchLigas = async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/mis-ligas-id/${user.id}`);
            if (!res.ok) {
                alert('Error al cargar ligas');
                setLoading(false);
                return;
            }
            const data = await res.json();
            setLigas(data);
            setLigaSeleccionada(data[0] || null);
            if (data[0]) setLiga(data[0]);
        } catch (error: any) {
            alert('Error de red: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.id) fetchLigas();
    }, [user?.id, refreshKey]);

    const confirmarCrearLiga = async () => {
        if (!nombreNuevaLiga.trim()) {
            alert("Debes ingresar un nombre válido");
            return;
        }
        setModalCrearVisible(false);
        try {
            const res = await fetch(`${API_URL}/crear-liga`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nombre: nombreNuevaLiga.trim(), usuario_id: user?.id }),
            });
            if (!res.ok) {
                const errorData = await res.json();
                alert("Error: " + (errorData.error?.message || "No se pudo crear la liga"));
                return;
            }
            const data = await res.json();
            alert("Liga creada: " + data.liga.nombre);
            setRefreshKey(prev => prev + 1);
            const resPoints = await fetch(`${API_URL}/player/${user?.nombre}/${nombreNuevaLiga.trim()}/points`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ usuario_id: user?.nombre, nombre: nombreNuevaLiga.trim() }),
            });
            if (!resPoints.ok) {
                const errorData = await resPoints.json();
                console.log("Error asignando puntos:", errorData);
            }
        } catch (error: any) {
            alert("Error de red: " + error.message);
        }
    };

    const confirmarUnirseLiga = async () => {
        if (!codigoLiga.trim()) {
            alert("Debes ingresar un código válido");
            return;
        }
        setModalUnirseVisible(false);
        try {
            const res = await fetch(`${API_URL}/unirse-liga`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ usuario_id: user?.id, codigo_liga: codigoLiga.trim().toUpperCase() }),
            });
            const data = await res.json();
            if (!res.ok) {
                alert(data.error || "Error al unirse");
                return;
            }
            alert("Te uniste a la liga correctamente");
            setRefreshKey(prev => prev + 1);
        } catch (err: any) {
            alert("Error de red: " + err.message);
        }
    };

    const irAClasificacion = (liga: any) => {
        setLigaSeleccionada(liga);
        setLiga(liga);
        router.push(`/clasificacion?liga=${encodeURIComponent(JSON.stringify(liga))}` as any);
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#0A1628' }}>
            <StatusBar backgroundColor="#0A1628" barStyle="light-content" />

            {/* HEADER */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Fantasy Gamer</Text>
                {user && (
                    <TouchableOpacity
                        style={styles.logoutButton}
                        onPress={() => { logout(); alert('Sesión cerrada'); router.replace('/'); }}
                    >
                        <Ionicons name="log-out-outline" size={16} color="white" style={{ marginRight: 4 }} />
                        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 13 }}>Salir</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* BOTONES */}
            <View style={styles.actionsRow}>
                <TouchableOpacity
                    style={styles.buton1}
                    onPress={() => { setCodigoLiga(""); setModalUnirseVisible(true); }}
                >
                    <Ionicons name="enter-outline" size={16} color="white" style={{ marginRight: 6 }} />
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>Unirse a liga</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.buton2}
                    onPress={() => { setNombreNuevaLiga(""); setModalCrearVisible(true); }}
                >
                    <Ionicons name="add-circle-outline" size={16} color="white" style={{ marginRight: 6 }} />
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>Crear liga</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.container}>
                {loading ? (
                    <Text style={{ color: '#6B8BA4', textAlign: 'center', marginTop: 20 }}>Cargando ligas...</Text>
                ) : ligas.length === 0 ? (
                    <View style={styles.emptyBox}>
                        <Ionicons name="trophy-outline" size={40} color="#6B8BA4" />
                        <Text style={{ color: '#6B8BA4', marginTop: 12, fontSize: 15 }}>No tienes ligas aún.</Text>
                    </View>
                ) : (
                    ligas.map((liga: any, index) => {
                        const isSelected = ligaSeleccionada?.id === liga.id;
                        return (
                            <TouchableOpacity
                                key={liga.id || index}
                                style={[styles.card, isSelected ? styles.cardSelected : styles.cardBlue]}
                                onPress={() => { setLigaSeleccionada(liga); setLiga(liga); }}
                            >
                                <View style={styles.infoContainer}>
                                    <View style={[styles.avatar, { backgroundColor: isSelected ? "#3B82F6" : "#1E3A5F" }]}>
                                        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 14 }}>
                                            {liga.nombre?.[0]?.toUpperCase() ?? "L"}
                                        </Text>
                                    </View>
                                    <View>
                                        <Text style={[styles.title, { color: 'white' }]}>{liga.nombre}</Text>
                                        <Text style={[styles.subtitle, { color: '#6B8BA4' }]}>
                                            👥 {liga.miembros}/14 · 🏆 {liga.puntos} pts
                                        </Text>
                                    </View>
                                </View>
                                <TouchableOpacity onPress={() => irAClasificacion(liga)} style={styles.statsButton}>
                                    <Ionicons name="stats-chart" size={18} color={isSelected ? "#3B82F6" : "#6B8BA4"} />
                                </TouchableOpacity>
                            </TouchableOpacity>
                        );
                    })
                )}
            </ScrollView>

            {/* Modal Crear Liga */}
            <Modal visible={modalCrearVisible} transparent={true} animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Crear nueva liga</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Nombre de la liga..."
                            placeholderTextColor="#888"
                            value={nombreNuevaLiga}
                            onChangeText={setNombreNuevaLiga}
                            autoFocus
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.btnCancel} onPress={() => setModalCrearVisible(false)}>
                                <Text style={styles.btnText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.btnConfirm} onPress={confirmarCrearLiga}>
                                <Text style={styles.btnText}>Crear</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Modal Unirse a Liga */}
            <Modal visible={modalUnirseVisible} transparent={true} animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Unirse a una liga</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ej: ABC123XYZ"
                            placeholderTextColor="#888"
                            value={codigoLiga}
                            onChangeText={setCodigoLiga}
                            autoCapitalize="characters"
                            autoFocus
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.btnCancel} onPress={() => setModalUnirseVisible(false)}>
                                <Text style={styles.btnText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.btnConfirm} onPress={confirmarUnirseLiga}>
                                <Text style={styles.btnText}>Unirse</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 12,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 26,
        fontWeight: 'bold',
        letterSpacing: 0.3,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#7F1D1D',
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 8,
    },
    actionsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    buton1: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#111D35',
        paddingVertical: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#1E3A5F',
    },
    buton2: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#3B82F6',
        paddingVertical: 12,
        borderRadius: 10,
    },
    container: {
        paddingHorizontal: 20,
        paddingBottom: 32,
        gap: 12,
    },
    emptyBox: {
        alignItems: 'center',
        marginTop: 60,
    },
    card: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#1E3A5F',
    },
    cardSelected: {
        backgroundColor: "#111D35",
        borderColor: "#3B82F6",
    },
    cardBlue: {
        backgroundColor: "#111D35",
        borderColor: "#1E3A5F",
    },
    infoContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    avatar: {
        width: 38,
        height: 38,
        borderRadius: 19,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 15,
        fontWeight: "600",
        color: 'white',
    },
    subtitle: {
        fontSize: 12,
        color: '#6B8BA4',
        marginTop: 2,
    },
    statsButton: {
        padding: 8,
        backgroundColor: '#0A1628',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#1E3A5F',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.75)",
        justifyContent: "center",
        padding: 24,
    },
    modalContent: {
        backgroundColor: "#111D35",
        borderRadius: 16,
        padding: 24,
        borderWidth: 1,
        borderColor: '#1E3A5F',
    },
    modalTitle: {
        color: "white",
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 16,
        textAlign: "center",
    },
    input: {
        backgroundColor: "#0A1628",
        color: "white",
        borderWidth: 1,
        borderColor: "#1E3A5F",
        padding: 14,
        borderRadius: 10,
        fontSize: 16,
        marginBottom: 20,
    },
    modalButtons: {
        flexDirection: "row",
        gap: 12,
    },
    btnCancel: {
        flex: 1,
        backgroundColor: "#1E2A3A",
        padding: 14,
        borderRadius: 10,
        alignItems: "center",
        borderWidth: 1,
        borderColor: '#1E3A5F',
    },
    btnConfirm: {
        flex: 1,
        backgroundColor: "#3B82F6",
        padding: 14,
        borderRadius: 10,
        alignItems: "center",
    },
    btnText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 15,
    },
});