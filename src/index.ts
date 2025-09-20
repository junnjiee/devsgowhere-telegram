import { scrapeAndBroadcast } from "./scrapeAndBroadcast";

interface Env {}
interface ScheduledController {}
interface ExecutionContext {}
export default {
  async scheduled(
    controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext
  ) {
    await scrapeAndBroadcast();
  },
};
