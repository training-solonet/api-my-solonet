import e from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import cors from "cors";
import router from "./routes/web.js";
import dotenv from "dotenv";
import { loginGoogle, registerGoogle } from "./controller/UserController.js";

dotenv.config();

const app = e();
const port = process.env.PORT;

app.use(cors());
app.use(e.json());

app.use(
  session({
    secret: "bIlN0pbm4S",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

passport.use(
  new GoogleStrategy(
    {
      clientID:
        "179217026619-dfhjpdk5njnoktot1hquafijbgkn2s3p.apps.googleusercontent.com",
      clientSecret:
        "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GOCSPX-ySK5gw-iesFTml8GGIG5XdcIAoEj",
      callbackURL: `https://api.connectis.my.id/auth/google`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("Google Profile:", profile);
        console.log("Access Token:", accessToken);

        let user = await loginGoogle(profile);

        if (!user) {
          user = await registerGoogle(profile);

          if (user) {
            return done(null, user);
          } else {
            return done(null, false, { message: "Google account not linked" });
          }
        }

        if (!user) {
          return done(null, false, { message: "Google account not linked" });
        }

        done(null, user);
      } catch (error) {
        console.error("Authentication Error:", error);
        return done(error);
      }
    }
  )
);

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
