import * as mongoose from 'mongoose';

//connect to mangodb
mongoose.connect(String(process.env.MONGO_URL), {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
});

mongoose.connection.on("connected", () => {
    console.log("Connected !");
});

export default mongoose;