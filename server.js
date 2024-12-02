// const express = require("express");
// const axios = require("axios");
// const cors = require("cors");
// const schedule = require("node-schedule");
// require("dotenv").config();

// const app = express();
// const auth = process.env.AUTH;
// const locationsUrl = process.env.LOCATIONS_URL;
// const timesheetUrl = process.env.TIMESHEET_URL;
// const stopUrl = process.env.STOP_URL;
// const startUrl = process.env.START_URL;

// const PORT = 2137;

// app.use(cors());

// let eventId = null;
// let startingDate;

// const getLocations = async () => {
//   try {
//     const response = await axios(
//       locationsUrl,

//       {
//         headers: {
//           referrer: "https://gpmo.ts.fujitsu.com/",
//           authorization: auth,
//         },
//       }
//     );

//     console.log(response.data[0]);
//   } catch (error) {
//     console.error("Error fetching locations:", error);
//   }
// };

// const getTimesheet = async () => {
//   try {
//     const response = await axios.post(
//       timesheetUrl,
//       {},
//       {
//         headers: {
//           referrer: "https://gpmo.ts.fujitsu.com/",
//           authorization: auth,
//         },
//       }
//     );

//     // console.log(response.data[0].events[0]);
//     return response.data[0].events[0];
//   } catch (error) {
//     console.error("Error fetching timesheet:", error);
//   }
// };

// const startWorking = async () => {
//   try {
//     const response = await axios.post(
//       startUrl,
//       {
//         siteId: 401,
//         eventId,
//         unspecificId: null,
//         backupId: null,
//         time: null,
//         isOvertime: false,
//       },
//       {
//         headers: {
//           referrer: "https://gpmo.ts.fujitsu.com/",
//           authorization: auth, // Use your auth token here
//         },
//       }
//     );

//     // handle response
//     console.log(response.data.events);
//     return response;
//   } catch (error) {
//     console.error("Start working error:", error);
//   }
// };

// const stopWorking = async () => {
//   try {
//     const response = await axios.post(
//       stopUrl,
//       { siteId: 401, time: null },
//       {
//         headers: {
//           referrer: "https://gpmo.ts.fujitsu.com/",
//           authorization: auth, // Use your auth token here
//         },
//       }
//     );

//     console.log(response.data);
//     eventId = null;
//     return response;
//   } catch (error) {
//     console.error("Stop working error:", error);
//   }
// };

// //UTILITY

// const getRandomTime = () => {
//   const startMinutes = 8 * 60 + 42; // 8:42 in minutes
//   //   const startMinutes = 10 * 60 + 18; // 8:42 in minutes
//   const endMinutes = 8 * 60 + 55; // 8:55 in minutes
//   //   const endMinutes = 10 * 60 + 23; // 8:55 in minutes
//   const randomMinutes =
//     Math.floor(Math.random() * (endMinutes - startMinutes + 1)) + startMinutes;

//   const hours = Math.floor(randomMinutes / 60);
//   const minutes = randomMinutes % 60;

//   return { hours, minutes };
// };

// const setWorkData = (timesheet) => {
//   if (eventId === null) {
//     eventId = timesheet.id;
//     startingDate = timesheet.start;
//   }
// };

// const runSchedule = async () => {
//   const { hours, minutes } = getRandomTime();

//   const timesheet = await getTimesheet();

//   setWorkData(timesheet); // sets eventId and startingDate

//   if (eventId !== null) {
//     const providedDate = new Date(startingDate);

//     const startLogTime = new Date(
//       providedDate.getFullYear(),
//       providedDate.getMonth(),
//       providedDate.getDate(),
//       hours,
//       minutes
//     );

//     console.log(`Next "start" log scheduled at: ${startLogTime}`);

//     const startJob = schedule.scheduleJob(startLogTime, async () => {
//       console.log("start");

//       //
//       const startWorkingResponse = await startWorking();
//       if (startWorkingResponse) {
//         const locationsResponse = await getLocations();
//         if (locationsResponse) {
//           const approvedStartingDate = new Date(locationsResponse.startingTime);
//           const endLogTime = new Date(
//             approvedStartingDate.getTime() + 8 * 60 * 60 * 1000
//           );

//           console.log(`"end" log scheduled at: ${endLogTime}`);
//           schedule.scheduleJob(endLogTime, () => {
//             stopWorking();
//             console.log("end");
//           });

//           const nextLogDate = new Date(
//             startLogTime.getFullYear(),
//             startLogTime.getMonth(),
//             startLogTime.getDate() + 1
//           );

//           schedule.scheduleJob(nextLogDate, () => {
//             runSchedule();
//           });
//         }
//       }
//     });
//   }
// };

// runSchedule();

// app.listen(PORT, () => {
//   console.log(`Server running at http://localhost:${PORT}`);
// });

const express = require("express");
const axios = require("axios");
const cors = require("cors");
const schedule = require("node-schedule");
require("dotenv").config();
const nodemailer = require("nodemailer");

