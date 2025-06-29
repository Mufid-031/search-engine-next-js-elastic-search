import { Client } from "@elastic/elasticsearch";

export const client = new Client({
  node: "https://76784fddd43d41588f1364faefe440d1.us-central1.gcp.cloud.es.io:443",
  auth: {
    apiKey: "TWM2dnQ1Y0I4bVZvUlVXUWFza286cEJxY3ZoLUFZU3FUVUdCbFpWSjJuQQ==",
  },
});