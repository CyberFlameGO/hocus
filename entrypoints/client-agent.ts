/* eslint-disable no-console */
import { Connection, WorkflowClient } from "@temporalio/client";
import { nanoid } from "nanoid";
import { startVM } from "~/agent/workflows";

async function run() {
  const connection = await Connection.connect();
  const client = new WorkflowClient({
    connection,
  });
  const handle = await client.start(startVM, {
    args: ["agent-vm"],
    taskQueue: "hello-world",
    workflowId: "workflow-" + nanoid(),
  });
  console.log(`Started workflow ${handle.workflowId}`);
  console.log(await handle.result()); // Hello, Temporal!
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
