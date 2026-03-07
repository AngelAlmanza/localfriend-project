import moment from "moment-timezone";

// type FormatDateConfig = {
//   timezone?: string;
//   format?: string;
// };

// const defaultConfig: FormatDateConfig = {
//   timezone: moment.tz.guess(),
//   format: "DD/MM/YYYY HH:mm",
// };

export const formatDate = (
  dateStr: string,
  // config: FormatDateConfig,
  timezone: string = moment.tz.guess(),
  format: string = "DD/MM/YYYY HH:mm",
) => moment.tz(dateStr, timezone).format(format);
