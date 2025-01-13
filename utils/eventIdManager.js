let eventId = null;

const getEventId = () => eventId;
const setEventId = (id) => {
  eventId = id;
};

module.exports = { getEventId, setEventId };
