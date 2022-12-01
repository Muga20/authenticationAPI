import  express  from "express";
import  db  from "./config/config.js";
import  UserRoutes  from "./routes/user.js";
import cors from 'cors'


const app = express();
try {
  db.authenticate();
  console.log("Connection has been established successfully.");
  app.listen(5000, () => console.log('Example app listening on port 5000'));
} catch (error) {
   console.log("Unable to connect to the database:");
}


app.use(express.json());
app.use(cors())



app.use('/api', UserRoutes);
