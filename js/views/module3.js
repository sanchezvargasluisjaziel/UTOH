/* Vista: Módulo 3 (Equipos y aparatos) */

// =========================================================================
// 4. MÓDULO 3: EQUIPOS Y APARATOS (SOLO UNIDADES)
// =========================================================================
function renderModule3(activeImports) {
    const currentFY = getActiveFiscalYear();
    const mod3Imports = filterByMonth(activeImports.filter(i => String(i.module) === '3'), 'mod3');

    // Empresas con importaciones de equipos dentro del periodo (año fiscal y mes activos)
    const mod3Companies = [...new Set(mod3Imports.map(i => i.company))].sort((a, b) => a.localeCompare(b));

    let html = `
        <div class="mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
                <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800">EQUIPOS Y APARATOS • UNIDADES</span>
                <h2 class="text-2xl font-bold text-gray-800 mt-1">${moduleName('3')} (AF ${currentFY})</h2>
                <p class="text-sm text-gray-500">Medición exclusiva en Unidades de aparatos con gases regulados o no regulados.</p>
            </div>
            <div class="flex flex-wrap items-center gap-2">
                <button onclick="openQuickCompanyModal()" class="px-3 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-bold">
                    + Agregar Empresa
                </button>
                <button onclick="clearModuleData('3')" class="px-3 py-2 bg-white border border-red-200 hover:bg-red-50 text-red-600 rounded-lg text-xs font-bold">
                    Vaciar Movimientos
                </button>
                <button onclick="openModuleImportModal('3')" class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold shadow-sm">
                    + Registrar Importación
                </button>
            </div>
        </div>

        ${renderReportToolbar('mod3')}

        <!-- Empresas Activas en Módulo 3 -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div class="px-5 py-3.5 border-b border-gray-100 flex justify-between items-center bg-purple-50/50">
                <h3 class="font-bold text-gray-800 text-sm">Empresas Importadoras de Equipos (AF ${currentFY})</h3>
                <span class="text-xs font-bold text-purple-700">${mod3Companies.length} empresas</span>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500">
                            <th class="p-3.5 font-semibold">Empresa Importadora</th>
                            <th class="p-3.5 font-semibold">Categorías de Equipos Importadas</th>
                            <th class="p-3.5 font-semibold text-right">Total (Unidades)</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100 text-sm">
    `;

    if (mod3Companies.length === 0) {
        html += `<tr><td colspan="3" class="p-6 text-center text-gray-400">Ninguna empresa ha importado en este apartado durante el periodo.</td></tr>`;
    } else {
        mod3Companies.forEach(name => {
            const compImports = mod3Imports.filter(i => i.company === name);
            const cats = [...new Set(compImports.map(i => i.type))];
            const totalUnits = compImports.reduce((acc, cur) => acc + parseInt(cur.qty || 0, 10), 0);

            html += `
                <tr class="hover:bg-gray-50">
                    <td class="p-3.5 font-bold text-gray-900">${escapeHtml(name)}</td>
                    <td class="p-3.5 text-xs text-gray-600">${cats.map(escapeHtml).join(', ')}</td>
                    <td class="p-3.5 text-right font-extrabold text-purple-700">${fmtNum(totalUnits, 0)}</td>
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
                <h3 class="font-bold text-gray-800 text-sm">Movimientos de Importación Registrados</h3>
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
                            <th class="p-3.5 font-semibold text-right">Cantidad (Unidades)</th>
                            <th class="p-3.5 font-semibold text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100 text-sm">
    `;

    if (mod3Imports.length === 0) {
        html += `<tr><td colspan="8" class="p-8 text-center text-gray-400">Sin movimientos registrados en este apartado.</td></tr>`;
    } else {
        mod3Imports.forEach(imp => {
            html += `
                <tr class="hover:bg-gray-50">
                    <td class="p-3.5">
                        <button onclick="openReceiptById('${imp.id}')" class="font-mono text-xs font-bold text-purple-700 hover:underline bg-purple-50 px-2 py-1 rounded">
                            ${escapeHtml(imp.trackingNumber || 'VER-QR')}
                        </button>
                    </td>
                    <td class="p-3.5 text-xs">
                        <div class="font-bold text-gray-800">Orden: ${escapeHtml(imp.orderDate)}</div>
                        <div class="text-gray-400">Llegada: ${escapeHtml(imp.arrivalDate || 'Pendiente')}</div>
                    </td>
                    <td class="p-3.5 font-bold text-gray-900">${escapeHtml(imp.company)}</td>
                    <td class="p-3.5">
                        <div class="font-semibold text-gray-800 text-xs">${escapeHtml(imp.type)}</div>
                        <div class="text-xs text-purple-700">${escapeHtml(imp.productDescription || '')}</div>
                    </td>
                    <td class="p-3.5 text-xs">
                        <span class="font-bold">${escapeHtml(imp.contained || 'N/A')}</span>
                        <span class="block text-[10px] text-gray-500">${escapeHtml(imp.regStatus || '')}</span>
                    </td>
                    <td class="p-3.5 font-mono text-xs text-gray-600">${escapeHtml(imp.tariff)}</td>
                    <td class="p-3.5 text-right font-bold text-gray-900">${fmtNum(imp.qty, 0)}</td>
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
