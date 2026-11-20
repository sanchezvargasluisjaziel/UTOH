/* Persistencia en localStorage (temporal, hasta tener backend). */

window.STORAGE_KEY = 'utoh_state_v1';
window.PERSISTED_KEYS = ['companies', 'substances', 'fiscalYears', 'quotas', 'imports', 'auditLogs'];

// Lee el estado guardado. Devuelve null si no existe, está dañado o no tiene la forma esperada.
window.loadPersistedState = function() {
    try {
        const raw = localStorage.getItem(window.STORAGE_KEY);
        if (!raw) return null;
        const data = JSON.parse(raw);
        if (!data || typeof data !== 'object') return null;
        for (const k of window.PERSISTED_KEYS) {
            if (!Array.isArray(data[k])) return null;
        }
        return data;
    } catch (err) {
        console.warn('No se pudo leer el estado guardado:', err);
        return null;
    }
};

// Guarda solo los datos (no la pestaña activa ni estado de la interfaz).
window.savePersistedState = function() {
    try {
        const out = {};
        window.PERSISTED_KEYS.forEach(k => { out[k] = window.appState[k]; });
        localStorage.setItem(window.STORAGE_KEY, JSON.stringify(out));
        return true;
    } catch (err) {
        console.warn('No se pudo guardar el estado:', err);
        if (!window._storageWarned && typeof showToast === 'function') {
            window._storageWarned = true;
            showToast('⚠ No se pudo guardar en este navegador; los cambios se perderán al recargar');
        }
        return false;
    }
};

// Borra lo guardado y recarga con los datos de demostración.
window.resetToDemoData = function() {
    customConfirm('Restaurar datos de demostración', 'Se perderán todos los datos actuales y se cargarán de nuevo los datos de ejemplo. ¿Continuar?', () => {
        try { localStorage.removeItem(window.STORAGE_KEY); } catch (err) { /* sin acceso a localStorage */ }
        location.reload();
    });
};
