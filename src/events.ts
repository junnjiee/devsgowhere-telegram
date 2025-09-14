import { parse, isWithinInterval, add } from "date-fns";
import { capitalizeFirstLetter } from "./utils";
import { event } from "./types/event";

export function craftWeeklyEventsDigestMsg(events: event[]) {
  const eventsList = events
    .map((event: event, idx: number) => {
      return `<u><b>${idx + 1}) ${event.title}</b></u>\n
🏠 Host: ${event.org}
🗓️ Date: ${event.day}, ${event.datetime}
📍 Venue: ${event.location}, ${capitalizeFirstLetter(event.address)}
🔍 More details <a href="${event.url}">here</a>
🎫 <a href="${event.rsvpUrl}">${event.rsvpMedium}</a>\n\n`;
    })
    .join("");

  const header = `🚀🚀 <b><a href="https://devsgowhere.pages.dev">DevsGoWhere</a>: Upcoming events for the next two weeks!</b> 🚀🚀`;
  return [header, eventsList].join("\n\n\n");
}

export function filterEvents(events: event[]) {
  const dateNow = new Date();
  return events.filter((event: event) => {
    const parsedDate = parse(event.date, "dd MMMM yyyy", dateNow);

    return isWithinInterval(parsedDate, {
      start: dateNow,
      end: add(dateNow, { days: 14 }),
    });
  });
}
