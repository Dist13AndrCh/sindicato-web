let currentEditingSocioId = null;

// --- AUTH ---
auth.onAuthStateChanged(user => {
    if (user) {
        document.getElementById('auth-container').style.display = 'none';
        document.getElementById('app-content').style.display = 'block';
        document.getElementById('logout-btn').style.display = 'block';
        initApp();
    } else {
        document.getElementById('auth-container').style.display = 'block';
        document.getElementById('app-content').style.display = 'none';
        document.getElementById('logout-btn').style.display = 'none';
    }
});

async function login() {
    const e = document.getElementById('email').value;
    const p = document.getElementById('password').value;
    try {
        await auth.signInWithEmailAndPassword(e, p);
    } catch (err) {
        showToast("Error de acceso: " + err.message);
    }
}

function logout() { auth.signOut(); }

// --- LOGICA PRINCIPAL ---
function initApp() {
    loadSocios();
    loadPagos();
    // Escuchar cambios en tiempo real
    getPublicRef('socios').onSnapshot(snap => renderSocios(snap));
    getPublicRef('pagos').orderBy('fecha', 'desc').limit(20).onSnapshot(snap => renderPagos(snap));
}

// Socios
async function addSocio() {
    const n = document.getElementById('socio-nombre').value.trim().toUpperCase();
    if (!n) return;
    showLoading(true);
    await getPublicRef('socios').add({ nombre: n, fechaRegistro: new Date() });
    document.getElementById('socio-nombre').value = '';
    showLoading(false);
    showToast("Socio registrado");
}

function renderSocios(snap) {
    const list = document.getElementById('socios-list');
    const selectPay = document.getElementById('pay-socio-select');
    const selectRep = document.getElementById('report-socio-select');
    
    list.innerHTML = '';
    selectPay.innerHTML = '<option value="">Seleccionar Socio...</option>';
    selectRep.innerHTML = '<option value="">Seleccionar Socio...</option>';

    snap.forEach(doc => {
        const s = doc.data();
        // Lista
        const div = document.createElement('div');
        div.className = 'item-row';
        div.innerHTML = `<span>${s.nombre}</span> 
            <div>
                <button onclick="openEditModal('${doc.id}', '${s.nombre}')" style="background:#444; padding:5px 10px; font-size:12px">Editar</button>
            </div>`;
        list.appendChild(div);
        
        // Selects
        const opt = `<option value="${doc.id}">${s.nombre}</option>`;
        selectPay.innerHTML += opt;
        selectRep.innerHTML += opt;
    });
}

// Pagos
function updatePayDisplay() {
    const qty = parseInt(document.getElementById('pay-qty').value) || 0;
    document.getElementById('pay-amount').value = (qty * 10) + " $"; // Ejemplo: 10$ por cuota
}

async function addPago() {
    const sId = document.getElementById('pay-socio-select').value;
    const qty = parseInt(document.getElementById('pay-qty').value);
    if (!sId || !qty) return showToast("Faltan datos");

    showLoading(true);
    const socioName = document.querySelector(`#pay-socio-select option[value="${sId}"]`).text;
    
    await getPublicRef('pagos').add({
        socioId: sId,
        socioNombre: socioName,
        cuotas: qty,
        monto: qty * 10,
        fecha: new Date()
    });
    
    document.getElementById('pay-qty').value = '';
    updatePayDisplay();
    showLoading(false);
    showToast("Pago registrado con éxito");
}

function renderPagos(snap) {
    const list = document.getElementById('pagos-list');
    list.innerHTML = '';
    snap.forEach(doc => {
        const p = doc.data();
        const div = document.createElement('div');
        div.className = 'item-row';
        div.innerHTML = `<div><strong>${p.socioNombre}</strong><br><small>${p.fecha.toDate().toLocaleDateString()}</small></div>
                         <div style="color:var(--warning)">+ ${p.monto} $</div>`;
        list.appendChild(div);
    });
}

// Reportes
async function generateIndividualReport() {
    const sId = document.getElementById('report-socio-select').value;
    if (!sId) return;
    
    const snap = await getPublicRef('pagos').where('socioId', '==', sId).get();
    const area = document.getElementById('report-print-area');
    let html = `<div class="report-header"><h2>Estado de Cuenta Individual</h2><h3>${document.querySelector(`#report-socio-select option[value="${sId}"]`).text}</h3></div>
                <table class="report-table"><thead><tr><th>Fecha</th><th>Cuotas</th><th>Monto</th></tr></thead><tbody>`;
    
    let total = 0;
    snap.forEach(doc => {
        const p = doc.data();
        total += p.monto;
        html += `<tr><td>${p.fecha.toDate().toLocaleDateString()}</td><td>${p.cuotas}</td><td>${p.monto} $</td></tr>`;
    });
    
    html += `</tbody></table><h3 style="margin-top:1rem; text-align:right">Total Aportado: ${total} $</h3>`;
    area.innerHTML = html;
}

// UI Helpers
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active-tab'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('tab-' + tabId).classList.add('active-tab');
    event.currentTarget.classList.add('active');
}

function openEditModal(id, n) { 
    currentEditingSocioId = id; 
    document.getElementById('modal-edit-input').value = n; 
    document.getElementById('modal-overlay').style.display = 'flex'; 
}

function closeModal() { document.getElementById('modal-overlay').style.display = 'none'; }

async function saveEditSocio() { 
    const n = document.getElementById('modal-edit-input').value.trim().toUpperCase(); 
    if(n) await getPublicRef('socios').doc(currentEditingSocioId).update({ nombre: n }); 
    closeModal(); 
}

function showToast(m) { 
    const c = document.getElementById('toast-container'), t = document.createElement('div'); 
    t.className='toast'; t.innerText=m; c.appendChild(t); 
    setTimeout(() => t.remove(), 3000); 
}

function showLoading(s) { document.getElementById('loading').style.display = s ? 'flex' : 'none'; }

function printReport() { window.print(); }

function switchReportSubTab(t) { 
    document.getElementById('sub-tab-individual').style.display = t==='individual'?'block':'none'; 
    document.getElementById('sub-tab-general').style.display = t==='general'?'block':'none'; 
    document.getElementById('btn-rep-ind').className = `tab-btn ${t==='individual'?'active':''}`; 
    document.getElementById('btn-rep-gen').className = `tab-btn ${t==='general'?'active':''}`; 
}
