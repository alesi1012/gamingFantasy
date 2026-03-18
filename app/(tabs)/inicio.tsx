import React, { useEffect, useState, useContext } from 'react';
import { View, Text, TouchableOpacity, StatusBar, Platform, StyleSheet, ScrollView, Modal, TextInput } from 'react-native';
import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from "expo-router";
import { LigaContext } from "./_layout";
import { useUser } from "../UserContext";

const isWeb = Platform.OS === 'web';

export default function Inicio() {
    const [ligas, setLigas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [ligaSeleccionada, setLigaSeleccionada] = useState(null);
    const router = useRouter();

    const { setLiga } = useContext(LigaContext);
    const { user, logout } = useUser();

    // Estados para los Modals
    const [modalCrearVisible, setModalCrearVisible] = useState(false);
    const [nombreNuevaLiga, setNombreNuevaLiga] = useState("");

    const [modalUnirseVisible, setModalUnirseVisible] = useState(false);
    const [codigoLiga, setCodigoLiga] = useState("");
    const [refreshKey, setRefreshKey] = useState(0);

    const fetchLigas = async () => {
        if (!user?.id) return;

        setLoading(true);
        try {
            const res = await fetch(`http://localhost:3000/mis-ligas-id/${user.id}`);
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
        if (user?.id) {
            fetchLigas();
        }
    }, [user?.id, refreshKey]);

    const confirmarCrearLiga = async () => {
        if (!nombreNuevaLiga.trim()) {
            alert("Debes ingresar un nombre válido");
            return;
        }

        setModalCrearVisible(false);

        try {
            const res = await fetch("http://localhost:3000/crear-liga", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nombre: nombreNuevaLiga.trim(),
                    usuario_id: user?.id,
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                alert("Error: " + (errorData.error?.message || "No se pudo crear la liga"));
                return;
            }

            const data = await res.json();
            alert("Liga creada: " + data.liga.nombre);
            setRefreshKey(prev => prev + 1);

            const resPoints = await fetch(`http://localhost:3000/player/${user?.nombre}/${nombreNuevaLiga.trim()}/points`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    usuario_id: user?.nombre,
                    nombre: nombreNuevaLiga.trim()
                }),
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
            const res = await fetch("http://localhost:3000/unirse-liga", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    usuario_id: user?.id,
                    codigo_liga: codigoLiga.trim().toUpperCase(),
                }),
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
        <View style={{ flex: 1, backgroundColor: 'black' }}>
            <StatusBar backgroundColor={'#000'} />

            <View style={{ alignItems: 'center', marginTop: 20, marginBottom: 10 }}>
                <Text style={{ color: '#fff', fontSize: 32, fontWeight: 'bold' }}>
                    Fantasy Gamer
                </Text>

                {user && (
                    <TouchableOpacity
                        style={styles.logoutButton}
                        onPress={() => {
                            logout();
                            alert('Sesión cerrada');
                            router.replace('/');
                        }}
                    >
                        <Text style={{ color: 'white', fontWeight: 'bold' }}>Cerrar sesión</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* ⭐ BOTONES RESTAURADOS A TUS ESTILOS ORIGINALES */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginVertical: 20 }}>
                <TouchableOpacity style={styles.buton1} onPress={() => { setCodigoLiga(""); setModalUnirseVisible(true); }}>
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>Unirse a una liga</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.buton2} onPress={() => { setNombreNuevaLiga(""); setModalCrearVisible(true); }}>
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>Crear liga</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.container}>
                {loading ? (
                    <Text style={{ color: 'white', textAlign: 'center' }}>Cargando ligas...</Text>
                ) : ligas.length === 0 ? (
                    <Text style={{ color: 'white', textAlign: 'center' }}>No tienes ligas.</Text>
                ) : (
                    ligas.map((liga: any, index) => {
                        const isSelected = ligaSeleccionada?.id === liga.id;

                        return (
                            <TouchableOpacity
                                key={liga.id || index}
                                style={[styles.card, isSelected ? styles.cardSelected : styles.cardBlue]}
                                onPress={() => {
                                    setLigaSeleccionada(liga);
                                    setLiga(liga);
                                }}
                            >
                                <View style={styles.infoContainer}>
                                    <View style={[styles.avatar, { backgroundColor: isSelected ? "#ccc" : "#0D47A1" }]} />
                                    <View>
                                        <Text style={[styles.title, !isSelected && { color: 'white' }]}>{liga.nombre}</Text>
                                        <Text style={[styles.subtitle, !isSelected && { color: 'white' }]}>
                                            Miembros: {liga.miembros}/14  Pts: {liga.puntos}
                                        </Text>
                                    </View>
                                </View>

                                <TouchableOpacity onPress={() => irAClasificacion(liga)}>
                                    <Ionicons name="stats-chart" size={24} color={isSelected ? "#555" : "white"} />
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
    // ⭐ ESTILOS ORIGINALES RESTAURADOS
    buton1: {
        backgroundColor: '#3684B5',
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 8,
        marginRight: isWeb ? 400 : 80,
    },
    buton2: {
        backgroundColor: '#3684B5',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 8,
        width: 150,
        justifyContent: 'center',
        alignItems: 'center'
    },
    container: {
        padding: 20,
        gap: 20,
    },
    card: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
        borderRadius: 12,
        backgroundColor: "#fff",
        elevation: 3,
        marginBottom: 12,
    },
    cardSelected: {
        borderWidth: 2,
        borderColor: "#9C27B0",
        backgroundColor: "white"
    },
    cardBlue: {
        backgroundColor: "#1565C0",
    },
    infoContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
    },
    title: {
        fontSize: 16,
        fontWeight: "600",
    },
    subtitle: {
        fontSize: 12,
        opacity: 0.7,
    },
    logoutButton: {
        marginTop: 10,
        backgroundColor: '#d33',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 8,
    },

    // Estilos de los Modals
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.7)",
        justifyContent: "center",
        padding: 20,
    },
    modalContent: {
        backgroundColor: "#1e1e1e",
        borderRadius: 16,
        padding: 24,
    },
    modalTitle: {
        color: "white",
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 16,
        textAlign: "center"
    },
    input: {
        backgroundColor: "#111",
        color: "white",
        borderWidth: 1,
        borderColor: "#444",
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
        backgroundColor: "#444",
        padding: 14,
        borderRadius: 10,
        alignItems: "center",
    },
    btnConfirm: {
        flex: 1,
        backgroundColor: "#3684B5",
        padding: 14,
        borderRadius: 10,
        alignItems: "center",
    },
    btnText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 16,
    },
});