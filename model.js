/**
 * MODELO
 * Maneja la configuración de Firebase y referencias a datos.
 */

const firebaseConfig = {
    apiKey: "", // Tu API Key
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

// Helpers para rutas de Firestore
const getPublicRef = (coll) => db.collection('artifacts').doc(appId).collection('public').doc('data').collection(coll);
