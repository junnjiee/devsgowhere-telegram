import {
  eventsScraper,
  filterNewEvents,
  markEventsAsBroadcasted,
} from "./event";
import { sendTelegramMsg } from "./telegram";

interface Env {}
interface ScheduledController {}
interface ExecutionContext {}
export default {
  async scheduled(
    controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext
  ) {
    await main();
  },
};

// TODO: remove export
export async function main() {
  const scrapedEvents = await eventsScraper(process.env.TARGET_URL!);
  const filteredEvents = filterNewEvents(scrapedEvents);

  const msgStatus = await Promise.all(
    filteredEvents.map(async (event) => {
      return await sendTelegramMsg(event.title);
    })
  );
  markEventsAsBroadcasted(filteredEvents);

  console.log({
    job_completed_on: new Date().toLocaleString("en", {
      timeZone: "Asia/Singapore",
    }),
    messageSent: msgStatus,
  });
}
