/* Modales de edición y funciones de eliminación. */

// =========================================================================
// 11. EDICIÓN Y ELIMINACIÓN (CUOTAS, EMPRESAS, SUSTANCIAS, IMPORTACIONES)
// =========================================================================
// Oculta los campos extra del modal de edición (se muestran solo donde aplican).
window.hideEditExtras = function() {
    ['edit-modal-limitco2-container', 'edit-modal-gwp-container', 'edit-modal-rtn-container'].forEach(id => document.getElementById(id).classList.add('hidden'));
};

window.openEditQuotaModal = function(quotaId) {
    hideEditExtras();
    const q = window.appState.quotas.find(x => x.id === quotaId);
    if (!q) return;
    document.getElementById('edit-modal-id').value = q.id;
    document.getElementById('edit-modal-type').value = 'quota';
    document.getElementById('edit-modal-title').innerText = `Editar Cuota: ${q.company} (${q.substance})`;
    document.getElementById('edit-modal-name-container').classList.add('hidden');
    document.getElementById('edit-modal-company-extra').classList.add('hidden');
    document.getElementById('edit-modal-module-container').classList.add('hidden');
    document.getElementById('edit-modal-refrigerant-container').classList.add('hidden');
    document.getElementById('edit-modal-date-container').classList.add('hidden');

    document.getElementById('edit-modal-limit-container').classList.remove('hidden');
    document.getElementById('edit-modal-limit-label').innerText = `Límite Anual Autorizado en Toneladas (AF ${q.year})`;
    document.getElementById('edit-modal-limit').value = q.limit;
    document.getElementById('edit-modal-limitco2-container').classList.remove('hidden');
    document.getElementById('edit-modal-limitco2').value = (q.limitCO2 === null || q.limitCO2 === undefined) ? '' : q.limitCO2;

    document.getElementById('edit-modal').classList.remove('hidden');
};

window.openEditCompanyModal = function(compId) {
    hideEditExtras();
    const c = window.appState.companies.find(x => x.id === compId);
    if (!c) return;
    document.getElementById('edit-modal-id').value = c.id;
    document.getElementById('edit-modal-type').value = 'company';
    document.getElementById('edit-modal-title').innerText = `Editar Empresa: ${c.name}`;

    document.getElementById('edit-modal-name-container').classList.remove('hidden');
    document.getElementById('edit-modal-name-label').innerText = 'Nombre de la Empresa';
    document.getElementById('edit-modal-input').value = c.name;
    document.getElementById('edit-modal-rtn-container').classList.remove('hidden');
    document.getElementById('edit-modal-rtn').value = c.rtn || '';

    document.getElementById('edit-modal-company-extra').classList.remove('hidden');
    document.getElementById('edit-comp-mod1').checked = (c.modules || []).includes('1');
    document.getElementById('edit-comp-mod2').checked = (c.modules || []).includes('2');
    document.getElementById('edit-comp-mod3').checked = (c.modules || []).includes('3');

    window.tempSelectedSubstances.edit = new Set(c.allowedSubstances || []);
    renderDynamicSubstancePicker('edit');

    document.getElementById('edit-modal-module-container').classList.add('hidden');
    document.getElementById('edit-modal-refrigerant-container').classList.add('hidden');
    document.getElementById('edit-modal-limit-container').classList.add('hidden');
    document.getElementById('edit-modal-date-container').classList.add('hidden');

    document.getElementById('edit-modal').classList.remove('hidden');
};

window.openEditSubstanceModal = function(subId) {
    hideEditExtras();
    const s = window.appState.substances.find(x => x.id === subId);
    if (!s) return;
    document.getElementById('edit-modal-id').value = s.id;
    document.getElementById('edit-modal-type').value = 'substance';
    document.getElementById('edit-modal-title').innerText = 'Editar Sustancia / Equipo';

    document.getElementById('edit-modal-name-container').classList.remove('hidden');
    document.getElementById('edit-modal-name-label').innerText = 'Nombre de Sustancia / Equipo';
    document.getElementById('edit-modal-input').value = s.name;

    document.getElementById('edit-modal-company-extra').classList.add('hidden');
    document.getElementById('edit-modal-module-container').classList.remove('hidden');
    document.getElementById('edit-modal-module').value = String(s.module);
    document.getElementById('edit-modal-tariff').value = s.tariff || '';

    document.getElementById('edit-modal-refrigerant').value = s.refrigerant || '';
    document.getElementById('edit-modal-gwp').value = (s.gwp === null || s.gwp === undefined) ? '' : s.gwp;
    toggleEditRefrigerantField();

    document.getElementById('edit-modal-limit-container').classList.add('hidden');
    document.getElementById('edit-modal-date-container').classList.add('hidden');
    document.getElementById('edit-modal').classList.remove('hidden');
};

