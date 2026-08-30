import type { Incident, ActivityBaseline, RecurrenceGroup } from '../types/incident';

export const SEEDED_INCIDENTS: Incident[] = [
  // --- ACTIVE / OPEN INCIDENTS (To demonstrate Match View & Resolution Flow) ---
  {
    id: 'INC-9844',
    created_at: '2026-08-30T05:12:00Z',
    service: 'auth-service',
    endpoint: 'POST /auth/login',
    error_type: 'RedisConnectionPoolTimeout',
    error_message: 'Timeout waiting for idle redis client in pool after 3000ms [pool_size=50, active=50, idle=0]',
    stack_trace: `Redis::ConnectionTimeoutError: Timeout acquiring client from pool
  at Pool.acquire (/app/node_modules/generic-pool/index.js:312:19)
  at RedisSessionStore.getSession (/app/src/session/redis.ts:84:32)
  at AuthController.login (/app/src/controllers/auth.ts:142:15)
  at Layer.handle [as handle_request] (/app/node_modules/express/lib/router/layer.js:95:5)
  at next (/app/node_modules/express/lib/router/route.js:144:13)`,
    category: 'error_thrown',
    severity: 'P1 - Critical',
    status: 'open',
    similarity_score: 92,
    matched_incident_id: 'INC-2041',
    match_evidence: {
      error_type_match: 98,
      endpoint_match: 100,
      stack_trace_overlap: 91,
      service_context_match: 95,
      key_matches: [
        'Identical endpoint: POST /auth/login',
        'Redis session pool exhaustion pattern (50/50 active clients)',
        'Stack frame match in /app/src/session/redis.ts:84:32',
        'Failure triggered during peak authentication traffic spike'
      ]
    },
    resolution_verified: false
  },
  {
    id: 'INC-9850',
    created_at: '2026-08-30T04:45:00Z',
    service: 'checkout-api',
    endpoint: 'GET /v2/orders',
    error_type: 'ReadReplicaRouterLeak',
    error_message: 'Max active connections (100) exceeded on read-replica-node-03; acquire failed',
    stack_trace: `DB::ConnectionLeakError: Replica pool exhausted (100/100)
  at ReadRouter.getConnection (/app/src/db/router.ts:119:24)
  at OrderRepository.listCustomerOrders (/app/src/repos/order.ts:67:18)
  at OrderController.getOrders (/app/src/controllers/orders.ts:55:12)`,
    category: 'error_thrown',
    severity: 'P2 - High',
    status: 'open',
    similarity_score: 87,
    matched_incident_id: 'INC-4022',
    match_evidence: {
      error_type_match: 89,
      endpoint_match: 100,
      stack_trace_overlap: 85,
      service_context_match: 92,
      key_matches: [
        'Endpoint match: GET /v2/orders',
        'Replica router connection release failure on transaction rollback',
        'Direct stack match in /app/src/db/router.ts:119:24'
      ]
    },
    resolution_verified: false
  },
  {
    id: 'INC-9855',
    created_at: '2026-08-30T03:30:00Z',
    service: 'billing-gateway',
    endpoint: 'POST /v1/webhooks/stripe',
    error_type: 'SilentDropAnomaly',
    error_message: 'Zero ingress webhook events received in 6h window (Expected: ~125 events, Baseline: 500/day)',
    stack_trace: `[TELEMETRY_ANOMALY_DETECTOR]
Service: billing-gateway
Endpoint: POST /v1/webhooks/stripe
Anomaly: Total Traffic Cliff (-100% Ingress)
No 5xx or 4xx errors logged in application layer.
Upstream Cloudflare edge returned 403 WAF blocks on rotated Stripe IP ranges.`,
    category: 'silent_failure',
    severity: 'P1 - Critical',
    status: 'open',
    similarity_score: 84,
    matched_incident_id: 'INC-3189',
    match_evidence: {
      error_type_match: 78,
      endpoint_match: 100,
      stack_trace_overlap: 80,
      service_context_match: 94,
      key_matches: [
        'Target endpoint POST /v1/webhooks/stripe',
        'Zero error logs generated in application layer',
        'Edge firewall IP allowlist divergence from Stripe IP webhook pool'
      ]
    },
    resolution_verified: false
  },
  {
    id: 'INC-9860',
    created_at: '2026-08-30T01:15:00Z',
    service: 'auth-service',
    endpoint: 'POST /auth/login',
    error_type: 'JWTClockSkewRaceCondition',
    error_message: 'Token issued at future timestamp (clock drift +3.4s across container nodes)',
    stack_trace: `JWT::InvalidTokenError: jwt issued at future date (nbf validation failed)
  at JWTVerifier.verify (/app/src/auth/jwt.ts:98:14)
  at SessionManager.validateLogin (/app/src/auth/session.ts:210:22)
  at LoginHandler.process (/app/src/handlers/login.ts:45:10)`,
    category: 'recurring_debt',
    severity: 'P2 - High',
    status: 'investigating',
    similarity_score: 96,
    matched_incident_id: 'INC-7112',
    match_evidence: {
      error_type_match: 97,
      endpoint_match: 100,
      stack_trace_overlap: 94,
      service_context_match: 98,
      key_matches: [
        'Endpoint POST /auth/login recurrence #4',
        'Container node chrony/NTP sync drift exceeded 3 seconds',
        'Previous patch applied leeway margin but did not fix host NTP daemon sync'
      ]
    },
    resolution_verified: false
  },

  // --- HISTORICAL RESOLVED INCIDENTS (Organizational Memory Bank) ---
  {
    id: 'INC-2041',
    created_at: '2026-06-14T14:22:00Z',
    service: 'auth-service',
    endpoint: 'POST /auth/login',
    error_type: 'RedisConnectionPoolTimeout',
    error_message: 'Timeout waiting for idle redis client in pool after 3000ms [pool_size=50, active=50, idle=0]',
    stack_trace: `Redis::ConnectionTimeoutError: Timeout acquiring client from pool
  at Pool.acquire (/app/node_modules/generic-pool/index.js:312:19)
  at RedisSessionStore.getSession (/app/src/session/redis.ts:84:32)
  at AuthController.login (/app/src/controllers/auth.ts:142:15)`,
    category: 'error_thrown',
    severity: 'P1 - Critical',
    status: 'resolved',
    similarity_score: 100,
    root_cause: 'Unclosed Redis client in async error handler branch during OAuth token exchange caused active client leaks until the 50-connection pool was completely exhausted.',
    fix_description: 'Wrapped all session lookup blocks with `try...finally` ensuring `client.release()` executes in every code path, and increased maximum idle connection pool size from 50 to 200 with connection keepalive heartbeat.',
    fix_diff: `@@ -84,6 +84,10 @@ export async function getSession(token: string) {
-  const client = await pool.acquire();
-  const session = await client.get(token);
-  return JSON.parse(session);
+  const client = await pool.acquire();
+  try {
+    const session = await client.get(token);
+    return session ? JSON.parse(session) : null;
+  } finally {
+    await pool.release(client);
+  }`,
    fix_pr_url: 'https://github.com/org/auth-service/pull/482',
    resolution_verified: true,
    resolved_by: 'alex.chen@infra.internal',
    resolved_at: '2026-06-14T15:45:00Z',
    reuse_count: 3,
    downtime_minutes: 28
  },
  {
    id: 'INC-3189',
    created_at: '2026-05-18T09:10:00Z',
    service: 'billing-gateway',
    endpoint: 'POST /v1/webhooks/stripe',
    error_type: 'SilentDropAnomaly',
    error_message: 'Stripe webhook ingestion completely halted following Cloudflare WAF bot management update',
    stack_trace: `[EDGE_ANOMALY_LOG]
Path: POST /v1/webhooks/stripe
HTTP 403 Forbidden returned at Edge CDN
Cloudflare WAF Rule 100019 triggered on new Stripe Webhook egress IP blocks (54.187.174.160/28).
Application healthcheck remained green (200 OK) masking the drop.`,
    category: 'silent_failure',
    severity: 'P1 - Critical',
    status: 'resolved',
    similarity_score: 100,
    root_cause: 'Cloudflare WAF rules blocked newly added Stripe webhook IP subnets after Stripe infrastructure migration. Because the edge rejected requests, the internal server never received traffic or threw an error.',
    fix_description: 'Updated edge firewall configuration to bypass bot management rules for endpoints with valid `Stripe-Signature` headers and dynamically sync Stripe IP CIDR lists every 12 hours via Terraform worker.',
    fix_diff: `@@ -12,4 +12,8 @@ resource "cloudflare_filter" "stripe_webhook" {
-  expression = "(http.request.uri.path eq \\"/v1/webhooks/stripe\\" and not ip.src in $stripe_ips)"
+  expression = "(http.request.uri.path eq \\"/v1/webhooks/stripe\\" and not (ip.src in $stripe_ips or http.request.headers[\\"stripe-signature\\"][0] ne \\"\\"))"
   action     = "bypass"
+  description = "Allow all verified Stripe Webhook traffic bypass"
 }`,
    fix_pr_url: 'https://github.com/org/infra-terraform/pull/914',
    resolution_verified: true,
    resolved_by: 'sarah.miller@sre.internal',
    resolved_at: '2026-05-18T10:30:00Z',
    reuse_count: 2,
    downtime_minutes: 80
  },
  {
    id: 'INC-4022',
    created_at: '2026-04-02T18:30:00Z',
    service: 'checkout-api',
    endpoint: 'GET /v2/orders',
    error_type: 'ReadReplicaRouterLeak',
    error_message: 'Max active connections (100) exceeded on read-replica-node-03; acquire failed',
    stack_trace: `DB::ConnectionLeakError: Replica pool exhausted (100/100)
  at ReadRouter.getConnection (/app/src/db/router.ts:119:24)
  at OrderRepository.listCustomerOrders (/app/src/repos/order.ts:67:18)`,
    category: 'error_thrown',
    severity: 'P2 - High',
    status: 'resolved',
    similarity_score: 100,
    root_cause: 'Database read replica router failed to return connection back to pool when streaming paginated order results hit client abort / timeout exceptions.',
    fix_description: 'Added `stream.on("close")` and `stream.on("error")` lifecycle hooks to immediately dispose and recycle database handles back to the connection pool.',
    fix_diff: `@@ -119,4 +119,8 @@ export function createReadStream(query, conn) {
   const stream = conn.query(query).stream();
+  stream.on('close', () => conn.release());
+  stream.on('error', (err) => {
+    conn.release();
+    logger.error('Stream aborted', { err });
   });
   return stream;`,
    fix_pr_url: 'https://github.com/org/checkout-api/pull/312',
    resolution_verified: true,
    resolved_by: 'devin.vance@backend.internal',
    resolved_at: '2026-04-02T19:40:00Z',
    reuse_count: 1,
    downtime_minutes: 42
  },
  {
    id: 'INC-5190',
    created_at: '2026-03-11T08:14:00Z',
    service: 'ingest-worker',
    endpoint: 'POST /v1/telemetry/batch',
    error_type: 'HeapOutOfMemoryError',
    error_message: 'JavaScript heap out of memory (allocation failed during snappy decompress of 45MB chunk)',
    stack_trace: `FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed - JavaScript heap out of memory
  at Snappy.uncompressSync (/app/node_modules/snappy/index.js:52:11)
  at TelemetryParser.parse (/app/src/workers/telemetry.ts:110:20)`,
    category: 'error_thrown',
    severity: 'P1 - Critical',
    status: 'resolved',
    similarity_score: 100,
    root_cause: 'Synchronous in-memory snappy decompression on batches >30MB overloaded the 1.5GB V8 node heap during unsegmented batch ingestion spikes.',
    fix_description: 'Switched from synchronous uncompressSync to streamed transform pipeline with backpressure and enforced 15MB client-side chunking limit at API gateway.',
    fix_diff: `@@ -110,3 +110,6 @@ export async function processBatch(payload) {
-  const raw = Snappy.uncompressSync(payload);
+  const stream = pipeline(payload, Snappy.createUncompressStream(), parserStream);
   return stream;`,
    fix_pr_url: 'https://github.com/org/ingest-worker/pull/205',
    resolution_verified: true,
    resolved_by: 'elena.rostova@data.internal',
    resolved_at: '2026-03-11T09:35:00Z',
    reuse_count: 1,
    downtime_minutes: 35
  },
  {
    id: 'INC-6304',
    created_at: '2026-02-19T22:15:00Z',
    service: 'billing-gateway',
    endpoint: 'POST /payments/charge',
    error_type: 'GrpcDeadlineExceeded',
    error_message: 'gRPC status 4 DEADLINE_EXCEEDED: upstream fraud-engine did not respond within 1500ms',
    stack_trace: `Error: 4 DEADLINE_EXCEEDED: context deadline exceeded
  at Object.callErrorFromStatus (/app/node_modules/@grpc/grpc-js/build/src/call.js:31:26)
  at FraudClient.evaluateTransaction (/app/src/clients/fraud.ts:75:18)`,
    category: 'error_thrown',
    severity: 'P1 - Critical',
    status: 'resolved',
    similarity_score: 100,
    root_cause: 'Node DNS resolver cached a terminated Pod IP due to infinite TTL config, sending traffic to dead endpoint until connection timed out.',
    fix_description: 'Configured `@grpc/grpc-js` channel with `grpc.service_config` enabling round-robin load balancing and DNS refresh subchannel TTL of 15 seconds.',
    fix_diff: `@@ -75,3 +75,6 @@ export const fraudClient = new FraudServiceClient(target, creds, {
+  'grpc.lb_policy_name': 'round_robin',
+  'grpc.dns_min_time_between_resolutions_ms': 15000,
+  'grpc.keepalive_time_ms': 10000`,
    fix_pr_url: 'https://github.com/org/billing-gateway/pull/587',
    resolution_verified: true,
    resolved_by: 'alex.chen@infra.internal',
    resolved_at: '2026-02-19T23:05:00Z',
    reuse_count: 2,
    downtime_minutes: 22
  },
  {
    id: 'INC-7112',
    created_at: '2026-01-10T12:00:00Z',
    service: 'auth-service',
    endpoint: 'POST /auth/login',
    error_type: 'JWTClockSkewRaceCondition',
    error_message: 'Token issued at future timestamp (clock drift +2.8s across EC2 worker pool)',
    stack_trace: `JWT::InvalidTokenError: jwt issued at future date
  at JWTVerifier.verify (/app/src/auth/jwt.ts:98:14)
  at SessionManager.validateLogin (/app/src/auth/session.ts:210:22)`,
    category: 'recurring_debt',
    severity: 'P2 - High',
    status: 'resolved',
    similarity_score: 100,
    root_cause: 'Worker node system clocks drifted apart by 2.8 seconds due to disabled chronyd NTP synchronization daemon on legacy ami-09f images.',
    fix_description: 'Applied a quick 5-second clock tolerance leeway into JWT validation settings. (Note: Only a temporary band-aid; host NTP sync was not fixed at the time).',
    fix_diff: `@@ -98,3 +98,4 @@ export function verifyToken(token: string) {
-  return jwt.verify(token, SECRET);
+  return jwt.verify(token, SECRET, { clockTolerance: 5 });`,
    fix_pr_url: 'https://github.com/org/auth-service/pull/390',
    resolution_verified: true,
    resolved_by: 'marcus.brooks@sec.internal',
    resolved_at: '2026-01-10T13:10:00Z',
    reuse_count: 1,
    downtime_minutes: 15
  },
  {
    id: 'INC-8034',
    created_at: '2025-11-28T16:40:00Z',
    service: 'notification-worker',
    endpoint: 'POST /notifications/send',
    error_type: 'RabbitMQUnackedQueueOverflow',
    error_message: 'Channel prefetch limit (2500) reached; consumer consumer-worker-4 hung on APNS socket',
    stack_trace: `AMQP::ChannelBlocked: Maximum unacknowledged messages exceeded
  at Channel.consume (/app/src/queue/rabbitmq.ts:180:12)
  at Worker.processNotification (/app/src/workers/notification.ts:90:8)`,
    category: 'error_thrown',
    severity: 'P2 - High',
    status: 'resolved',
    similarity_score: 100,
    root_cause: 'Apple Push Notification Service (APNS) HTTP/2 keep-alive socket hung indefinitely without timeout, leaving 2,500 messages in unacknowledged limbo.',
    fix_description: 'Set strict 4000ms request timeout on APNS client connections and implemented dead-letter queue (DLQ) routing for retries.',
    fix_diff: `@@ -90,3 +90,5 @@ export async function sendPush(payload) {
+  const abortController = new AbortController();
+  const timeout = setTimeout(() => abortController.abort(), 4000);
   const res = await apnsClient.send(payload, { signal: abortController.signal });`,
    fix_pr_url: 'https://github.com/org/notification-worker/pull/112',
    resolution_verified: true,
    resolved_by: 'sarah.miller@sre.internal',
    resolved_at: '2025-11-28T17:20:00Z',
    reuse_count: 1,
    downtime_minutes: 30
  }
];

