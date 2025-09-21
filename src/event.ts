import fs from "fs";
import axios from "axios";
import * as cheerio from "cheerio";
import {
  eventType,
  broadcastedEventsType,
  eventDetailsScraperResponseType,
} from "./types/event";

export function markEventsAsBroadcasted(events: eventType[]) {
  const filePath = "./src/data/broadcastedEvents.json";
  const currentContent = fs.readFileSync(filePath, "utf-8");
  const existingEvents: broadcastedEventsType = JSON.parse(currentContent);

  const updatedBroadcastedEvents: broadcastedEventsType = {
    ...existingEvents,
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
    filePath,
    JSON.stringify(updatedBroadcastedEvents, null, 2),
    "utf-8"
  );
}

export function filterNewEvents(events: eventType[]) {
  const filePath = "./src/data/broadcastedEvents.json";
  const currentContent = fs.readFileSync(filePath, "utf-8");
  const broadcastedEvents: broadcastedEventsType = JSON.parse(currentContent);

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

    const eventPromise = $(".event-card").map(async (idx, element) => {
      const fullLoc = $(element).find(".event-location").find("p");

      const eventUrl = url + $(element).attr("href");
      const eventDetails = await eventDetailsScraper(eventUrl);

      return {
        org: $(element).find(".org-name").text().trim(),
        title: $(element).find(".event-title").text().trim(),
        datetime: $(element).find(".event-date > .event-date").text().trim(),
        location: fullLoc.eq(0).text().trim(),
        address: fullLoc.eq(1).text().trim(),
        url: eventUrl,
        ...eventDetails,
        imgUrl: url + eventDetails.imgUrl,
      };
    });

    const event: eventType[] = await Promise.all(eventPromise.get());

    // NOTE: using the date in <legend> element for filtering, since date in the .event-card
    // element has inconsistent date formatting (e.g. Sept instead of Sep)
    return $(".event-date > fieldset > legend")
      .map((idx, element) => {
        const dayDate = $(element).text().split(",");
        return {
          ...event[idx],
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

async function eventDetailsScraper(
  url: string
): Promise<eventDetailsScraperResponseType> {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const descElement: string[] = $(".event-markup")
      .contents()
      .map((idx, element) => $(element).text().trim())
      .get();

    const filteredDesc = descElement
      .filter((element) => element !== "\n")
      .join("\n");

    const rsvpElement = $(".rsvp-button").first();

    return {
      desc: filteredDesc,
      imgUrl: $(".hero-image").attr("src") || "",
      rsvpMedium: rsvpElement.text().trim(),
      rsvpUrl: rsvpElement.attr("href") || "",
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
}
