import { InfluxDB } from "@influxdata/influxdb-client";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import CreateBucket from "./utils/CreateBucket.js";
import WritePoint from "./utils/WritePoint.js";
import { zWritePoint } from "./types/WritePoint.js";
import { zHealth } from "./types/Health.js";
import { basicAuth } from "hono/basic-auth";

const app = new Hono();

const HONO_USERNAME = process.env.HONO_USERNAME || "";
const HONO_PASSWORD = process.env.HONO_PASSWORD || "";

const INFLUX_URL = process.env.INFLUX_URL || "";
const INFLUX_TOKEN = process.env.INFLUX_TOKEN || "";
const INFLUX_ORG_ID = process.env.INFLUX_ORG_ID || "";
const influxDB = new InfluxDB({ url: INFLUX_URL, token: INFLUX_TOKEN });

// basic auth
app.use(
  "/api/v1/*",
  basicAuth({
    username: HONO_USERNAME,
    password: HONO_PASSWORD,
  })

);

app.get("/", (c) => {
  return c.text("Hello Inflexdb api!");
});

app.get("/api/v1/health", async (c) => {
  const health = await fetch(`${INFLUX_URL}/health`, {
    method: "GET",
    headers: {
      Authorization: `Authorization: Token ${INFLUX_TOKEN}`,
      "Content-Type": "application/json",
    },
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error(`Failed to fetch health: ${res.statusText}`);
      }
      return res.json();
    })
    .catch((err: string) => {
      console.error(err);
      c.status(500);
      return c.text(err);
    });
  const parsedHealth = zHealth.safeParse(health);
  if (!parsedHealth.success) {
    console.error("Invalid health response", parsedHealth.error);
    c.status(500);
    return c.text("Invalid health response");
  }
  c.status(200);
  return c.json(parsedHealth);
});

app.get("/api/v1/bucket/create", (c) => {
  const bucketName = c.req.query("bucketName");
  if (!bucketName) {
    console.error("bucketName is required");
    c.status(400);
    return c.text("bucketName is required");
  }

  const _ = CreateBucket({ INFLUX_URL, INFLUX_TOKEN, INFLUX_ORG_ID, bucketName }).catch((err: string) => {
    console.error(err);
    c.status(500);
    return c.text(err);
  });

  c.status(201);
  return c.text("Bucket created successfully");
});

app.post("/api/v1/point/write", (c) => {
  const writePoint = zWritePoint.safeParse(c.req.json());
  if (!writePoint.success) {
    console.error("Invalid write point", writePoint.error);
    c.status(400);
    return c.text("Invalid write point");
  }

  const { measurement, tags, fields, bucketName, timestamp } = writePoint.data;
  if (!measurement || !tags || !fields || !bucketName) {
    console.error("tags, fields and bucketName are required");
    c.status(400);
    return c.text("tags, fields and bucketName are required");
  }

  const _ = WritePoint({
    measurement,
    tags: tags,
    fields: fields,
    influxDB,
    INFLUX_ORG_ID,
    bucketName,
    timestamp: timestamp,
  });

  c.status(201);
  return c.text("Point written successfully");
});

serve(
  {
    fetch: app.fetch,
    port: 3004,
  },
  (info) => {
    if (!HONO_PASSWORD || !HONO_USERNAME) {
      console.error("Hono username and password are required");
      process.exit(1);
    }
    console.log(`INFLUX_URL: ${INFLUX_URL}`);
    console.log(`INFLUX_TOKEN: ${INFLUX_TOKEN}`);
    console.log(`INFLUX_ORG_ID: ${INFLUX_ORG_ID}`);
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