export const SEEDED_BASELINES: ActivityBaseline[] = [
  {
    id: 'BASE-01',
    service: 'billing-gateway',
    endpoint: 'POST /v1/webhooks/stripe',
    expected_rate: 125,
    actual_rate: 0,
    unit: 'events / 6h',
    window: 'Last 6 Hours',
    last_seen_at: '6 hours 14 mins ago',
    time_since_last: '6h 14m',
    anomaly_threshold: 80,
    drop_percentage: 100,
    sparkline_data: [130, 128, 125, 122, 134, 120, 118, 125, 60, 10, 0, 0, 0, 0],
    description: 'Payment provider webhook ingress has completely flatlined. Normal volume is ~500 events/day (~125 per 6 hours). No application errors or 5xx exceptions logged.',
    root_cause_clue: 'Edge firewall WAF / CDN rule blocking inbound IP pool after provider rotation.',
    status: 'active_drop',
    suggested_runbook: 'RB-BILLING-04: Inspect Edge CDN WAF block metrics & verify Stripe webhook IP ranges.'
  },
  {
    id: 'BASE-02',
    service: 'inventory-sync',
    endpoint: 'sync_inventory_delta',
    expected_rate: 1200,
    actual_rate: 12,
    unit: 'jobs / hour',
    window: 'Last 1 Hour',
    last_seen_at: '45 mins ago',
    time_since_last: '45m',
    anomaly_threshold: 75,
    drop_percentage: 99,
    sparkline_data: [1180, 1210, 1195, 1220, 1205, 1190, 1230, 1150, 420, 80, 14, 12],
    description: 'Warehouse ERP delta sync job processing volume collapsed by 99%. Worker process is alive and heartbeating, but queue polling yielded zero processed records.',
    root_cause_clue: 'Upstream Kafka consumer group partition rebalance deadlock or expired SASL token.',
    status: 'active_drop',
    suggested_runbook: 'RB-SYNC-12: Check Kafka consumer partition lag and verify Kerberos SASL renewer.'
  },
  {
    id: 'BASE-03',
    service: 'notification-worker',
    endpoint: 'POST /notifications/send',
    expected_rate: 85,
    actual_rate: 2,
    unit: 'dispatches / min',
    window: 'Last 30 Mins',
    last_seen_at: '18 mins ago',
    time_since_last: '18m',
    anomaly_threshold: 70,
    drop_percentage: 97.6,
    sparkline_data: [82, 88, 85, 84, 87, 86, 90, 83, 30, 8, 3, 2],
    description: 'Outbound user email & push notification dispatch throughput plummeted from 85/min baseline down to 2/min. No downstream provider 5xx recorded.',
    root_cause_clue: 'Rate limiter redis key locked by lingering worker node or token bucket quota drain.',
    status: 'investigating',
    suggested_runbook: 'RB-NOTIF-02: Flush stale rate-limiter bucket locks and inspect queue backlogs.'
  }
];

