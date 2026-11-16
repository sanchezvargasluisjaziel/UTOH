/* Navegación, renderizado principal e inicialización. */

window.renderAll = function() {
    updateGlobalDropdowns();
    renderActiveTab();
    updateTopRegisterButton();
    window.savePersistedState();
};

function updateGlobalDropdowns() {
    const fySelect = document.getElementById('global-fiscal-year');
    if (fySelect) {
        const currentVal = fySelect.value ? Number(fySelect.value) : 2026;
        fySelect.innerHTML = '';
        const sortedYears = [...window.appState.fiscalYears].sort((a,b) => a.year - b.year);
        sortedYears.forEach(y => {
            const opt = new Option(`AF ${y.year}`, y.year);
            if (Number(y.year) === currentVal) opt.selected = true;
            fySelect.add(opt);
        });
        if (!sortedYears.some(y => Number(y.year) === currentVal) && sortedYears.length > 0) {
            fySelect.value = sortedYears[sortedYears.length - 1].year;
        }
    }

    const compRoleGroup = document.getElementById('user-role-companies');
    const roleSel = document.getElementById('user-role-selector');
    if (compRoleGroup && roleSel) {
        const prevRole = roleSel.value;
        compRoleGroup.innerHTML = '';
        window.appState.companies.forEach(c => {
            const opt = document.createElement('option');
            opt.value = `COMPANY_VIEW:${c.name}`;
            opt.textContent = `🏢 Empresa: ${c.name}`;
            compRoleGroup.appendChild(opt);
        });
        if (Array.from(roleSel.options).some(o => o.value === prevRole)) {
            roleSel.value = prevRole;
        }
    }
}

function updateTopRegisterButton() {
    const btn = document.getElementById('top-register-btn');
    if (!btn) return;
    const tab = window.appState.activeTab;
    if (tab === 'mod1') {
        btn.innerText = '+ Registrar en Módulo 1';
        btn.className = 'px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors flex items-center';
    } else if (tab === 'mod2') {
        btn.innerText = '+ Registrar en Módulo 2';
        btn.className = 'px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors flex items-center';
    } else if (tab === 'mod3') {
        btn.innerText = '+ Registrar en Módulo 3';
        btn.className = 'px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors flex items-center';
    } else {
        btn.innerText = '+ Registrar Importación';
        btn.className = 'px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors flex items-center';
    }
}

function onRoleSelectorChange() {
    const sel = document.getElementById('user-role-selector');
    if (sel && sel.value.startsWith('COMPANY_VIEW:')) {
        const compName = sel.value.replace('COMPANY_VIEW:', '');
        window.appState.selectedPortalCompany = compName;
        switchTab('portal');
        return;
    }
    window.renderAll();
}

function switchTab(tabId) {
    window.appState.activeTab = tabId;
    tabs.forEach(t => {
        const btn = document.getElementById('tab-' + t);
        if (btn) {
            btn.className = (t === tabId)
                ? "tab-active flex items-center px-6 py-3 text-left w-full transition-colors duration-150 font-medium text-sm"
                : "tab-inactive flex items-center px-6 py-3 text-left w-full transition-colors duration-150 font-medium text-sm";
        }
    });
    const mobSel = document.getElementById('mobile-nav-select');
    if (mobSel) mobSel.value = tabId;
    window.renderAll();
}

function renderCompanyMonitorBanner() {
    const monitored = getMonitoredCompanyFilter();
    if (!monitored) return '';
    return `
        <div class="mb-4 bg-indigo-900 text-white px-4 py-2.5 rounded-xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span class="text-xs sm:text-sm">Vista filtrada para empresa: <b>${monitored}</b></span>
            <div class="flex items-center gap-2">
                <button onclick="switchTab('portal')" class="text-xs bg-emerald-600 hover:bg-emerald-500 px-3 py-1 rounded font-semibold">Mi Portal</button>
                <button onclick="document.getElementById('user-role-selector').value='Admin 1 (Sistema)'; renderAll();" class="text-xs bg-indigo-700 hover:bg-indigo-600 px-3 py-1 rounded font-semibold">Ver Todo (Admin)</button>
            </div>
        </div>
    `;
}

function renderActiveTab() {
    const contentDiv = document.getElementById('main-content');
    if (!contentDiv) return;
    const currentTab = window.appState.activeTab;
    const currentFY = getActiveFiscalYear();
    const monitoredCompany = getMonitoredCompanyFilter();

    let activeImports = window.appState.imports.filter(imp => Number(imp.fiscalYear) === currentFY);
    if (monitoredCompany) {
        activeImports = activeImports.filter(imp => imp.company === monitoredCompany);
    }

    let html = renderCompanyMonitorBanner();

    if (currentTab === 'quotas') {
        html += renderQuotas();
    } else if (currentTab === 'mod1') {
        html += renderModule1(activeImports);
    } else if (currentTab === 'mod2') {
        html += renderModule2(activeImports);
    } else if (currentTab === 'mod3') {
        html += renderModule3(activeImports);
    } else if (currentTab === 'portal') {
        html += renderCompanyPortal();
    } else if (currentTab === 'companies') {
        html += renderCompanies();
        setTimeout(() => renderDynamicSubstancePicker('cat'), 0);
    } else if (currentTab === 'substances') {
        html += renderSubstances();
    } else if (currentTab === 'years') {
        html += renderYears();
    } else if (currentTab === 'audit') {
        html += renderAudit();
    }

    contentDiv.innerHTML = html;
}

// Inicializar al cargar la ventana
window.addEventListener('DOMContentLoaded', () => {
    window.renderAll();
});
