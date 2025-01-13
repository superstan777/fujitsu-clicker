const { sendMail } = require("../utils/mailer");

const sendJobStartEmail = async (startTime) => {
  await sendMail("Job Started", `Job started at: ${startTime}`);
};

const sendJobEndEmail = async (endTime) => {
  await sendMail("Job Ended", `Job ended at: ${endTime}`);
};

const sendNewTimesheetNotification = async (nextLogDate) => {
  await sendMail(
    `New timesheet will be fetched at: ${nextLogDate}`,
    `New timesheet will be fetched at: ${nextLogDate}`
  );
};

const sendNextStartLogNotification = async (startLogTime) => {
  await sendMail(
    `Start log scheduled at: ${startLogTime}`,
    `Start log scheduled at: ${startLogTime}`
  );
};

const sendNextEndLogNotification = async (endLogTime) => {
  await sendMail(
    `End log scheduled at: ${endLogTime}`,
    `End log scheduled at: ${endLogTime}`
  );
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
