```bash
npx tsx src/benchmark.ts
```

=== INICIANDO BENCHMARK (200 peticiones) ===

Resultados para: http://localhost:9000/saludo?nombre=Bench
  Promedio: 0.40 ms
  Mínimo:   0.16 ms
  Máximo:   22.19 ms
  Éxitos:   200 / Fallos: 0

Resultados para: http://blog.local:8090/api/saludo?nombre=Bench
  Promedio: 0.73 ms
  Mínimo:   0.47 ms
  Máximo:   11.10 ms
  Éxitos:   200 / Fallos: 0