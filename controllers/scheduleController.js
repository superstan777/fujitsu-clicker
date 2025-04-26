const schedule = require("node-schedule");
const {
  authenticate,
  getTimesheet,
  getLocations,
  startWorking,
  stopWorking,
  isDayOff,
} = require("../controllers/workController");

const {
  getRandomTimeOffset,
  getRandomTime,
} = require("../utils/timeFunctions");
const {
  sendJobStartEmail,
  sendJobEndEmail,
  sendNewTimesheetNotification,
  sendNextStartLogNotification,
  sendNextEndLogNotification,
  sendErrorNotification,
} = require("./emailController");

const { getEventId, setEventId } = require("../utils/eventIdManager");

const runSchedule = async () => {
  const authToken = await authenticate();

  const locationsResponse = await getLocations(authToken);

  // if active -> end, next, re-run

  if (locationsResponse.activeTimesheet) {
    console.log(" if active end, next, return");
    const approvedStartingDate = new Date(
      locationsResponse.activeTimesheet.start.concat("Z")
    );

    const endLogTime = new Date(
      approvedStartingDate.getTime() + getRandomTimeOffset()
    );

    console.log(`"end" log scheduled at: ${endLogTime}`);

    schedule.scheduleJob(endLogTime, async () => {
      const endResponse = await stopWorking(authToken);

      if (endResponse === 200) {
        sendJobEndEmail(endLogTime);
      } else {
        sendErrorNotification(); // change to endJobError
      }

      console.log(`Job ended at: ${endLogTime}`);
      setEventId(null);

      const nextLogDate = new Date(
        approvedStartingDate.getFullYear(),
        approvedStartingDate.getMonth(),
        approvedStartingDate.getDate() + 1
      );

      sendNewTimesheetNotification(nextLogDate);

      schedule.scheduleJob(nextLogDate, () => {
        runSchedule();
      });
    });

    return;
  }

  const timesheet = await getTimesheet(authToken);
  const now = new Date();
  const jobStartDate = new Date(timesheet.latestStart);
  const dayOff = await isDayOff(authToken);

  // if not active and time > latest start or day is off based on planning -> next, re-run

  if (dayOff || now.getTime() > jobStartDate.getTime()) {
    const nextTimesheetDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1
    );

    console.log(`Next timesheet will be fetched at ${nextTimesheetDate}`);

    schedule.scheduleJob(nextTimesheetDate, () => {
      runSchedule();
    });
  }

  // if not active and time < latest start -> start, end, next, re-run
  else {
    const { hours, minutes, seconds } = getRandomTime();

    setEventId(timesheet.id);

    if (getEventId() !== null) {
      const providedDate = new Date(jobStartDate);

      const startLogTime = new Date(
        providedDate.getFullYear(),
        providedDate.getMonth(),
        providedDate.getDate(),
        hours,
        minutes,
        seconds
      );

      console.log(`Start scheduled at: ${startLogTime}`);

      sendNextStartLogNotification(startLogTime);

      schedule.scheduleJob(startLogTime, async () => {
        const startResponse = await startWorking(authToken);

        if (startResponse === 200) {
          sendJobStartEmail(startLogTime);
        } else {
          sendErrorNotification(); // change to startJobError
        }

        console.log(`Job start requested at: ${startLogTime}`);

        const locationsResponse = await getLocations(authToken);

        if (locationsResponse.activeTimesheet) {
          const approvedStartingDate = new Date(
            locationsResponse.activeTimesheet.start.concat("Z")
          );

          const endLogTime = new Date(
            approvedStartingDate.getTime() + getRandomTimeOffset()
          );

          console.log(`End log scheduled at: ${endLogTime}`);

          sendNextEndLogNotification(endLogTime); // wysyla

          schedule.scheduleJob(endLogTime, async () => {
            const endResponse = await stopWorking(authToken);

            if (endResponse === 200) {
              sendJobEndEmail(endLogTime);
            } else {
              sendErrorNotification(); // change to endJobError
            }

            console.log(`Job ended at: ${endLogTime}`);
            setEventId(null);

            const nextLogDate = new Date(
              startLogTime.getFullYear(),
              startLogTime.getMonth(),
              startLogTime.getDate() + 1
            );

            sendNewTimesheetNotification(nextLogDate);

            schedule.scheduleJob(nextLogDate, () => {
              runSchedule();
            });
          });
        } else {
          console.log(`Error fetching active timesheet`);

          sendErrorNotification();
        }
      });
    }
  }
};

module.exports = { runSchedule };
