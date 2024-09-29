import e from "express";
import session from "express-session"; 
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import cors from "cors";
import router from "./routes/web.js";
import dotenv from "dotenv";
import { registerGoogle } from "./controller/UserController.js";

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
}, async(accessToken, refreshToken, profile, done) => {
  try {
    const user = await registerGoogle(profile);
    if(user) {
      return done(null, user);
    }else{
      return done(null, false);
    }
  } catch (error) {
    return done(error, false);
  }  
}));

app.use(router);

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.get("/logout", (req, res) => {
  res.send("berhasil logout");
});

app.listen(port, () => {
  console.log(`Server running on port http://localhost:${port}`);
});