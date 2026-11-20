/* Modal rápido para agregar empresa (solo nombre y RTN). */

window.openQuickCompanyModal = function() {
    document.getElementById('qc_name').value = '';
    document.getElementById('qc_rtn').value = '';
    document.getElementById('quick-company-modal').classList.remove('hidden');
};

window.closeQuickCompanyModal = function() {
    document.getElementById('quick-company-modal').classList.add('hidden');
};

window.handleQuickCompanySubmit = function(e) {
    e.preventDefault();
    const name = document.getElementById('qc_name').value.trim();
    const rtn = document.getElementById('qc_rtn').value.trim();
    if (!window.saveCompanyToDB(name, rtn)) return;
    closeQuickCompanyModal();

    // Si el modal de importación está abierto, actualizar su selector y seleccionar la nueva empresa
    if (!document.getElementById('import-modal').classList.contains('hidden')) {
        const mod = document.getElementById('modal_current_module').value;
        openModuleImportModal(mod);
        document.getElementById('modal_company').value = name;
        onOrderDateOrCompanyChange();
    }

    // Si se agregó desde Asignación de Cuota, dejarla seleccionada en el formulario
    const quotaSel = document.getElementById('quota_company');
    if (quotaSel) quotaSel.value = name;
};
