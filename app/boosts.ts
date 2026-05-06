export const TODAY_MISSIONS_BOOST = {
    id: "doble_misiones_hoy",
    name: "Duplicador de misiones de hoy",
    description: "Duplica la recompensa de todas las misiones de hoy en esta liga.",
    price: 120
};

export type UserBoost = {
    inventoryId: string;
    boostId: string;
    ligaId: string;
    purchasedAt: string;
};

export function createTodayMissionBoost(ligaId: string): UserBoost {
    return {
        inventoryId: crypto.randomUUID(),
        boostId: TODAY_MISSIONS_BOOST.id,
        ligaId,
        purchasedAt: new Date().toISOString()
    };
}

export function getTodayKey() {
    return new Date().toISOString().slice(0, 10);
}