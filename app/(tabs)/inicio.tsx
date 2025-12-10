import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StatusBar, Platform, StyleSheet, ScrollView } from 'react-native';
import Ionicons from "@expo/vector-icons/Ionicons";

const isWeb = Platform.OS === 'web';

export default function Inicio() {
    const [ligas, setLigas] = useState([]);
    const [loading, setLoading] = useState(false);

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
        let nombreLiga = '';

        if (isWeb) {
            nombreLiga = window.prompt("Ingresa el nombre de la nueva liga:");
            if (!nombreLiga) {
                alert("Debes ingresar un nombre válido");
                return;
            }
        } else {
            alert('Implementa un modal para pedir nombre de liga en móvil');
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


    return (
        <View style={{ flex: 1, backgroundColor: 'black' }}>
            <StatusBar backgroundColor={'#000'} />
            <View style={{ alignItems: 'center', marginTop: 20 }}>
                <Text style={{ color: '#fff', fontSize: 32, fontWeight: 'bold' }}>
                    Fantasy Gamer
                </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginVertical: 20 }}>
                <TouchableOpacity
                    style={styles.buton1}
                    onPress={() => alert('Botón 1 presionado')}
                >
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>Unirse a una liga</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.buton2}
                    onPress={crearLiga}
                >
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>Crear liga</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.container}>
                {loading ? (
                    <Text style={{ color: 'white', textAlign: 'center' }}>Cargando ligas...</Text>
                ) : ligas.length === 0 ? (
                    <Text style={{ color: 'white', textAlign: 'center' }}>No tienes ligas.</Text>
                ) : (
                    ligas.map((liga, index) => (
                        <TouchableOpacity
                            key={liga.id || index}
                            style={[styles.card, index === 0 ? styles.cardSelected : styles.cardBlue]}
                            onPress={() => alert(`Entrando a ${liga.nombre}`)}
                        >
                            <View style={styles.infoContainer}>
                                <View style={[styles.avatar, { backgroundColor: index === 0 ? "#ccc" : "#0D47A1" }]} />
                                <View>
                                    <Text style={[styles.title, index === 0 ? {} : { color: 'white' }]}>{liga.nombre}</Text>
                                    <Text style={[styles.subtitle, index === 0 ? {} : { color: 'white' }]}>
                                        {/* Aquí podrías agregar datos reales, por ejemplo número de usuarios y puntos */}
                                        Miembros: {liga.miembros}/14 Pts: {liga.puntos}
                                    </Text>
                                </View>
                            </View>
                            <Ionicons name="stats-chart" size={24} color={index === 0 ? "#555" : "white"} />
                        </TouchableOpacity>
                    ))
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
        backgroundColor: "#ccc",
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
