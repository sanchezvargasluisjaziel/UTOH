/* Importación de base de datos real (JSON / CSV). */

// =========================================================================
// 13. IMPORTACIÓN DE BASE DE DATOS REAL (JSON / CSV)
// =========================================================================
window.openImportDBModal = function() {
    document.getElementById('import-db-modal').classList.remove('hidden');
};

window.closeImportDBModal = function() {
    document.getElementById('import-db-modal').classList.add('hidden');
};

window.restoreUTOHCatalog = function() {
    window.appState.substances = [...window.OFFICIAL_UTOH_SUBSTANCES];
    window.renderAll();
    closeImportDBModal();
    showToast('Catálogo oficial UTOH restaurado');
};

window.processRealDatabaseUpload = function() {
    const fileInput = document.getElementById('db_file_input');
    if (!fileInput.files || fileInput.files.length === 0) {
        customAlert('Atención', 'Seleccione un archivo .json o .csv primero.');
        return;
    }
    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.onload = function(evt) {
        try {
            if (file.name.endsWith('.json')) {
                const data = JSON.parse(evt.target.result);
                if (Array.isArray(data.companies)) window.appState.companies = data.companies;
                if (Array.isArray(data.quotas)) window.appState.quotas = data.quotas;
                if (Array.isArray(data.imports)) window.appState.imports = data.imports;
            }
            window.renderAll();
            closeImportDBModal();
            showToast('Base de datos cargada con éxito');
        } catch (err) {
            customAlert('Error de formato', 'El archivo no pudo procesarse. Verifique que sea JSON válido.');
        }
    };
    reader.readAsText(file);
};
