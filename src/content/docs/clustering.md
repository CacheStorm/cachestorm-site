## Build beyond one node

CacheStorm includes clustering, replication and Sentinel-related commands. These provide building blocks for multi-node deployments; test the topology and failure behavior required by your own application.

## Cluster configuration

The source example config uses a gossip bind address, a gossip port and seed nodes:

```yaml
cluster:
  enabled: true
  node_name: "node1"
  bind_addr: "0.0.0.0"
  bind_port: 7946
  seeds:
    - "node2:7946"
    - "node3:7946"
```

Each node also needs its own RESP address, persistent data directory where applicable, and reachable peer addresses. Keep gossip traffic on a trusted network.

## Hash-slot routing

Cluster mode uses hash slots to distribute data. A cluster-aware client must handle routing and topology changes. Inspect the topology with cluster commands:

```redis
CLUSTER INFO
CLUSTER NODES
CLUSTER SLOTS
```

## Replication

The source example config includes a replica role and primary address:

```yaml
replication:
  role: "slave"
  master_host: "primary.internal"
  master_port: 6380
  master_auth: "replace-with-primary-password"
  read_only: true
```

Confirm the terminology and supported fields for your installed release. Replication does not replace independent backups.

## Before a real deployment

- Test node restart, disconnection and reconnection.
- Verify client behavior during routing changes and failover.
- Measure replication lag under your write workload.
- Confirm ACL and authentication behavior on every node.
- Restore from a backup into an isolated topology.

Explore the distributed and Sentinel command categories in the [command reference](/docs/commands/). The [upstream repository](https://github.com/CacheStorm/CacheStorm) contains the implementation and integration tests for these paths.
