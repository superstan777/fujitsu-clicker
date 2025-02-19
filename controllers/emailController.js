const { sendMail } = require("../utils/mailer");

const sendJobStartEmail = async (startingDate) => {
  await sendMail("Job Started", `Job started at: ${startingDate}`);
};

const sendJobEndEmail = async (endingDate) => {
  await sendMail("Job Ended", `Job ended at: ${endingDate}`);
};

const sendNewTimesheetNotification = async (nextTimesheetDate) => {
  await sendMail(
    "New Timesheet",
    `New timesheet will be fetched at: ${nextTimesheetDate}`
  );
};

const sendNextStartLogNotification = async (nextStartingDate) => {
  await sendMail("Next start", `Start log scheduled at: ${nextStartingDate}`);
};

const sendNextEndLogNotification = async (nextEndingDate) => {
  await sendMail("Next end", `End log scheduled at: ${nextEndingDate}`);
};

const sendErrorNotification = async () => {
  await sendMail(
    `Error fetching active timesheet, manual activity is needed`,
    `Error fetching active timesheet, manual activity is needed`
  );
};

module.exports = {
  sendJobStartEmail,
  sendJobEndEmail,
  sendNewTimesheetNotification,
  sendNextStartLogNotification,
  sendNextEndLogNotification,
  sendErrorNotification,
};
