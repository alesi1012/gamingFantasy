import { useLocalSearchParams } from "expo-router";
import { useUser } from "./UserContext";
import { io } from "socket.io-client";
import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";

import { Platform } from "react-native";

const API_BASE = Platform.OS === "android" ? "http://10.0.2.2:3000" : "http://localhost:3000";

const socket = io(API_BASE);

export default function ChatLiga() {
    type Mensaje = {
        id: number;
        liga_id: number;
        usuario_id: string;
        usuario_nombre: string;
        mensaje: string;
        created_at?: string;
    };

    const { ligaId } = useLocalSearchParams();
    const { user } = useUser();

    const [mensajes, setMensajes] = useState<Mensaje[]>([]);
    const [texto, setTexto] = useState("");

    useEffect(() => {
        if (!ligaId) return;

        socket.emit("join_liga", ligaId);

        socket.on("cargar_mensajes", (mensajesDB) => {
            setMensajes(mensajesDB);
        });

        socket.on("nuevo_mensaje", (msg) => {
            setMensajes(prev => [...prev, msg]);
        });

        return () => {
            socket.off("cargar_mensajes");
            socket.off("nuevo_mensaje");
        };
    }, [ligaId]);

    const enviar = () => {
        if (!texto.trim()) return;

        socket.emit("enviar_mensaje", {
            ligaId,
            usuarioId: user?.id,
            usuarioNombre: user?.nombre,
            mensaje: texto
        });

        setTexto("");
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <FlatList
                data={mensajes}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{ padding: 16, paddingBottom: 90 }}
                renderItem={({ item }) => (
                    <View
                        style={[
                            styles.bubble,
                            item.usuario_id === user?.id ? styles.bubbleMe : styles.bubbleOther,
                        ]}
                    >
                        <Text style={styles.username}>{item.usuario_nombre}</Text>
                        <Text style={styles.messageText}>{item.mensaje}</Text>
                        {item.created_at && (
                            <Text style={styles.timeText}>
                                {new Date(item.created_at).toLocaleTimeString()}
                            </Text>
                        )}
                    </View>
                )}
            />

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={texto}
                    onChangeText={setTexto}
                    placeholder="Escribe algo..."
                    placeholderTextColor="#777"
                />
                <TouchableOpacity
                    onPress={enviar}
                    style={[styles.sendButton, !texto.trim() && styles.sendButtonDisabled]}
                    disabled={!texto.trim()}
                >
                    <Ionicons name="send" size={18} color="white" />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0D0D0D",
    },

    list: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 90,
    },

    messageRow: {
        flexDirection: "row",
        marginBottom: 14,
        alignItems: "flex-end",
    },

    messageRowMe: {
        justifyContent: "flex-end",
    },

    messageRowOther: {
        justifyContent: "flex-start",
    },

    avatar: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: "#1F1F1F",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 8,
    },

    avatarText: {
        color: "#4CAF50",
        fontWeight: "bold",
        fontSize: 14,
    },

    bubble: {
        maxWidth: "75%",
        padding: 12,
        borderRadius: 14,
        marginTop: 10,
    },

    bubbleMe: {
        backgroundColor: "#1E3A8A",
        borderBottomRightRadius: 4,
        alignSelf: "flex-end",
    },

    bubbleOther: {
        backgroundColor: "#1A1A1A",
        borderBottomLeftRadius: 4,
        alignSelf: "flex-start",
        borderWidth: 1,
        borderColor: "#2A2A2A",
    },

    username: {
        fontSize: 12,
        fontWeight: "600",
        marginBottom: 4,
        color: "#4CAF50",
    },

    usernameMe: {
        color: "#0D0D0D",
    },

    messageText: {
        color: "white",
        fontSize: 15,
        lineHeight: 20,
    },

    messageTextMe: {
        color: "#0D0D0D",
    },

    timeText: {
        fontSize: 10,
        marginTop: 4,
        color: "#555",
        alignSelf: "flex-end",
    },

    timeTextMe: {
        color: "#7A9CC8",
    },

    inputContainer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: "#121212",
        borderTopWidth: 1,
        borderTopColor: "#222",
    },

    input: {
        flex: 1,
        backgroundColor: "#1E1E1E",
        color: "white",
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 20,
        fontSize: 15,
        marginRight: 10,
        borderWidth: 1,
        borderColor: "#2A2A2A",
    },

    sendButton: {
        backgroundColor: "#1E3A8A",
        width: 42,
        height: 42,
        borderRadius: 21,
        justifyContent: "center",
        alignItems: "center",
    },

    sendButtonDisabled: {
        backgroundColor: "#1E3A8A",
        opacity: 0.3,
    },
});