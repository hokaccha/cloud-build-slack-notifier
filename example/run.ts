import { notify } from "../src/notifier";

// eslint-disable-next-line
const successPayload = require("./success.json");

(async () => {
  await notify(successPayload);
})();
