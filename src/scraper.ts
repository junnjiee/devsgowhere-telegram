import axios from "axios";
import * as cheerio from "cheerio";
import { event, rsvpDetails } from "./types/event";

export async function eventsScraper(url: string) {
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

    const eventDetails: event[] = await Promise.all(eventDetailsPromise.get());

    // using the date in legend element for filtering, since date in the event-card
    // element has inconsistent date formatting (Sept instead of Sep)
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

export async function rsvpLinkScraper(url: string): Promise<rsvpDetails> {
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
