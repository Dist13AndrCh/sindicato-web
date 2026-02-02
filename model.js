/**
 * MODELO: Maneja la configuración de Firebase y referencias a datos.
 */

const firebaseConfig = {
    apiKey: "", // Tu API Key debe ir aquí si no está en la configuración del proyecto
    authDomain: "sindicato-pagos.firebaseapp.com",
    projectId: "sindicato-pagos",
    storageBucket: "sindicato-pagos.appspot.com",
    messagingSenderId: "565773199920",
    appId: "1:565773199920:web:9f8992a54b3cc16be709cc"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
const appId = "sindicato-pagos-v1";

// Helper para obtener referencias a colecciones públicas
const getPublicRef = (coll) => db.collection('artifacts').doc(appId).collection('public').doc('data').collection(coll);
