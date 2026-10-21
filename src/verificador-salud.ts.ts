process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

interface EstadoNodo {
    url: string;
    saludable: boolean;
    detalle?: any;
}

async function verificarNodo(baseUrl: string): Promise<EstadoNodo> {
    try {
        // Se construye la URL apuntando a /health o /api/health según el prefijo
        const healthUrl = baseUrl.endsWith('/api') ? `${baseUrl}/health` : `${baseUrl}/health`;

        const respuesta = await fetch(healthUrl, {
            signal: AbortSignal.timeout(3000) // Timeout de 3 segundos
        });

        if (!respuesta.ok) return { url: baseUrl, saludable: false };
        const detalle = await respuesta.json();

        if (detalle.estado !== 'saludable') {
            return { url: baseUrl, saludable: false, detalle };
        }

        return { url: baseUrl, saludable: true, detalle };
    } catch (error) {
        return { url: baseUrl, saludable: false };
    }
}

async function verificarCluster(nodos: string[]) {
    // Promise.all ejecuta la comprobación de todos los nodos en paralelo
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
    "http://localhost:9000",       // Directo a Express (Instancia en 9000)
    "http://mi-api.local:8090",    // Proxy HTTP (Instancia en 3000)
    "https://blog.local/api"       // Proxy HTTPS (Atraviesa Apache en :443 y reenvía a :9000)
]);