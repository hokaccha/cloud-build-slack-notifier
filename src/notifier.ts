import { format } from "util";
import type { IncomingWebhookSendArguments } from "@slack/webhook";
import { IncomingWebhook } from "@slack/webhook";
import type { EventData } from "./types";

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

function createMessage(data: EventData): IncomingWebhookSendArguments {
  const emoji = statusEmoji(data.status);
  const triggerName = data.substitutions.TRIGGER_NAME;
  const text = format("%s %s *%s*\n<%s|*View Log*>", emoji, triggerName, data.status, data.logUrl);

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

function notifiable(data: EventData): boolean {
  if (["INTERNAL_ERROR", "TIMEOUT"].includes(data.status)) {
    return true;
  }

  const triggerName = data.substitutions.TRIGGER_NAME;
  const successTargets = process.env.SUCCESS_NOTIFY_TRIGGER?.split(",") || [];
  const failureTargets = process.env.FAILURE_NOTIFY_TRIGGER?.split(",") || [];

  if (data.status === "SUCCESS" && successTargets.includes(triggerName)) {
    return true;
  }

  if (data.status === "FAILURE" && failureTargets.includes(triggerName)) {
    return true;
  }

  return false;
}

export async function notify(data: EventData): Promise<void> {
  if (notifiable(data) === false) {
    return;
  }

  console.info(`Status: ${data.status}`);

  const url = process.env.SLACK_WEBHOOK_URL;
  if (url === undefined) {
    throw new Error("SLACK_WEBHOOK_URL is required.");
  }

  const message = createMessage(data);
  const webhook = new IncomingWebhook(url);
  await webhook.send(message);

  console.info(`Sent message: ${JSON.stringify(message)}`);
}