export const SEEDED_RECURRENCE_GROUPS: RecurrenceGroup[] = [
  {
    id: 'REC-01',
    signature: 'POST /auth/login : RedisConnectionPool & TokenRace',
    service: 'auth-service',
    endpoint: 'POST /auth/login',
    error_type: 'SessionPoolExhaustion / ClockSkewRace',
    occurrence_count: 4,
    timeframe: '4 incidents in 4 months',
    first_seen: '2026-05-02',
    last_seen: '2026-08-30',
    flagged_as_debt: true,
    debt_threshold: 3,
    recommendation: 'Refactor authentication state from stateful in-memory Redis session locks to stateless Ed25519 asymmetric JWT verification with distributed cache fallback.',
    permanent_solution: 'Replace connection-pool-bound session state with stateless tokens + edge revocation bloom filters. Eliminates Redis lock contention and clock skew vulnerability completely.',
    wasted_hours: 38.5,
    refactor_estimate_hours: 16.0,
    occurrences: [
      {
        incident_id: 'INC-2041',
        date: '2026-05-02',
        patch_applied: 'Increased pool size limit from 25 to 50',
        why_it_failed_again: 'Band-aid only delayed connection pool exhaustion during traffic spikes.',
        engineer: 'alex.chen',
        downtime_minutes: 32
      },
      {
        incident_id: 'INC-4410',
        date: '2026-06-14',
        patch_applied: 'Wrapped error handlers in try/finally blocks',
        why_it_failed_again: 'Async promise unhandled rejections still orphaned redis client locks.',
        engineer: 'devin.vance',
        downtime_minutes: 28
      },
      {
        incident_id: 'INC-7112',
        date: '2026-07-20',
        patch_applied: 'Added 5-second clock tolerance leeway to token verifier',
        why_it_failed_again: 'Clock skew across AWS multi-AZ containers grew to 6.2s during load.',
        engineer: 'marcus.brooks',
        downtime_minutes: 15
      },
      {
        incident_id: 'INC-9860',
        date: '2026-08-30',
        patch_applied: 'Pending architectural refactor approval (Current Incident)',
        why_it_failed_again: 'Underlying architectural debt remains unaddressed across 4 patch cycles.',
        engineer: 'triage-team',
        downtime_minutes: 18
      }
    ]
  },
  {
    id: 'REC-02',
    signature: 'POST /checkout/apply-coupon : OptimisticLockTimeout',
    service: 'checkout-api',
    endpoint: 'POST /checkout/apply-coupon',
    error_type: 'OptimisticLockException (Version mismatch on promo_codes row)',
    occurrence_count: 3,
    timeframe: '3 incidents in 2 months',
    first_seen: '2026-07-04',
    last_seen: '2026-08-25',
    flagged_as_debt: true,
    debt_threshold: 3,
    recommendation: 'Migrate promo code redemption counter to Redis INCRBY atomics with asynchronous Postgres reconciliation instead of row-level pessimistic database locks.',
    permanent_solution: 'Decouple high-concurrency coupon validation counters from transactional relational DB writes.',
    wasted_hours: 22.0,
    refactor_estimate_hours: 12.0,
    occurrences: [
      {
        incident_id: 'INC-7801',
        date: '2026-07-04',
        patch_applied: 'Added retry-loop (3 attempts) on DB row lock timeout',
        why_it_failed_again: 'Retry storm amplified database CPU load to 98% during flash sales.',
        engineer: 'sarah.miller',
        downtime_minutes: 24
      },
      {
        incident_id: 'INC-8490',
        date: '2026-08-11',
        patch_applied: 'Increased lock timeout threshold from 1000ms to 3000ms',
        why_it_failed_again: 'Cascaded HTTP connection pool starvation across checkout microservice.',
        engineer: 'elena.rostova',
        downtime_minutes: 36
      },
      {
        incident_id: 'INC-9102',
        date: '2026-08-25',
        patch_applied: 'Temporarily capped max concurrent coupon redemptions',
        why_it_failed_again: 'User checkout abandonment rate spiked 14% due to throttling.',
        engineer: 'devin.vance',
        downtime_minutes: 19
      }
    ]
  }
];

