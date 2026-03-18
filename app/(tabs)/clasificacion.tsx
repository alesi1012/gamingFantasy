import React, { JSX, useEffect, useState, useContext, useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Modal, TextInput, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { LigaContext } from "./_layout";
import { useUser } from "../UserContext";

type Miembro = {
    id: string;
    nombre: string;
    codigo_cr?: string;
    puntos: number;
};

type OpcionApuesta = {
    id: string;
    titulo: string;
    parametros?: {
        tipo: "numero" | "seleccion";
        label: string;
        key: string;
        opciones?: string[];
    }[];
};

type MissionItem = {
    id: string;
    title: string;
    description: string;
    difficulty: string;
    missionType: string | null;
    points: number;
    expires_at: string;
    status: string;
    created_at: string;
    dayKey: string | null;
    ligaId: number | null;
    completed: boolean;
    claimed: boolean;
    expired: boolean;
    claimable: boolean;
    validationType: Record<string, any>;
};

const API_BASE = "http://localhost:3000";

const OPCIONES_APUESTA: OpcionApuesta[] = [
    {
        id: "ganar_partidas_carta",
        titulo: "Ganar X partidas con Y carta",
        parametros: [
            { tipo: "numero", label: "Nº de partidas", key: "partidas" },
            { tipo: "seleccion", label: "Carta", key: "carta", opciones: ["Montapuercos", "P.E.K.K.A", "Barril de Duendes", "Minero", "Globo"] },
        ],
    },
    {
        id: "racha_victorias",
        titulo: "Conseguir una racha de X victorias",
        parametros: [{ tipo: "numero", label: "Victorias seguidas", key: "victorias" }],
    },
    {
        id: "mas_coronas",
        titulo: "Conseguirá más coronas esta semana",
    },
];

export default function Clasificacion(): JSX.Element {
    const params = useLocalSearchParams();
    const router = useRouter();
    const { user } = useUser();
    const { liga: ligaGlobal, setLiga } = useContext(LigaContext);

    const rawLiga =
        typeof params.liga === "string"
            ? params.liga
            : Array.isArray(params.liga)
                ? params.liga[0]
                : null;

    const ligaObj = useMemo(() => {
        if (ligaGlobal) return ligaGlobal;
        if (rawLiga) {
            try {
                return JSON.parse(rawLiga);
            } catch {
                return null;
            }
        }
        return null;
    }, [rawLiga, ligaGlobal]);

    const [miembros, setMiembros] = useState<Miembro[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [modoSeleccion, setModoSeleccion] = useState(false);
    const [seleccionados, setSeleccionados] = useState<Miembro[]>([]);

    const [modalApuestaVisible, setModalApuestaVisible] = useState(false);
    const [miembroApuesta, setMiembroApuesta] = useState<Miembro | null>(null);
    const [opcionElegida, setOpcionElegida] = useState<string | null>(null);
    const [paramsApuesta, setParamsApuesta] = useState<Record<string, string>>({});
    const [cantidadPuntos, setCantidadPuntos] = useState("");

    const [modalRetosVisible, setModalRetosVisible] = useState(false);
    const [missions, setMissions] = useState<MissionItem[]>([]);
    const [loadingMissions, setLoadingMissions] = useState(false);
    const [reclamandoMissionId, setReclamandoMissionId] = useState<string | null>(null);
    const [nowTick, setNowTick] = useState(Date.now());

    function toggleSeleccion(miembro: Miembro) {
        const existe = seleccionados.find((m) => m.id === miembro.id);
        if (existe) setSeleccionados((prev) => prev.filter((m) => m.id !== miembro.id));
        else setSeleccionados((prev) => [...prev, miembro]);
    }

    function abrirModalApuesta(miembro: Miembro) {
        setMiembroApuesta(miembro);
        setOpcionElegida(null);
        setParamsApuesta({});
        setCantidadPuntos("");
        setModalApuestaVisible(true);
    }

    async function abrirModalRetos() {
        setModalRetosVisible(true);
        await cargarMisiones();
    }

    function cerrarModalRetos() {
        if (loadingMissions || reclamandoMissionId) return;
        setModalRetosVisible(false);
    }

    function setParametro(key: string, valor: string) {
        setParamsApuesta((prev) => ({ ...prev, [key]: valor }));
    }

    function salirDeLiga() {
        if (typeof window !== "undefined") {
            const ok = window.confirm("¿Seguro que quieres salir de esta liga?");
            if (ok) confirmarSalida();
            return;
        }

        Alert.alert("Salir de la liga", "¿Seguro que quieres salir de esta liga?", [
            { text: "Cancelar", style: "cancel" },
            { text: "Salir", style: "destructive", onPress: confirmarSalida },
        ]);
    }

    async function confirmarSalida() {
        try {
            if (!ligaObj?.id || !user?.id) {
                Alert.alert("Error", "Datos de usuario o liga no disponibles");
                return;
            }

            const res = await fetch(`${API_BASE}/liga/${ligaObj.id}/salir`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ usuario_id: user.id }),
            });

            if (!res.ok) throw new Error("Error servidor");

            setLiga(null);
            router.replace("/inicio");
        } catch (err) {
            console.error(err);
            Alert.alert("Error", "Error al salir de la liga");
        }
    }

    const apuestaValida = useMemo(() => {
        if (!opcionElegida || !cantidadPuntos || isNaN(Number(cantidadPuntos))) return false;

        const config = OPCIONES_APUESTA.find((o) => o.id === opcionElegida);
        if (config?.parametros) {
            for (const param of config.parametros) {
                if (!paramsApuesta[param.key]) return false;
            }
        }

        return true;
    }, [opcionElegida, paramsApuesta, cantidadPuntos]);

    function confirmarApuesta() {
        if (!apuestaValida || !miembroApuesta) return;

        const config = OPCIONES_APUESTA.find((o) => o.id === opcionElegida);

        console.log({
            retado: miembroApuesta.nombre,
            apuesta: config?.titulo,
            detalles: paramsApuesta,
            puntos: cantidadPuntos,
        });

        Alert.alert("Apuesta enviada", `¡Apuesta enviada a ${miembroApuesta.nombre} por ${cantidadPuntos} puntos!`);
        setModalApuestaVisible(false);
    }

    async function cargarMisiones() {
        try {
            if (!user?.id || !ligaObj?.id) return;

            setLoadingMissions(true);

            const res = await fetch(`${API_BASE}/Reptes/MisMissions/${user.id}/${ligaObj.id}`);
            const text = await res.text();
            let data: any = null;

            try {
                data = text ? JSON.parse(text) : null;
            } catch {
                data = text;
            }

            if (!res.ok) throw new Error(data?.error || data?.message || "No se pudieron cargar las misiones");

            setMissions(data?.missions || []);
        } catch (err: any) {
            console.error("Error cargando misiones:", err);
            Alert.alert("Error", err?.message || "No se pudieron cargar las misiones");
        } finally {
            setLoadingMissions(false);
        }
    }

    async function reclamarMission(mission: MissionItem) {
        try {
            setReclamandoMissionId(mission.id);

            const res = await fetch(`${API_BASE}/Reptes/Reclamar`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ repteId: mission.id }),
            });

            const text = await res.text();
            let data: any = null;

            try {
                data = text ? JSON.parse(text) : null;
            } catch {
                data = text;
            }

            if (!res.ok) throw new Error(data?.error || data?.message || "No se pudieron reclamar los puntos");

            Alert.alert("Puntos reclamados", `Has ganado ${data?.reward ?? mission.points} puntos`);
            await cargarMisiones();
        } catch (err: any) {
            console.error("Error reclamando misión:", err);
            Alert.alert("Error", err?.message || "No se pudieron reclamar los puntos");
        } finally {
            setReclamandoMissionId(null);
        }
    }

    function getTextoBotonMission(mission: MissionItem) {
        if (mission.claimed) return "Reclamado";
        if (mission.expired) return "Caducada";
        if (mission.claimable || mission.completed) return "Reclamar puntos";
        return "En progreso";
    }

    function missionButtonDisabled(mission: MissionItem) {
        if (reclamandoMissionId === mission.id) return true;
        if (mission.claimed) return true;
        if (mission.expired) return true;
        if (!(mission.claimable || mission.completed)) return true;
        return false;
    }

    function getMissionCountdown(expiresAt: string) {
        const diff = new Date(expiresAt).getTime() - nowTick;

        if (diff <= 0) return "00:00:00";

        const totalSeconds = Math.floor(diff / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }

    function getMissionDifficultyLabel(difficulty: string) {
        if (difficulty === "FACIL") return "Común";
        if (difficulty === "MEDIA") return "Especial";
        if (difficulty === "DIFICIL") return "Épica";
        return difficulty;
    }

    function getMissionDifficultyStyle(difficulty: string) {
        if (difficulty === "FACIL") return styles.missionCommon;
        if (difficulty === "MEDIA") return styles.missionSpecial;
        if (difficulty === "DIFICIL") return styles.missionEpic;
        return styles.missionCommon;
    }

    function getMissionProgress(mission: MissionItem) {
        const target = Number(
            mission.validationType?.targetProgress ??
            mission.validationType?.playsCount ??
            mission.validationType?.streakCount ??
            1
        );

        let current = Number(mission.validationType?.currentProgress ?? 0);

        if (mission.completed || mission.claimable || mission.claimed) {
            current = target;
        }

        const safeTarget = target > 0 ? target : 1;
        const safeCurrent = Math.max(0, Math.min(current, safeTarget));
        const percent = Math.max(0, Math.min((safeCurrent / safeTarget) * 100, 100));

        return {
            current: safeCurrent,
            target: safeTarget,
            percent,
        };
    }

    useEffect(() => {
        const fetchMiembros = async () => {
            if (!ligaObj?.id) return;

            setLoading(true);
            setError(null);

            try {
                const res = await fetch(`${API_BASE}/liga/${ligaObj.id}/miembros`);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);

                const data: Miembro[] = await res.json();
                const ordenados = data ? data.slice().sort((a, b) => (b.puntos ?? 0) - (a.puntos ?? 0)) : [];
                setMiembros(ordenados);
            } catch {
                setError("No se pudieron cargar los miembros.");
            } finally {
                setLoading(false);
            }
        };

        fetchMiembros();
    }, [ligaObj?.id]);

    useEffect(() => {
        const interval = setInterval(() => {
            setNowTick(Date.now());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!modalRetosVisible || !user?.id || !ligaObj?.id) return;

        const interval = setInterval(() => {
            cargarMisiones();
        }, 15000);

        return () => clearInterval(interval);
    }, [modalRetosVisible, user?.id, ligaObj?.id]);

    if (!ligaObj) {
        return (
            <View style={styles.center}>
                <Text style={styles.errorText}>Error: no se recibió liga.</Text>
            </View>
        );
    }

    return (
        <View style={styles.screen}>
            <View style={styles.headerRow}>
                <Text style={styles.title}>Clasificación — {ligaObj.nombre}</Text>

                <View style={styles.headerActions}>
                    <TouchableOpacity
                        style={styles.headerBtn}
                        onPress={() => {
                            setModoSeleccion(!modoSeleccion);
                            setSeleccionados([]);
                        }}
                    >
                        <Ionicons name={modoSeleccion ? "close-outline" : "stats-chart-outline"} size={20} color="white" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.headerBtn}
                        onPress={() =>
                            router.push({
                                pathname: "../ChatLiga",
                                params: { ligaId: ligaObj.id },
                            })
                        }
                    >
                        <Ionicons name="chatbubble-ellipses-outline" size={20} color="white" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.headerBtn}
                        onPress={() =>
                            router.push({
                                pathname: "/invitar_liga",
                                params: { liga: JSON.stringify(ligaObj) },
                            })
                        }
                    >
                        <Ionicons name="person-add-outline" size={20} color="white" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.headerBtnDanger} onPress={salirDeLiga}>
                        <Ionicons name="exit-outline" size={20} color="white" />
                    </TouchableOpacity>
                </View>
            </View>

            {loading ? (
                <View style={styles.loadingRow}>
                    <ActivityIndicator size="large" color="#fff" />
                </View>
            ) : error ? (
                <View style={styles.loadingRow}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.listContainer}>
                    {miembros.map((m, idx) => {
                        const esYo = m.id === user?.id || m.nombre === user?.nombre;
                        const seleccionado = seleccionados.some((s) => s.id === m.id);

                        return (
                            <TouchableOpacity
                                key={m.id}
                                onPress={() => {
                                    if (modoSeleccion) toggleSeleccion(m);
                                }}
                                style={[styles.card, esYo ? styles.cardMe : styles.cardOther, seleccionado && styles.cardSelected]}
                                activeOpacity={modoSeleccion ? 0.8 : 1}
                            >
                                <View style={styles.left}>
                                    <View style={styles.positionCircle}>
                                        <Text style={styles.positionText}>{idx + 1}</Text>
                                    </View>

                                    <View style={styles.info}>
                                        <Text style={styles.playerName}>{m.nombre}</Text>
                                        <Text style={styles.playerPoints}>{m.puntos} pts</Text>
                                    </View>
                                </View>

                                {!modoSeleccion && (
                                    <View style={styles.actions}>
                                        {esYo ? (
                                            <TouchableOpacity style={styles.actionBtn} onPress={abrirModalRetos}>
                                                <Ionicons name="flash" size={18} color="#FFD700" />
                                            </TouchableOpacity>
                                        ) : (
                                            <>
                                                <TouchableOpacity style={styles.actionBtn} onPress={() => abrirModalApuesta(m)}>
                                                    <Ionicons name="cash-outline" size={18} color="#4CAF50" />
                                                </TouchableOpacity>

                                                <TouchableOpacity
                                                    style={styles.actionBtn}
                                                    onPress={() => Alert.alert("Stats", `Aquí irían stats o detalles de ${m.nombre}`)}
                                                >
                                                    <Ionicons name="bar-chart-outline" size={18} color="#4FC3F7" />
                                                </TouchableOpacity>
                                            </>
                                        )}

                                        {modoSeleccion && seleccionado && <Ionicons name="checkmark-circle" size={22} color="#FFD700" />}
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            )}

            <Modal visible={modalApuestaVisible} transparent animationType="slide" onRequestClose={() => setModalApuestaVisible(false)}>
                <View style={styles.modalOverlay}>
                    <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Apostar contra {miembroApuesta?.nombre}</Text>

                            <Text style={styles.sectionLabel}>1. Elige el tipo de apuesta</Text>

                            {OPCIONES_APUESTA.map((opcion) => {
                                const isSelected = opcionElegida === opcion.id;

                                return (
                                    <View key={opcion.id} style={[styles.optionContainer, isSelected && styles.optionContainerSelected]}>
                                        <TouchableOpacity
                                            style={styles.optionHeader}
                                            onPress={() => {
                                                setOpcionElegida(opcion.id);
                                                setParamsApuesta({});
                                            }}
                                        >
                                            <View style={styles.radioBtn}>{isSelected && <View style={styles.radioInner} />}</View>
                                            <Text style={styles.optionText}>{opcion.titulo}</Text>
                                        </TouchableOpacity>

                                        {isSelected && opcion.parametros && (
                                            <View style={styles.subOptionsContainer}>
                                                {opcion.parametros.map((param) => (
                                                    <View key={param.key} style={styles.paramRow}>
                                                        <Text style={styles.paramLabel}>{param.label}:</Text>

                                                        {param.tipo === "numero" ? (
                                                            <TextInput
                                                                style={styles.paramInput}
                                                                keyboardType="numeric"
                                                                value={paramsApuesta[param.key] || ""}
                                                                onChangeText={(val) => setParametro(param.key, val)}
                                                            />
                                                        ) : (
                                                            <View style={styles.chipsContainer}>
                                                                {param.opciones?.map((opt) => (
                                                                    <TouchableOpacity
                                                                        key={opt}
                                                                        style={[styles.chip, paramsApuesta[param.key] === opt && styles.chipSelected]}
                                                                        onPress={() => setParametro(param.key, opt)}
                                                                    >
                                                                        <Text style={styles.chipText}>{opt}</Text>
                                                                    </TouchableOpacity>
                                                                ))}
                                                            </View>
                                                        )}
                                                    </View>
                                                ))}
                                            </View>
                                        )}
                                    </View>
                                );
                            })}

                            <Text style={styles.sectionLabel}>2. ¿Cuántos puntos apuestas?</Text>
                            <TextInput
                                style={styles.puntosInput}
                                keyboardType="numeric"
                                value={cantidadPuntos}
                                onChangeText={setCantidadPuntos}
                                placeholder="Ej: 20"
                                placeholderTextColor="#888"
                            />

                            <View style={styles.modalActions}>
                                <TouchableOpacity style={[styles.modalBtn, styles.btnCancel]} onPress={() => setModalApuestaVisible(false)}>
                                    <Text style={styles.btnText}>Cancelar</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.modalBtn, styles.btnConfirm, !apuestaValida && styles.btnDisabled]}
                                    onPress={confirmarApuesta}
                                    disabled={!apuestaValida}
                                >
                                    <Text style={styles.btnText}>Confirmar</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </Modal>

            <Modal visible={modalRetosVisible} transparent animationType="slide" onRequestClose={cerrarModalRetos}>
                <View style={styles.modalOverlay}>
                    <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Misiones del día</Text>

                            {loadingMissions ? (
                                <View style={styles.loadingMissionsBox}>
                                    <ActivityIndicator size="large" color="#fff" />
                                </View>
                            ) : missions.length === 0 ? (
                                <Text style={styles.emptyText}>No hay misiones disponibles.</Text>
                            ) : (
                                missions.map((mission) => {
                                    const progress = getMissionProgress(mission);

                                    return (
                                        <View key={mission.id} style={styles.retoCard}>
                                            <View style={styles.retoTopRow}>
                                                <Text style={styles.retoTitle}>{mission.title}</Text>
                                                <Text style={styles.retoPoints}>+{mission.points} pts</Text>
                                            </View>

                                            <Text style={[styles.missionBadge, getMissionDifficultyStyle(mission.difficulty)]}>
                                                {getMissionDifficultyLabel(mission.difficulty)}
                                            </Text>

                                            <Text style={styles.retoDescription}>{mission.description}</Text>

                                            <View style={styles.progressBarContainer}>
                                                <View style={[styles.progressBarFill, { width: `${progress.percent}%` }]} />
                                                <Text style={styles.progressBarText}>{progress.current}/{progress.target}</Text>
                                            </View>

                                            <Text style={styles.missionMeta}>Tiempo restante: {getMissionCountdown(mission.expires_at)}</Text>
                                            <Text style={styles.missionMeta}>
                                                Estado: {mission.claimed ? "Reclamada" : mission.expired ? "Caducada" : mission.completed ? "Completada" : "En progreso"}
                                            </Text>

                                            <TouchableOpacity
                                                style={[styles.retoButton, missionButtonDisabled(mission) && styles.btnDisabled]}
                                                onPress={() => reclamarMission(mission)}
                                                disabled={missionButtonDisabled(mission)}
                                            >
                                                <Text style={styles.btnText}>
                                                    {reclamandoMissionId === mission.id ? "Reclamando..." : getTextoBotonMission(mission)}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    );
                                })
                            )}

                            <View style={styles.modalActions}>
                                <TouchableOpacity style={[styles.modalBtn, styles.btnCancel]} onPress={cerrarModalRetos} disabled={loadingMissions || !!reclamandoMissionId}>
                                    <Text style={styles.btnText}>Cerrar</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </Modal>

            {modoSeleccion && seleccionados.length > 1 && (
                <TouchableOpacity
                    style={styles.compareButton}
                    onPress={() =>
                        router.push({
                            pathname: "/estadistiquesMultiUser",
                            params: { usuarios: seleccionados.map((u) => u.nombre).join(",") },
                        })
                    }
                >
                    <Text style={styles.compareText}>Comparar {seleccionados.length} jugadores</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: "#000", paddingTop: 20, paddingHorizontal: 16 },
    headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12, gap: 12 },
    headerActions: { flexDirection: "row", alignItems: "center", gap: 8 },
    title: { color: "white", fontSize: 22, fontWeight: "700", flex: 1 },
    headerBtn: { backgroundColor: "#3684B5", padding: 8, borderRadius: 8 },
    headerBtnDanger: { backgroundColor: "#C62828", padding: 8, borderRadius: 8 },
    loadingRow: { marginTop: 20, alignItems: "center" },
    center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000" },
    errorText: { color: "#ff6666", fontSize: 16 },
    listContainer: { paddingBottom: 80, gap: 12 },
    card: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 12, borderRadius: 12 },
    cardMe: { backgroundColor: "#2E3BFF" },
    cardOther: { backgroundColor: "#1565C0" },
    cardSelected: { borderWidth: 2, borderColor: "#FFD700" },
    left: { flexDirection: "row", alignItems: "center", flex: 1 },
    positionCircle: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#fff", justifyContent: "center", alignItems: "center", marginRight: 12 },
    positionText: { fontWeight: "700" },
    info: { flexShrink: 1 },
    playerName: { color: "white", fontSize: 16, fontWeight: "600" },
    playerPoints: { color: "#e0e0e0", fontSize: 13 },
    actions: { flexDirection: "row", alignItems: "center" },
    actionBtn: { padding: 8, marginLeft: 8, backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 8 },
    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "center", padding: 16 },
    modalContent: { backgroundColor: "#1e1e1e", borderRadius: 16, padding: 20, maxHeight: "90%" },
    modalTitle: { color: "white", fontSize: 22, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
    sectionLabel: { color: "#FFD700", fontSize: 16, fontWeight: "bold", marginTop: 10, marginBottom: 12 },
    optionContainer: { backgroundColor: "#2a2a2a", borderRadius: 10, marginBottom: 10, overflow: "hidden", borderWidth: 1, borderColor: "transparent" },
    optionContainerSelected: { borderColor: "#4CAF50" },
    optionHeader: { flexDirection: "row", alignItems: "center", padding: 14 },
    radioBtn: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: "#4CAF50", marginRight: 12, justifyContent: "center", alignItems: "center" },
    radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#4CAF50" },
    optionText: { color: "white", fontSize: 15, flexShrink: 1, fontWeight: "500" },
    subOptionsContainer: { backgroundColor: "#222", padding: 12, borderTopWidth: 1, borderTopColor: "#333" },
    paramRow: { marginBottom: 12 },
    paramLabel: { color: "#ccc", fontSize: 14, marginBottom: 6 },
    paramInput: { backgroundColor: "#111", color: "white", padding: 10, borderRadius: 8, borderWidth: 1, borderColor: "#444" },
    chipsContainer: { flexDirection: "row", flexWrap: "wrap" },
    chip: { backgroundColor: "#333", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, marginRight: 8, marginBottom: 8, borderWidth: 1, borderColor: "#444" },
    chipSelected: { backgroundColor: "rgba(76, 175, 80, 0.2)", borderColor: "#4CAF50" },
    chipText: { color: "white", fontSize: 13 },
    puntosInput: { backgroundColor: "#2a2a2a", color: "#4CAF50", fontSize: 24, fontWeight: "bold", padding: 16, borderRadius: 10, textAlign: "center", marginBottom: 10, borderWidth: 1, borderColor: "#444" },
    modalActions: { flexDirection: "row", justifyContent: "space-between", marginTop: 20, gap: 12 },
    modalBtn: { flex: 1, padding: 14, borderRadius: 10, alignItems: "center" },
    btnCancel: { backgroundColor: "#444" },
    btnConfirm: { backgroundColor: "#4CAF50" },
    btnDisabled: { opacity: 0.5 },
    btnText: { color: "white", fontWeight: "bold", fontSize: 16 },
    compareButton: { position: "absolute", bottom: 20, left: 20, right: 20, backgroundColor: "#9C27B0", padding: 16, borderRadius: 12, alignItems: "center" },
    compareText: { color: "white", fontWeight: "bold", fontSize: 16 },
    retoCard: { backgroundColor: "#2a2a2a", borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: "#3a3a3a" },
    retoTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 8 },
    retoTitle: { color: "white", fontSize: 16, fontWeight: "700", flex: 1 },
    retoPoints: { color: "#FFD700", fontSize: 14, fontWeight: "700" },
    retoDescription: { color: "#d0d0d0", fontSize: 14, lineHeight: 20, marginBottom: 12 },
    retoButton: { backgroundColor: "#FF9800", paddingVertical: 12, borderRadius: 10, alignItems: "center", marginTop: 12 },
    missionMeta: { color: "#bdbdbd", fontSize: 13, marginTop: 4 },
    loadingMissionsBox: { paddingVertical: 30, alignItems: "center" },
    emptyText: { color: "#ccc", textAlign: "center", marginVertical: 20 },
    missionBadge: { alignSelf: "flex-start", paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999, color: "white", fontWeight: "700", fontSize: 12, marginBottom: 10 },
    missionCommon: { backgroundColor: "#2196F3" },
    missionSpecial: { backgroundColor: "#FF9800" },
    missionEpic: { backgroundColor: "#9C27B0" },
    progressBarContainer: {
        height: 24,
        backgroundColor: "#111",
        borderRadius: 999,
        overflow: "hidden",
        justifyContent: "center",
        marginBottom: 12,
        position: "relative",
    },
    progressBarFill: {
        position: "absolute",
        left: 0,
        top: 0,
        bottom: 0,
        backgroundColor: "#4CAF50",
        borderRadius: 999,
    },
    progressBarText: {
        color: "white",
        fontWeight: "700",
        textAlign: "center",
        zIndex: 2,
    },
});