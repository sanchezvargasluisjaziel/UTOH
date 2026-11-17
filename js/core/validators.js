/* Validaciones de formularios (devuelven un mensaje de error o null si todo está bien). */

// Escapa texto antes de insertarlo en HTML generado con template strings.
window.escapeHtml = function(value) {
    return String(value === null || value === undefined ? '' : value)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
};

// Valor seguro para pasar como argumento de texto en un atributo onclick="fn(${jsArg(valor)})".
window.jsArg = function(value) {
    return window.escapeHtml(JSON.stringify(String(value === null || value === undefined ? '' : value)));
};

// Normaliza un RTN para compararlo: sin espacios ni guiones y en mayúsculas.
window.normalizeRTN = function(rtn) {
    return String(rtn || '').replace(/[\s-]/g, '').toUpperCase();
};

// Valida los datos de una empresa. excludeId sirve al editar (ignora a la propia empresa).
window.validateCompanyData = function({ name, rtn, excludeId = null }) {
    const cleanName = (name || '').trim();
    const cleanRTN = (rtn || '').trim();
    if (cleanName.length < 2) return 'El nombre de la empresa es obligatorio (mínimo 2 caracteres).';
    if (cleanName.length > 120) return 'El nombre de la empresa no puede exceder 120 caracteres.';
    if (!cleanRTN) return 'El RTN / identificador fiscal es obligatorio.';
    if (cleanRTN.length < 3 || cleanRTN.length > 30) return 'El RTN debe tener entre 3 y 30 caracteres.';
    if (!/^[A-Za-z0-9 -]+$/.test(cleanRTN)) return 'El RTN solo puede contener letras, números, espacios y guiones.';
    const others = window.appState.companies.filter(c => c.id !== excludeId);
    if (others.some(c => c.name.trim().toLowerCase() === cleanName.toLowerCase())) {
        return `Ya existe una empresa llamada "${cleanName}".`;
    }
    if (others.some(c => c.rtn && normalizeRTN(c.rtn) === normalizeRTN(cleanRTN))) {
        return `El RTN "${cleanRTN}" ya está registrado en otra empresa.`;
    }
    return null;
};

// ------------------------------------------------------------------ fechas y cantidades

window.MAX_QTY = 10000000;

window.isValidISODate = function(str) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(str || '')) return false;
    const [y, m, d] = str.split('-').map(Number);
    if (y < 2000 || y > 2100) return false;
    const dt = new Date(Date.UTC(y, m - 1, d));
    return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
};

// Cantidad de una importación: toneladas con máximo 2 decimales (módulos 1 y 2) o unidades enteras (módulo 3).
window.validateQty = function(qty, mod) {
    if (typeof qty !== 'number' || !isFinite(qty)) return 'Capture una cantidad numérica.';
    if (qty <= 0) return 'La cantidad debe ser mayor a cero.';
    if (qty > window.MAX_QTY) return `La cantidad no puede exceder ${fmtNum(window.MAX_QTY, 0)}.`;
    if (String(mod) === '3') {
        if (!Number.isInteger(qty)) return 'Los equipos se capturan en unidades enteras.';
    } else if (Math.abs(qty * 100 - Math.round(qty * 100)) > 1e-6) {
        return 'La cantidad admite máximo 2 decimales.';
    }
    return null;
};

// ------------------------------------------------------------------ importaciones

