## See what your engine is doing

CacheStorm includes a Prometheus metrics plugin, HTTP status endpoints, command statistics and slow-log facilities. Enable the listeners that fit your environment.

## Prometheus metrics plugin

The source example uses port 9090 for the metrics plugin:

```yaml
plugins:
  metrics:
    enabled: true
    port: 9090
    path: "/metrics"
  stats:
    enabled: true
```

```bash
curl http://localhost:9090/metrics
```

Add the endpoint to a Prometheus scrape job:

```yaml
scrape_configs:
  - job_name: "cachestorm"
    static_configs:
      - targets: ["cachestorm.internal:9090"]
```

## HTTP status and metrics

The HTTP API documents these endpoints on its own listener:

| Endpoint           | Purpose                              |
| ------------------ | ------------------------------------ |
| `GET /api/health`  | Health response                      |
| `GET /api/info`    | Server information                   |
| `GET /api/stats`   | Store statistics                     |
| `GET /api/metrics` | Metrics exposed through the HTTP API |

Include the configured authorization header when HTTP authentication is enabled. Keep monitoring access within your operational network or authenticated ingress.

## Slow log

```yaml
plugins:
  slowlog:
    enabled: true
    threshold: "10ms"
    max_entries: 128
```

Use the documented slow-log commands to inspect expensive operations:

```redis
SLOWLOG GET 10
SLOWLOG LEN
```

## Useful operating signals

- Memory usage and configured memory limit.
- Connection count and connection failures.
- Command throughput and latency.
- Keyspace hits, misses and eviction activity.
- Persistence errors and recovery time.
- Replica health for multi-node deployments.

Set thresholds using your normal workload and service objectives. Benchmark the complete request path rather than assuming a storage microbenchmark describes user-visible latency.
