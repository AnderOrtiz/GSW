// import { performance } from 'perf_hooks';

interface ResultadoMedicion {
    url: string;
    tiempoPromedioMs: number;
    tiempoMinimoMs: number;
    tiempoMaximoMs: number;
    exitosas: number;
    fallidas: number;
}

async function medirUrl(url: string, cantidad: number): Promise<ResultadoMedicion> {
    const tiempos: number[] = [];
    let exitosas = 0;
    let fallidas = 0;

    for (let i = 0; i < cantidad; i++) {
        const inicio = performance.now();
        try {
            const respuesta = await fetch(url);
            await respuesta.text();
            if (respuesta.ok) exitosas++; else fallidas++;
        } catch {
            fallidas++;
        }
        tiempos.push(performance.now() - inicio);
    }

    return {
        url,
        tiempoPromedioMs: tiempos.reduce((a, b) => a + b, 0) / tiempos.length,
        tiempoMinimoMs: Math.min(...tiempos),
        tiempoMaximoMs: Math.max(...tiempos),
        exitosas,
        fallidas,
    };
}

async function compararServidores() {
    const cantidadPeticiones = 200;
    const candidatos: string[] = [
        "http://localhost:9000/saludo?nombre=Bench",                  // Directo a Express
        "http://blog.local:8090/api/saludo?nombre=Bench",             // Vía Apache Reverse Proxy
    ];

    console.log(`=== INICIANDO BENCHMARK (${cantidadPeticiones} peticiones) ===\n`);

    for (const url of candidatos) {
        const resultado = await medirUrl(url, cantidadPeticiones);
        console.log(`Resultados para: ${resultado.url}`);
        console.log(`  Promedio: ${resultado.tiempoPromedioMs.toFixed(2)} ms`);
        console.log(`  Mínimo:   ${resultado.tiempoMinimoMs.toFixed(2)} ms`);
        console.log(`  Máximo:   ${resultado.tiempoMaximoMs.toFixed(2)} ms`);
        console.log(`  Éxitos:   ${resultado.exitosas} / Fallos: ${resultado.fallidas}\n`);
    }
}

compararServidores();