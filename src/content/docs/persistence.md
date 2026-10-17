## Choose what survives

Cache data can be disposable; application state may need to survive a restart. CacheStorm provides append-only files and snapshots. The upstream example configuration disables persistence by default, so make your policy explicit.

## Enable persistence

```yaml
persistence:
  enabled: true
  aof: true
  aof_sync: "everysec"
  data_dir: "./data"
  snapshot_interval: "5m"
```

The process must be able to read and write the configured directory. For a container, mount that directory on a persistent volume.

## Append-only files

The AOF records mutations for replay during recovery. Sync policy balances disk synchronization frequency against throughput:

| Policy     | Intent                                                            |
| ---------- | ----------------------------------------------------------------- |
| `always`   | Synchronize each write for the strongest configured sync behavior |
| `everysec` | Synchronize periodically, balancing throughput and durability     |
| `no`       | Leave synchronization timing to the operating system              |

Actual durability depends on storage, operating-system behavior and failure mode. A periodic policy can lose recent writes after an abrupt failure.

## Snapshots

Snapshots capture a point-in-time view of data. The example configuration sets the snapshot interval with `snapshot_interval`. Keep backups outside the process's own data directory and validate restoration procedures.

## Containers and recovery

Use a mounted configuration file and data directory. Match the mount path to `persistence.data_dir` in the file.

```bash
docker run -d --name cachestorm \
  -p 127.0.0.1:6380:6380 \
  -v "$(pwd)/cachestorm.yaml:/etc/cachestorm.yaml:ro" \
  -v "$(pwd)/data:/var/lib/cachestorm" \
  ghcr.io/cachestorm/cachestorm:v0.3.0 \
  --config /etc/cachestorm.yaml
```

Set `data_dir: "/var/lib/cachestorm"` in that mounted file. Check the image's entrypoint and permissions for your deployment environment.

## A useful recovery rehearsal

1. Write representative values and expiry settings.
2. Stop the instance gracefully and restart it with the same data directory.
3. Verify values, data types and expected expiry behavior.
4. Repeat with a copied backup on a separate instance.
5. Measure recovery time using a realistically sized dataset.

See [configuration](/docs/configuration/) and the upstream persistence implementation for the exact behavior of your installed version.
