import { format } from "util";
import type { IncomingWebhookSendArguments } from "@slack/webhook";
import { IncomingWebhook } from "@slack/webhook";
import type { EventData } from "./types";

const NOTIFIABLE_STATUS = ["SUCCESS", "FAILURE", "INTERNAL_ERROR", "TIMEOUT"];

function statusEmoji(status: string): string {
  switch (status) {
    case "SUCCESS":
      return ":white_check_mark:";
    case "FAILURE":
      return ":heavy_exclamation_mark:";
    case "INTERNAL_ERROR":
      return ":bangbang:";
    case "TIMEOUT":
      return ":alarm_clock:";
    default:
      return ":question:";
  }
}

function createMessage(data: EventData, messageText: string): IncomingWebhookSendArguments {
  const emoji = statusEmoji(data.status);
  const text = format("%s %s *%s*\n<%s|*View Log*>", emoji, messageText, data.status, data.logUrl);

  const message: IncomingWebhookSendArguments = {
    text,
  };

  if (process.env.SLACK_USERNAME) {
    message.username = process.env.SLACK_USERNAME;
  }

  if (process.env.SLACK_ICON_EMOJI) {
    message.icon_emoji = process.env.SLACK_ICON_EMOJI;
  }

  if (process.env.SLACK_CHANNEL) {
    message.channel = process.env.SLACK_CHANNEL;
  }

  return message;
}

export async function notify(data: EventData): Promise<void> {
  if (NOTIFIABLE_STATUS.includes(data.status) === false) {
    return;
  }

  console.info(`Status: ${data.status}`);

  const url = process.env.SLACK_WEBHOOK_URL;
  if (url === undefined) {
    throw new Error("SLACK_WEBHOOK_URL is required.");
  }

  const messageText = process.env.NOTIFY_MESSAGE_TEXT || "";

  const message = createMessage(data, messageText);
  const webhook = new IncomingWebhook(url);
  await webhook.send(message);

  console.info(`Sent message: ${JSON.stringify(message)}`);
}