window.toggleEditRefrigerantField = function() {
    const mod = document.getElementById('edit-modal-module').value;
    document.getElementById('edit-modal-refrigerant-container').classList.toggle('hidden', mod !== '3');
    document.getElementById('edit-modal-gwp-container').classList.toggle('hidden', mod === '3');
};

window.openEditYearModal = function(yearId) {
    hideEditExtras();
    const y = window.appState.fiscalYears.find(x => x.id === yearId);
    if (!y) return;
    document.getElementById('edit-modal-id').value = y.id;
    document.getElementById('edit-modal-type').value = 'year';
    document.getElementById('edit-modal-title').innerText = 'Editar Año Fiscal';

    document.getElementById('edit-modal-name-container').classList.remove('hidden');
    document.getElementById('edit-modal-name-label').innerText = 'Año Fiscal';
    document.getElementById('edit-modal-input').value = y.year;

    document.getElementById('edit-modal-company-extra').classList.add('hidden');
    document.getElementById('edit-modal-module-container').classList.add('hidden');
    document.getElementById('edit-modal-refrigerant-container').classList.add('hidden');
    document.getElementById('edit-modal-limit-container').classList.add('hidden');
    document.getElementById('edit-modal-date-container').classList.add('hidden');
    document.getElementById('edit-modal').classList.remove('hidden');
};

window.openEditImportModal = function(impId) {
    hideEditExtras();
    const imp = window.appState.imports.find(x => x.id === impId);
    if (!imp) return;
    document.getElementById('edit-modal-id').value = imp.id;
    document.getElementById('edit-modal-type').value = 'import';
    document.getElementById('edit-modal-title').innerText = `Editar Importación [${imp.trackingNumber}]`;

    document.getElementById('edit-modal-name-container').classList.add('hidden');
    document.getElementById('edit-modal-company-extra').classList.add('hidden');
    document.getElementById('edit-modal-module-container').classList.add('hidden');
    document.getElementById('edit-modal-refrigerant-container').classList.add('hidden');

    document.getElementById('edit-modal-limit-container').classList.remove('hidden');
    document.getElementById('edit-modal-limit-label').innerText = imp.module === '3' ? 'Cantidad (Unidades)' : 'Cantidad (Toneladas)';
    document.getElementById('edit-modal-limit').value = imp.qty;

    document.getElementById('edit-modal-date-container').classList.remove('hidden');
    document.getElementById('edit-modal-date').value = imp.orderDate;

    document.getElementById('edit-modal').classList.remove('hidden');
};

window.closeEditModal = function() {
    document.getElementById('edit-modal').classList.add('hidden');
};

window.saveEdit = function() {
    const id = document.getElementById('edit-modal-id').value;
    const type = document.getElementById('edit-modal-type').value;

    if (type === 'quota') {
        const q = window.appState.quotas.find(x => x.id === id);
        if (q) {
            q.limit = parseFloat(document.getElementById('edit-modal-limit').value || 0);
            const co2Raw = document.getElementById('edit-modal-limitco2').value;
            q.limitCO2 = co2Raw === '' ? null : parseFloat(co2Raw);
            logAudit(`Modificó cuota de ${q.company} (${q.substance}) a ${q.limit} Ton`, 'Módulo 1 / Cuotas');
            showToast('Cuota actualizada correctamente');
        }
    } else if (type === 'company') {
        const c = window.appState.companies.find(x => x.id === id);
        if (c) {
            const oldName = c.name;
            const newName = document.getElementById('edit-modal-input').value.trim();
            const mods = [];
            if (document.getElementById('edit-comp-mod1').checked) mods.push('1');
            if (document.getElementById('edit-comp-mod2').checked) mods.push('2');
            if (document.getElementById('edit-comp-mod3').checked) mods.push('3');
            const newRTN = document.getElementById('edit-modal-rtn').value.trim();
            const error = validateCompanyData({ name: newName, rtn: newRTN, modules: mods, excludeId: c.id });
            if (error) {
                customAlert('No se pudo guardar la empresa', error);
                return;
            }
            c.name = newName;
            c.rtn = newRTN;
            c.modules = mods;
            c.allowedSubstances = Array.from(window.tempSelectedSubstances.edit);

            // Propagar cambio de nombre en cuotas e importaciones
            if (oldName !== newName) {
                window.appState.quotas.forEach(q => { if (q.company === oldName) q.company = newName; });
                window.appState.imports.forEach(i => { if (i.company === oldName) i.company = newName; });
            }
            // Asegurar cuotas base para Módulo 1 si se agregaron sustancias reguladas
            const currentFY = getActiveFiscalYear();
            if (mods.includes('1')) {
                c.allowedSubstances.forEach(subName => {
                    const sObj = window.appState.substances.find(s => s.name === subName && String(s.module) === '1');
                    if (sObj && !window.appState.quotas.some(q => q.company === newName && q.substance === subName && Number(q.year) === currentFY)) {
                        window.appState.quotas.push({
                            id: 'q_' + Date.now() + Math.floor(Math.random() * 1000),
                            company: newName,
                            substance: subName,
                            limit: 0,
                            year: currentFY
                        });
                    }
                });
            }
            logAudit(`Editó empresa "${newName}" (Módulos: ${mods.join(', ')})`, 'Empresas');
            showToast('Empresa actualizada');
        }
    } else if (type === 'substance') {
        const s = window.appState.substances.find(x => x.id === id);
        if (s) {
            s.name = document.getElementById('edit-modal-input').value.trim();
            s.module = document.getElementById('edit-modal-module').value;
            s.tariff = document.getElementById('edit-modal-tariff').value.trim();
            s.refrigerant = document.getElementById('edit-modal-refrigerant').value.trim();
            const gwpRaw = document.getElementById('edit-modal-gwp').value;
            s.gwp = (s.module === '3' || gwpRaw === '') ? null : parseFloat(gwpRaw);
            logAudit(`Editó sustancia/equipo "${s.name}"`, 'Catálogo');
            showToast('Sustancia actualizada');
        }
    } else if (type === 'year') {
        const y = window.appState.fiscalYears.find(x => x.id === id);
        if (y) {
            y.year = parseInt(document.getElementById('edit-modal-input').value, 10);
            showToast('Año fiscal actualizado');
        }
    } else if (type === 'import') {
        const imp = window.appState.imports.find(x => x.id === id);
        if (imp) {
            imp.qty = imp.module === '3'
                ? parseInt(document.getElementById('edit-modal-limit').value, 10)
                : parseFloat(document.getElementById('edit-modal-limit').value);
            imp.orderDate = document.getElementById('edit-modal-date').value;
            imp.fiscalYear = calculateFiscalYear(imp.orderDate);
            logAudit(`Editó movimiento [${imp.trackingNumber}]: cantidad=${imp.qty}, fecha=${imp.orderDate}`, `Módulo ${imp.module}`);
            showToast('Movimiento actualizado');
        }
    }

    closeEditModal();
    window.renderAll();
};

