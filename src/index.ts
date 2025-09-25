import { eventsScraper } from "./event";
import { sendTelegramMsg, craftMessage } from "./telegram";

const MODEL = "@cf/google/gemma-3-12b-it";
const SYSTEM_PROMPT =
  "Summarise the text given to you, the text contains details of an event. Remove information such as panelist/speaker profile, organisation information, date/time, venue and any other similar details. Keep the event description only.";

export default {
  async scheduled(
    controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext
  ) {
    try {
      const scrapedEvents = await eventsScraper(env.TARGET_URL);
      const filteredEvents = scrapedEvents.filter(async (event) => {
        const kvTitle = await env.BROADCASTED_EVENTS.get(event.title);
        return kvTitle === null;
      });

      const msgStatus = await Promise.all(
        filteredEvents.map(async (event) => {
          const messages = [
            {
              role: "system",
              content: SYSTEM_PROMPT,
            },
            {
              role: "user",
              content: event.desc,
            },
          ];
          const aiRes = await env.AI.run(MODEL, {
            messages,
          });

          const teleMsgSuccess = await sendTelegramMsg(
            craftMessage({ ...event, desc: aiRes.response })
          );

          if (teleMsgSuccess) {
            await env.BROADCASTED_EVENTS.put(event.title, event.date);
          }
          return teleMsgSuccess;
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
