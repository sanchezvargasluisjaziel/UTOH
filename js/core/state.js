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

window.tempSelectedSubstances = {
    cat: new Set(),
    qc: new Set(),
    edit: new Set()
};

const tabs = ['quotas', 'mod1', 'mod2', 'mod3', 'portal', 'companies', 'substances', 'years', 'audit'];
