/* Componentes de interfaz: alertas, confirmaciones y notificaciones (toast). */

window.customAlert = function(title, message) {
    document.getElementById('custom-dialog-title').innerText = title;
    document.getElementById('custom-dialog-message').innerText = message;
    document.getElementById('custom-dialog-buttons').innerHTML = `
        <button onclick="document.getElementById('custom-dialog-modal').classList.add('hidden')" class="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700">Entendido</button>
    `;
    document.getElementById('custom-dialog-modal').classList.remove('hidden');
};

window.customConfirm = function(title, message, onConfirmCallback) {
    document.getElementById('custom-dialog-title').innerText = title;
    document.getElementById('custom-dialog-message').innerText = message;
    const btns = document.getElementById('custom-dialog-buttons');
    btns.innerHTML = '';

    const cancelBtn = document.createElement('button');
    cancelBtn.className = "px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-200";
    cancelBtn.innerText = "Cancelar";
    cancelBtn.onclick = () => document.getElementById('custom-dialog-modal').classList.add('hidden');

    const okBtn = document.createElement('button');
    okBtn.className = "px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700";
    okBtn.innerText = "Confirmar";
    okBtn.onclick = () => {
        document.getElementById('custom-dialog-modal').classList.add('hidden');
        if (onConfirmCallback) onConfirmCallback();
    };

    btns.appendChild(cancelBtn);
    btns.appendChild(okBtn);
    document.getElementById('custom-dialog-modal').classList.remove('hidden');
};

window.showToast = function(msg) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = "bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg text-xs font-semibold flex items-center space-x-2 border border-slate-700";
    const dot = document.createElement('span');
    dot.className = 'w-2 h-2 rounded-full bg-emerald-400 shrink-0';
    const text = document.createElement('span');
    text.textContent = msg;
    toast.append(dot, text);
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3200);
};
