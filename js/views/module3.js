/* Vista: Módulo 3 (Equipos y aparatos) */

// =========================================================================
// 4. MÓDULO 3: EQUIPOS Y APARATOS (SOLO UNIDADES)
// =========================================================================
function renderModule3(activeImports) {
    const currentFY = getActiveFiscalYear();
    const monitored = getMonitoredCompanyFilter();
    const mod3Imports = filterByMonth(activeImports.filter(i => String(i.module) === '3'), 'mod3');

    let mod3Companies = window.appState.companies.filter(c => Array.isArray(c.modules) && c.modules.includes('3'));
    if (monitored) mod3Companies = mod3Companies.filter(c => c.name === monitored);

    let html = `
        <div class="mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
                <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800">MÓDULO 3 • EQUIPOS Y APARATOS (UNIDADES)</span>
                <h2 class="text-2xl font-bold text-gray-800 mt-1">Equipos con Gases Refrigerantes (AF ${currentFY})</h2>
                <p class="text-sm text-gray-500">Medición exclusiva en Unidades de aparatos con gases regulados o no regulados.</p>
            </div>
            <div class="flex flex-wrap items-center gap-2">
                <button onclick="openQuickCompanyModal('3')" class="px-3 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-bold">
                    + Agregar Empresa
                </button>
                <button onclick="clearModuleData('3')" class="px-3 py-2 bg-white border border-red-200 hover:bg-red-50 text-red-600 rounded-lg text-xs font-bold">
                    Vaciar Módulo 3
                </button>
                <button onclick="openModuleImportModal('3')" class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold shadow-sm">
                    + Registrar Importación (Módulo 3)
                </button>
            </div>
        </div>

        ${renderReportToolbar('mod3')}

        <!-- Empresas Activas en Módulo 3 -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div class="px-5 py-3.5 border-b border-gray-100 flex justify-between items-center bg-purple-50/50">
                <h3 class="font-bold text-gray-800 text-sm">Empresas Importadoras de Equipos en Módulo 3 (AF ${currentFY})</h3>
                <span class="text-xs font-bold text-purple-700">${mod3Companies.length} empresas</span>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500">
                            <th class="p-3.5 font-semibold">Empresa Importadora</th>
                            <th class="p-3.5 font-semibold">Categorías de Equipos Autorizadas</th>
                            <th class="p-3.5 font-semibold text-right">Total Unidades AF ${currentFY} · ${monthLabel('mod3')}</th>
                            <th class="p-3.5 font-semibold text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100 text-sm">
    `;

    if (mod3Companies.length === 0) {
        html += `<tr><td colspan="4" class="p-6 text-center text-gray-400">No hay empresas registradas para el Módulo 3.</td></tr>`;
    } else {
        mod3Companies.forEach(c => {
            const mod3Subs = (c.allowedSubstances || []).filter(sName => {
                const sObj = window.appState.substances.find(s => s.name === sName);
                return sObj && String(sObj.module) === '3';
            });
            const totalUnits = mod3Imports
                .filter(i => i.company === c.name)
                .reduce((acc, cur) => acc + parseInt(cur.qty || 0, 10), 0);

            html += `
                <tr class="hover:bg-gray-50">
                    <td class="p-3.5 font-bold text-gray-900">${c.name}</td>
                    <td class="p-3.5 text-xs text-gray-600">${mod3Subs.length > 0 ? mod3Subs.join(', ') : 'Todos los equipos del catálogo Módulo 3'}</td>
                    <td class="p-3.5 text-right font-extrabold text-purple-700">${totalUnits.toLocaleString('en-US')} Unidades</td>
                    <td class="p-3.5 text-right whitespace-nowrap">
                        <button onclick="openEditCompanyModal('${c.id}')" class="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded font-bold text-xs">Editar Empresa</button>
                    </td>
                </tr>
            `;
        });
    }

    html += `
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Movimientos Detallados Módulo 3 -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div class="px-5 py-3.5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 class="font-bold text-gray-800 text-sm">Movimientos de Importación Registrados — Módulo 3</h3>
                <span class="text-xs font-semibold text-gray-500">${mod3Imports.length} movimientos</span>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500">
                            <th class="p-3.5 font-semibold">Folio / QR</th>
                            <th class="p-3.5 font-semibold">Fecha Orden</th>
                            <th class="p-3.5 font-semibold">Empresa</th>
                            <th class="p-3.5 font-semibold">Equipo / Descripción</th>
                            <th class="p-3.5 font-semibold">Refrigerante</th>
                            <th class="p-3.5 font-semibold">Arancel</th>
                            <th class="p-3.5 font-semibold text-right">Unidades</th>
                            <th class="p-3.5 font-semibold text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100 text-sm">
    `;

    if (mod3Imports.length === 0) {
        html += `<tr><td colspan="8" class="p-8 text-center text-gray-400">Sin movimientos registrados en el Módulo 3.</td></tr>`;
    } else {
        mod3Imports.forEach(imp => {
            html += `
                <tr class="hover:bg-gray-50">
                    <td class="p-3.5">
                        <button onclick="openReceiptById('${imp.id}')" class="font-mono text-xs font-bold text-purple-700 hover:underline bg-purple-50 px-2 py-1 rounded">
                            ${imp.trackingNumber || 'VER-QR'}
                        </button>
                    </td>
                    <td class="p-3.5 text-xs">
                        <div class="font-bold text-gray-800">Orden: ${imp.orderDate}</div>
                        <div class="text-gray-400">Llegada: ${imp.arrivalDate || 'Pendiente'}</div>
                    </td>
                    <td class="p-3.5 font-bold text-gray-900">${imp.company}</td>
                    <td class="p-3.5">
                        <div class="font-semibold text-gray-800 text-xs">${imp.type}</div>
                        <div class="text-xs text-purple-700">${imp.productDescription || ''}</div>
                    </td>
                    <td class="p-3.5 text-xs">
                        <span class="font-bold">${imp.contained || 'N/A'}</span>
                        <span class="block text-[10px] text-gray-500">${imp.regStatus || ''}</span>
                    </td>
                    <td class="p-3.5 font-mono text-xs text-gray-600">${imp.tariff}</td>
                    <td class="p-3.5 text-right font-bold text-gray-900">${ parseInt(imp.qty, 10).toLocaleString('en-US') } Unid.</td>
                    <td class="p-3.5 text-right whitespace-nowrap">
                        <button onclick="openReceiptById('${imp.id}')" class="text-emerald-600 hover:text-emerald-800 font-bold text-xs mr-2">Recibo/QR</button>
                        <button onclick="openEditImportModal('${imp.id}')" class="text-indigo-600 hover:text-indigo-900 font-bold text-xs mr-2">Editar</button>
                        <button onclick="deleteImport('${imp.id}')" class="text-red-500 hover:text-red-700 font-bold text-xs">Eliminar</button>
                    </td>
                </tr>
            `;
        });
    }

    html += `</tbody></table></div></div>`;
    return html;
}
