/**
 * CONTROLADOR
 * Maneja la lógica de eventos, estados y renderizado.
 */

let allSocios = [];
let currentGestiones = {};
let currentEditingSocioId = null;

// Inicialización de la App
window.onload = () => {
    auth.onAuthStateChanged(user => {
        if (user) {
            enterAs('admin');
        } else {
            enterAs('public');
        }
    });

    // Suscripciones en tiempo real
    getPublicRef('socios').orderBy('nombre').onSnapshot(snap => {
        allSocios = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderSocios();
        updateSocioSelects();
    });

    getPublicRef('gestiones').onSnapshot(snap => {
        snap.forEach(doc => { currentGestiones[doc.id] = doc.data(); });
        updatePayDisplay();
    });

    getPublicRef('avisos').doc('actual').onSnapshot(doc => {
        if(doc.exists) {
            const aviso = doc.data().texto;
            document.getElementById('conf-aviso').value = aviso;
        }
    });

    showLoading(false);
};

// --- LOGICA DE NAVEGACION ---
function enterAs(role) {
    document.getElementById('view-home').style.display = role === 'public' ? 'block' : 'none';
    document.getElementById('view-admin').style.display = role === 'admin' ? 'block' : 'none';
    if(role === 'admin') {
        document.getElementById('admin-title').innerText = "Panel Administrativo";
    }
}

function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('tab-' + tabId).classList.add('active');
    event.currentTarget.classList.add('active');
}

// --- LOGICA DE SOCIOS ---
function renderSocios() {
    const list = document.getElementById('socios-list');
    list.innerHTML = allSocios.map(s => `
        <div class="socio-row">
            <div class="socio-info">
                <h4>${s.nombre}</h4>
                <p>Registrado el: ${s.fecha?.toDate().toLocaleDateString() || 'Reciente'}</p>
            </div>
            <div class="actions">
                <button class="btn-icon" onclick="openEditModal('${s.id}', '${s.nombre}')">✏️</button>
                <button class="btn-icon" onclick="deleteSocio('${s.id}')">🗑️</button>
            </div>
        </div>
    `).join('');
}

async function addSocio() {
    const input = document.getElementById('new-socio-name');
    const nombre = input.value.trim().toUpperCase();
    if(!nombre) return;
    showLoading(true);
    await getPublicRef('socios').add({ nombre, fecha: new Date() });
    input.value = '';
    showLoading(false);
    showToast("Socio registrado con éxito");
}

async function deleteSocio(id) {
    if(confirm("¿Seguro de eliminar este socio?")) {
        await getPublicRef('socios').doc(id).delete();
        showToast("Socio eliminado");
    }
}

// --- LOGICA DE PAGOS ---
function updateSocioSelects() {
    const selects = ['pay-socio-select', 'report-socio-select'];
    selects.forEach(id => {
        const el = document.getElementById(id);
        if(!el) return;
        el.innerHTML = '<option value="">-- Seleccionar Socio --</option>' + 
            allSocios.map(s => `<option value="${s.id}">${s.nombre}</option>`).join('');
    });
}

function updatePayDisplay() {
    const qty = parseInt(document.getElementById('pay-qty').value) || 0;
    const price = currentGestiones['2024']?.precio || 10;
    document.getElementById('pay-amount').value = (qty * price) + " Bs";
}

async function processPayment() {
    const socioId = document.getElementById('pay-socio-select').value;
    const qty = parseInt(document.getElementById('pay-qty').value);
    if(!socioId || qty < 1) return showToast("Datos incompletos");

    showLoading(true);
    const socio = allSocios.find(s => s.id === socioId);
    const price = currentGestiones['2024']?.precio || 10;

    await getPublicRef('pagos').add({
        socioId,
        socioNombre: socio.nombre,
        meses: qty,
        monto: qty * price,
        fecha: new Date(),
        gestion: '2024'
    });

    showLoading(false);
    showToast("Pago registrado correctamente");
}

