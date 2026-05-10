import React, { JSX, useEffect, useState, useContext, useMemo } from "react";
import { View, Text, Alert, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Modal, TextInput, Platform } from "react-native";
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
    categoria: "CARDS" | "TROPHIES" | "ELIXIR";
    parametros?: {
        tipo: "numero" | "seleccion";
        label: string;
        key: string;
        opciones?: { label: string; value: string }[];
        dependsOn?: { key: string; value: string };
    }[];
};

const OPCIONES_TEMPS = [
    { label: "1 Hora", value: "1" },
    { label: "12 Hores", value: "12" },
    { label: "24 Hores", value: "24" },
    { label: "3 Dies", value: "72" },
    { label: "1 Setmana", value: "168" },
];

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

const MAPA_CARTES: Record<number, string> = {
    // --- TROPES (260000...) ---
    26000000: "Knight",
    26000001: "Archers",
    26000002: "Goblins",
    26000003: "Giant",
    26000004: "P.E.K.K.A",
    26000005: "Minions",
    26000006: "Balloon",
    26000007: "Witch",
    26000008: "Barbarians",
    26000009: "Golem",
    26000010: "Skeletons",
    26000011: "Valkyrie",
    26000012: "Skeleton Army",
    26000013: "Bomber",
    26000014: "Musketeer",
    26000015: "Baby Dragon",
    26000016: "Prince",
    26000017: "Wizard",
    26000018: "Mini P.E.K.K.A",
    26000019: "Spear Goblins",
    26000020: "Giant Skeleton",
    26000021: "Hog Rider",
    26000022: "Minion Horde",
    26000023: "Ice Wizard",
    26000024: "Royal Giant",
    26000025: "Guards",
    26000026: "Princess",
    26000027: "Dark Prince",
    26000028: "Three Musketeers",
    26000029: "Lava Hound",
    26000030: "Ice Spirit",
    26000031: "Fire Spirit",
    26000032: "Miner",
    26000033: "Sparky",
    26000034: "Bowler",
    26000035: "Lumberjack",
    26000036: "Battle Ram",
    26000037: "Inferno Dragon",
    26000038: "Ice Golem",
    26000039: "Mega Minion",
    26000040: "Dart Goblin",
    26000041: "Goblin Gang",
    26000042: "Electro Wizard",
    26000043: "Elite Barbarians",
    26000044: "Hunter",
    26000045: "Executioner",
    26000046: "Bandit",
    26000047: "Royal Recruits",
    26000048: "Night Witch",
    26000049: "Bats",
    26000050: "Royal Ghost",
    26000051: "Ram Rider",
    26000052: "Zappies",
    26000053: "Rascals",
    26000054: "Cannon Cart",
    26000055: "Mega Knight",
    26000056: "Skeleton Barrel",
    26000057: "Flying Machine",
    26000058: "Wall Breakers",
    26000059: "Royal Hogs",
    26000060: "Goblin Giant",
    26000061: "Fisherman",
    26000062: "Magic Archer",
    26000063: "Electro Dragon",
    26000064: "Firecracker",
    26000065: "Mighty Miner",
    26000067: "Elixir Golem",
    26000068: "Battle Healer",
    26000069: "Skeleton King",
    26000072: "Archer Queen",
    26000074: "Golden Knight",
    26000077: "Monk",
    26000080: "Skeleton Dragons",
    26000081: "Heal Spirit",
    26000083: "Mother Witch",
    26000084: "Electro Spirit",
    26000085: "Electro Giant",
    26000087: "Phoenix",
    26000093: "Little Prince",
    26000095: "Goblin Demolisher",
    26000096: "Goblin Machine",
    26000097: "Suspicious Bush",
    26000099: "Goblinstein",
    26000101: "Rune Giant",
    26000102: "Berserker",
    26000103: "Boss Bandit",

    // --- ESTRUCTURES (270000...) ---
    27000000: "Cannon",
    27000001: "Goblin Hut",
    27000002: "Mortar",
    27000003: "Inferno Tower",
    27000004: "Bomb Tower",
    27000005: "Barbarian Hut",
    27000006: "Tombstone",
    27000007: "Elixir Collector",
    27000008: "X-Bow",
    27000009: "Tesla",
    27000010: "Furnace",
    27000012: "Goblin Cage",
    27000013: "Goblin Drill",

    // --- ENCISOS (280000...) ---
    28000000: "Fireball",
    28000001: "Arrows",
    28000002: "Rage",
    28000003: "Rocket",
    28000004: "Goblin Barrel",
    28000005: "Freeze",
    28000006: "Mirror",
    28000007: "Lightning",
    28000008: "Zap",
    28000009: "Poison",
    28000010: "Graveyard",
    28000011: "The Log",
    28000012: "Tornado",
    28000013: "Clone",
    28000014: "Earthquake",
    28000015: "Barbarian Barrel",
    28000017: "Giant Snowball",
    28000018: "Royal Delivery",
    28000021: "Void",
    28000022: "Goblin Curse"
};

