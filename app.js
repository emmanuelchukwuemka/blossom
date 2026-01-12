const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const userRoute = require("./routes/userRoute");
const errorHandler = require("./middleware/errorMiddleware");
const db = require("./Database/db");

const app = express();

//  middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.json({ limit: "50kb" }));
process.env.NODE_ENV === "development" && app.use(morgan("dev"));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

//

const ProductRoute = require("./routes/products/ProductRoutes");
// const userRoute = require('./routes/userRoutes/userRoute') //create user Router
const categoryRoute = require("./routes/categoryRoutes/categoryRoutes");
const cartRoute = require("./routes/cartRoutes/cartRoutes"); //cartRoute
// const primeRoute = require("./routes/PrimeRoutes/PrimeRoutes")
const orderRoute = require("./routes/OrderRoutes/OrderRoutes");
const browseHistory = require("./routes/browseHistory/browseHistory");
// const upload = require('./routes/uploadRoute/uploadRoute')
// const freshRoute = require("./routes/BloomzonFresh/freshRoute")
const bannerRoute = require("./routes/bannerRoute/bannerRouter");
const notificationRoute = require("./routes/notificationRoutes/notificationRoutes");
const businessRoute = require("./routes/businessRoutes/businessRoutes");
const walletRoute = require("./routes/walletRoutes/walletRoutes");
const garageDeliveryRoute = require("./routes/garageDeliveryRoutes/garageDeliveryRoutes");
const deviceRoute = require("./routes/deviceRoutes/deviceRoutes");
const addressRouter = require("./routes/addressRoute/addressRoutes");
const helpfulRouter = require("./routes/helpfulRoutes/helpfulRoutes");
const coinRouter = require("./routes/coinRoutes/coinRoutes");
const giftcardRouter = require("./routes/giftCardRoutes/giftcardRoutes");
const reviewRouter = require("./routes/reviewRoutes/reviewRoutes");
const fanshopRouter = require("./routes/fanshopRoutes/fanshopRoutes");
const cartMainRoute = require("./routes/cartRoutes/cartMainRoutes");
const wishlistRoute = require("./routes/wishlistRoutes/wishlistRoutes");

const garageRoute = require("./routes/garageRoutes/garageRoutes");
const appPreferenceRoute = require("./routes/appPreferenceRoutes/appPreferenceRoutes");
const suggestionRoute = require("./routes/suggestionRoutes/suggestionRoutes");

const couponRoute = require("./routes/couponRoutes/couponRoutes");
const petRoute = require("./routes/petRoutes/petRoutes");
const breedRoute = require("./routes/petRoutes/breedRoutes");
const userPetRoute = require("./routes/petRoutes/userPetRoutes");
const logisticSupplierRoute = require("./routes/logisticRoutes/logisticSupplierRoutes");
const logisticServiceRoute = require("./routes/logisticRoutes/logisticServicesRoutes");
const messagesRoute = require("./routes/messagesRoutes/messagesRoutes");
const sponsoredAdsRoute = require("./routes/sponsoredAdRoutes/sponsoredAdRoutes");
const favoriteRoute = require("./routes/favoriteRoutes/favoriteRoutes");
const mainPetRoute = require("./routes/petRoutes/mainPetRoutes");
const referralRoute = require("./routes/referralRoutes/referralRoutes");
const requestRoute = require("./routes/requestRoutes/requestRoutes");
const marketplaceRoute = require("./routes/marketplaceRoutes/marketplaceRoutes");
const accountRoute = require("./routes/accountRoutes/accountRoutes");
const profileRoute = require("./routes/profileRoutes/profileRoutes");





// Routes

app.use("/api/v1", ProductRoute);
app.use("/api/v1", userRoute); //Users Router Middleware
app.use("/api/v1", categoryRoute); //CategoryRoute Middleware
app.use("/api/v1", cartRoute); //cartRoute
app.use("/api/v1", orderRoute);
app.use("/api/v1", browseHistory);
app.use("/api/v1", bannerRoute);
app.use("/api/v1", notificationRoute);
app.use("/api/v1", businessRoute);
app.use("/api/v1", walletRoute);
app.use("/api/v1", garageDeliveryRoute);
app.use("/api/v1", deviceRoute);
app.use("/api/v1", addressRouter);
app.use("/api/v1", helpfulRouter);
app.use("/api/v1", coinRouter);
app.use("/api/v1", giftcardRouter);
app.use("/api/v1", reviewRouter);
app.use("/api/v1", fanshopRouter);
app.use("/api/v1", cartMainRoute);
app.use("/api/v1", wishlistRoute);

app.use("/api/v1", garageRoute);

app.use("/api/v1", couponRoute);

app.use("/api/v1", appPreferenceRoute);
app.use("/api/v1", suggestionRoute);
app.use("/api/v1", petRoute);
app.use("/api/v1", breedRoute);
app.use("/api/v1", userPetRoute);
app.use("/api/v1", logisticSupplierRoute);
app.use("/api/v1", logisticServiceRoute);
app.use("/api/v1", messagesRoute);
app.use("/api/v1", sponsoredAdsRoute);
app.use("/api/v1", favoriteRoute);
app.use("/api/v1", mainPetRoute);
app.use("/api/v1", referralRoute);
app.use("/api/v1", requestRoute);
app.use("/api/v1", marketplaceRoute);
app.use("/api/v1", accountRoute);
app.use("/api/v1", profileRoute);





app.get("/api/v1", (req, res) => {
  res.send("Hello World and Welcome to Bloomzon version 1!");
});
app.get("/", (req, res) => {
  res.send("Hello World");
});
app.use((req, res, next) => {
  res.status(404).json({
      status: "fail",
      message: `Cannot find ${req.method} ${req.originalUrl} on this server, or there may be a missing parameter.`,
  });
});




// Error middleware
app.use(errorHandler);

const PORT = 5001 || process.env.PORT;

app.listen(PORT, () => {
  console.log(`App is Running on port ${5001 || process.env.PORT}`);
  db.connect((err) => {
    if (err) {
      console.log(err);
    } else {
      console.log("Db connected");
    }
  });
});
