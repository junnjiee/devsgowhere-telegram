import axios, { isAxiosError } from "axios";
import { capitalizeFirstLetter } from "./utils";
import { eventType } from "./types/event";

export async function sendTelegramMsg(message: string) {
  const url = `${process.env.TELEGRAM_API_URL}/bot${process.env.BOT_TOKEN}/sendMessage`;
  const payload = {
    chat_id: process.env.CHANNEL_NAME,
    text: message,
    parse_mode: "HTML",
    link_preview_options: {
      // is_disabled: true,
      show_above_text: true,
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

export function craftMessage(event: eventType) {
  return `<b>${event.title}</b>\n
<u><b>🚀 Event Details</b></u>
🏠 Host: ${event.org}
🗓️ Date: ${event.datetime}
📍 Venue: ${event.location}, ${capitalizeFirstLetter(event.address)}
🔍 <b><a href="${event.url}">More Details</a></b>
🎫 <b><a href="${event.rsvpUrl}">${event.rsvpMedium}</a></b>\n
<u><b>🚀 Event Description (Summarised)</b></u>
${event.desc}
`;
}
