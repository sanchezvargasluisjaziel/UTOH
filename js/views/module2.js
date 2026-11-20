/* Vista: Módulo 2 (Sustancias sin cuota) */

// =========================================================================
// 3. MÓDULO 2: GASES REFRIGERANTES NO REGULADOS
// =========================================================================
function renderModule2(activeImports) {
    const currentFY = getActiveFiscalYear();
    const mod2Imports = filterByMonth(activeImports.filter(i => String(i.module) === '2'), 'mod2');

    // Empresas con importaciones en este apartado dentro del periodo (año fiscal y mes activos)
    // Empresas asignadas a este apartado en Asignación de Cuota más las que importaron en el periodo
    const mod2Companies = companiesInModule('2', mod2Imports);

    let html = `
        <div class="mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
                <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">PROTOCOLO DE MONTREAL • SIN CUOTA</span>
                <h2 class="text-2xl font-bold text-gray-800 mt-1">${moduleName('2')} (AF ${currentFY})</h2>
                <p class="text-sm text-gray-500">Contabilización en Toneladas con su fracción arancelaria correspondiente.</p>
            </div>
            <div class="flex flex-wrap items-center gap-2">
                <button onclick="clearModuleData('2')" class="px-3 py-2 bg-white border border-red-200 hover:bg-red-50 text-red-600 rounded-lg text-xs font-bold">
                    Vaciar Movimientos
                </button>
                <button onclick="openModuleImportModal('2')" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm">
                    + Registrar Importación
                </button>
            </div>
        </div>

        ${renderGwpNotice(mod2Imports.map(i => i.type))}
        ${renderReportToolbar('mod2')}

        <!-- Empresas Activas en Módulo 2 -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div class="px-5 py-3.5 border-b border-gray-100 flex justify-between items-center bg-emerald-50/50">
                <h3 class="font-bold text-gray-800 text-sm">Empresas Importadoras y Total Acumulado (AF ${currentFY})</h3>
                <span class="text-xs font-bold text-emerald-700">${mod2Companies.length} empresas</span>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500">
                            <th class="p-3.5 font-semibold">Empresa Importadora</th>
                            <th class="p-3.5 font-semibold">Sustancias</th>
                            <th class="p-3.5 font-semibold text-right">Total Importado (TM)</th>
                            <th class="p-3.5 font-semibold text-right">Total Importado (TCO₂eq)</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100 text-sm">
    `;

    if (mod2Companies.length === 0) {
        html += `<tr><td colspan="4" class="p-6 text-center text-gray-400">Ninguna empresa asignada ni con importaciones en este apartado durante el periodo.</td></tr>`;
    } else {
        mod2Companies.forEach(name => {
            const compImports = mod2Imports.filter(i => i.company === name);
            const subs = substancesOfCompanyInModule(name, '2', compImports);
            const totalTon = round2(compImports.reduce((acc, cur) => acc + parseFloat(cur.qty || 0), 0));

            html += `
                <tr class="hover:bg-gray-50">
                    <td class="p-3.5 font-bold text-gray-900">${escapeHtml(name)}</td>
                    <td class="p-3.5 text-xs text-gray-600">${subs.map(escapeHtml).join(', ')}</td>
                    <td class="p-3.5 text-right font-extrabold text-emerald-700">${fmtNum(totalTon)}</td>
                    <td class="p-3.5 text-right font-bold text-gray-600">${fmtCO2Num(sumCO2(compImports))}</td>
                </tr>
            `;
        });
    }

    html += `
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Movimientos Detallados Módulo 2 -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div class="px-5 py-3.5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 class="font-bold text-gray-800 text-sm">Movimientos de Importación Registrados (AF ${currentFY} · ${monthLabel('mod2')})</h3>
                <span class="text-xs font-semibold text-gray-500">${mod2Imports.length} movimientos</span>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500">
                            <th class="p-3.5 font-semibold">Folio / QR</th>
                            <th class="p-3.5 font-semibold">Fecha Orden</th>
                            <th class="p-3.5 font-semibold">Empresa</th>
                            <th class="p-3.5 font-semibold">Sustancia</th>
                            <th class="p-3.5 font-semibold">Fracción Arancelaria</th>
                            <th class="p-3.5 font-semibold text-right">Cantidad (TM)</th>
                            <th class="p-3.5 font-semibold text-right">Cantidad (TCO₂eq)</th>
                            <th class="p-3.5 font-semibold text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100 text-sm">
    `;

    if (mod2Imports.length === 0) {
        html += `<tr><td colspan="8" class="p-8 text-center text-gray-400">Sin movimientos registrados en este apartado.</td></tr>`;
    } else {
        mod2Imports.forEach(imp => {
            html += `
                <tr class="hover:bg-gray-50">
                    <td class="p-3.5">
                        <button onclick="openReceiptById('${imp.id}')" class="font-mono text-xs font-bold text-emerald-700 hover:underline bg-emerald-50 px-2 py-1 rounded">
                            ${escapeHtml(imp.trackingNumber || 'VER-QR')}
                        </button>
                    </td>
                    <td class="p-3.5 text-xs">
                        <div class="font-bold text-gray-800">Orden: ${escapeHtml(imp.orderDate)}</div>
                        <div class="text-gray-400">Llegada: ${escapeHtml(imp.arrivalDate || 'Pendiente')}</div>
                    </td>
                    <td class="p-3.5 font-bold text-gray-900">${escapeHtml(imp.company)}</td>
                    <td class="p-3.5 font-semibold text-emerald-700">${escapeHtml(imp.type)}</td>
                    <td class="p-3.5 font-mono text-xs text-gray-600">${escapeHtml(imp.tariff)}</td>
                    <td class="p-3.5 text-right font-bold text-gray-900">${fmtNum(imp.qty)}</td>
                    <td class="p-3.5 text-right font-semibold text-gray-600">${fmtCO2Num(calcCO2(imp.qty, imp.type))}</td>
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
