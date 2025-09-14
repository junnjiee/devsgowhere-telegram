import cron from "node-cron";
import { scrapeAndBroadcast } from "./scrapeAndBroadcast";

// TODO: change cron timing
const task = cron.schedule("* * * * * *", async () => {
  scrapeAndBroadcast();
  task.stop();
  task.destroy();
});
task.start();
