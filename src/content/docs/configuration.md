## A readable configuration

Pass a YAML configuration file when starting the server:

```bash
cachestorm --config cachestorm.yaml
```

The example below follows the upstream `config/cachestorm.example.yaml` field names. Some older website examples use different names; use the source configuration as the reference for your installed version.

```yaml
server:
  bind: "127.0.0.1"
  port: 6380
  max_connections: 10000
  tcp_keepalive: 300
  read_buffer_size: 4096
  write_buffer_size: 4096
  read_timeout: "5m"
  write_timeout: "5m"
  requirepass: ""

http:
  enabled: true
  port: 8080
  password: ""

memory:
  max_memory: "512mb"
  eviction_policy: "allkeys-lru"
  pressure_warning: 70
  pressure_critical: 85
  eviction_sample_size: 5

persistence:
  enabled: false
  aof: true
  aof_sync: "everysec"
  data_dir: "./data"
  snapshot_interval: "5m"

logging:
  level: "info"
  format: "json"
  output: "stdout"
```

## Server connections

| Setting                  | Purpose                                               |
| ------------------------ | ----------------------------------------------------- |
| `server.bind`            | Address the RESP server listens on                    |
| `server.port`            | RESP listener port; the example uses 6380             |
| `server.max_connections` | Maximum simultaneous connections                      |
| `server.requirepass`     | Password required before executing protected commands |
| `server.read_timeout`    | Connection read timeout, expressed as a duration      |
| `server.write_timeout`   | Connection write timeout                              |

## Bound memory use

Set `memory.max_memory` to a size such as `512mb` or `1gb`. A value of `0` means unlimited in the example configuration.

Choose an eviction policy for your data lifecycle:

- `noeviction`: reject writes when memory cannot be allocated within the limit.
- `allkeys-lru`: evict least recently used keys.
- `allkeys-lfu`: evict least frequently used keys.
- `volatile-lru`: evict least recently used keys that have an expiry.
- `allkeys-random`: choose keys at random.

Leave headroom for process overhead, client buffers and persistence work. Measure the actual memory profile of your workload.

## Organize with namespaces

```yaml
namespaces:
  default:
    default_ttl: "0"
  cache:
    default_ttl: "1h"
  sessions:
    default_ttl: "30m"
```

Namespaces group data and can define default expiry behavior. See namespace commands in the [command reference](/docs/commands/).

## Plugins and metrics

```yaml
plugins:
  stats:
    enabled: true
  metrics:
    enabled: true
    port: 9090
    path: "/metrics"
  slowlog:
    enabled: true
    threshold: "10ms"
    max_entries: 128
```

Use [monitoring](/docs/monitoring/) to check the endpoints enabled in your own configuration. The metrics plugin and the HTTP API have separate listeners.

## Complete upstream examples

- [Example configuration](https://github.com/CacheStorm/CacheStorm/blob/baf028b1276b411641edd92e7135202fd114f4e1/config/cachestorm.example.yaml)
- [Production configuration](https://github.com/CacheStorm/CacheStorm/blob/baf028b1276b411641edd92e7135202fd114f4e1/config/cachestorm.production.yaml)
- [Configuration implementation](https://github.com/CacheStorm/CacheStorm/tree/baf028b1276b411641edd92e7135202fd114f4e1/internal/config)
