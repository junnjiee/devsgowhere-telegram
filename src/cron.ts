import cron from "node-cron";
import { main } from "./main";

// TODO: change cron timing
const task = cron.schedule("* * * * * *", async () => {
  main();
  task.stop();
  task.destroy();
});
task.start();
