## Your first CacheStorm instance

CacheStorm runs as a standalone server. The default RESP port is **6380**; the optional HTTP interface uses **8080**. Connect using a Redis-compatible client.

### Install a binary

The upstream installer supports Linux and macOS:

```bash
curl -fsSL https://raw.githubusercontent.com/CacheStorm/CacheStorm/main/scripts/install.sh | bash
```

On Windows, use PowerShell:

```powershell
irm https://raw.githubusercontent.com/CacheStorm/CacheStorm/main/scripts/install.ps1 | iex
```

Prefer a manual installation? Download a platform archive from [GitHub Releases](https://github.com/CacheStorm/CacheStorm/releases/tag/v0.3.0), verify its checksums, and extract the executable.

### Run with Docker

```bash
docker run -d --name cachestorm \
  -p 127.0.0.1:6380:6380 \
  -p 127.0.0.1:8080:8080 \
  ghcr.io/cachestorm/cachestorm:v0.3.0
```

The loopback bindings make this a local development instance. For persistent data, mount a data directory and enable persistence in your configuration.

### Build from source

The module declares Go 1.22 or newer. Use a current supported Go toolchain.

```bash
git clone https://github.com/CacheStorm/CacheStorm.git
cd CacheStorm
go build -o cachestorm ./cmd/cachestorm
./cachestorm
```

## Make the connection

With the server running, open a second terminal:

```bash
redis-cli -p 6380 PING
# PONG

redis-cli -p 6380 SET hello "world" EX 3600
# OK

redis-cli -p 6380 GET hello
# "world"
```

These replies are illustrative. Your commands run against your local CacheStorm server.

## Try tag-based invalidation

Tags connect related keys so you can invalidate cached data as a group.

```redis
SET product:1 "chair" TAGS catalog
SET product:2 "desk" TAGS catalog
TAGKEYS catalog
INVALIDATE catalog
```

`INVALIDATE` removes matching cached keys. Use a dedicated tag while experimenting.

## Make it yours

Start with a [configuration file](/docs/configuration/), select a [client library](/docs/clients/), then explore the [command reference](/docs/commands/).

For a deployment beyond your development machine, configure [authentication and TLS](/docs/security/), choose a [persistence policy](/docs/persistence/), and add [monitoring](/docs/monitoring/).
