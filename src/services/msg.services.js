import axios from "axios";

export const sendSMS = async (mobile, variables = {}) => {
  const flowId = process.env.MSG91_FLOW_ID;
  const authKey = process.env.MSG91_AUTH_KEY;

  if (!flowId || !authKey || !mobile) {
    console.warn("SMS skipped: MSG91_FLOW_ID, MSG91_AUTH_KEY, or mobile is missing");
    return false;
  }

  const normalizedMobile = String(mobile).replace(/\D/g, "").replace(/^91/, "");

  const response = await axios.post(
    "https://control.msg91.com/api/v5/flow",
    {
      flow_id: flowId,
      mobiles: `91${normalizedMobile}`,
      ...variables,
    },
    {
      headers: {
        authkey: authKey,
        "Content-Type": "application/json",
        accept: "application/json",
      },
    }
  );

  return response.data;
};