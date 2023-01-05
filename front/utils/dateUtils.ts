import moment from "moment";

export const formatTimestampToDate = (timestamp: number) => {
    return moment(timestamp).format("YYYY/MM/DD");
  };