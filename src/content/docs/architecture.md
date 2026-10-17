## One server, a focused core

CacheStorm is written in Go. A standalone process brings together protocol handling, command routing, sharded in-memory storage and optional persistence. The Go module uses native Go dependencies, including a Lua interpreter and YAML configuration library. No CGO toolchain is required by the documented build.

## Request lifecycle

1. A Redis-compatible client connects to the RESP listener, normally on port 6380.
2. The protocol layer parses an incoming command and its arguments.
3. Authentication and command routing determine whether the request can execute.
4. The handler operates on the relevant in-memory data structure.
5. Persistence records mutations when enabled; the protocol layer serializes the response.

## 256 memory shards

The storage engine distributes keys across 256 shards. Sharding reduces the amount of shared work contending on one global store and supports concurrent access from client goroutines.

This design is why the benchmark page distinguishes sequential and parallel storage measurements. A direct store call measures different work from a complete TCP request.

## Familiar wire protocol

The server implements RESP command handling for Redis-compatible clients. You can use `redis-cli` and Redis libraries to begin testing. CacheStorm extensions, such as tags and namespaces, sit alongside familiar commands.

Compatibility should be evaluated against your application's actual operations. See [clients and SDKs](/docs/clients/) and the [command reference](/docs/commands/).

## Storage lifecycle

- **Expiry:** TTLs let cached data expire automatically.
- **Eviction:** configurable policies respond to a configured memory limit.
- **Persistence:** AOF and snapshots support recovery when enabled.
- **Replication and clustering:** provide multi-node deployment options.

## HTTP and observability

An optional HTTP listener exposes management and integration endpoints. The metrics plugin provides a Prometheus endpoint; slow logs help investigate expensive requests. See [HTTP API](/docs/http-api/) and [monitoring](/docs/monitoring/).

## Read the implementation

- [Server and networking](https://github.com/CacheStorm/CacheStorm/tree/baf028b1276b411641edd92e7135202fd114f4e1/internal/server)
- [Command handlers](https://github.com/CacheStorm/CacheStorm/tree/baf028b1276b411641edd92e7135202fd114f4e1/internal/command)
- [Storage engine](https://github.com/CacheStorm/CacheStorm/tree/baf028b1276b411641edd92e7135202fd114f4e1/internal/store)
- [Benchmarks and methodology](/benchmarks/)