const OPCIONES_APUESTA: OpcionApuesta[] = [
    {
        id: "1",
        titulo: "Repte de Cartes",
        categoria: "CARDS",
        parametros: [
            {
                tipo: "seleccion",
                label: "Objectiu",
                key: "actionType",
                opciones: [{ label: "Guanyar amb", value: "WIN" }, { label: "Jugar amb", value: "PLAY" }]
            },
            { tipo: "numero", label: "Nº de partides", key: "playsCount" },
            {
                tipo: "seleccion",
                label: "Carta",
                key: "cardId",
                opciones: Object.entries(MAPA_CARTES).map(([id, name]) => ({ label: name, value: id.toString() }))
            },
        ],
    },
    {
        id: "2",
        titulo: "Repte de Trofeus",
        categoria: "TROPHIES",
        parametros: [
            {
                tipo: "seleccion",
                label: "Tipus de repte",
                key: "trophyMode",
                opciones: [{ label: "Guanyar X trofeus", value: "GAIN" }, { label: "Arribar a X trofeus", value: "REACH" }]
            },
            { tipo: "numero", label: "Quantitat de trofeus", key: "trophyTarget" },
        ],
    },
    {
        id: "3",
        titulo: "Repte d'Elixir",
        categoria: "ELIXIR",
        parametros: [
            {
                tipo: "seleccion",
                label: "Tipus",
                key: "elixirMode",
                opciones: [{ label: "Sense malgastar (per partida)", value: "PER_MATCH" }, { label: "Malgastar en total", value: "TOTAL" }]
            },
            // Aquests dos només es mostren si trien "PER_MATCH"
            { tipo: "numero", label: "Nº de partides", key: "playsCount", dependsOn: { key: "elixirMode", value: "PER_MATCH" } },
            { tipo: "numero", label: "Límit d'elixir a malgastar (per partida)", key: "elixirLimit", dependsOn: { key: "elixirMode", value: "PER_MATCH" } },
            // Aquest només es mostra si trien "TOTAL"
            { tipo: "numero", label: "Elixir a malgastar en total", key: "totalElixir", dependsOn: { key: "elixirMode", value: "TOTAL" } },
        ],
    },
];

export default function Clasificacion(): JSX.Element {
    const params = useLocalSearchParams();
    const router = useRouter();
    const { user } = useUser();
    const { liga: ligaGlobal, setLiga } = useContext(LigaContext);
    const [tempsLimit, setTempsLimit] = useState<string>("24");

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
    const [modalApostesActivesVisible, setModalApostesActivesVisible] = useState(false);
    const [apostesActives, setApostesActives] = useState<any[]>([]);
    const [loadingApostes, setLoadingApostes] = useState(false);

    const [reptesFinalitzats, setReptesFinalitzats] = useState<any[]>([]);

    const [modalRetosVisible, setModalRetosVisible] = useState(false);
    const [missions, setMissions] = useState<MissionItem[]>([]);
    const [loadingMissions, setLoadingMissions] = useState(false);
    const [reclamandoMissionId, setReclamandoMissionId] = useState<string | null>(null);
    const [nowTick, setNowTick] = useState(Date.now());

    const [modalPendentsVisible, setModalPendentsVisible] = useState(false);
    const [reptesPendents, setReptesPendents] = useState<any[]>([]);
    const [filtroCarta, setFiltroCarta] = useState("");

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
        setTempsLimit("24");
        setFiltroCarta("");
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
        if (!opcionElegida || !cantidadPuntos || isNaN(Number(cantidadPuntos)) || !tempsLimit) return false;

        const config = OPCIONES_APUESTA.find((o) => o.id === opcionElegida);
        if (config?.parametros) {
            for (const param of config.parametros) {
                if (param.dependsOn && paramsApuesta[param.dependsOn.key] !== param.dependsOn.value) {
                    continue;
                }
                if (!paramsApuesta[param.key]) return false;
            }
        }

        return true;
    }, [opcionElegida, paramsApuesta, cantidadPuntos, tempsLimit]);

    async function carregarReptesPendents(autoOpen = false) {
        if (!user?.id || !ligaObj?.id) return;

        try {
            const response = await fetch(`${API_BASE}/Reptes/Pendents/${user.id}`);
            const data = await response.json();

            console.log("[LOG] Reptes rebuts del servidor:", data.length);

            const filteredData = data.filter((r: any) => {
                const challengerId = r.challenger_id || r.challenger?.id;
                const repteLigaId = r.liga_id || r.league_id;

                const noEsMeu = challengerId !== user.id;
                const esDeLaLligaActual = String(repteLigaId) === String(ligaObj.id);

                // LOG DE DEBUG PER A CADA REPTE
                console.log(`[DEBUG REPTE ${r.id}]`, {
                    repteLigaId: repteLigaId,
                    lligaActual: ligaObj.id,
                    coincideix: esDeLaLligaActual,
                    noEsMeu: noEsMeu
                });

                return noEsMeu && esDeLaLligaActual;
            });

            console.log("[LOG] Reptes després del filtre de lliga:", filteredData.length);
            setReptesPendents(filteredData);

            // ... resta del codi
        } catch (error: any) {
            console.error("Error carregant reptes pendents:", error.message);
        }
    }

