type CreateBucketProps = {
  INFLUX_URL: string;
  INFLUX_TOKEN: string;
  INFLUX_ORG_ID: string;
  bucketName: string;
};

export default async function CreateBucket({ INFLUX_URL, INFLUX_TOKEN, INFLUX_ORG_ID, bucketName }: CreateBucketProps) {
  const res = await fetch(`${INFLUX_URL}/api/v2/buckets`, {
    method: "POST",
    headers: {
      Authorization: `Authorization: Token ${INFLUX_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      orgID: `'"${INFLUX_ORG_ID}"'`,
      name: bucketName,
      retentionRules: [
        {
          type: "expire",
          everySeconds: 0,
        },
      ],
    }),
  });

  if (!res.ok) {
    throw new Error(`Failed to create bucket: ${res.statusText}`);
  }
}