// --- LOGICA DE REPORTES ---
async function generateIndividualReport() {
    const socioId = document.getElementById('report-socio-select').value;
    if(!socioId) return;
    
    const socio = allSocios.find(s => s.id === socioId);
    const snap = await getPublicRef('pagos').where('socioId', '==', socioId).get();
    let pagosRealizados = 0;
    snap.forEach(doc => pagosRealizados += doc.data().meses);

    const deudaMeses = Math.max(0, 12 - pagosRealizados);
    const totalDeuda = deudaMeses * (currentGestiones['2024']?.precio || 10);

    const content = document.getElementById('report-content');
    content.innerHTML = `
        <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 20px;">
            <h2 style="margin: 0;">ESTADO DE CUENTAS - GESTIÓN 2024</h2>
            <p style="margin: 5px 0;">Sindicato de Transportes</p>
        </div>
        <p><strong>SOCIO:</strong> ${socio.nombre}</p>
        <p><strong>ID:</strong> ${socio.id}</p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
        <table style="width: 100%;">
            <tr><td>Meses Pagados</td><td style="text-align: right;">${pagosRealizados} / 12</td></tr>
            <tr><td>Meses Pendientes</td><td style="text-align: right;">${deudaMeses}</td></tr>
            <tr style="font-weight: bold; font-size: 1.2rem;">
                <td>TOTAL DEUDA</td>
                <td style="text-align: right; color: #c41c1c;">${totalDeuda} Bs</td>
            </tr>
        </table>
        <div style="margin-top: 50px; text-align: center; color: #888; font-size: 0.8rem;">
            Documento generado el ${new Date().toLocaleString()}
        </div>
    `;
}

// --- LOGICA DE BÚSQUEDA PÚBLICA ---
async function searchSocio() {
    const term = document.getElementById('search-input').value.trim().toUpperCase();
    if(!term) return;
    
    showLoading(true);
    const results = allSocios.filter(s => s.nombre.includes(term));
    const container = document.getElementById('home-results');
    
    if(results.length === 0) {
        container.innerHTML = '<div class="card" style="text-align: center; color: #666;">No se encontró ningún socio con ese nombre.</div>';
    } else {
        container.innerHTML = '';
        for(let s of results) {
            const snap = await getPublicRef('pagos').where('socioId', '==', s.id).get();
            let totalMeses = 0;
            snap.forEach(doc => totalMeses += doc.data().meses);
            
            const isAlDia = totalMeses >= 12;
            container.innerHTML += `
                <div class="card" style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h4 style="color: white; margin-bottom: 5px;">${s.nombre}</h4>
                        <p style="font-size: 0.8rem; color: #666;">Meses pagados: ${totalMeses} de 12 (Gestión 2024)</p>
                    </div>
                    <span class="badge ${isAlDia ? 'badge-paid' : 'badge-debt'}">${isAlDia ? 'Al Día' : 'Con Deuda'}</span>
                </div>
            `;
        }
    }
    showLoading(false);
}

// --- LOGICA DE AUTH ---
async function login() {
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-pass').value;
    try {
        await auth.signInWithEmailAndPassword(email, pass);
        closeLoginModal();
    } catch(e) {
        showToast("Error: Credenciales inválidas");
    }
}

async function logout() {
    await auth.signOut();
    location.reload();
}

function openLoginModal() { document.getElementById('login-modal').style.display = 'flex'; }
function closeLoginModal() { document.getElementById('login-modal').style.display = 'none'; }

// --- UTILIDADES ---
function showToast(m) {
    const c = document.getElementById('toast-container'), t = document.createElement('div');
    t.className = 'toast'; t.innerText = m; c.appendChild(t);
    setTimeout(() => t.remove(), 3000);
}

function showLoading(s) { document.getElementById('loading').style.display = s ? 'flex' : 'none'; }
function handleSearch(e) { if(e.key === 'Enter') searchSocio(); }
function openEditModal(id, n) { currentEditingSocioId = id; document.getElementById('modal-edit-input').value = n; document.getElementById('modal-overlay').style.display = 'flex'; }
function closeModal() { document.getElementById('modal-overlay').style.display = 'none'; }
async function saveEditSocio() { const n = document.getElementById('modal-edit-input').value.trim().toUpperCase(); if(n) await getPublicRef('socios').doc(currentEditingSocioId).update({ nombre: n }); closeModal(); }
function printReport() { window.print(); }
function switchReportSubTab(t) { 
    document.getElementById('sub-tab-individual').style.display = t==='individual'?'block':'none'; 
    document.getElementById('sub-tab-general').style.display = t==='general'?'block':'none'; 
    document.getElementById('btn-rep-ind').className = `tab-btn ${t==='individual'?'active':''}`; 
    document.getElementById('btn-rep-gen').className = `tab-btn ${t==='general'?'active':''}`; 
}
