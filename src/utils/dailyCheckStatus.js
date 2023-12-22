const schedule = require('node-schedule');
const Test = require('../model/Test');

const dailyCheckStatus = schedule.scheduleJob('0 0 * * *', async () => {
    try {
        const documents = await Test.find();

        for (const document of documents) {
            const now = new Date();
            const midnight = new Date(now);
            midnight.setHours(0, 0, 0, 0);

            if (now < document.startTime) {
                document.status = 'Scheduled';
            } else if (now > document.endTime) {
                document.status = 'Completed';
            } else {
                document.status = 'Active';
            }

            await document.save();
        }
    } catch (error) {
        throw new Error(error);
    }
});

module.exports = { dailyCheckStatus };
