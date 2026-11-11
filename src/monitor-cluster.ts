interface NodoCluster {
    nombre: string;
    ipPrivada: string;
    url: string;
}

const nodosCluster: NodoCluster[] = [
    {
        nombre: "nodo1",
        ipPrivada: "172.28.0.11",
        url: "http://127.0.0.1:9006"
    },
    {
        nombre: "nodo2",
        ipPrivada: "172.28.0.12",
        url: "http://nodo2:9000/health"
    },
    {
        nombre: "nodo3",
        ipPrivada: "172.28.0.13",
        url: "http://nodo3:9000/health"
    }
]

async function monitorearCluster(nodosCluster: NodoCluster[]) {
    for (const nodo of nodosCluster) {
        try {
            const response = await fetch(`${nodo.url}/health`, {
                signal: AbortSignal.timeout(3000)
            });
            const data = await response.json();
            console.log(`[OK] ${nodo.nombre} (${nodo.ipPrivada}) => ${data.estado}`)
        }
        catch {
            console.error(`SIN RESPUESTA ${nodo.nombre} - ${nodo.ipPrivada}`)
        }
    }
}

monitorearCluster(nodosCluster)