// Valida el registro (o edición) de una importación. Bloquea si excede la cuota restante (Módulo 1).
// excludeId ignora el propio movimiento al editarlo; description solo se exige si se pasa (alta en Módulo 3).
window.validateImportData = function({ mod, company, substance, orderDate, arrivalDate, qty, description, excludeId = null }) {
    mod = String(mod);
    const comp = window.appState.companies.find(c => c.name === company);
    if (!comp) return 'Seleccione una empresa registrada.';
    if (!window.appState.substances.some(s => s.name === substance && String(s.module) === mod)) return 'Seleccione una sustancia o equipo válido para este apartado.';
    if (!isValidISODate(orderDate)) return 'Capture una fecha de orden válida.';
    if (arrivalDate) {
        if (!isValidISODate(arrivalDate)) return 'La fecha de llegada no es válida.';
        if (arrivalDate < orderDate) return 'La fecha de llegada no puede ser anterior a la fecha de orden.';
    }
    const qtyError = validateQty(qty, mod);
    if (qtyError) return qtyError;

    if (mod === '1') {
        const fy = calculateFiscalYear(orderDate);
        const bal = getQuotaBalance(company, substance, fy, excludeId);
        if (!bal.quota) return `${company} no tiene cuota asignada de ${substance} en el AF ${fy}.`;
        if (qty > bal.remTM + 1e-9) {
            return `La cantidad (${fmtNum(qty)} TM) supera la cuota restante (${fmtNum(bal.remTM)} TM) de ${substance} para ${company} en el AF ${fy}.`;
        }
        const co2 = calcCO2(qty, substance);
        if (co2 !== null && bal.remCO2 !== null && co2 > bal.remCO2 + 1e-9) {
            return `El equivalente (${fmtCO2(co2)}) supera la cuota restante en TCO₂eq (${fmtCO2(bal.remCO2)}).`;
        }
    }
    if (description !== undefined) {
        if (!description.trim()) return 'Capture la descripción del artículo.';
        if (description.length > 200) return 'La descripción no puede exceder 200 caracteres.';
    }
    return null;
};

// ------------------------------------------------------------------ cuotas

window.validateQuotaData = function({ company, substance, year, limit, limitCO2 = null }) {
    const comp = window.appState.companies.find(c => c.name === company);
    if (!comp) return 'Seleccione una empresa registrada.';
    if (!window.appState.substances.some(s => s.name === substance && String(s.module) === '1')) return 'Seleccione una sustancia regulada sujeta a cuota.';
    if (typeof limit !== 'number' || !isFinite(limit)) return 'Capture una cuota numérica en toneladas.';
    if (limit < 0) return 'La cuota no puede ser negativa.';
    if (limit > window.MAX_QTY) return `La cuota no puede exceder ${fmtNum(window.MAX_QTY, 0)} TM.`;
    if (Math.abs(limit * 100 - Math.round(limit * 100)) > 1e-6) return 'La cuota admite máximo 2 decimales.';
    if (limitCO2 !== null && (typeof limitCO2 !== 'number' || !isFinite(limitCO2) || limitCO2 < 0)) return 'La cuota en TCO₂eq debe ser un número mayor o igual a cero.';
    const bal = getQuotaBalance(company, substance, year);
    if (limit < bal.usedTM - 1e-9) return `La cuota (${fmtNum(limit)} TM) no puede ser menor a lo ya importado (${fmtNum(bal.usedTM)} TM).`;
    if (limitCO2 !== null && bal.usedCO2 !== null && limitCO2 < bal.usedCO2 - 1e-9) {
        return `La cuota en TCO₂eq no puede ser menor a lo ya importado (${fmtCO2(bal.usedCO2)}).`;
    }
    return null;
};

// ------------------------------------------------------------------ sustancias y años fiscales

window.validateSubstanceData = function({ name, tariff, module, gwp = null, refrigerant = '', excludeId = null }) {
    const cleanName = (name || '').trim();
    const mod = String(module);
    if (cleanName.length < 2) return 'El nombre es obligatorio (mínimo 2 caracteres).';
    if (cleanName.length > 150) return 'El nombre no puede exceder 150 caracteres.';
    if (!['1', '2', '3'].includes(mod)) return 'Seleccione una clasificación válida.';
    if (!/^\d{4}\.\d{2}\.\d{2}\.\d{2}$/.test((tariff || '').trim())) return 'La fracción arancelaria debe tener el formato 0000.00.00.00.';
    if (window.appState.substances.some(s => s.id !== excludeId && String(s.module) === mod && s.name.trim().toLowerCase() === cleanName.toLowerCase())) {
        return `Ya existe "${cleanName}" en "${moduleName(mod)}".`;
    }
    if (mod !== '3' && gwp !== null && (typeof gwp !== 'number' || !isFinite(gwp) || gwp <= 0)) return 'El factor TCO₂eq debe ser un número mayor a cero.';
    if ((refrigerant || '').length > 100) return 'El refrigerante no puede exceder 100 caracteres.';
    return null;
};

window.validateYear = function(year, excludeId = null) {
    if (!Number.isInteger(year)) return 'Capture un año válido.';
    if (year < 2000 || year > 2100) return 'El año fiscal debe estar entre 2000 y 2100.';
    if (window.appState.fiscalYears.some(y => y.id !== excludeId && Number(y.year) === year)) return `El Año Fiscal ${year} ya existe.`;
    return null;
};
