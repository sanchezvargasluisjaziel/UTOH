/* Modal rápido para agregar empresa. */

// Modal Rápido de Empresa
window.openQuickCompanyModal = function(defaultMod = '1') {
    document.getElementById('qc_name').value = '';
    document.getElementById('qc_mod1').checked = (String(defaultMod) === '1');
    document.getElementById('qc_mod2').checked = (String(defaultMod) === '2');
    document.getElementById('qc_mod3').checked = (String(defaultMod) === '3');
    window.tempSelectedSubstances.qc.clear();
    renderDynamicSubstancePicker('qc');
    document.getElementById('quick-company-modal').classList.remove('hidden');
};

window.closeQuickCompanyModal = function() {
    document.getElementById('quick-company-modal').classList.add('hidden');
};

window.handleQuickCompanySubmit = function(e) {
    e.preventDefault();
    const name = document.getElementById('qc_name').value.trim();
    const mods = [];
    if (document.getElementById('qc_mod1').checked) mods.push('1');
    if (document.getElementById('qc_mod2').checked) mods.push('2');
    if (document.getElementById('qc_mod3').checked) mods.push('3');
    if (mods.length === 0) {
        customAlert('Atención', 'Seleccione al menos un módulo.');
        return;
    }
    const subs = Array.from(window.tempSelectedSubstances.qc);
    window.saveCompanyToDB(name, mods, subs);
    closeQuickCompanyModal();

    // Si el modal de importación está abierto, actualizar su selector y seleccionar la nueva empresa
    if (!document.getElementById('import-modal').classList.contains('hidden')) {
        const mod = document.getElementById('modal_current_module').value;
        openModuleImportModal(mod);
        document.getElementById('modal_company').value = name;
        onOrderDateOrCompanyChange();
    }
};
