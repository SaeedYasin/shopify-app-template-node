import mixpanel_import from "mixpanel";

const mixpanel = mixpanel_import.init(`${process.env.MP_TOKEN}` || "", {
  debug: process.env.NODE_ENV === "development",
});

export default mixpanel;
