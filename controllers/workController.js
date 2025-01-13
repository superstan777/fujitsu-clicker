const axios = require("axios");
const { getEventId, setEventId } = require("../utils/eventIdManager");

const getLocations = async () => {
  try {
    const response = await axios(process.env.LOCATIONS_URL, {
      headers: {
        referrer: "https://gpmo.ts.fujitsu.com/",
        authorization: process.env.AUTH,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching locations:", error);
  }
};

const getTimesheet = async () => {
  try {
    const response = await axios.post(
      process.env.TIMESHEET_URL,
      {},
      {
        headers: {
          referrer: "https://gpmo.ts.fujitsu.com/",
          authorization: process.env.AUTH,
        },
      }
    );
    console.log(response.data[0].events[0]);

    return response.data[0].events[0];
  } catch (error) {
    console.error("Error fetching timesheet:", error);
  }
};

const startWorking = async () => {
  try {
    const response = await axios.post(
      process.env.START_URL,
      {
        siteId: 401,
        eventId: getEventId(),
        unspecificId: null,
        backupId: null,
        time: null,
        isOvertime: false,
      },
      {
        headers: {
          referrer: "https://gpmo.ts.fujitsu.com/",
          authorization: process.env.AUTH,
        },
      }
    );

    return response.status;
  } catch (error) {
    console.error("Start working error:", error);
  }
};

const stopWorking = async () => {
  try {
    const response = await axios.post(
      process.env.STOP_URL,
      { siteId: 401, time: null },
      {
        headers: {
          referrer: "https://gpmo.ts.fujitsu.com/",
          authorization: process.env.AUTH,
        },
      }
    );

    setEventId(null);

    return response.status;
  } catch (error) {
    console.error("Stop working error:", error);
  }
};

const isDayOff = async () => {
  const today = new Date();
  const todayISOString = today.toISOString();

  try {
    const response = await axios.post(
      process.env.PLANNING_URL,
      {
        from: todayISOString,
        to: todayISOString,
      },
      {
        headers: {
          referrer: "https://gpmo.ts.fujitsu.com/",
          authorization: process.env.AUTH,
        },
      }
    );
    console.log(response.data.timeoff.length > 0);
    return response.data.timeoff.length > 0;
  } catch (error) {
    console.error("Stop working error:", error);
  }
};

module.exports = {
  getLocations,
  getTimesheet,
  startWorking,
  stopWorking,
  isDayOff,
};
