export interface DocSection {
  id: string;
  number: number;
  title: string;
  category: 'core' | 'backend' | 'tsdb' | 'features' | 'ops' | 'design';
  contentFa: string;
  tags: string[];
}

export const ARCHITECTURE_SECTIONS: DocSection[] = [
  {
    id: 'intro-and-problem',
    number: 1,
    title: 'معرفی پروژه، مسئله و ارزش پیشنهادی (Overview & Value Prop)',
    category: 'core',
    tags: ['Problem', 'Solution', 'Target Users', 'Monetization'],
    contentFa: `
### ۱. مسئله اصلی در بازار مانیتورینگ مدرن (The Core Problem)
در معماری‌های توزیع‌شده (Microservices, Kubernetes, Edge) سیستم بدون مانیتورینگ شبیه پرواز هواپیما بدون رادار در شب تاریک است. اما ابزارهای فعلی مشکلات فلج‌کننده‌ای دارند:
- **هزینه‌های گزاف ابزارهای ابری (SaaS Pricing Traps):** شرکت‌هایی مانند Datadog و New Relic بر اساس تعداد هاست، تعداد متریک‌های کاستوم و حجم لاگ‌ها پول می‌گیرند. یک جهش ناگهانی در ترافیک یا افزایش کاردینالیتی می‌تواند قبض ماهانه را از ۲,۰۰۰ دلار به ۲۵,۰۰۰ دلار برساند!
- **پیچیدگی وحشتناک استک سنتی سلف‌هاستد (Prometheus Stack Complexity):** راه‌اندازی و نگهداری ترکیب Prometheus + Alertmanager + Grafana + Loki + Tempo + Thanos + VictoriaMetrics نیازمند تیم مجزای DevOps/SRE است.
- **فقدان راه‌حل یکپارچه All-in-One سبک:** یا باید ابزارهای غول‌پیکر را تحمل کرد یا از مانیتورینگ صرف‌نظر کرد.

---

### ۲. راه‌حل ما: PulseCore Engine
یک پلتفرم مرکزی و مدرن Observability که سه ستون تله‌متری (**Metrics** ، **Logs** و **Traces**) را به همراه یک موتور هشدار بی‌درنگ (Alert Engine) و داشبورد گرافیکی خیره‌کننده در یک باینری یا سرویس یکپارچه سبک ارائه می‌دهد.
- **سازگار با استانداردهای جهانی:** پشتیبانی بومی از Prometheus Exposition Format، StatsD، OpenTelemetry (OTLP) و JSON Line.
- **موتور ذخیره‌سازی بهینه سری‌های زمانی:** با الگوریتم فشرده‌سازی Gorilla (کاهش ۱۶ بایت خام به ۱.۳۷ بایت در هر نمونه).
- **موتور هشدار مجهز به State Machine:** جلوگیری از خستگی ناشی از هشدار (Alert Fatigue) با قابلیت‌های Dedup، Silencing، Grouping و Inhibition.
- **رابط کاربری مدرن الهام‌گرفته از گرافانا و ورسل:** با تایپوگرافی دقیق، حالت تیره اختصاصی و پایش زنده.

---

### ۳. کاربران هدف (Target Audience)
۱. تیم‌های توسعه نرم‌افزار و استارتاپ‌های در حال رشد (Mid-market & Scale-ups)
۲. شرکت‌های با محدودیت‌های قانونی داده (بانک‌ها، فین‌تک، سلامت) که ملزم به اجرای On-Premise/Self-Hosted هستند.
۳. مهندسان قابلیت اطمینان سایت (SREs) و Platform Engineers که نیاز به دید متمرکز دارند.

---

### ۴. مدل درآمدی و اقتصادی (Monetization Strategy)
- **Open-Core / Self-Hosted Community:** کاملاً رایگان برای یک کلاستر تک‌نود، تا ۱۰۰,۰۰۰ سری زمانی فعال.
- **PulseCore Cloud (SaaS Managed):** پرداخت به ازای حجم منصفانه (Pay-as-you-go) با شفافیت کامل، تا ۷۰٪ ارزان‌تر از Datadog.
- **Enterprise Self-Hosted:** کلاسترینگ چندنودی (High Availability Sharding)، احراز هویت سازمانی (SAML/SSO, Okta, LDAP)، پشتیبانی ۲۴/۷ و گزارش‌های انطباق SOC2 / HIPAA.
`,
  },
  {
    id: 'system-features-matrix',
    number: 2,
    title: 'ماتریس ویژگی‌ها: از MVP تا نسخه Enterprise',
    category: 'core',
    tags: ['MVP', 'Roadmap', 'Features', 'Modules'],
    contentFa: `
### ماتریس جامع قابلیت‌های سیستم بر اساس فازهای توسعه

| ماژول | فاز ۱ (MVP ۸-۱۰ هفته) | فاز ۲ (نسخه پیشرفته ۱۲-۱۴ هفته) | فاز ۳ (Enterprise نسخه سازمانی) |
| :--- | :--- | :--- | :--- |
| **Ingestion** | HTTP Ingestion برای پروتکل پرومتئوس و JSON Logs | بافر NATS JetStream، پروتکل StatsD و OTLP gRPC | Distributed Kafka Buffer، لایسنس پروتکل Syslog و FluentBit |
| **TSDB Storage** | In-Memory Ring Buffer + فایل‌های روی دیسک با Gorilla Compression | ادغام ClickHouse / Time-Series Storage با Downsampling خودکار | کلاسترینگ افقی (Sharded Raft)، تایرینگ ذخیره‌سازی S3 Cold Storage |
| **Query Engine** | کوئری‌های ساده پرومتئوسی (Rate, Sum, Avg, Min, Max, Quantile) | بهینه‌ساز AST، کش محلی با LRU، بردار توابع پنجره‌ای | Distributed Query Planner، کش توزیع‌شده با Redis Cluster |
| **Alert Engine** | قوانین شرطی آستانه (Threshold)، ارزیابی چرخه‌ای | State Machine ۴ وضعیته، Silencing، Deduplication و Inhibition | یادگیری ماشین برای Anomaly Detection، چند لایه Escalation Policy |
| **Notifications** | وب‌هوک، تلگرام، ایمیل (SMTP) و اسلک | دیسکورد، PagerDuty، مایکروسافت تیمز، صف Retry خودکار | تماس تلفنی خودکار (Twilio Voice)، On-Call Schedule چرخان |
| **Logs & Tracing** | فیلتر لاگ بر اساس سطح و سرویس، جستجوی متنی | نمایش لاگ‌های ساخت‌یافته و آبشار ردگیری OTLP (Waterfall) | همبستگی هوشمند (Log-to-Metric-to-Trace Correlation)، نمونه‌برداری پویا |
| **داشبورد و UI** | پنل‌های چارت سری زمانی، جدول هشدارها، حالت تاریک | ویرایشگر کشیدن و رها کردن داشبورد، متغیرهای فیلتر | اشتراک‌گذاری عمومی (Public Dashboard)، داشبورد وضعیت SLA |
| **Multi-Tenancy** | تک تستر با API Key پایه | جداسازی منطقی داده‌ها بر اساس Tenant ID و سهمیه‌بندی | ایزولاسیون کامل رمزنگاری، Fair Scheduling منابع، صورتحساب خودکار |
`,
  },
  {
    id: 'rbac-and-roles',
    number: 3,
    title: 'نقش‌ها و دسترسی‌ها (RBAC & Permissions)',
    category: 'backend',
    tags: ['Security', 'RBAC', 'Roles', 'Access Control'],
    contentFa: `
### ماتریس دسترسی‌ها و مدل RBAC / ABAC

سیستم بر پایه مدل کنترل دسترسی بر مبنای نقش (Role-Based Access Control) همراه با محدودیت دامنه مستأجر (Tenant Scope) طراحی شده است:

| نقش | توضیحات | مجوزهای Ingest | مشاهده داشبورد | ویرایش قوانین هشدار | تایید هشدار (Ack/Resolve) | مدیریت اعضا و سکرت‌ها |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **SuperAdmin** | ادمین کل سیستم زیرساختی | ✔ | ✔ | ✔ | ✔ | ✔ (همه‌کاره) |
| **TenantAdmin** | مدیر ارشد سازمان / تیم فنی | ✔ | ✔ | ✔ | ✔ | ✔ (محدود به تیم) |
| **On-Call Engineer** | مهندس کشیک پاسخگوی سوانح | ✖ | ✔ | ✔ | ✔ (با دسترسی Silence) | ✖ |
| **Editor / SRE** | مهندس پلتفرم و طراح داشبورد | ✖ | ✔ | ✔ | ✔ | ✖ |
| **Viewer** | ناظر (مدیران محصول و کسب‌وکار) | ✖ | ✔ | ✖ | ✖ | ✖ |
| **API Ingestion Client** | توکن ایجنت‌ها و سرورها | ✔ (Write Only) | ✖ | ✖ | ✖ | ✖ |

\`\`\`typescript
// ساختار مجوزها در کدهای بک‌اند (NestJS / TypeScript Guard)
export enum Permission {
  METRICS_WRITE = 'metrics:write',
  METRICS_READ = 'metrics:read',
  ALERTS_MANAGE = 'alerts:manage',
  ALERTS_ACK = 'alerts:ack',
  DASHBOARDS_EDIT = 'dashboards:edit',
  CHANNELS_CONFIG = 'channels:config',
  TENANT_SETTINGS = 'tenant:settings',
}
\`\`\`
`,
  },
  {
    id: 'system-architecture-diagram',
    number: 4,
    title: 'معماری کلی، دیاگرام سطح بالا و جریان داده (Architecture & Data Flow)',
    category: 'core',
    tags: ['Architecture', 'Data Flow', 'Sequence', 'Topology'],
    contentFa: `
### دیاگرام معماری سطح بالای سیستم (High-Level Architecture)

\`\`\`
+-----------------------------------------------------------------------------------+
|                            SOURCES & TELEMETRY AGENTS                             |
|  [Prometheus Scrapers]    [OpenTelemetry SDK]    [StatsD Clients]   [App Loggers] |
+-----------------------------------------------------------------------------------+
                                         │
                   HTTP/2 POST (gzip) / gRPC (OTLP) / UDP
                                         ▼
+───────────────────────────────────────────────────────────────────────────────────+
|                           INGESTION & BUFFERING GATEWAY                           |
|  - Rate Limiter (Token Bucket)        - API Key Auth & Tenant Validator          |
|  - Schema Validation (Protobuf/JSON)  - Cardinality Circuit Breaker               |
+───────────────────────────────────────────────────────────────────────────────────+
                                         │
                   High-Throughput Ring Buffer / NATS JetStream
                                         ▼
+───────────────────────────────────────────────────────────────────────────────────+
|                         CORE OBSERVABILITY STORAGE ENGINES                        |
|                                                                                   |
|  ┌───────────────────────────┐  ┌───────────────────────┐  ┌──────────────────┐   |
|  │ PulseCore TSDB Engine     │  │ ClickHouse Log Store  │  │ OTLP Trace Store │   |
|  │ - Gorilla Compression     │  │ - Structured JSON     │  │ - Spans & Water- │   |
|  │ - Delta-of-Delta Timest.  │  │ - Token Inverted Index│  │   fall DAG Index │   |
|  │ - Multi-Tier Downsampling │  │ - Vector Partitioning │  │ - Latency Roots  │   |
|  └───────────────────────────┘  └───────────────────────┘  └──────────────────┘   |
+───────────────────────────────────────────────────────────────────────────────────+
              ▲                                                       │
              │ Query / Aggregation                                   ▼
+──────────────────────────────────────────────+  +─────────────────────────────────+
|                QUERY ENGINE                  |  |          ALERT ENGINE           |
| - PromQL-compatible Parser & AST Generator   |  | - State Machine Evaluator (10s) |
| - Window Functions & Dynamic Quantiles (p99) |  | - Pending Duration Gatekeeper   |
| - LRU Series Cache (Redis / In-Memory)       |  | - Dedup, Grouping & Inhibition  |
+──────────────────────────────────────────────+  +─────────────────────────────────+
              ▲                                                       │
              │ REST / WebSocket / SSE                                ▼
+──────────────────────────────────────────────+  +─────────────────────────────────+
|         MODERN REACT / NEXT.JS UI            |  |       NOTIFICATION DISPATCH     |
| - Real-Time Visual Charts (Zoom, Brush)      |  | - Slack, Telegram, PagerDuty   |
| - Active Incidents & Silence Manager         |  | - Exponential Backoff Retries   |
| - Public Status Page & Service Topology      |  | - Two-Way Interactive Acknowl.  |
+──────────────────────────────────────────────+  +─────────────────────────────────+
\`\`\`

### جریان داده‌های اصلی (Core Data Flows):
1. **جریان دریافت تله‌متری (Ingestion Flow):** کلاینت داده را به صورت فشرده ارسال می‌کند -> درگاه با استفاده از الگوریتم Token Bucket نرخ ارسال را بررسی کرده و API Key را ارزیابی می‌کند -> داده به بافر حافظه رفته و بلافاصله برای کوئری در دسترس قرار می‌گیرد.
2. **جریان چرخه ارزیابی هشدار (Alert Evaluation Loop):** موتور ارزیابی هر ۱۵ ثانیه قوانین فعال را روی بازه داده اخیر اجرا می‌کند -> اگر آستانه رد شود وارد وضعیت \`Pending\` می‌شود -> پس از گذشت مدت زمان \`for: 2m\` به وضعیت \`Firing\` منتقل شده و پیام به صف توزیع فرستاده می‌شود.
3. **جریان بازیابی خودکار (Auto-Resolution):** با بازگشت پارامتر به وضعیت نرمال، هشدار به صورت خودکار به وضعیت \`Resolved\` رفته و پیام رفع سانحه ارسال می‌شود.
`,
  },
  {
    id: 'tsdb-deep-dive',
    number: 6,
    title: 'کالبدشکافی دیتابیس سری‌های زمانی (TSDB Engine & Gorilla Compression)',
    category: 'tsdb',
    tags: ['TSDB', 'Gorilla', 'Delta-of-Delta', 'XOR', 'Downsampling'],
    contentFa: `
### ۱. مقایسه جامع گزینه‌های دیتابیس سری‌های زمانی

| معیار مقایسه | ساخت موتور اختصاصی (Custom In-Memory + Disk) | ClickHouse (پیشنهاد تولیدی) | TimescaleDB (بر پایه Postgres) | InfluxDB (v2/v3 IOx) |
| :--- | :--- | :--- | :--- | :--- |
| **سرعت نوشتن (Write RPS)** | خارق‌العاده (میلیون رکورد/ثانیه روی حافظه) | بسیار بالا (تا ۳ میلیون/ثانیه) | متوسط (۲۰۰k تا ۵۰۰k/ثانیه) | بسیار بالا (Arrow DataFusion) |
| **فشرده‌سازی** | حداکثری (Gorilla XOR: ~1.37 بایت) | عالی (ZSTD + DoubleDelta: ~1.5 بایت)| خوب (Gorilla + LZ4: ~2-3 بایت) | عالی (Parquet + Snappy) |
| **کوئری‌های پیچیده و Join** | محدود به منطق خودمان | فوق‌العاده سریع با SQL استاندارد | عالی (پشتیبانی کامل از PostgreSQL)| محدود به Flux / InfluxQL |
| **هزینه نگهداری عملیاتی** | صفر وابستگی خارجی (Self-Contained) | متوسط (نیاز به تنظیم Zookeeper/Keeper) | آسان (همان پایش Postgres) | متوسط تا بالا |
| **پیشنهاد برای فازها** | **انتخاب فاز ۱ (MVP & دمو)** | **انتخاب فاز ۲ و ۳ (تولید انبوه)** | مناسب داده‌های رابطه‌ای پرحجم | جایگزین ابری |

---

### ۲. الگوریتم فشرده‌سازی Gorilla (Facebook Paper Deep Dive)
یک نقطه داده خام شامل:
- زمان سنج: ۶۴ بیت (int64 یونیکس)
- مقدار عددی: ۶۴ بیت (float64 استاندارد IEEE 754)
مجموع: **۱۲۸ بیت = ۱۶ بایت**.

#### الف) فشرده‌سازی زمان با Delta-of-Delta:
اگر فاصله نمونه‌برداری ۱۰ ثانیه باشد:
$$D = (t_n - t_{n-1}) - (t_{n-1} - t_{n-2})$$
- اگر $D = 0$ (فاصله ثابت): فقط **۱ بیت** ذخیره می‌شود: \`0\`.
- اگر $-63 \le D \le 64$: بیت‌های \`10\` به همراه ۷ بیت مقدار (مجموع ۹ بیت).
- اگر $-255 \le D \le 256$: بیت‌های \`110\` به همراه ۹ بیت مقدار (مجموع ۱۲ بیت).

#### ب) فشرده‌سازی مقادیر اعشاری با XOR:
مقدار جاری $V_n$ با مقدار قبلی $V_{n-1}$ عملگر XOR می‌شود:
$$X = V_n \oplus V_{n-1}$$
- اگر مقادیر دقیقاً برابر باشند: فقط **۱ بیت** ذخیره می‌شود: \`0\`.
- اگر برابر نباشند: بیت \`1\` ذخیره شده و فقط تعداد صفرهای آغازین و پایانی و بیت‌های معنی‌دار ثبت می‌شوند.
نتیجه نهایی: **کاهش مصرف حافظه از ۱۶ بایت به ۱.۲ تا ۱.۴ بایت (بیش از ۹۰٪ صرفه‌جویی!)**.

---

### ۳. استراتژی بازپایین‌سنجی (Downsampling & Retention Policy)
داده‌ها در سه سطح دسته‌بندی می‌شوند:
1. **داده‌های زنده (Raw Data):** با وضوح ۵ ثانیه‌ای به مدت ۷ روز ذخیره می‌شوند.
2. **رول‌آپ ۵ دقیقه‌ای (5m Rollup):** حاوی میانگین، کمینه و بیشینه به مدت ۹۰ روز.
3. **رول‌آپ ۱ ساعته (1h Rollup):** برای گزارش‌گیری طولانی‌مدت به مدت ۲ سال.
`,
  },
  {
    id: 'database-design-erd',
    number: 7,
    title: 'طراحی دیتابیس، مدل داده و جداول (ERD & Database Schema)',
    category: 'backend',
    tags: ['Database', 'Postgres', 'Schema', 'Prisma', 'ERD'],
    contentFa: `
### ساختار جداول هسته سیستم در PostgreSQL / Prisma

\`\`\`prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Tenant {
  id             String         @id @default(uuid())
  name           String
  slug           String         @unique
  quotaRps       Int            @default(10000)
  retentionDays  Int            @default(30)
  createdAt      DateTime       @default(now())
  apiKeys        ApiKey[]
  alertRules     AlertRule[]
  channels       NotificationChannel[]
  dashboards     Dashboard[]
  silences       Silence[]
}

model ApiKey {
  id          String    @id @default(uuid())
  tenantId    String
  tenant      Tenant    @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  keyHash     String    @unique
  name        String
  scopes      String[]  // ['metrics:write', 'logs:write']
  lastUsedAt  DateTime?
  createdAt   DateTime  @default(now())
}

model AlertRule {
  id           String      @id @default(uuid())
  tenantId     String
  tenant       Tenant      @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  name         String
  expr         String      // e.g. 'rate(http_requests_total[2m]) > 100'
  forDuration  String      @default("2m")
  severity     String      // 'critical' | 'warning' | 'info'
  threshold    Float
  comparison   String      // '>', '<', '>=', '<='
  metricName   String
  description  String?
  runbookUrl   String?
  enabled      Boolean     @default(true)
  alerts       AlertInstance[]
  channels     NotificationChannel[] @relation("RuleChannels")
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt
}

model AlertInstance {
  id             String      @id @default(uuid())
  ruleId         String
  rule           AlertRule   @relation(fields: [ruleId], references: [id], onDelete: Cascade)
  state          String      // 'Pending', 'Firing', 'Resolved'
  currentValue   Float
  triggeredAt    DateTime    @default(now())
  resolvedAt     DateTime?
  acknowledgedBy String?
  acknowledgedAt DateTime?
  notes          String?
  labelsJson     Json
}

model NotificationChannel {
  id          String      @id @default(uuid())
  tenantId    String
  tenant      Tenant      @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  name        String
  type        String      // 'slack', 'telegram', 'pagerduty', 'webhook', 'email'
  destination String      // webhook url, bot token, or email
  enabled     Boolean     @default(true)
  rules       AlertRule[] @relation("RuleChannels")
  createdAt   DateTime    @default(now())
}

model Silence {
  id          String      @id @default(uuid())
  tenantId    String
  tenant      Tenant      @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  matcherJson Json        // e.g. { "service": "auth", "env": "prod" }
  startsAt    DateTime
  endsAt      DateTime
  createdBy   String
  reason      String
}
\`\`\`
`,
  },
  {
    id: 'api-specification',
    number: 8,
    title: 'طراحی و مستندات کامل APIها (RESTful API Specification)',
    category: 'backend',
    tags: ['API', 'Endpoints', 'OpenAPI', 'REST'],
    contentFa: `
### مستندات فراخوانی وب‌سرویس‌های اصلی سیستم

#### ۱. اینجست متریک‌ها با فرمت استاندارد پرومتئوس
- **مسیر:** \`POST /api/v1/metrics\`
- **هدرها:** \`Content-Type: text/plain; version=0.0.4\`, \`X-API-Key: pk_live_xxxx\`
- **بدنه نمونه (Prometheus Text Format):**
\`\`\`text
# HELP http_requests_total Total number of HTTP requests made.
# TYPE http_requests_total counter
http_requests_total{method="POST",handler="/checkout",status="200"} 18402 1727394800000
http_requests_total{method="POST",handler="/checkout",status="504"} 48 1727394800000
\`\`\`
- **پاسخ:** \`202 Accepted\` با محتوای \`{ "ingested_points": 2, "time_us": 48 }\`

---

#### ۲. اجرای کوئری بازه‌ای (Query Range)
- **مسیر:** \`POST /api/v1/query_range\`
- **هدرها:** \`Authorization: Bearer <JWT>\`
- **بدنه درخواست:**
\`\`\`json
{
  "query": "rate(http_requests_total{status=~'5..'}[2m])",
  "start": 1727394000,
  "end": 1727397600,
  "step": "15s"
}
\`\`\`
- **پاسخ نمونه:**
\`\`\`json
{
  "status": "success",
  "data": {
    "resultType": "matrix",
    "result": [
      {
        "metric": { "service": "auth-service", "status": "504" },
        "values": [
          [1727394000, "0.12"],
          [1727394015, "0.14"],
          [1727394030, "5.82"]
        ]
      }
    ],
    "stats": {
      "seriesFetched": 1,
      "executionTimeMs": 3.8
    }
  }
}
\`\`\`

---

#### ۳. تایید و مدیریت هشدارها (Acknowledge Alert)
- **مسیر:** \`POST /api/v1/alerts/:id/ack\`
- **بدنه:** \`{ "assignee": "ali.kheiri", "notes": "در حال بازنشانی کانتینر ریدیس هستم." }\`
- **پاسخ:** \`{ "status": "acknowledged", "silencedForMinutes": 30 }\`
`,
  },
  {
    id: 'alert-engine-state-machine',
    number: 11,
    title: 'موتور هشدار، ماشین وضعیت و جلوگیری از نویز (Alert Engine & State Machine)',
    category: 'backend',
    tags: ['Alerting', 'State Machine', 'Inhibition', 'Deduplication'],
    contentFa: `
### دیاگرام ماشین وضعیت ارزیابی هشدار (Alert State Machine)

\`\`\`
              +--------------------------+
              |            OK            |<--------------------------+
              | (پارامتر در وضعیت نرمال) |                           |
              +--------------------------+                           |
                           │                                         |
             شرط نقض شد (Val > Thresh)                               |
                           ▼                                         |
              +--------------------------+                           |
              |         PENDING          |                           |
              | (منتظر انقضای for: 2m)   |                           |
              +--------------------------+                           |
                │                      │                             |
    شرط برطرف شد│                      │ گذشت زمان 2m                |
    قبل از انقضا│                      ▼                             |
                │             +--------------------------+           |
                │             |          FIRING          |           |
                │             | (هشدار ارسال به کانال‌ها)|           |
                │             +--------------------------+           |
                │                      │                             |
                │                      │ مقدار مجدداً نرمال شد       |
                │                      ▼                             |
                │             +--------------------------+           |
                +------------>|         RESOLVED         |-----------+
                              | (ارسال پیام رفع سانحه)   |
                              +--------------------------+
\`\`\`

### مفاهیم کلیدی برای جلوگیری از خستگی ناشی از هشدار (Anti-Alert Fatigue):
1. **Deduplication (حذف هشدارهای تکراری):** اگر یک شرط در هر ارزیابی همچنان صادق باشد، نوتیفیکیشن مجدد ارسال نمی‌شود مگر اینکه بازه \`repeat_interval: 4h\` منقضی شود.
2. **Inhibition (مهار آبشاری):** اگر هشدار سطح بالا (\`ClusterDown\`) شلیک شود، سیستم تمام هشدارهای زیرمجموعه (\`ServiceLatency\` ، \`DatabaseConnectionTimeout\`) را مهار می‌کند تا اینباکس مهندسان منفجر نشود!
3. **Silencing (سکوت زمان‌دار):** خاموش کردن موقت اعلان‌ها با Matcher مشخص (مثلاً در زمان عملیات استقرار یا تعمیرات سرور).
`,
  },
  {
    id: 'visual-identity-and-aesthetic',
    number: 28,
    title: 'هویت بصری، طراحی و دیزاین سیستم (Aesthetic & Visual Identity)',
    category: 'design',
    tags: ['UI/UX', 'Tailwind', 'Design System', 'HEX Codes', 'Motion'],
    contentFa: `
### ۱. فلسفه طراحی (Design Philosophy)
طراحی این سیستم بر پایه احساس **«دقت میلی‌ثانیه‌ای، کنترل کامل بر زیرساخت و آرامش زیر بار سنگین بحران»** شکل گرفته است:
- کنتراست فوق‌العاده بالا برای خوانایی در محیط‌های مرکز عملیات شبکه (NOC Rooms).
- رنگ‌بندی تیره ارگانیک با شیدهای سنگین سورمه‌ای-خاکستری برای جلوگیری از خستگی چشم در شیفت‌های شبانه.

---

### ۲. پالت رنگی استاندارد مهندسی (Design Tokens & HEX Codes)

| کاربرد | نام توکن | کد HEX | نمونه بصری و کاربرد |
| :--- | :--- | :--- | :--- |
| **پس‌زمینه اصلی** | \`canvas-dark\` | \`#090D16\` | مشکی عمیق فضایی برای کل اپلیکیشن |
| **کارت‌ها و پنل‌ها** | \`panel-surface\` | \`#0B0F19\` | پس‌زمینه کارت‌ها با حاشیه شیشه‌ای \`border-slate-800/80\` |
| **وضعیت بحرانی (Critical)** | \`alert-crimson\` | \`#EF4444\` | قرمز نئونی مجهز به پالس راداری برای هشدارهای بحرانی |
| **وضعیت هشدار (Warning)** | \`warning-amber\` | \`#F59E0B\` | زرد کهربایی گرم برای مقادیر فراتر از استاندارد |
| **وضعیت سالم (Healthy)** | \`success-emerald\`| \`#10B981\` | سبز زمردی با گواهی پایداری و آپ‌تایم |
| **متریک‌های کلیدی (Primary)** | \`brand-indigo\` | \`#6366F1\` | نیلی جذاب برای خطوط نمودار و عناصر فعال |
| **ردگیری و لاگ‌ها (Traces)**| \`trace-cyan\` | \`#06B6D4\` | فیروزه‌ای نئونی برای آبشار اسپان‌ها و تایم‌لاین‌ها |

---

### ۳. تایپوگرافی مهندسی
- **فونت فارسی:** Vazirmatn (وزن‌های ۴۰۰، ۵۰۰، ۶۰۰، ۷۰۰) با بهینه‌سازی فاصله‌گذاری اعداد.
- **فونت انگلیسی و کد:** JetBrains Mono و Inter برای نمایش متون فنی، فرمول‌های PromQL و تگ‌های لاگ.

---

### ۴. سیستم موشن و تعاملات خرد (Micro-Interactions)
- **پالس راداری برای هشدارهای فعال:** استفاده از انیمیشن دایره‌ای در حال انبساط بر روی نشانگرهای وضعیت بحرانی.
- **انتقال نرم نمودارها:** رندر روان تغییرات متریک بدون پرش صفحه با بازه ۵۰۰ میلی‌ثانیه‌ای.
- **پالت فرمان (Command Palette):** باز شدن آنی با کلید ترکیبی \`Ctrl + K\` یا \`Cmd + K\`.
`,
  },
];
