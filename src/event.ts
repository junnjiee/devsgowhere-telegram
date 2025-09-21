import fs from "fs";
import axios from "axios";
import * as cheerio from "cheerio";
import { eventType, broadcastedEventsType } from "./types/event";
import broadcastedEventsJson from "./data/broadcastedEvents.json";

export function markEventsAsBroadcasted(events: eventType[]) {
  const updatedBroadcastedEvents: broadcastedEventsType = {
    ...broadcastedEventsJson,
  };

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
  const broadcastedEvents: broadcastedEventsType = broadcastedEventsJson;

  return events.filter((event) => {
    const broadcastedEventsByDate = broadcastedEvents[event.date];

    return (
      !broadcastedEventsByDate || !(event.title in broadcastedEventsByDate)
    );
  });
}

export async function eventsScraper(url: string): Promise<eventType[]> {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const eventDetailsPromise = $(".event-card").map(async (idx, element) => {
      const fullLoc = $(element).find(".event-location").find("p");

      const eventUrl = url + $(element).attr("href");
      const rsvpDetails = await eventPageDetailsScraper(eventUrl);

      return {
        org: $(element).find(".org-name").text().trim(),
        title: $(element).find(".event-title").text().trim(),
        datetime: $(element).find(".event-date > .event-date").text().trim(),
        location: fullLoc.eq(0).text().trim(),
        address: fullLoc.eq(1).text().trim(),
        url: eventUrl,
        desc: rsvpDetails.desc,
        rsvpMedium: rsvpDetails.medium,
        rsvpUrl: rsvpDetails.url,
      };
    });

    const eventDetails: eventType[] = await Promise.all(
      eventDetailsPromise.get()
    );

    // using the date in <legend> element for filtering, since date in the .event-card
    // element has inconsistent date formatting (e.g. Sept instead of Sep)
    return $(".event-date > fieldset > legend")
      .map((idx, element) => {
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

async function eventPageDetailsScraper(
  url: string
): Promise<Record<string, string>> {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const descElement: string[] = $(".event-markup")
      .contents()
      .map((idx, element) => $(element).text().trim())
      .get();
    console.log(descElement);

    const filteredDesc = descElement
      .filter((element) => element !== "\n")
      .join("\n");

    const rsvpElement = $(".rsvp-button").first();

    return {
      desc: filteredDesc,
      medium: rsvpElement.text().trim(),
      url: rsvpElement.attr("href") || "",
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
}
