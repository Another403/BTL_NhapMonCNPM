const paymentRoute = require("./payment.route.js");
const feeRoute = require("./fee.route.js");
const authenRoute = require("./authen.route.js");
const apartmentRoute = require("./apartment.route.js");
const householdRoute = require("./househole.route.js");
const personRoute = require("./person.route.js");
const overviewRoute = require("./overview.route.js");
const vehicleRoute = require("./vehicle.route.js");
const requireAuth = require("../middlewares/requireAuth.js");

const publicRoutesMiddleware = (req, res, next) => {
  const publicRoutes = [
    { method: 'POST', path: '/person/api/v1/create' },
    { method: 'POST', path: '/household/api/v1/create' },
    { method: 'POST', path: '/household/api/v1/addMember' },
    { method: 'GET', path: '/apartments/api/v1/remains' }
  ];

  const isPublic = publicRoutes.some(route =>
    route.method === req.method && route.path === req.path
  );

  if (isPublic) {
    return next();
  }

  return requireAuth(req, res, next);
};

module.exports = (app) => {
  // Auth routes không cần xác thực (login, register)
  app.use("/auth", authenRoute);

  // Cho phép một số route cụ thể truy cập công khai, còn lại yêu cầu đăng nhập
  app.use(publicRoutesMiddleware);

  app.use("/payments", paymentRoute);
  app.use("/fees", feeRoute);
  app.use("/apartments", apartmentRoute);
  app.use("/household", householdRoute);
  app.use("/person", personRoute);
  app.use("/vehicles", vehicleRoute);
  app.use("/", overviewRoute);
}