/* Vista: Registro de Auditoría. */

function renderAudit() {
    const logs = getFilteredAuditLogs();
    return `
        <div class="mb-6">
            <h2 class="text-2xl font-bold text-gray-800">Registro de Auditoría de Administradores</h2>
            <p class="text-sm text-gray-500">Bitácora en tiempo real de quién ha modificado cuotas, empresas o importaciones.</p>
        </div>
        ${renderAuditToolbar()}
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div class="px-5 py-3 border-b border-gray-100 bg-gray-50 text-xs font-semibold text-gray-500">${logs.length} registro(s) en el periodo seleccionado</div>
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="bg-gray-50 border-b text-xs uppercase text-gray-500">
                        <th class="p-3.5">Fecha / Hora</th>
                        <th class="p-3.5">Usuario / Administrador</th>
                        <th class="p-3.5">Apartado</th>
                        <th class="p-3.5">Movimiento Registrado</th>
                    </tr>
                </thead>
                <tbody class="divide-y text-sm">
                    ${logs.length === 0 ? `<tr><td colspan="4" class="p-8 text-center text-gray-400">Sin registros de auditoría en este periodo.</td></tr>` : logs.map(a => `
                        <tr>
                            <td class="p-3.5 font-mono text-xs text-gray-500 whitespace-nowrap">${escapeHtml(a.timestamp)}</td>
                            <td class="p-3.5 font-bold text-indigo-700 whitespace-nowrap">${escapeHtml(a.user)}</td>
                            <td class="p-3.5 text-xs font-semibold">${escapeHtml(a.module)}</td>
                            <td class="p-3.5 text-xs text-gray-700">${escapeHtml(a.action)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}