window.deleteQuota = function(id) {
    customConfirm('Eliminar Cuota', '¿Desea eliminar este registro de cuota?', () => {
        window.appState.quotas = window.appState.quotas.filter(q => q.id !== id);
        window.renderAll();
        showToast('Cuota eliminada');
    });
};

window.deleteCompany = function(id) {
    const c = window.appState.companies.find(x => x.id === id);
    if (!c) return;
    const nQuotas = window.appState.quotas.filter(q => q.company === c.name).length;
    const nImports = window.appState.imports.filter(i => i.company === c.name).length;
    const detail = (nQuotas || nImports)
        ? ` Se eliminarán también ${nQuotas} cuota(s) y ${nImports} importación(es) asociadas.`
        : '';
    customConfirm('Dar de baja la empresa', `¿Desea eliminar a "${c.name}"?${detail}`, () => {
        window.appState.companies = window.appState.companies.filter(x => x.id !== id);
        window.appState.quotas = window.appState.quotas.filter(q => q.company !== c.name);
        window.appState.imports = window.appState.imports.filter(i => i.company !== c.name);
        logAudit(`Dio de baja la empresa "${c.name}" (RTN ${c.rtn || 'sin RTN'}), con ${nQuotas} cuota(s) y ${nImports} importación(es)`, 'Empresas');
        window.renderAll();
        showToast('Empresa eliminada');
    });
};

window.deleteSubstance = function(id) {
    customConfirm('Eliminar Sustancia', '¿Desea eliminar este elemento del catálogo?', () => {
        window.appState.substances = window.appState.substances.filter(s => s.id !== id);
        window.renderAll();
        showToast('Sustancia eliminada');
    });
};

window.deleteImport = function(id) {
    customConfirm('Eliminar Importación', '¿Desea eliminar este movimiento de importación?', () => {
        window.appState.imports = window.appState.imports.filter(i => i.id !== id);
        window.renderAll();
        showToast('Movimiento eliminado');
    });
};

window.clearModuleData = function(modNum) {
    const m = String(modNum);
    customConfirm(`Vaciar Módulo ${m}`, `¿Desea dejar en blanco los movimientos del Módulo ${m}?`, () => {
        window.appState.imports = window.appState.imports.filter(i => String(i.module) !== m);
        if (m === '1') window.appState.quotas = [];
        window.renderAll();
        showToast(`Módulo ${m} vaciado`);
    });
};

window.clearAllDemoDataToBlank = function() {
    customConfirm('Dejar Módulos en Blanco', '¿Desea borrar las empresas, cuotas e importaciones de prueba para ingresar únicamente sus datos reales?', () => {
        window.appState.companies = [];
        window.appState.quotas = [];
        window.appState.imports = [];
        window.renderAll();
        showToast('Sistema limpio y listo para sus empresas reales');
    });
};
