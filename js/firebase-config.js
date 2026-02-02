// Tu configuración de Firebase 
const firebaseConfig = {
    apiKey: "AIzaSyCF4UkeKdrkwFIF8GXph3aUmUBa-0-I0Ko",
    authDomain: "sindicato-pagos.firebaseapp.com",
    projectId: "sindicato-pagos",
    storageBucket: "sindicato-pagos.firebasestorage.app",
    messagingSenderId: "312221388190",
    appId: "1:312221388190:web:b72becdd106713095d9a8f"
};

// Inicialización de Firebase
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

// Helpers para Rutas de Firestore (Estructura de Seguridad solicitada)
const appId = "control-sindical-v1"; // ID Único para tu despliegue

function getPublicRef(collectionName) {
    return db.collection('artifacts').doc(appId).collection('public').doc('data').collection(collectionName);
}
