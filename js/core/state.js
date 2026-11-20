/* Estado central de la aplicación. */

// Estado Central Reactivo
window.appState = {
    activeTab: 'quotas',
    selectedPortalCompany: 'FrioMax S.A.',
    companies: [...window.DEMO_COMPANIES],
    substances: [...window.OFFICIAL_UTOH_SUBSTANCES],
    fiscalYears: [
        { id: "fy1", year: 2025 },
        { id: "fy2", year: 2026 },
        { id: "fy3", year: 2027 }
    ],
    quotas: [...window.DEMO_QUOTAS],
    imports: [...window.DEMO_IMPORTS],
    auditLogs: [
        { id: "a1", timestamp: "2026-12-28 14:15", user: "Admin 2 (Aduana)", module: "Sustancias reguladas sujetas a cuota", action: "Registró orden [UTOH-2026-M1-592044] (2026-12-28, llega 2027-01-11 -> Contabilizada en AF 2026): 300 Ton de R-410A para FrioMax S.A." }
    ]
};

// Si hay datos guardados en localStorage, reemplazan a los de demostración.
(function hydrateFromStorage() {
    const saved = window.loadPersistedState();
    if (saved) window.PERSISTED_KEYS.forEach(k => { window.appState[k] = saved[k]; });
})();

// Carga los PCG oficiales (js/data/pcg-honduras.js) en el catálogo, también sobre datos ya guardados.
// Solo llena factores vacíos: un factor capturado a mano distinto al oficial no se toca.
(function applyOfficialPcg() {
    const pcg = window.OFFICIAL_PCG || {};
    window.appState.substances.forEach(s => {
        const off = pcg[s.id];
        if (!off || String(s.module) !== '1') return;
        const empty = s.gwp === null || s.gwp === undefined || s.gwp === '';
        if (empty && off.gwp !== null) s.gwp = off.gwp;
        // Marca "por confirmar" solo si el valor actual es el oficial (o sigue vacío)
        const isOfficial = (s.gwp === null || s.gwp === undefined || s.gwp === '') ? off.gwp === null : Number(s.gwp) === off.gwp;
        if (isOfficial && s.gwpConfirmed !== true) {
            s.gwpPending = off.pending;
            s.gwpNote = off.note;
        }
    });
})();


const tabs = ['quotas', 'mod1', 'mod2', 'mod3', 'portal', 'companies', 'substances', 'years', 'audit'];
