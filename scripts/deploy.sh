#!/bin/bash

set -ex

if [[ -z "${FUNCTION_NAME}" ]]; then
  echo "FUNCTION_NAME is required"
  exit 1
fi

if [[ -z "${GCP_PROJECT}" ]]; then
  echo "GCP_PROJECT is required"
  exit 1
fi

if [[ -z "${GCP_REGION}" ]]; then
  echo "GCP_REGION is required"
  exit 1
fi

if [[ -z "${SLACK_WEBHOOK_URL}" ]]; then
  echo "SLACK_WEBHOOK_URL is required"
  exit 1
fi

npm run lint
npm run build

gcloud functions deploy \
  ${FUNCTION_NAME} \
  --project=${GCP_PROJECT} \
  --source=./dist \
  --region=${GCP_REGION} \
  --entry-point=main \
  --trigger-topic cloud-builds \
  --runtime=nodejs16 \
  --set-env-vars "SLACK_WEBHOOK_URL=${SLACK_WEBHOOK_URL},NOTIFY_MESSAGE_TEXT=${NOTIFY_MESSAGE_TEXT},SLACK_CHANNEL=${SLACK_CHANNEL},SLACK_USERNAME=${SLACK_USERNAME},SLACK_ICON_EMOJI=${SLACK_ICON_EMOJI}"
