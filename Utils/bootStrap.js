const mongoose = require('mongoose');
const Config = require('../Config');
mongoose.Promise = global.Promise;


mongoose
    .connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("Connect to Database"))
    .catch((error) => console.log("Error in Connecting to Database: ", error));