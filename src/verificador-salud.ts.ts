interface EstadoNodo {
    url: string;
    saludable: boolean;
    detalle?: any;
}

async function verificarNodo(url: string): Promise<EstadoNodo> {
    try {
        const respuesta = await fetch(`${url}/health`, {
            signal: AbortSignal.timeout(3000) // Timeout de 3 segundos
        });

        if (!respuesta.ok) return { url, saludable: false };
        const detalle = await respuesta.json();

        // Si la respuesta indica estado no saludable
        if (detalle.estado !== 'saludable') {
            return { url, saludable: false, detalle };
        }

        return { url, saludable: true, detalle };
    } catch {
        return { url, saludable: false };
    }
}

async function verificarCluster(nodos: string[]) {
    // Promise.all ejecuta todas las verificaciones en paralelo
    const resultados = await Promise.all(nodos.map(verificarNodo));

    console.log("\n=== ESTADO DEL CLÚSTER ===");
    for (const r of resultados) {
        if (r.saludable) {
            // Verde: \x1b[32m
            console.log(`\x1b[32m[OK]\x1b[0m ${r.url} - Saludable (Nodo: ${r.detalle?.nodo})`);
        } else {
            // Rojo: \x1b[31m
            console.log(`\x1b[31m[CAIDO]\x1b[0m ${r.url} - No Saludable`);
        }
    }

    const sanos = resultados.filter((r) => r.saludable).length;
    console.log(`\nResumen: ${sanos} de ${resultados.length} nodos saludables.\n`);
}

// Probar con el backend local directamente y/o a través de Apache
verificarCluster([
    "http://localhost:3000",
    "http://mi-api.local:8090"
]);