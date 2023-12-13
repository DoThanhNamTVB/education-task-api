const adminRouter = require('./admin_Route');
const userRouter = require('./user_Router');

const initRoutes = (app) => {
    app.use('/api/admin', adminRouter);
    app.use('/api/user', userRouter);
};

module.exports = initRoutes;
