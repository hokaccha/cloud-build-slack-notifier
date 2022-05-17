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
  --set-env-vars="SLACK_WEBHOOK_URL=${SLACK_WEBHOOK_URL}" \
  --set-env-vars="^:^SUCCESS_NOTIFY_TRIGGER=${SUCCESS_NOTIFY_TRIGGER}" \
  --set-env-vars="^:^FAILURE_NOTIFY_TRIGGER=${FAILURE_NOTIFY_TRIGGER}" \
  --set-env-vars="SLACK_CHANNEL=${SLACK_CHANNEL}" \
  --set-env-vars="SLACK_USERNAME=${SLACK_USERNAME}" \
  --set-env-vars="SLACK_ICON_EMOJI=${SLACK_ICON_EMOJI}"
