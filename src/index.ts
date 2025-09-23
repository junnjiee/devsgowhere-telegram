import { eventsScraper } from "./event";
import { sendTelegramMsg, craftMessage } from "./telegram";

export default {
  async scheduled(
    controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext
  ) {
    try {
      const scrapedEvents = await eventsScraper(env.TARGET_URL);
      const filteredEvents = scrapedEvents.filter(
        (event) => env.BROADCASTED_EVENTS.get(event.title) === null
      );

      const msgStatus = await Promise.all(
        filteredEvents.map(async (event) => {
          const success = await sendTelegramMsg(craftMessage(event));
          if (success) {
            await env.BROADCASTED_EVENTS.put(event.title, event.date);
          }
          return success;
        })
      );

      console.log({
        job_completed_on: new Date().toLocaleString("en", {
          timeZone: "Asia/Singapore",
        }),
        messageSent: msgStatus,
      });
    } catch (err) {
      console.error(err);
      throw err;
    }
  },
};
