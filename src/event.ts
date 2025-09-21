import fs from "fs";
import axios from "axios";
import * as cheerio from "cheerio";
import { parse, isWithinInterval, add } from "date-fns";
import { capitalizeFirstLetter } from "./utils";
import { eventType, rsvpDetailsType } from "./types/event";
import broadcastedEventsJson from "./data/broadcastedEvents.json";

type broadcastedEventsType = Record<string, Record<string, string>>;
const broadcastedEvents: broadcastedEventsType = broadcastedEventsJson;

export function craftWeeklyEventsDigestMsg(events: eventType[]) {
  const eventsList = events
    .map((event: eventType, idx: number) => {
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

export function markEventsAsBroadcasted(events: eventType[]) {
  const updatedBroadcastedEvents = { ...broadcastedEvents };

  // NOTE: this fn mutates updatedBroadcastedEvents in-place
  events.forEach((event) => {
    if (!updatedBroadcastedEvents[event.date]) {
      updatedBroadcastedEvents[event.date] = {};
    }
    // NOTE: used non-null assertion
    updatedBroadcastedEvents[event.date]![event.title] = "";
  });

  fs.writeFileSync(
    "./src/data/broadcastedEvents.json",
    JSON.stringify(updatedBroadcastedEvents, null, 2),
    "utf-8"
  );
}

export function filterNewEvents(events: eventType[]) {
  return events.filter((event) => {
    const broadcastedEventsByDate = broadcastedEvents[event.date];

    return (
      !broadcastedEventsByDate || !(event.title in broadcastedEventsByDate)
    );
  });
}

export function filterEventsByDate(events: eventType[]) {
  const dateNow = new Date();
  return events.filter((event: eventType) => {
    const parsedDate = parse(event.date, "dd MMMM yyyy", dateNow);

    return isWithinInterval(parsedDate, {
      start: dateNow,
      end: add(dateNow, { days: 14 }),
    });
  });
}

export async function eventsScraper(url: string): Promise<eventType[]> {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const eventDetailsPromise = $(".event-card").map(
      async (idx: number, element: cheerio.Element) => {
        const fullLoc = $(element).find(".event-location").find("p");

        const eventUrl = url + $(element).attr("href");
        const rsvpDetails = await rsvpLinkScraper(eventUrl);

        return {
          org: $(element).find(".org-name").text().trim(),
          title: $(element).find(".event-title").text().trim(),
          datetime: $(element).find(".event-date > .event-date").text().trim(),
          location: fullLoc.eq(0).text().trim(),
          address: fullLoc.eq(1).text().trim(),
          url: eventUrl,
          rsvpMedium: rsvpDetails.medium,
          rsvpUrl: rsvpDetails.url,
        };
      }
    );

    const eventDetails: eventType[] = await Promise.all(
      eventDetailsPromise.get()
    );

    // using the date in <legend> element for filtering, since date in the .event-card
    // element has inconsistent date formatting (e.g. Sept instead of Sep)
    return $(".event-date > fieldset > legend")
      .map((idx: number, element: cheerio.Element) => {
        const dayDate = $(element).text().split(",");
        return {
          ...eventDetails[idx],
          day: dayDate[0]?.trim(),
          date: dayDate[1]?.trim(),
        };
      })
      .get();
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function rsvpLinkScraper(url: string): Promise<rsvpDetailsType> {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const element = $(".rsvp-button").first();

    return { medium: element.text().trim(), url: element.attr("href") || "" };
  } catch (error) {
    console.error(error);
    throw error;
  }
}
