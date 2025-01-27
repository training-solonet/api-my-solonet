import e from "express";
import cors from "cors";
import router from "./routes/web.js";
import dotenv from "dotenv";
import whatsappClient from './controller/wwebController.js';

dotenv.config();

const app = e();
const port = process.env.PORT;

app.use(cors());
app.use(e.urlencoded({ extended: true })); 
app.use(e.json());

app.use('/images', e.static('images'));

whatsappClient.initialize().catch(err => {
  console.log("Gagal menginisialisasi Klien WhatsApp", err);
});

app.use(router);

app.get("/", (req, res) => {
  res.send("Endpoint API My SOLONET Dev");
});

app.listen(port, () => {
  console.log(`Server running on port http://localhost:${port}`);
});
