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
const sendMail = async (subject, text) => {
  try {
    const info = await transporter.sendMail({
      from: '"Fujitsu-Clicker" <your-email@gmail.com>', // Sender address
      to: "viir4d@gmail.com", // Receiver's email
      subject: subject, // Subject line
      text: text, // Plain text body
      // You can also add an HTML body: html: "<b>Hello, world!</b>"
    });

    console.log("Email sent: %s", info.messageId);
  } catch (error) {
    console.error("Error sending email: ", error);
  }
};

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

    return response.data;
  } catch (error) {
    console.error("Error fetching locations:", error);
  }
};

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

const getRandomTimeOffset = () => {
  const eightHours = 8 * 60 * 60 * 1000;

  const randomMinutes = Math.floor(Math.random() * 3 + 1) * 60 * 1000;

  const randomSeconds = Math.floor(Math.random() * 60) * 1000;

  const randomMilliseconds = Math.floor(Math.random() * 1000);

  const totalOffset =
    eightHours + randomMinutes + randomSeconds + randomMilliseconds;

  return totalOffset;
};

const setWorkData = (timesheet) => {
  if (eventId === null) {
    eventId = timesheet.id;
    startingDate = timesheet.start;
  }
};

const runSchedule = async () => {
  const locationsResponse = await getLocations();

  if (locationsResponse.activeTimesheet) {
    const approvedStartingDate = new Date(
      locationsResponse.activeTimesheet.start.concat("Z")
    );

    const endLogTime = new Date(
      approvedStartingDate.getTime() + getRandomTimeOffset()
    );

    console.log(`"end" log scheduled at: ${endLogTime}`);

    schedule.scheduleJob(endLogTime, () => {
      sendMail(
        `Job ended at: ${startLogTime}`,
        `Job ended at: ${startLogTime}`
      );

      console.log(`Job ended at: ${startLogTime}`);
      eventId === null;
    });

    const nextLogDate = new Date(
      approvedStartingDate.getFullYear(),
      approvedStartingDate.getMonth(),
      approvedStartingDate.getDate() + 1
    );

    schedule.scheduleJob(nextLogDate, () => {
      runSchedule();
    });

    // locationsResponse.activeTimesheet
    return;
  }

  const timesheet = await getTimesheet();
  const now = new Date();
  const timesheetDate = new Date(timesheet.start);

  if (now.getTime() > timesheetDate.getTime()) {
    const nextLogDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1
    );

    sendMail(
      `New timesheet will be fetched at: ${nextLogDate}`,
      `New timesheet will be fetched at: ${nextLogDate}`
    );
    // send mails at 01:00 instead of 00:00

    schedule.scheduleJob(nextLogDate, () => {
      runSchedule();
    });
  } else {
    const { hours, minutes, seconds } = getRandomTime();

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

      console.log(`Start scheduled at: ${startLogTime}`);

      sendMail(
        `Start log scheduled at: ${startLogTime}`,
        `Start log scheduled at: ${startLogTime}`
      );

      //send mails 1 hour later

      const startJob = schedule.scheduleJob(startLogTime, async () => {
        sendMail(
          `Job started at: ${startLogTime}`,
          `Job started at: ${startLogTime}`
        );

        console.log(`Job started at: ${startLogTime}`);

        const locationsResponse = await getLocations();

        if (locationsResponse.activeTimesheet) {
          const approvedStartingDate = new Date(
            locationsResponse.activeTimesheet.start.concat("Z")
          );
          const endLogTime = new Date(
            approvedStartingDate.getTime() + getRandomTimeOffset()
          );

          console.log(`End log scheduled at: ${endLogTime}`);

          schedule.scheduleJob(endLogTime, () => {
            sendMail(
              `Job ended at: ${endLogTime}`,
              `Job ended at: ${endLogTime}`
            );

            console.log(`Job ended at: ${endLogTime}`);
            eventId === null;
          });

          const nextLogDate = new Date(
            startLogTime.getFullYear(),
            startLogTime.getMonth(),
            startLogTime.getDate() + 1
          );

          sendMail(
            `New timesheet will be fetched at: ${startLogTime}`,
            `New timesheet will be fetched at: ${startLogTime}`
          );

          schedule.scheduleJob(nextLogDate, () => {
            runSchedule();
          });
        }
      });
    }
  }
};

runSchedule();

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
