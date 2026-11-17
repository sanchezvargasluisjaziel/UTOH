/* Vista: Catálogo de Empresas */

// =========================================================================
// 6. CATÁLOGO DE EMPRESAS (SOLO ALTA, EDICIÓN Y BAJA: NOMBRE Y RTN)
// =========================================================================
function renderCompanies() {
    const companies = window.appState.companies;
    const currentFY = getActiveFiscalYear();
    let html = `
        <div class="mb-6">
            <span class="text-xs font-bold uppercase tracking-wider text-indigo-600">Configuración de Padrón</span>
            <h2 class="text-2xl font-bold text-gray-800">Catálogo de Empresas Importadoras</h2>
            <p class="text-sm text-gray-500">Dé de alta, edite o dé de baja a las empresas importadoras (nombre y RTN). Las cuotas y sustancias se asignan en Asignación de Cuota.</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <!-- Formulario lateral compacto para Agregar Empresa -->
            <div class="lg:col-span-5 bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <h3 class="font-bold text-gray-800 text-sm mb-3">Registrar Nueva Empresa</h3>
                <form onsubmit="handleAddCompanyFromCatalog(event)" class="space-y-3.5">
                    <div>
                        <label class="block text-xs font-bold text-gray-700 mb-1">Nombre de la Empresa <span class="text-red-500">*</span></label>
                        <input type="text" id="cat_comp_name" required class="w-full p-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Ej. Refrigeración Industrial S.A.">
                    </div>

                    <div>
                        <label class="block text-xs font-bold text-gray-700 mb-1">RTN / Identificador Fiscal <span class="text-red-500">*</span></label>
                        <input type="text" id="cat_comp_rtn" required maxlength="30" class="w-full p-2.5 border border-gray-300 rounded-lg text-sm font-mono outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Ej. 0801-1999-123456">
                    </div>

                    <button type="submit" class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-sm shadow-sm">
                        + Agregar Empresa
                    </button>
                </form>
            </div>

            <!-- Tabla Compacta de Empresas Existentes -->
            <div class="lg:col-span-7 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div class="px-5 py-3.5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 class="font-bold text-gray-800 text-sm">Empresas Registradas (${companies.length})</h3>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500">
                                <th class="p-3.5 font-semibold">Empresa</th>
                                <th class="p-3.5 font-semibold">RTN</th>
                                <th class="p-3.5 font-semibold text-right">Cuotas AF ${currentFY}</th>
                                <th class="p-3.5 font-semibold text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100 text-sm">
    `;

    if (companies.length === 0) {
        html += `<tr><td colspan="4" class="p-8 text-center text-gray-400">No hay empresas registradas.</td></tr>`;
    } else {
        companies.forEach(c => {
            const nQuotas = window.appState.quotas.filter(q => q.company === c.name && Number(q.year) === currentFY).length;
            html += `
                <tr class="hover:bg-gray-50">
                    <td class="p-3.5 font-bold text-gray-900">${escapeHtml(c.name)}</td>
                    <td class="p-3.5 font-mono text-xs text-gray-600 whitespace-nowrap">${c.rtn ? escapeHtml(c.rtn) : '<span class="text-amber-600 font-sans font-semibold">Sin RTN</span>'}</td>
                    <td class="p-3.5 text-right text-xs font-semibold text-gray-600">${nQuotas}</td>
                    <td class="p-3.5 text-right whitespace-nowrap">
                        <button onclick="openEditCompanyModal('${c.id}')" class="px-2.5 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded font-bold text-xs mr-1.5">Editar</button>
                        <button onclick="deleteCompany('${c.id}')" class="px-2.5 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded font-bold text-xs">Eliminar</button>
                    </td>
                </tr>
            `;
        });
    }

    html += `</tbody></table></div></div></div>`;
    return html;
}

function handleAddCompanyFromCatalog(e) {
    e.preventDefault();
    const name = document.getElementById('cat_comp_name').value.trim();
    const rtn = document.getElementById('cat_comp_rtn').value.trim();
    if (!window.saveCompanyToDB(name, rtn)) return;
    document.getElementById('cat_comp_name').value = '';
    document.getElementById('cat_comp_rtn').value = '';
}
