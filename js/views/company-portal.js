/* Vista: Portal de la Empresa */

// =========================================================================
// 5. VISTA DE EMPRESA (PORTAL DE MONITOREO PERSONAL Y BUZÓN DE RECIBOS)
// =========================================================================
function renderCompanyPortal() {
    const currentFY = getActiveFiscalYear();
    const companies = window.appState.companies;
    if (companies.length === 0) {
        return `<div class="bg-white p-8 rounded-xl border text-center text-gray-500">No hay empresas registradas. Agregue una empresa primero.</div>`;
    }

    const monitored = getMonitoredCompanyFilter();
    const selectedName = monitored || window.appState.selectedPortalCompany || companies[0].name;
    const compObj = companies.find(c => c.name === selectedName) || companies[0];
    const compImports = window.appState.imports.filter(i => i.company === compObj.name && Number(i.fiscalYear) === currentFY);
    const compQuotas = window.appState.quotas.filter(q => q.company === compObj.name && Number(q.year) === currentFY);

    let html = `
        <div class="mb-6 bg-slate-900 text-white p-5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
                <span class="text-[11px] font-bold uppercase tracking-wider text-indigo-300">Portal de Monitoreo Personal y Comprobantes</span>
                <h2 class="text-xl font-bold mt-0.5">${escapeHtml(compObj.name)} — Año Fiscal ${currentFY}</h2>
                <div class="flex flex-wrap gap-1.5 mt-2">
                    ${companyModules(compObj.name, currentFY).map(m => `<span class="px-2 py-0.5 bg-white/10 rounded text-xs font-semibold">${moduleName(m)}</span>`).join('')}
                </div>
            </div>
            <div class="flex items-center gap-2">
                <label class="text-xs text-slate-300 font-semibold">Empresa:</label>
                <select onchange="window.appState.selectedPortalCompany=this.value; renderAll();" class="p-2 rounded-lg bg-slate-800 text-white border border-slate-700 text-xs font-bold">
                    ${companies.map(c => `<option value="${escapeHtml(c.name)}" ${c.name === compObj.name ? 'selected' : ''}>${escapeHtml(c.name)}</option>`).join('')}
                </select>
            </div>
        </div>

        <!-- Balance de Cuotas de la Empresa -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6">
            <h3 class="font-bold text-gray-800 text-sm mb-3">Estado de Cuotas Autorizadas (AF ${currentFY})</h3>
            ${compQuotas.length === 0
                ? `<p class="text-xs text-gray-400">Esta empresa no tiene cuotas asignadas para este año fiscal.</p>`
                : `<div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    ${compQuotas.map(q => {
                        const bal = getQuotaBalance(q.company, q.substance, currentFY);
                        return `
                            <div class="p-3.5 rounded-lg border border-gray-200 bg-gray-50">
                                <div class="font-bold text-indigo-700 text-sm mb-1.5">${escapeHtml(q.substance)}</div>
                                <table class="w-full text-xs">
                                    <thead>
                                        <tr class="text-[10px] uppercase text-gray-400">
                                            <th class="text-left font-semibold pb-1"></th>
                                            <th class="text-right font-semibold pb-1">TM</th>
                                            <th class="text-right font-semibold pb-1">TCO₂eq</th>
                                        </tr>
                                    </thead>
                                    <tbody class="text-gray-600">
                                        <tr><td>Asignada</td><td class="text-right font-bold">${fmtNum(bal.limitTM)}</td><td class="text-right">${fmtCO2Num(bal.limitCO2)}</td></tr>
                                        <tr><td>Usado</td><td class="text-right font-bold">${fmtNum(bal.usedTM)}</td><td class="text-right">${fmtCO2Num(bal.usedCO2)}</td></tr>
                                        <tr class="font-extrabold ${bal.remTM < 0 ? 'text-red-600' : 'text-emerald-700'}"><td>Disponible</td><td class="text-right">${fmtNum(bal.remTM)}</td><td class="text-right">${fmtCO2Num(bal.remCO2)}</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        `;
                    }).join('')}
                   </div>`
            }
        </div>

        <!-- Buzón de Comprobantes QR Entregados a la Empresa -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div class="px-5 py-3.5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 class="font-bold text-gray-800 text-sm">Buzón de Comprobantes Digitales Recibidos (${escapeHtml(compObj.name)})</h3>
                <span class="text-xs font-semibold text-emerald-700">${compImports.length} recibos oficiales</span>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500">
                            <th class="p-3.5 font-semibold">Folio Oficial</th>
                            <th class="p-3.5 font-semibold">Apartado</th>
                            <th class="p-3.5 font-semibold">Sustancia / Equipo</th>
                            <th class="p-3.5 font-semibold">Fecha Orden</th>
                            <th class="p-3.5 font-semibold text-right">Cantidad</th>
                            <th class="p-3.5 font-semibold">Unidad</th>
                            <th class="p-3.5 font-semibold text-right">TCO₂eq</th>
                            <th class="p-3.5 font-semibold text-right">Comprobante</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100 text-sm">
                        ${compImports.length === 0
                            ? `<tr><td colspan="8" class="p-6 text-center text-gray-400">No hay comprobantes registrados para esta empresa en el AF ${currentFY}.</td></tr>`
                            : compImports.map(imp => `
                                <tr class="hover:bg-gray-50">
                                    <td class="p-3.5 font-mono text-xs font-bold text-indigo-700">${escapeHtml(imp.trackingNumber)}</td>
                                    <td class="p-3.5 text-xs font-semibold">${moduleName(imp.module)}</td>
                                    <td class="p-3.5 font-semibold">${escapeHtml(imp.type)}</td>
                                    <td class="p-3.5 text-xs">${escapeHtml(imp.orderDate)}</td>
                                    <td class="p-3.5 text-right font-bold">${imp.module === '3' ? fmtNum(imp.qty, 0) : fmtNum(imp.qty)}</td>
                                    <td class="p-3.5 text-xs text-gray-600">${imp.module === '3' ? 'Unidades' : 'TM'}</td>
                                    <td class="p-3.5 text-right text-gray-600">${imp.module === '3' ? '<span class="text-gray-400">No aplica</span>' : fmtCO2Num(calcCO2(imp.qty, imp.type))}</td>
                                    <td class="p-3.5 text-right">
                                        <button onclick="openReceiptById('${imp.id}', 'company')" class="px-3 py-1 bg-indigo-600 text-white rounded text-xs font-bold hover:bg-indigo-700">
                                            Ver Ejemplar Empresa
                                        </button>
                                    </td>
                                </tr>
                            `).join('')
                        }
                    </tbody>
                </table>
            </div>
        </div>
    `;
    return html;
}
