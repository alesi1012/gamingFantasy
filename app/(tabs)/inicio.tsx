import React, { useEffect, useState, useContext } from 'react';
import { View, Text, TouchableOpacity, StatusBar, Platform, StyleSheet, ScrollView } from 'react-native';
import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from '@react-navigation/native';
import { useRouter } from "expo-router";
import { LigaContext } from "./_layout";  // CONTEXT GLOBAL

const isWeb = Platform.OS === 'web';

export default function Inicio() {
    const [ligas, setLigas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [ligaSeleccionada, setLigaSeleccionada] = useState(null);

    const navigation = useNavigation();
    const router = useRouter();

    const { setLiga } = useContext(LigaContext);

    const usuarioId = "34d84e35-c84c-4590-8331-3d8e5318f42d";

    const fetchLigas = async () => {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:3000/mis-ligas/${usuarioId}`);
            if (!res.ok) {
                alert('Error al cargar ligas');
                setLoading(false);
                return;
            }

            const data = await res.json();
            setLigas(data);
            setLigaSeleccionada(data[0] || null);

            // Guardar también en global si existe
            if (data[0]) setLiga(data[0]);

        } catch (error) {
            alert('Error de red: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLigas();
    }, []);

    const crearLiga = async () => {
        let nombreLiga: string | null = "";

        if (isWeb) {
            nombreLiga = window.prompt("Ingresa el nombre de la nueva liga:");
            if (!nombreLiga) {
                alert("Debes ingresar un nombre válido");
                return;
            }
        } else {
            alert('Implementa modal para móvil');
            return;
        }

        try {
            const res = await fetch("http://localhost:3000/crear-liga", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nombre: nombreLiga,
                    usuario_id: usuarioId,
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                alert("Error: " + (errorData.error?.message || "No se pudo crear la liga"));
                return;
            }

            const data = await res.json();
            alert("Liga creada: " + data.liga.nombre);
            fetchLigas();
        } catch (error) {
            alert("Error de red: " + error.message);
        }
    };

    // NUEVA VERSIÓN — guarda en context + mantiene params para compatibilidad
    const irAClasificacion = (liga) => {
        setLigaSeleccionada(liga);
        setLiga(liga);  // GUARDAR GLOBALMENTE

        router.push({
            pathname: "/(tabs)/clasificacion",
            params: { liga: JSON.stringify(liga) }
        });
    };

    return (
        <View style={{ flex: 1, backgroundColor: 'black' }}>
            <StatusBar backgroundColor={'#000'} />

            <View style={{ alignItems: 'center', marginTop: 20 }}>
                <Text style={{ color: '#fff', fontSize: 32, fontWeight: 'bold' }}>
                    Fantasy Gamer
                </Text>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'center', marginVertical: 20 }}>
                <TouchableOpacity style={styles.buton1} onPress={() => alert('Unirse')}>
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>Unirse a una liga</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.buton2} onPress={crearLiga}>
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>Crear liga</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.container}>
                {loading ? (
                    <Text style={{ color: 'white', textAlign: 'center' }}>Cargando ligas...</Text>
                ) : ligas.length === 0 ? (
                    <Text style={{ color: 'white', textAlign: 'center' }}>No tienes ligas.</Text>
                ) : (
                    ligas.map((liga, index) => {
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
        </View>
    );
}

const styles = StyleSheet.create({
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
});
