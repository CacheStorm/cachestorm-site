## The right shape for your data

Use familiar Redis data types or explore CacheStorm's extended command modules. The upstream reference documents strings, hashes, lists, sets, sorted sets, streams, geospatial indexes, bitmaps and HyperLogLog, plus extensions.

## Strings and expiry

Store cached values, sessions and counters. Set expiry at write time or add it later.

```redis
SET session:42 "user_128" EX 3600
GET session:42
TTL session:42
INCR page:views
MSET config:theme dark config:locale en
```

## Hashes

Update individual fields without replacing an entire object.

```redis
HSET user:42 name "Ada" language "Go"
HGET user:42 name
HGETALL user:42
HINCRBY user:42 visits 1
```

## Lists and sets

Lists preserve order. Sets keep unique members.

```redis
LPUSH jobs "send-email"
RPOP jobs
SADD team:engineering "ada" "linus"
SISMEMBER team:engineering "ada"
SMEMBERS team:engineering
```

## Sorted sets

Associate members with numeric scores for rankings and score-based queries.

```redis
ZADD leaderboard 2400 "ada" 1800 "linus"
ZREVRANGE leaderboard 0 9 WITHSCORES
ZINCRBY leaderboard 100 "linus"
```

## Streams and Pub/Sub

Append entries to a stream for ordered event processing. Pub/Sub broadcasts messages to current subscribers.

```redis
XADD events * type pageview path /home
XRANGE events - + COUNT 10
```

In separate client connections:

```redis
SUBSCRIBE notifications
```

```redis
PUBLISH notifications "build complete"
```

## Tags and invalidation

Attach tags to cached values, then inspect or invalidate groups.

```redis
SET product:1 "chair" TAGS catalog furniture
SET product:2 "desk" TAGS catalog furniture
TAGKEYS catalog
INVALIDATE catalog
```

## Extended modules

The upstream reference includes JSON, time series, full-text search, graph operations, probabilistic structures, scheduling, workflows and other modules. Availability of a command name does not establish compatibility with every external module or workload. Review the syntax and test the operations your application depends on.

Explore the [searchable command reference](/docs/commands/) for the command signatures documented by upstream.
