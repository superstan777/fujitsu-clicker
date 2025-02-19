const axios = require("axios");
const { getEventId, setEventId } = require("../utils/eventIdManager");

const authenticate = async () => {
  try {
    const response = await axios.post(
      process.env.AUTH_URL,
      {
        username: process.env.FUJITSU_USER,
        password: process.env.FUJITSU_PASSWORD,
        mfaToken: "",
        trustBrowserForMfa: false,
      },
      {
        headers: {
          referrer: "https://gpmo.ts.fujitsu.com/",
        },
      }
    );

    const authToken = `Bearer ${response.data.token}`;

    return authToken;
  } catch (error) {
    console.error("Authentication error:", error);
  }
};

const getLocations = async (authToken) => {
  try {
    const response = await axios(process.env.LOCATIONS_URL, {
      headers: {
        referrer: "https://gpmo.ts.fujitsu.com/",
        authorization: authToken,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching locations:", error);
  }
};

const getTimesheet = async (authToken) => {
  try {
    const response = await axios.post(
      process.env.TIMESHEET_URL,
      {},
      {
        headers: {
          referrer: "https://gpmo.ts.fujitsu.com/",
          authorization: authToken,
        },
      }
    );
    console.log(response.data[0].events[0]);

    return response.data[0].events[0];
  } catch (error) {
    console.error("Error fetching timesheet:", error);
  }
};

const startWorking = async (authToken) => {
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
          authorization: authToken,
        },
      }
    );

    return response.status;
  } catch (error) {
    console.error("Start working error:", error);
  }
};

const stopWorking = async (authToken) => {
  try {
    const response = await axios.post(
      process.env.STOP_URL,
      { siteId: 401, time: null },
      {
        headers: {
          referrer: "https://gpmo.ts.fujitsu.com/",
          authorization: authToken,
        },
      }
    );

    setEventId(null);

    return response.status;
  } catch (error) {
    console.error("Stop working error:", error);
  }
};

const isDayOff = async (authToken) => {
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
          authorization: authToken,
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
  authenticate,
  getLocations,
  getTimesheet,
  startWorking,
  stopWorking,
  isDayOff,
};