// 2. La teva funció actualitzada
    function generarDescripcioRepte(repte: any): string {
        if (!repte) return "⚠️ Repte no definit";

        // Extraiem les dades i la categoria base amb seguretat
        const dades = repte.specific_validation_data || {};
        const base = Array.isArray(repte.base_challenges)
            ? repte.base_challenges[0]
            : repte.base_challenges;

        const categoria = base?.validation_category;

        switch (categoria) {
            case 'CARDS': {
                const cardName = dades.cardId
                    ? (MAPA_CARTES[dades.cardId] || `Carta (${dades.cardId})`)
                    : "una carta";

                const accio = dades.actionType === 'WIN' ? "Guanyar" : "Jugar";
                const count = dades.playsCount || dades.amount || 1;
                const plural = count === 1 ? "partida" : "partides";

                return `${accio} ${count} ${plural} utilitzant la carta ${cardName}.`;
            }

            case 'TROPHIES': {
                if (dades.trophyMode === 'GAIN') {
                    return `Guanyar un total de ${dades.trophyTarget} trofeus en partides PvP.`;
                }
                return `Arribar a la xifra de ${dades.trophyTarget} trofeus abans que s'acabi el temps.`;
            }

            case 'ELIXIR': {
                if (dades.elixirMode === 'TOTAL') {
                    return `Malgastar més de ${dades.totalElixir} gotes d'elixir en total.`;
                }

                const count = dades.playsCount || 1;
                const plural = count === 1 ? "partida" : "partides";
                return `Guanyar ${count} ${plural} sense malgastar més de ${dades.elixirLimit} d'elixir en cadascuna.`;
            }

            default:
                return base?.name || "Repte especial";
        }
    }

    async function respondreRepte(repteId: number, accio: "ACCEPTED" | "DECLINED") {
        console.log(`[FRONTEND] Responent al repte ${repteId} amb acció: ${accio}`);
        try {
            const response = await fetch(`${API_BASE}/Reptes/Respondre`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    repteId,
                    accio,
                    userId: user?.id
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || "Error en respondre al repte");
            }

            setReptesPendents((prev) => prev.filter((r) => r.id !== repteId));

            if (accio === "ACCEPTED") {
                await cargarMisiones();
            }

            Alert.alert("Èxit", data.message);

            if (reptesPendents.length <= 1) {
                setModalPendentsVisible(false);
            }

        } catch (error: any) {
            console.error("Error responent:", error);
            Alert.alert("Error", error.message);
        }
    }

    async function confirmarApuesta() {
        if (!apuestaValida || !miembroApuesta || !user) {
            console.log("[FRONTEND] Intent de confirmar aposta no vàlida", { apuestaValida, miembroApuesta, user: !!user });
            return;
        }

        const puntsApostats = Number(cantidadPuntos);

        const elsMeusPunts = Number(ligaObj.puntos || 0);
        const puntsRival = Number(miembroApuesta.puntos || 0);

        if (puntsApostats > elsMeusPunts) {
            console.log("[FRONTEND] Saldo insuficient 💸");

            const titol = "Saldo insuficient 💸";
            const missatge = "No tens prou punts per fer aquesta aposta.";

            if (Platform.OS === 'web') {
                window.alert(`${titol}\n\n${missatge}`);
            } else {
                Alert.alert(titol, missatge);
            }
            return;
        }

        if (puntsApostats > puntsRival) {
            console.log("[FRONTEND] Aposta massa alta 🛑");

            const titol = "Aposta massa alta 🛑";
            const missatge = `El rival només té ${puntsRival} punts. No li pots apostar més del que pot pagar!`;

            if (Platform.OS === 'web') {
                window.alert(`${titol}\n\n${missatge}`);
            } else {
                Alert.alert(titol, missatge);
            }
            return;
        }
        // ==========================================

        const config = OPCIONES_APUESTA.find((o) => o.id === opcionElegida);
        if (!config) return;

        console.log(`[FRONTEND] Preparant aposta de categoria: ${config.categoria}`);

        let validationType: Record<string, any> = {};

        if (config.categoria === "CARDS") {
            validationType = {
                actionType: paramsApuesta.actionType,
                playsCount: Number(paramsApuesta.playsCount),
                cardId: Number(paramsApuesta.cardId)
            };
        } else if (config.categoria === "TROPHIES") {
            validationType = {
                trophyMode: paramsApuesta.trophyMode,
                trophyTarget: Number(paramsApuesta.trophyTarget)
            };
        } else if (config.categoria === "ELIXIR") {
            validationType = {
                elixirMode: paramsApuesta.elixirMode,
                ...(paramsApuesta.elixirMode === "PER_MATCH" && {
                    playsCount: Number(paramsApuesta.playsCount),
                    elixirLimit: Number(paramsApuesta.elixirLimit)
                }),
                ...(paramsApuesta.elixirMode === "TOTAL" && {
                    totalElixir: Number(paramsApuesta.totalElixir)
                })
            };
        }

        const timeoutHours = Number(tempsLimit);
        const ara = new Date();
        const tempsFinal = new Date(ara.getTime() + (timeoutHours * 60 * 60 * 1000));
        const timeoutDate = tempsFinal.toISOString().slice(0, -1);

        const payload = {
            retador: user.id,
            retat: miembroApuesta.id,
            repteBase: Number(config.id),
            validationType: validationType,
            reward: puntsApostats, // Utilitzem la variable numèrica d'abans
            timeout: timeoutDate,
            liga_id: ligaObj.id
        };

        console.log("[LOG] Creant repte amb la lliga:", ligaObj.id);

        try {
            console.log("[FRONTEND] 1. Enviant petició al backend...");

            const res = await fetch(`${API_BASE}/Reptes/Crear`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            console.log(`[FRONTEND] 2. Resposta rebuda! Status Code: ${res.status}`);

            const data = await res.json();
            console.log("[FRONTEND] 3. Dades rebudes del backend:", data);

            // Si el backend diu que no hi ha èxit o l'status és 400, saltem a l'error
            if (!res.ok || !data.success) {
                console.log("[FRONTEND] 4. Detectat error del backend, forçant salt al catch...");
                throw new Error(data.error || "No s'ha pogut crear el repte");
            }

            // Si tot va bé:
            Alert.alert("Repte enviat! ⚔️", `Has reptat a ${miembroApuesta.nombre} per ${puntsApostats} punts!`);
            setModalApuestaVisible(false);

        } catch (error: any) {
            console.error("[FRONTEND] 5. CAIGUT AL CATCH! L'error és:", error.message);

            // AQUESTA ÉS L'ALERTA QUE HAURIA DE SORTIR A LA PANTALLA:
            Alert.alert("Acció no permesa 🛑", error.message);
        }
    }

    async function cargarApostesActives() {
        try {
            if (!user?.id || !ligaObj?.id) return;
            setLoadingApostes(true);

            // ATENCIÓ: L'endpoint ha de ser el que retorna els reptes de la taula 'challenges_log'
            // Si no el tens creat al backend, l'haurem de revisar.
            const res = await fetch(`${API_BASE}/Reptes/MisApostesActives/${user.id}/${ligaObj.id}`);
            const data = await res.json();

            if (res.ok) {
                setApostesActives(data.apostes || []);
                console.log("Apostes actives carregades:", data.apostes);
            }

            console.log("=============== DEBUG MISSIONS ===============");
            console.log(JSON.stringify(data?.missions, null, 2));
            console.log("==============================================");

        } catch (err) {
            console.error("Error carregant apostes:", err);
        } finally {
            setLoadingApostes(false);
        }
    }


    function obtenirTempsRestant(expiresAt: string): string {
        const ara = new Date();
        const fi = new Date(expiresAt);
        const diferenciaMs = fi.getTime() - ara.getTime();

        // Si ja ha passat de l'hora
        if (diferenciaMs <= 0) {
            return "Fora de temps";
        }

        const totalMinuts = Math.floor(diferenciaMs / 60000);
        const dies = Math.floor(totalMinuts / (60 * 24));
        const hores = Math.floor((totalMinuts % (60 * 24)) / 60);
        const minuts = totalMinuts % 60;

        // Retornem el format bonic segons el temps que queda
        if (dies > 0) {
            return `Queden ${dies}d i ${hores}h`;
        }
        if (hores > 0) {
            return `Queden ${hores}h i ${minuts}m`;
        }
        return `Queden ${minuts}m`;
    }

     function obtenirObjectiuRepte(repte: any): number {
        if (!repte) return 1; // Evitem dividir per zero més endavant

        const dades = repte.specific_validation_data || {};
        const base = Array.isArray(repte.base_challenges)
            ? repte.base_challenges[0]
            : repte.base_challenges;

        const categoria = base?.validation_category;

        switch (categoria) {
            case 'CARDS':
                return dades.playsCount || dades.amount || 1;

            case 'TROPHIES':
                return dades.trophyTarget || 1;

            case 'ELIXIR':
                if (dades.elixirMode === 'TOTAL') {
                    return dades.totalElixir || 1;
                }
                return dades.playsCount || 1;

            default:
                return 1;
        }
    }

     function calcularPercentatgeBarra(valorActual: number, objectiu: number): number {
        if (objectiu <= 0) return 0;

        const percentatge = (valorActual / objectiu) * 100;

        return Math.min(Math.floor(percentatge), 100);
    }

    const eliminarApostaVisualIBD = async (repteId: string) => {
        try {
            // 1. Cridem al backend per esborrar-ho de Supabase
            const response = await fetch(`${API_BASE}/Reptes/${repteId}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (data.success) {
                // 2. Si s'ha esborrat de la BD, l'eliminem del state de React
                setApostesActives((prevApostes) =>
                    prevApostes.filter((aposta) => aposta.id !== repteId)
                );
                console.log(`[FRONTEND] Aposta ${repteId} eliminada correctament.`);
            } else {
                console.error("[FRONTEND] Error esborrant l'aposta:", data.error);
            }
        } catch (err) {
            console.error("[FRONTEND] Error global en eliminar:", err);
        }
    };

    const entendreRepteAcabat = (repteId: any) => {
        setReptesFinalitzats((prev) => prev.filter((r) => r.id !== repteId));
    };

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

    const fetchMiembros = async () => {
        if (!ligaObj?.id) return;

        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`${API_BASE}/liga/${ligaObj.id}/miembros`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const data = await res.json();
            const ordenados = data ? data.slice().sort((a: { puntos: any; }, b: { puntos: any; }) => (b.puntos ?? 0) - (a.puntos ?? 0)) : [];
            setMiembros(ordenados);
        } catch {
            setError("No se pudieron cargar los miembros.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMiembros();
    }, [ligaObj?.id]);

    // Comprovar reptes pendents periòdicament
    useEffect(() => {
        if (!user?.id) return;

        // Primera càrrega (amb autoOpen habilitat)
        carregarReptesPendents(true);

        const interval = setInterval(() => {
            // Polling per veure si hi ha nous reptes
            carregarReptesPendents(true);
        }, 15000);

        return () => clearInterval(interval);
    }, [user?.id]);

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

    const comprovarTotesLesApostes = async () => {
        const apostesFiltrades = apostesActives.filter(a =>
            String(a.liga_id || a.league_id) === String(ligaObj.id)
        );

        console.log(`[DEBUG FRONTEND] Apostes filtrades per lliga ${ligaObj.id}: ${apostesFiltrades.length}`);
        setLoadingApostes(true);

        let sHanRepartitPunts = false; // <-- El nostre xivato

        try {
            const apostesActualitzades = await Promise.all(
                apostesFiltrades.map(async (aposta) => {
                    if (aposta.isSuccess) return aposta;

                    try {
                        const response = await fetch(`${API_BASE}/Reptes/Validar`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ repteId: aposta.id })
                        });

                        const data = await response.json();

                        if (data.success) {
                            // SI EL REPTE S'HA TANCAT (Per èxit o caducitat), marquem el xivato
                            if (data.isSuccess || data.isExpired) {
                                sHanRepartitPunts = true;
                            }

                            return {
                                ...aposta,
                                currentProgress: data.currentProgress,
                                isSuccess: data.isSuccess,
                                liga_id: aposta.liga_id
                            };
                        }
                        return aposta;
                    } catch (err) {
                        return aposta;
                    }
                })
            );

            setApostesActives(apostesActualitzades);

            // ==========================================
            // LA MÀGIA: Refrescar el rànquing automàticament
            // ==========================================
            if (sHanRepartitPunts) {
                console.log("[FRONTEND] Alguna aposta ha finalitzat! Refrescant el rànquing...");
                await fetchMiembros();
            }

        } catch (error) {
            console.error("[DEBUG FRONTEND] Error global sincronitzant:", error);
        } finally {
            setLoadingApostes(false);
        }
    };

    return (
        <View style={styles.screen}>
            <View style={styles.headerRow}>
                <Text style={styles.title}>Clasificación — {ligaObj.nombre}</Text>

                <View style={styles.headerActions}>

                    {/* BOTÓ DE NOTIFICACIONS / REPTES PENDENTS */}
                    <TouchableOpacity
                        style={styles.headerBtn}
                        onPress={async () => {
                            await carregarReptesPendents(); // Refresquem dades
                            setModalPendentsVisible(true);  // Sempre l'obrim si és manual
                        }}
                    >
                        <Ionicons
                            name={reptesPendents.length > 0 ? "notifications" : "notifications-outline"}
                            size={20}
                            color={reptesPendents.length > 0 ? "#FFD700" : "white"}
                        />
                        {reptesPendents.length > 0 && (
                            <View style={{
                                position: 'absolute', top: -2, right: -2,
                                backgroundColor: 'red', width: 10, height: 10, borderRadius: 5
                            }}/>
                        )}
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
                                            <>
                                            <TouchableOpacity style={styles.actionBtn} onPress={abrirModalRetos}>
                                                <Ionicons name="flash" size={18} color="#FFD700" />
                                            </TouchableOpacity>
                                            
                                            <TouchableOpacity style={styles.actionBtn} onPress={() =>{ 
                                                setModalApostesActivesVisible(true);
                                                cargarApostesActives();
                                            }}>
                                                <Ionicons name="shield-half-outline" size={18} color="#0288d1" />

                                                {/* Detall del globus vermell si tens apostes (opcional) */}
                                                {missions && missions.length > 0 && (
                                                    <View style={{
                                                        position: 'absolute', top: -5, right: -5,
                                                        backgroundColor: 'red', borderRadius: 8, width: 14, height: 14,
                                                        justifyContent: 'center', alignItems: 'center'
                                                    }}>
                                                        <Text style={{ color: 'white', fontSize: 9, fontWeight: 'bold' }}>
                                                            {missions.length}
                                                        </Text>
                                                    </View>
                                                )}
                                            </TouchableOpacity>
                                            </>
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

                            {/* --- INICI DEL BUCLE D'OPCIONS --- */}
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
                                                {opcion.parametros
                                                    .filter(param => !param.dependsOn || paramsApuesta[param.dependsOn.key] === param.dependsOn.value)
                                                    .map((param) => (
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
                                                                <>
                                                                    {param.key === "cardId" && (
                                                                        <TextInput
                                                                            style={[styles.paramInput, { marginBottom: 10, fontSize: 14 }]}
                                                                            placeholder="Cerca una carta..."
                                                                            placeholderTextColor="#888"
                                                                            value={filtroCarta}
                                                                            onChangeText={setFiltroCarta}
                                                                        />
                                                                    )}
                                                                    <ScrollView style={{ maxHeight: 80 }} nestedScrollEnabled={true}>
                                                                        <View style={styles.chipsContainer}>
                                                                            {param.opciones
                                                                                ?.filter(opt =>
                                                                                    param.key !== "cardId" ||
                                                                                    opt.label.toLowerCase().includes(filtroCarta.toLowerCase())
                                                                                )
                                                                                .map((opt) => (
                                                                                    <TouchableOpacity
                                                                                        key={opt.value}
                                                                                        style={[styles.chip, paramsApuesta[param.key] === opt.value && styles.chipSelected]}
                                                                                        onPress={() => setParametro(param.key, opt.value)}
                                                                                    >
                                                                                        <Text style={styles.chipText}>{opt.label}</Text>
                                                                                    </TouchableOpacity>
                                                                                ))}
                                                                        </View>
                                                                    </ScrollView>
                                                                </>
                                                            )}
                                                        </View>
                                                    ))}
                                            </View>
                                        )}
                                    </View>
                                );
                            })}
                            {/* --- FI DEL BUCLE D'OPCIONS --- */}

                            {/* --- APARTATS GLOBALS (FORA DEL BUCLE) --- */}
                            <Text style={styles.sectionLabel}>2. Temps límit per complir-ho</Text>
                            <View style={styles.chipsContainer}>
                                {OPCIONES_TEMPS.map((opt) => (
                                    <TouchableOpacity
                                        key={opt.value}
                                        style={[styles.chip, tempsLimit === opt.value && styles.chipSelected]}
                                        onPress={() => setTempsLimit(opt.value)}
                                    >
                                        <Text style={styles.chipText}>{opt.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={styles.sectionLabel}>3. ¿Quants punts apostes?</Text>
                            <TextInput
                                style={styles.puntosInput}
                                keyboardType="numeric"
                                value={cantidadPuntos}
                                onChangeText={setCantidadPuntos}
                                placeholder="Ex: 20"
                                placeholderTextColor="#888"
                            />

                            {/* --- BOTONS D'ACCIÓ --- */}
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

            <Modal
                visible={modalApostesActivesVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setModalApostesActivesVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { maxHeight: '85%', width: '90%', maxWidth: 450, alignSelf: 'center' }]}>

                        {/* CAPÇALERA DEL MODAL */}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 15 }}>
                            <Text style={[styles.modalTitle, { marginBottom: 0 }]}>⚔️ Apostes Actives</Text>

                            <TouchableOpacity onPress={comprovarTotesLesApostes} style={{ padding: 5 }} disabled={loadingApostes}>
                                <Ionicons
                                    name="sync-circle"
                                    size={36}
                                    color={loadingApostes ? "#888" : "#0288d1"}
                                />
                            </TouchableOpacity>
                        </View>

                        {/* LLISTA D'APOSTES */}
                        <ScrollView style={{ width: '100%' }} showsVerticalScrollIndicator={false}>
                            {loadingApostes ? (
                                <ActivityIndicator size="large" color="#0288d1" style={{ marginTop: 20 }} />
                            ) : apostesActives.length === 0 ? (
                                <Text style={{ textAlign: 'center', color: '#888', marginTop: 20 }}>
                                    No tens apostes 1vs1 actives.
                                </Text>
                            ) : (
                                apostesActives.map((aposta) => {
                                    const tempsRestant = obtenirTempsRestant(aposta.expires_at);
                                    const isCompleted = aposta.isSuccess;
                                    const isExpired = tempsRestant === "Fora de temps" && !isCompleted;
                                    const descripcioRepte = generarDescripcioRepte(aposta);
                                    const quiRetat = aposta.challenger?.username || "Algú";

                                    // --- CÀLCULS PER LA BARRA DE PROGRÉS ---
                                    const objectiuTotal = obtenirObjectiuRepte(aposta);
                                    const progresActual = aposta.currentProgress || 0;
                                    const percentatge = calcularPercentatgeBarra(progresActual, objectiuTotal);

                                    return (
                                        <View key={aposta.id} style={[
                                            styles.optionContainer,
                                            {
                                                borderLeftWidth: 4,
                                                borderLeftColor: isCompleted ? '#4CAF50' : (isExpired ? '#ff4444' : '#0288d1'),
                                                padding: 12,
                                                marginBottom: 12,
                                                backgroundColor: isCompleted ? 'rgba(76, 175, 80, 0.1)' : 'rgba(2, 136, 209, 0.08)',
                                                borderRadius: 8,
                                            }
                                        ]}>
                                            {/* INFO RIVAL + BOTÓ ELIMINAR */}
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                                <Text style={{ fontSize: 10, color: isCompleted ? '#4CAF50' : '#0288d1', fontWeight: 'bold', textTransform: 'uppercase' }}>
                                                    ⚔️ REBUT DE: {quiRetat}
                                                </Text>

                                                {(isCompleted || isExpired) && (
                                                    <TouchableOpacity onPress={() => eliminarApostaVisualIBD(aposta.id)}>
                                                        <Ionicons name="trash" size={24} color="red" />
                                                    </TouchableOpacity>
                                                )}
                                            </View>

                                            {/* DESCRIPCIÓ DEL REPTE */}
                                            <Text style={{ fontSize: 14, color: '#fff', fontWeight: 'bold', marginBottom: 8 }}>
                                                {descripcioRepte}
                                            </Text>

                                            {/* CAIXA D'ESTAT I BARRA DE PROGRÉS */}
                                            <View style={{ backgroundColor: 'rgba(0,0,0,0.4)', padding: 8, borderRadius: 6 }}>
                                                {isCompleted ? (
                                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                        <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                                                        <Text style={{ color: '#4CAF50', fontWeight: 'bold', marginLeft: 5 }}>
                                                            REPTE COMPLETAT! +{aposta.reward_amount} pts
                                                        </Text>
                                                    </View>
                                                ) : isExpired ? (
                                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                        <Ionicons name="close-circle" size={20} color="#ff4444" />
                                                        <Text style={{ color: '#ff4444', fontWeight: 'bold', marginLeft: 5 }}>
                                                            TEMPS EXHAURIT (FRACÀS)
                                                        </Text>
                                                    </View>
                                                ) : (
                                                    <>
                                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                                                            <Text style={{ color: '#ccc', fontSize: 12.5 }}>
                                                                💰 En joc: <Text style={{ color: '#FFD700', fontWeight: 'bold' }}>{aposta.reward_amount} pts</Text>
                                                            </Text>
                                                            <Text style={{ color: '#ccc', fontSize: 12.5 }}>
                                                                ⏳ Estat: <Text style={{ color: '#4CAF50', fontWeight: 'bold' }}>{tempsRestant}</Text>
                                                            </Text>
                                                        </View>

                                                        <View style={{ marginTop: 6 }}>
                                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                                                                <Text style={{ color: '#aaa', fontSize: 11 }}>Progrés</Text>
                                                                <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>
                                                                    {progresActual} / {objectiuTotal}
                                                                </Text>
                                                            </View>
                                                            <View style={{ height: 6, backgroundColor: '#444', borderRadius: 3, width: '100%', overflow: 'hidden' }}>
                                                                <View style={{ height: '100%', width: `${percentatge}%`, backgroundColor: '#0288d1', borderRadius: 3 }} />
                                                            </View>
                                                        </View>
                                                    </>
                                                )}
                                            </View>
                                        </View>
                                    );
                                })
                            )}
                        </ScrollView>

                        {/* BOTÓ DE TANCAR EL MODAL */}
                        <TouchableOpacity
                            style={[styles.modalBtn, styles.btnCancel, { marginTop: 15, width: '100%', backgroundColor: '#333' }]}
                            onPress={() => setModalApostesActivesVisible(false)}
                        >
                            <Text style={styles.btnText}>Tancar</Text>
                        </TouchableOpacity>

                    </View>
                </View>
            </Modal>

            <Modal visible={modalPendentsVisible} transparent animationType="fade" onRequestClose={() => setModalPendentsVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>📩 Reptes i Avisos</Text>

                        <ScrollView style={{ maxHeight: 450, width: '100%' }}>

                            {/* ========================================== */}
                            {/* 1. SECCIÓ: REPTES FINALITZATS (NOTIFICACIONS) */}
                            {/* ========================================== */}
                            {reptesFinalitzats.map((repte) => {
                                const hasGuanyat = repte.winner_id === user?.id;
                                const colorFons = hasGuanyat ? 'rgba(46, 125, 50, 0.2)' : 'rgba(198, 40, 40, 0.2)';
                                const colorVora = hasGuanyat ? '#4caf50' : '#f44336';

                                return (
                                    <View key={`fin-${repte.id}`} style={[styles.optionContainer, { borderLeftWidth: 4, borderLeftColor: colorVora, padding: 15, backgroundColor: colorFons, marginBottom: 15 }]}>
                                        <Text style={{ fontSize: 18, color: hasGuanyat ? '#a5d6a7' : '#ef9a9a', fontWeight: 'bold', marginBottom: 5 }}>
                                            {hasGuanyat ? '🏆 Has guanyat!' : '📉 Has perdut'}
                                        </Text>

                                        <Text style={{ fontSize: 15, color: '#fff', marginBottom: 10 }}>
                                            El repte de <Text style={{ fontWeight: 'bold' }}>{generarDescripcioRepte(repte)}</Text> ha finalitzat.
                                        </Text>

                                        <TouchableOpacity
                                            style={[styles.modalBtn, { backgroundColor: '#555', alignSelf: 'flex-end', paddingHorizontal: 20 }]}
                                            onPress={() => entendreRepteAcabat(repte.id)}
                                        >
                                            <Text style={styles.btnText}>✓ Entès</Text>
                                        </TouchableOpacity>
                                    </View>
                                );
                            })}


                            {/* ========================================== */}
                            {/* 2. SECCIÓ: REPTES PENDENTS D'ACCEPTAR */}
                            {/* ========================================== */}
                            {reptesPendents.length === 0 && reptesFinalitzats.length === 0 ? (
                                <Text style={{ textAlign: 'center', color: '#888', marginTop: 20 }}>No tens cap repte pendent ni avisos nous.</Text>
                            ) : (
                                reptesPendents.map((repte) => (
                                    <View key={`pend-${repte.id}`} style={[styles.optionContainer, { borderLeftWidth: 4, borderLeftColor: '#FFD700', padding: 15, marginBottom: 15 }]}>

                                        {/* ENCAPÇALAMENT: QUI REPTA */}
                                        <Text style={{ fontSize: 16, color: '#fff', marginBottom: 5 }}>
                                            <Text style={{ fontWeight: 'bold', color: '#4FC3F7' }}>{repte.challenger?.nombre || repte.retador_nombre || "Un rival"}</Text>
                                        </Text>

                                        {/* EL TEXT "MACO" QUE HEM GENERAT */}
                                        <Text style={{ fontSize: 18, color: '#FFD700', fontWeight: '600', marginBottom: 10 }}>
                                            {generarDescripcioRepte(repte)}
                                        </Text>

                                        {/* DETALLS DE RECOMPENSA I TEMPS */}
                                        <View style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: 10, borderRadius: 8 }}>
                                            <Text style={{ color: '#aaa', fontSize: 14 }}>
                                                💰 Recompensa: <Text style={{ color: '#fff', fontWeight: 'bold' }}>{repte.reward_amount || 0} punts</Text>
                                            </Text>
                                            <Text style={{ color: '#aaa', fontSize: 14 }}>
                                                ⏰ Tens fins: <Text style={{ color: '#fff' }}>{repte.expires_at ? new Date(repte.expires_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Temps il·limitat"}</Text>
                                            </Text>
                                        </View>

                                        {/* BOTONS D'ACCIÓ */}
                                        <View style={[styles.modalActions, { marginTop: 15 }]}>
                                            <TouchableOpacity
                                                style={[styles.modalBtn, styles.btnCancel, { flex: 1, marginRight: 5, backgroundColor: '#c62828' }]}
                                                onPress={() => respondreRepte(repte.id, "DECLINED")}
                                            >
                                                <Text style={styles.btnText}>Rebutjar</Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                style={[styles.modalBtn, styles.btnConfirm, { flex: 1, marginLeft: 5, backgroundColor: '#2e7d32' }]}
                                                onPress={() => respondreRepte(repte.id, "ACCEPTED")}
                                            >
                                                <Text style={styles.btnText}>Acceptar</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ))
                            )}
                        </ScrollView>

                        <TouchableOpacity
                            style={[styles.modalBtn, styles.btnCancel, { marginTop: 20, width: '100%', backgroundColor: '#555' }]}
                            onPress={() => setModalPendentsVisible(false)}
                        >
                            <Text style={styles.btnText}>Tancar</Text>
                        </TouchableOpacity>
                    </View>
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
    modalContainer: {
        width: '85%',
        maxWidth: 320,
        alignSelf: 'center',
    }
});