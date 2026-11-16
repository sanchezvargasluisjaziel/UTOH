/* Validaciones de formularios (devuelven un mensaje de error o null si todo está bien). */

// Escapa texto antes de insertarlo en HTML generado con template strings.
window.escapeHtml = function(value) {
    return String(value === null || value === undefined ? '' : value)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
};

// Normaliza un RTN para compararlo: sin espacios ni guiones y en mayúsculas.
window.normalizeRTN = function(rtn) {
    return String(rtn || '').replace(/[\s-]/g, '').toUpperCase();
};

// Valida los datos de una empresa. excludeId sirve al editar (ignora a la propia empresa).
window.validateCompanyData = function({ name, rtn, modules, excludeId = null }) {
    const cleanName = (name || '').trim();
    const cleanRTN = (rtn || '').trim();
    if (cleanName.length < 2) return 'El nombre de la empresa es obligatorio (mínimo 2 caracteres).';
    if (cleanName.length > 120) return 'El nombre de la empresa no puede exceder 120 caracteres.';
    if (!cleanRTN) return 'El RTN / identificador fiscal es obligatorio.';
    if (cleanRTN.length < 3 || cleanRTN.length > 30) return 'El RTN debe tener entre 3 y 30 caracteres.';
    if (!/^[A-Za-z0-9 -]+$/.test(cleanRTN)) return 'El RTN solo puede contener letras, números, espacios y guiones.';
    if (!Array.isArray(modules) || modules.length === 0) return 'Seleccione al menos un módulo (1, 2 o 3).';
    const others = window.appState.companies.filter(c => c.id !== excludeId);
    if (others.some(c => c.name.trim().toLowerCase() === cleanName.toLowerCase())) {
        return `Ya existe una empresa llamada "${cleanName}".`;
    }
    if (others.some(c => c.rtn && normalizeRTN(c.rtn) === normalizeRTN(cleanRTN))) {
        return `El RTN "${cleanRTN}" ya está registrado en otra empresa.`;
    }
    return null;
};
