## Use the client you know

CacheStorm speaks RESP, the Redis serialization protocol. Start with a familiar Redis client and connect to port **6380**. Validate the commands and edge cases used by your application before migrating a workload.

## Redis CLI

```bash
redis-cli -h 127.0.0.1 -p 6380
```

```redis
PING
SET greeting "Hello, CacheStorm" EX 60
GET greeting
```

## Node.js

Install `redis` in your Node.js application:

```bash
npm install redis
```

```javascript
import { createClient } from "redis";

const client = createClient({ url: "redis://localhost:6380" });
client.on("error", console.error);
await client.connect();

try {
  await client.set("greeting", "Hello, CacheStorm", { EX: 60 });
  console.log(await client.get("greeting"));
} finally {
  await client.quit();
}
```

## Python

```bash
pip install redis
```

```python
import redis

client = redis.Redis(host="localhost", port=6380, decode_responses=True)
try:
    client.set("greeting", "Hello, CacheStorm", ex=60)
    print(client.get("greeting"))
finally:
    client.close()
```

## Go

```bash
go get github.com/redis/go-redis/v9
```

```go
package main

import (
    "context"
    "fmt"
    "log"
    "time"
    "github.com/redis/go-redis/v9"
)

func main() {
    ctx := context.Background()
    client := redis.NewClient(&redis.Options{Addr: "localhost:6380"})
    defer client.Close()

    if err := client.Set(ctx, "greeting", "Hello, CacheStorm", time.Minute).Err(); err != nil {
        log.Fatal(err)
    }
    value, err := client.Get(ctx, "greeting").Result()
    if err != nil { log.Fatal(err) }
    fmt.Println(value)
}
```

## Native CacheStorm SDKs

The upstream repository also includes dedicated Go, TypeScript and Python clients, with examples for CacheStorm-specific capabilities such as tags and namespaces. See the [clients directory](https://github.com/CacheStorm/CacheStorm/tree/baf028b1276b411641edd92e7135202fd114f4e1/clients) and its installation instructions.

## Connection checklist

- Match the configured port and authentication settings.
- Use TLS when the server is configured for encrypted connections.
- Set connection timeouts and handle errors in your application.
- Check the command reference for CacheStorm-specific extensions.
- Test pipelines, transactions, scripting and reconnection behavior with your selected client version.
