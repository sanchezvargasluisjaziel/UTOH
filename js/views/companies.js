/* Vista: Catálogo de Empresas */

// =========================================================================
// 6. CATÁLOGO DE EMPRESAS (SIMPLIFICADO, SIN GIRO, DESPLIEGUE LIMPIO)
// =========================================================================
function renderCompanies() {
    const companies = window.appState.companies;
    let html = `
        <div class="mb-6">
            <span class="text-xs font-bold uppercase tracking-wider text-indigo-600">Configuración de Padrón</span>
            <h2 class="text-2xl font-bold text-gray-800">Catálogo de Empresas Importadoras</h2>
            <p class="text-sm text-gray-500">Dé de alta o de baja a las empresas importadoras (nombre, RTN y módulos). Las cuotas se asignan aparte, en Asignación de Cuota.</p>
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

                    <div>
                        <label class="block text-xs font-bold text-gray-700 mb-1.5">Módulos que Importa <span class="text-red-500">*</span></label>
                        <div class="grid grid-cols-3 gap-2 bg-gray-50 p-2.5 rounded-lg border border-gray-200 text-xs">
                            <label class="flex items-center space-x-1.5 cursor-pointer">
                                <input type="checkbox" id="cat_mod1" value="1" checked onchange="renderDynamicSubstancePicker('cat')" class="rounded text-indigo-600 h-4 w-4">
                                <span class="font-semibold">Módulo 1</span>
                            </label>
                            <label class="flex items-center space-x-1.5 cursor-pointer">
                                <input type="checkbox" id="cat_mod2" value="2" onchange="renderDynamicSubstancePicker('cat')" class="rounded text-emerald-600 h-4 w-4">
                                <span class="font-semibold">Módulo 2</span>
                            </label>
                            <label class="flex items-center space-x-1.5 cursor-pointer">
                                <input type="checkbox" id="cat_mod3" value="3" onchange="renderDynamicSubstancePicker('cat')" class="rounded text-purple-600 h-4 w-4">
                                <span class="font-semibold">Módulo 3</span>
                            </label>
                        </div>
                    </div>

                    <!-- Selector compacto de sustancias de los módulos elegidos -->
                    <div class="border border-gray-200 bg-gray-50/60 rounded-lg p-3 space-y-2">
                        <div class="flex items-center justify-between">
                            <span class="text-xs font-bold text-gray-700">Sustancias / Equipos del Módulo</span>
                            <div class="flex items-center gap-2">
                                <span id="cat_sub_count_badge" class="text-[11px] font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">0 seleccionadas</span>
                                <button type="button" onclick="toggleAllVisibleSubstances('cat', true)" class="text-[11px] text-indigo-600 hover:underline font-semibold">Todas</button>
                                <button type="button" onclick="toggleAllVisibleSubstances('cat', false)" class="text-[11px] text-gray-500 hover:underline">Limpiar</button>
                            </div>
                        </div>
                        <input type="text" id="cat_sub_search" oninput="filterDynamicSubstancePicker('cat')" class="w-full p-1.5 border border-gray-300 rounded text-xs bg-white outline-none" placeholder="Buscar sustancia o equipo...">
                        <div id="cat_substances_container" class="max-h-40 overflow-y-auto space-y-1 pr-1"></div>
                    </div>

                    <button type="submit" class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-sm shadow-sm">
                        + Agregar Empresa y Actualizar Módulos
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
                                <th class="p-3.5 font-semibold">Módulos</th>
                                <th class="p-3.5 font-semibold">Sustancias / Equipos Autorizados</th>
                                <th class="p-3.5 font-semibold text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100 text-sm">
    `;

    if (companies.length === 0) {
        html += `<tr><td colspan="5" class="p-8 text-center text-gray-400">No hay empresas registradas.</td></tr>`;
    } else {
        companies.forEach(c => {
            const mods = (c.modules || ['1']).map(m => {
                const color = m === '1' ? 'bg-indigo-100 text-indigo-800' : (m === '2' ? 'bg-emerald-100 text-emerald-800' : 'bg-purple-100 text-purple-800');
                return `<span class="inline-block px-2 py-0.5 rounded text-[11px] font-bold ${color} mr-1">M${m}</span>`;
            }).join('');

            const subs = c.allowedSubstances || [];
            const previewSubs = subs.slice(0, 3).join(', ');
            const extraCount = subs.length > 3 ? ` <span class="text-indigo-600 font-bold">(+${subs.length - 3} más)</span>` : '';

            html += `
                <tr class="hover:bg-gray-50">
                    <td class="p-3.5 font-bold text-gray-900">${escapeHtml(c.name)}</td>
                    <td class="p-3.5 font-mono text-xs text-gray-600 whitespace-nowrap">${c.rtn ? escapeHtml(c.rtn) : '<span class="text-amber-600 font-sans font-semibold">Sin RTN</span>'}</td>
                    <td class="p-3.5 whitespace-nowrap">${mods}</td>
                    <td class="p-3.5 text-xs text-gray-600 max-w-xs">
                        ${subs.length > 0 ? `${previewSubs}${extraCount}` : '<span class="text-gray-400">Todas las del módulo</span>'}
                    </td>
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

// Despliegue Dinámico Compacto de Sustancias según Módulos Seleccionados
window.renderDynamicSubstancePicker = function(prefix) {
    const mod1Checked = document.getElementById(prefix === 'edit' ? 'edit-comp-mod1' : `${prefix}_mod1`)?.checked;
    const mod2Checked = document.getElementById(prefix === 'edit' ? 'edit-comp-mod2' : `${prefix}_mod2`)?.checked;
    const mod3Checked = document.getElementById(prefix === 'edit' ? 'edit-comp-mod3' : `${prefix}_mod3`)?.checked;

    const selectedMods = [];
    if (mod1Checked) selectedMods.push('1');
    if (mod2Checked) selectedMods.push('2');
    if (mod3Checked) selectedMods.push('3');

    const container = document.getElementById(`${prefix}_substances_container`);
    const badge = document.getElementById(`${prefix}_sub_count_badge`);
    const searchVal = (document.getElementById(`${prefix}_sub_search`)?.value || '').toLowerCase().trim();
    if (!container) return;

    const setRef = window.tempSelectedSubstances[prefix];
    const availableSubs = window.appState.substances.filter(s => selectedMods.includes(String(s.module)));

    // Limpiar del Set sustancias de módulos que fueron desmarcados
    Array.from(setRef).forEach(sName => {
        const sObj = window.appState.substances.find(x => x.name === sName);
        if (sObj && !selectedMods.includes(String(sObj.module))) {
            setRef.delete(sName);
        }
    });

    if (badge) badge.innerText = `${setRef.size} seleccionadas`;

    if (selectedMods.length === 0) {
        container.innerHTML = `<div class="text-xs text-amber-700 p-2">Seleccione al menos un módulo (1, 2 o 3).</div>`;
        return;
    }

    const filteredSubs = availableSubs.filter(s =>
        s.name.toLowerCase().includes(searchVal) || (s.tariff || '').toLowerCase().includes(searchVal)
    );

    let html = '';
    selectedMods.forEach(m => {
        const group = filteredSubs.filter(s => String(s.module) === m);
        if (group.length === 0) return;
        const modTitle = m === '1' ? 'Módulo 1: Regulados' : (m === '2' ? 'Módulo 2: No Regulados' : 'Módulo 3: Equipos');
        html += `<div class="text-[10px] font-bold uppercase text-indigo-700 bg-indigo-50 px-2 py-1 rounded mt-1">${modTitle}</div>`;
        group.forEach(s => {
            const checked = setRef.has(s.name) ? 'checked' : '';
            const safeName = jsArg(s.name);
            html += `
                <label class="flex items-center justify-between px-2 py-1 bg-white hover:bg-gray-50 rounded border border-gray-100 cursor-pointer text-xs">
                    <span class="flex items-center space-x-2 truncate pr-2">
                        <input type="checkbox" ${checked} onchange="toggleSingleSubstance('${prefix}', ${safeName}, this.checked)" class="rounded text-indigo-600 h-3.5 w-3.5">
                        <span class="truncate font-medium text-gray-800">${escapeHtml(s.name)}</span>
                    </span>
                    <span class="font-mono text-[10px] text-gray-400 shrink-0">${escapeHtml(s.tariff)}</span>
                </label>
            `;
        });
    });

    container.innerHTML = html || `<div class="text-xs text-gray-400 p-2">Sin resultados para ese filtro.</div>`;
};

window.toggleSingleSubstance = function(prefix, subName, isChecked) {
    const setRef = window.tempSelectedSubstances[prefix];
    if (isChecked) setRef.add(subName);
    else setRef.delete(subName);
    const badge = document.getElementById(`${prefix}_sub_count_badge`);
    if (badge) badge.innerText = `${setRef.size} seleccionadas`;
};

window.toggleAllVisibleSubstances = function(prefix, selectAll) {
    const mod1Checked = document.getElementById(prefix === 'edit' ? 'edit-comp-mod1' : `${prefix}_mod1`)?.checked;
    const mod2Checked = document.getElementById(prefix === 'edit' ? 'edit-comp-mod2' : `${prefix}_mod2`)?.checked;
    const mod3Checked = document.getElementById(prefix === 'edit' ? 'edit-comp-mod3' : `${prefix}_mod3`)?.checked;
    const selectedMods = [];
    if (mod1Checked) selectedMods.push('1');
    if (mod2Checked) selectedMods.push('2');
    if (mod3Checked) selectedMods.push('3');

    const setRef = window.tempSelectedSubstances[prefix];
    if (!selectAll) {
        setRef.clear();
    } else {
        window.appState.substances
            .filter(s => selectedMods.includes(String(s.module)))
            .forEach(s => setRef.add(s.name));
    }
    renderDynamicSubstancePicker(prefix);
};

window.filterDynamicSubstancePicker = function(prefix) {
    renderDynamicSubstancePicker(prefix);
};

function handleAddCompanyFromCatalog(e) {
    e.preventDefault();
    const name = document.getElementById('cat_comp_name').value.trim();
    const rtn = document.getElementById('cat_comp_rtn').value.trim();
    const modules = [];
    if (document.getElementById('cat_mod1').checked) modules.push('1');
    if (document.getElementById('cat_mod2').checked) modules.push('2');
    if (document.getElementById('cat_mod3').checked) modules.push('3');
    const allowedSubstances = Array.from(window.tempSelectedSubstances.cat);
    if (!window.saveCompanyToDB(name, rtn, modules, allowedSubstances)) return;
    document.getElementById('cat_comp_name').value = '';
    document.getElementById('cat_comp_rtn').value = '';
    window.tempSelectedSubstances.cat.clear();
    renderDynamicSubstancePicker('cat');
}
