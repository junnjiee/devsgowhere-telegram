import axios, { isAxiosError } from "axios";
import { eventsScraper } from "./scraper";
import { filterEvents, craftWeeklyEventsDigestMsg } from "./events";

export async function scrapeAndBroadcast() {
  const message = await scrapeAndCreateMsg();
  const teleMsgSuccess = await sendTelegramMsg(message);
  console.log({
    job_completed_on: new Date().toLocaleString("en", {
      timeZone: "Asia/Singapore",
    }),
    success: teleMsgSuccess,
  });
}

async function scrapeAndCreateMsg() {
  try {
    const events = await eventsScraper(process.env.TARGET_URL!);
    const filteredEvents = filterEvents(events);
    const message = craftWeeklyEventsDigestMsg(filteredEvents);

    return message;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function sendTelegramMsg(message: string) {
  const url = `${process.env.TELEGRAM_API_URL}/bot${process.env.BOT_TOKEN}/sendMessage`;
  const payload = {
    chat_id: process.env.CHANNEL_NAME,
    text: message,
    parse_mode: "HTML",
    link_preview_options: {
      is_disabled: true,
    },
  };

  try {
    const { data } = await axios.post(url, payload, {
      // NOTE: IPv6 does not work, but IPv4 does
      family: 4,
    });

    return true;
  } catch (error) {
    if (isAxiosError(error)) {
      console.error(error.message);
      console.error(error.cause);
      console.error(error.response?.data);
    } else {
      console.error(error);
    }
    return false;
  }
}
