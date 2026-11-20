/* Importación de base de datos real (JSON). */

window.MAX_DB_FILE_BYTES = 2 * 1024 * 1024;
window.MAX_DB_RECORDS = 50000;

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

// Revisa la forma de cada registro del archivo antes de tocar el estado. Devuelve un mensaje o null.
window.validateDatabasePayload = function(data) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) return 'El archivo debe contener un objeto JSON con "companies", "quotas" y/o "imports".';
    const keys = ['companies', 'quotas', 'imports'].filter(k => data[k] !== undefined);
    if (keys.length === 0) return 'El archivo no contiene "companies", "quotas" ni "imports".';
    for (const k of keys) {
        if (!Array.isArray(data[k])) return `"${k}" debe ser una lista.`;
        if (data[k].length > window.MAX_DB_RECORDS) return `"${k}" excede el máximo de ${window.MAX_DB_RECORDS} registros.`;
    }
    const isStr = v => typeof v === 'string' && v.trim().length > 0;
    const isNum = v => typeof v === 'number' && isFinite(v);

    const companies = data.companies !== undefined ? data.companies : window.appState.companies;
    const ids = new Set();
    const names = new Set();
    for (const [i, c] of (data.companies || []).entries()) {
        const at = `companies[${i}]`;
        if (!c || typeof c !== 'object') return `${at} no es un objeto.`;
        if (!isStr(c.id) || ids.has(c.id)) return `${at}: "id" faltante o repetido.`;
        ids.add(c.id);
        if (!isStr(c.name) || c.name.trim().length > 120) return `${at}: "name" faltante o demasiado largo.`;
        if (names.has(c.name.trim().toLowerCase())) return `${at}: la empresa "${c.name}" está repetida.`;
        names.add(c.name.trim().toLowerCase());
        if (c.rtn !== undefined && (typeof c.rtn !== 'string' || c.rtn.length > 30)) return `${at}: "rtn" no es válido.`;
        if (c.assignments !== undefined && (!Array.isArray(c.assignments) || c.assignments.some(x => !x || !['2', '3'].includes(String(x.module)) || typeof x.substance !== 'string' || x.substance.length > 200))) return `${at}: "assignments" debe ser una lista de {module: "2"|"3", substance}.`;
    }
    const companyNames = new Set(companies.map(c => c.name));

    for (const [i, q] of (data.quotas || []).entries()) {
        const at = `quotas[${i}]`;
        if (!q || typeof q !== 'object') return `${at} no es un objeto.`;
        if (!isStr(q.id) || !isStr(q.company) || !isStr(q.substance)) return `${at}: faltan "id", "company" o "substance".`;
        if (!companyNames.has(q.company)) return `${at}: la empresa "${q.company}" no existe.`;
        if (!isNum(q.limit) || q.limit < 0) return `${at}: "limit" debe ser un número mayor o igual a cero.`;
        if (!Number.isInteger(q.year) || q.year < 2000 || q.year > 2100) return `${at}: "year" no es válido.`;
        if (q.limitCO2 !== undefined && q.limitCO2 !== null && (!isNum(q.limitCO2) || q.limitCO2 < 0)) return `${at}: "limitCO2" no es válido.`;
    }

    for (const [i, m] of (data.imports || []).entries()) {
        const at = `imports[${i}]`;
        if (!m || typeof m !== 'object') return `${at} no es un objeto.`;
        if (!isStr(m.id) || !isStr(m.company) || !isStr(m.type)) return `${at}: faltan "id", "company" o "type".`;
        if (!companyNames.has(m.company)) return `${at}: la empresa "${m.company}" no existe.`;
        if (!['1', '2', '3'].includes(String(m.module))) return `${at}: "module" debe ser 1, 2 o 3.`;
        if (!isNum(m.qty) || m.qty <= 0) return `${at}: "qty" debe ser un número mayor a cero.`;
        if (!isValidISODate(m.orderDate)) return `${at}: "orderDate" debe tener el formato AAAA-MM-DD.`;
        if (!Number.isInteger(m.fiscalYear)) return `${at}: "fiscalYear" no es válido.`;
        if (!isStr(m.trackingNumber)) return `${at}: falta "trackingNumber".`;
    }
    return null;
};

window.processRealDatabaseUpload = function() {
    const fileInput = document.getElementById('db_file_input');
    if (!fileInput.files || fileInput.files.length === 0) {
        customAlert('Atención', 'Seleccione un archivo .json primero.');
        return;
    }
    const file = fileInput.files[0];
    if (!file.name.toLowerCase().endsWith('.json')) {
        customAlert('Formato no soportado', 'Por ahora solo se pueden cargar archivos .json.');
        return;
    }
    if (file.size > window.MAX_DB_FILE_BYTES) {
        customAlert('Archivo demasiado grande', `El archivo excede el máximo de ${Math.round(window.MAX_DB_FILE_BYTES / 1024 / 1024)} MB.`);
        return;
    }
    const reader = new FileReader();
    reader.onerror = function() {
        customAlert('Error de lectura', 'No se pudo leer el archivo.');
    };
    reader.onload = function(evt) {
        let data;
        try {
            data = JSON.parse(evt.target.result);
        } catch (err) {
            customAlert('Error de formato', 'El archivo no es un JSON válido.');
            return;
        }
        const error = validateDatabasePayload(data);
        if (error) {
            customAlert('Archivo no válido', error);
            return;
        }
        customConfirm('Reemplazar datos', 'Las empresas, cuotas e importaciones incluidas en el archivo reemplazarán a las actuales. ¿Continuar?', () => {
            if (Array.isArray(data.companies)) window.appState.companies = data.companies;
            if (Array.isArray(data.quotas)) window.appState.quotas = data.quotas;
            if (Array.isArray(data.imports)) window.appState.imports = data.imports;
            // Asegurar que existan los años fiscales usados por los datos cargados
            [...window.appState.quotas.map(q => q.year), ...window.appState.imports.map(i => i.fiscalYear)].forEach(y => {
                if (!window.appState.fiscalYears.some(fy => Number(fy.year) === Number(y))) {
                    window.appState.fiscalYears.push({ id: 'fy_' + y, year: Number(y) });
                }
            });
            logAudit('Cargó una base de datos desde archivo JSON', 'Sistema');
            window.renderAll();
            closeImportDBModal();
            fileInput.value = '';
            showToast('Base de datos cargada con éxito');
        });
    };
    reader.readAsText(file);
};
