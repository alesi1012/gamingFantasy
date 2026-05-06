export const API_BASE = "http://192.168.1.34:3000";

export async function crearRepte(payload: {
    retador: string;
    retat: string;
    repteBase: number;
    validationType: {
        cardId: number;
        playsCount: number;
    };
    reward: number;
    timeout: string;
}) {
    const res = await fetch(`${API_BASE}/Reptes/Crear`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    const text = await res.text();
    const data = text ? JSON.parse(text) : null;

    if (!res.ok) {
        throw new Error(data?.error || data?.message || `HTTP ${res.status}`);
    }

    return data;
}