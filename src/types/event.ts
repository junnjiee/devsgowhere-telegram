export type eventType = {
  org: string;
  title: string;
  datetime: string;
  location: string;
  address: string;
  url: string;
  desc: string;
  imgUrl: string;
  rsvpMedium: string;
  rsvpUrl: string;
  day: string;
  date: string;
};

export type eventDetailsScraperResponseType = {
  desc: string;
  imgUrl: string;
  rsvpMedium: string;
  rsvpUrl: string;
};
