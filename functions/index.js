const functions = require('firebase-functions');
const algoliasearch = require('algoliasearch');
const admin = require('firebase-admin');

// Inicializa Firebase Admin SDK
admin.initializeApp();

// Configura Algolia con la Admin Key (solo backend)
const ALGOLIA_ID = "8K5EQTCM77";
const ALGOLIA_ADMIN_KEY = "71c9c7d1f6c9b4dbf7e4cd1c9e959bb6";
const client = algoliasearch(ALGOLIA_ID, ALGOLIA_ADMIN_KEY);
const index = client.initIndex('camisetas'); 

// Sincroniza Firestore → Algolia
exports.syncCamisetaWithAlgolia = functions.firestore
  .document('camisetas/{camisetaId}')
  .onWrite(async (change, context) => {
    const data = change.after.exists ? change.after.data() : null;
    const objectID = context.params.camisetaId;

    if (data) {
        // Crear o actualizar en Algolia
        return index.saveObject({ ...data, objectID });
    } else {
        // Borrar de Algolia
        return index.deleteObject(objectID);
    }
  });