export const SIMULATION_SCENARIOS = [
  {
    title: 'Simulate Auth Redis Connection Starvation',
    category: 'error_thrown' as const,
    service: 'auth-service',
    endpoint: 'POST /auth/login',
    error_type: 'RedisConnectionPoolTimeout',
    error_message: 'Connection pool exhausted (50/50 clients busy) during morning login burst',
    stack_trace: `Redis::ConnectionTimeoutError: Timeout acquiring client from pool
  at Pool.acquire (/app/node_modules/generic-pool/index.js:312:19)
  at RedisSessionStore.getSession (/app/src/session/redis.ts:84:32)
  at AuthController.login (/app/src/controllers/auth.ts:142:15)`,
    severity: 'P1 - Critical' as const
  },
  {
    title: 'Simulate Stripe Webhook Silent Drop Anomaly',
    category: 'silent_failure' as const,
    service: 'billing-gateway',
    endpoint: 'POST /v1/webhooks/stripe',
    error_type: 'SilentDropAnomaly',
    error_message: '0 inbound webhook requests detected in past 6h (Baseline: 500/day). No error logs generated.',
    stack_trace: `[TELEMETRY_ANOMALY_DETECTOR]
Endpoint: POST /v1/webhooks/stripe
Traffic dropped by 100%. Expected rate: 125/6h, Actual: 0.
WAF block logs indicate Edge 403 rule triggered.`,
    severity: 'P1 - Critical' as const
  },
  {
    title: 'Simulate Database Read-Replica Stream Leak',
    category: 'error_thrown' as const,
    service: 'checkout-api',
    endpoint: 'GET /v2/orders',
    error_type: 'ReadReplicaRouterLeak',
    error_message: 'Max active connections exceeded on read replica node',
    stack_trace: `DB::ConnectionLeakError: Replica pool exhausted
  at ReadRouter.getConnection (/app/src/db/router.ts:119:24)
  at OrderRepository.listCustomerOrders (/app/src/repos/order.ts:67:18)`,
    severity: 'P2 - High' as const
  }
];
