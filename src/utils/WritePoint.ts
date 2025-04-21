import { type InfluxDB, Point } from "@influxdata/influxdb-client";
import type { ZWritePoint } from "../types/WritePoint.js";

type WritePointProps = {
  influxDB: InfluxDB;
  INFLUX_ORG_ID: string;
} & ZWritePoint;

export default function WritePoint({ measurement, tags, fields, influxDB, INFLUX_ORG_ID, bucketName, timestamp }: WritePointProps) {
  const point = new Point(measurement);
  for (const [key, value] of Object.entries(tags)) {
    point.tag(key, value);
  }
  for (const [key, value] of Object.entries(fields)) {
    if (typeof value === "number") {
      point.floatField(key, value);
    } else if (typeof value === "string") {
      point.stringField(key, value);
    } else if (typeof value === "boolean") {
      point.booleanField(key, value);
    }
  }
  point.timestamp(timestamp || Date.now());
  const writeApi = influxDB.getWriteApi(INFLUX_ORG_ID, bucketName);
  writeApi.writePoint(point);

  writeApi.close();
}
