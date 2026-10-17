## Secure the listeners you enable

Configure authentication, network exposure and TLS before sharing a server beyond local development. CacheStorm supports a server password, per-user ACL rules and TLS certificate configuration.

## Password authentication

The source configuration places the RESP password under `server.requirepass` and the HTTP password under `http.password`.

```yaml
server:
  bind: "127.0.0.1"
  port: 6380
  requirepass: "replace-with-a-long-random-password"

http:
  enabled: true
  port: 8080
  password: "replace-with-a-different-long-random-password"
```

Keep real secrets out of version control. Supply and protect the configuration file through your deployment's secret-management mechanism.

## Access control lists

ACLs associate users with command grants and key patterns. For example, an application user can be limited to keys beginning with `app:`.

```redis
ACL SETUSER app on >replace-with-a-random-password ~app:* +get +set +del
```

Run this as an authorized administrator in an isolated test instance first. Persist your ACL policy using the supported mechanism for your installed version. Verify denied commands and inaccessible keys, including script and HTTP access paths.

## TLS

The example source configuration uses certificate paths on the server section:

```yaml
server:
  port: 6380
  tls_cert_file: "/etc/cachestorm/tls/server.crt"
  tls_key_file: "/etc/cachestorm/tls/server.key"
```

Connect using a TLS-capable client and a trusted certificate chain. For example:

```bash
redis-cli --tls --cacert /path/to/ca.crt -p 6380 PING
```

## HTTP access

Use authorization headers rather than credentials in query strings. Bind and firewall HTTP endpoints according to your environment, or place them behind your authenticated HTTPS ingress.

```bash
curl -H "Authorization: Bearer YOUR_HTTP_PASSWORD" \
  http://localhost:8080/api/health
```

The current source includes ACL enforcement for HTTP identities and key/tag endpoints. Review the upstream changelog and security policy for version-specific fixes.

## Report an issue

Follow the repository's [security policy](https://github.com/CacheStorm/CacheStorm/blob/baf028b1276b411641edd92e7135202fd114f4e1/SECURITY.md) for sensitive vulnerability reports. Use the [issue tracker](https://github.com/CacheStorm/CacheStorm/issues) for general questions and reproducible non-sensitive bugs.
