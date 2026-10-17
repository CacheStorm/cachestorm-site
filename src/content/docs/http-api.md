## JSON meets your data store

The optional HTTP listener provides a REST interface on port **8080** in the source example configuration. Its API prefix is `/api`.

## Enable the interface

```yaml
http:
  enabled: true
  port: 8080
  password: "replace-with-a-long-random-password"
```

Keep the endpoint on your trusted network or behind your authenticated HTTPS ingress.

## Authentication

Send the configured HTTP password in an authorization header:

```bash
curl -H "Authorization: Bearer YOUR_HTTP_PASSWORD" \
  http://localhost:8080/api/health
```

The current source also supports ACL identities over HTTP. Match credentials and grants to your intended operations, and test denied access as well as successful access.

## Execute a command

```bash
curl -X POST http://localhost:8080/api/execute \
  -H "Authorization: Bearer YOUR_HTTP_PASSWORD" \
  -H "Content-Type: application/json" \
  -d '{"command":"SET","args":["hello","world"]}'
```

The upstream API documents command execution through this endpoint. The command router applies HTTP restrictions and ACL checks; not every administrative command is available through HTTP.

## Operational endpoints

| Method | Path           | Purpose                     |
| ------ | -------------- | --------------------------- |
| GET    | `/api/health`  | Check server health         |
| GET    | `/api/info`    | Read server information     |
| GET    | `/api/stats`   | Read store statistics       |
| GET    | `/api/metrics` | Read HTTP API metrics       |
| POST   | `/api/execute` | Execute a permitted command |
| GET    | `/api/keys`    | List accessible keys        |
| GET    | `/api/tags`    | List accessible tags        |

## Example health reply

```json
{
  "status": "ok",
  "uptime": "2h30m15s"
}
```

This is an illustrative response. Fields and access behavior should be checked against your installed version.

## Read the full API reference

The [upstream HTTP API guide](https://github.com/CacheStorm/CacheStorm/blob/baf028b1276b411641edd92e7135202fd114f4e1/docs/07-http-api.md) covers key operations, pipelines, tags and administration. The [HTTP server implementation](https://github.com/CacheStorm/CacheStorm/blob/baf028b1276b411641edd92e7135202fd114f4e1/internal/server/http.go) is the source of truth for routes and enforcement.
