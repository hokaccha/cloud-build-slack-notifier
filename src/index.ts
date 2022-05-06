import sourceMapSupport from "source-map-support";
import { notify } from "./notifier";
import type { PubSubEvent, EventData } from "./types";

sourceMapSupport.install();

function parseEventData(eventData: string): EventData {
  return JSON.parse(Buffer.from(eventData, "base64").toString());
}

export const main = async (event: PubSubEvent) => {
  const data = parseEventData(event.data);
  await notify(data);
};
