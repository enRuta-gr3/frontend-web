
const initialOptions = {
    "client-id": "ATUNaGK47J9j1jlkjrSsSfLG8hilQs9-5xMIL3APcMxdjguExhGZlk2_0aCrDbClDQTAmCnO-C4Q5pOZ",
    currency: "USD", // PESOS URUGUAYOS
    intent: "capture"
}


// credenciales de cuenta cliente de prueba
const username = "sb-dcbcv43271017@personal.example.com"
const passord = "jE1%}q5w"

// en desarrollo -> usamos la localhost

const urlRedir = "https://en-ruta.vercel.app/comprobante-pasaje"
//const urlRedir = "http://localhost:5173/comprobante-pasaje"

export {
    initialOptions,
    urlRedir
}
