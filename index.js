import e from "express";
import session from "express-session"; 
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import cors from "cors";
import router from "./routes/web.js";
import dotenv from "dotenv";

dotenv.config();

const app = e();
const port = process.env.PORT;

app.use(cors());
app.use(e.json());

app.use(session({
  secret: process.env.SESSION_SECRET, 
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: 'http://localhost:5000/auth/google/callback'  
}, (accessToken, refreshToken, profile, done) => {
  return done(null, profile);  
}));

app.use(router);

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.get("/login", (req, res) => {
  res.send("berhasil login");
});

app.get("/logout", (req, res) => {
  res.send("berhasil logout");
});

app.listen(port, () => {
  console.log(`Server running on port http://localhost:${port}`);
});