const app = express();

app.use(cors());
const PORT = 2137;

let eventId = null;
let startingDate;

const auth = process.env.AUTH;
const locationsUrl = process.env.LOCATIONS_URL;
const timesheetUrl = process.env.TIMESHEET_URL;
const stopUrl = process.env.STOP_URL;
const startUrl = process.env.START_URL;

//

// Create a transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

// Send mail function
const sendMail = async (to, subject, text) => {
  try {
    const info = await transporter.sendMail({
      from: '"Fujitsu-Clicker" <your-email@gmail.com>', // Sender address
      to: to, // Receiver's email
      subject: subject, // Subject line
      text: text, // Plain text body
      // You can also add an HTML body: html: "<b>Hello, world!</b>"
    });

    console.log("Email sent: %s", info.messageId);
  } catch (error) {
    console.error("Error sending email: ", error);
  }
};

// Example usage

//
const getLocations = async () => {
  try {
    const response = await axios(
      locationsUrl,

      {
        headers: {
          referrer: "https://gpmo.ts.fujitsu.com/",
          authorization: auth,
        },
      }
    );

    console.log(response.data[0]);
  } catch (error) {
    console.error("Error fetching locations:", error);
  }
};

// returns starting date and eventId
const getTimesheet = async () => {
  try {
    const response = await axios.post(
      timesheetUrl,
      {},
      {
        headers: {
          referrer: "https://gpmo.ts.fujitsu.com/",
          authorization: auth,
        },
      }
    );

    // console.log(response.data[0].events[0]);
    return response.data[0].events[0];
  } catch (error) {
    console.error("Error fetching timesheet:", error);
  }
};

const startWorking = async () => {
  try {
    const response = await axios.post(
      startUrl,
      {
        siteId: 401,
        eventId,
        unspecificId: null,
        backupId: null,
        time: null,
        isOvertime: false,
      },
      {
        headers: {
          referrer: "https://gpmo.ts.fujitsu.com/",
          authorization: auth, // Use your auth token here
        },
      }
    );

    // handle response
    console.log(response.data.events);
    return response;
  } catch (error) {
    console.error("Start working error:", error);
  }
};

const stopWorking = async () => {
  try {
    const response = await axios.post(
      stopUrl,
      { siteId: 401, time: null },
      {
        headers: {
          referrer: "https://gpmo.ts.fujitsu.com/",
          authorization: auth, // Use your auth token here
        },
      }
    );

    console.log(response.data);
    eventId = null;
    return response;
  } catch (error) {
    console.error("Stop working error:", error);
  }
};

//UTILITY

const getRandomTime = () => {
  const startMinutes = 8 * 60 + 42; // 8:42 in minutes

  const endMinutes = 8 * 60 + 55; // 8:55 in minutes

  const randomMinutes =
    Math.floor(Math.random() * (endMinutes - startMinutes + 1)) + startMinutes;

  const hours = Math.floor(randomMinutes / 60);
  const minutes = randomMinutes % 60;

  const seconds = Math.floor(Math.random() * 60);

  return { hours, minutes, seconds };
};

const setWorkData = (timesheet) => {
  if (eventId === null) {
    eventId = timesheet.id;
    startingDate = timesheet.start;
  }
};

const runSchedule = async () => {
  const { hours, minutes, seconds } = getRandomTime();

  const timesheet = await getTimesheet();

  setWorkData(timesheet); // sets eventId and startingDate

  if (eventId !== null) {
    const providedDate = new Date(startingDate);

    const startLogTime = new Date(
      providedDate.getFullYear(),
      providedDate.getMonth(),
      providedDate.getDate(),
      hours,
      minutes,
      seconds
    );

    console.log(`Next "start" log scheduled at: ${startLogTime}`);
    sendMail(
      "viir4d@gmail.com",
      "Test Email",
      `Next "start" log scheduled at: ${startLogTime}`
    );

    const startJob = schedule.scheduleJob(startLogTime, async () => {
      sendMail("viir4d@gmail.com", "Job started", "Job started");
      console.log("start");

      const locationsResponse = await getLocations();
      if (locationsResponse.activeTimesheet) {
        const approvedStartingDate = new Date(
          locationsResponse.activeTimesheet.start
        );
        const endLogTime = new Date(
          approvedStartingDate.getTime() + 8 * 60 * 60 * 1000
        );

        console.log(`"end" log scheduled at: ${endLogTime}`);
        schedule.scheduleJob(endLogTime, () => {
          sendMail("viir4d@gmail.com", "Job ended", "Job ended");
          console.log("end");
          eventId === null;
        });

        const nextLogDate = new Date(
          startLogTime.getFullYear(),
          startLogTime.getMonth(),
          startLogTime.getDate() + 1
        );

        schedule.scheduleJob(nextLogDate, () => {
          runSchedule();
        });
      }
    });
  }
};

runSchedule();

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
