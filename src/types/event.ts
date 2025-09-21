export type eventType = {
  org: string;
  title: string;
  datetime: string;
  location: string;
  address: string;
  url: string;
  desc: string;
  rsvpMedium: string;
  rsvpUrl: string;
  day: string;
  date: string;
};

export type broadcastedEventsType = Record<string, Record<string, string>>;
