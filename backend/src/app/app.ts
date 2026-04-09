import cors from "cors";
import passport from "passport";
import session from "cookie-session";
import express, { Application } from "express";
import { config } from "../config/app.config";
import "../config/passport.config";


export class App {
    public app: Application;

    constructor() {
        this.app = express();

        this.initializeCore();
        this.initializeMiddlewares();
    }

    private initializeCore() {
        this.app.set("trust proxy", 1);
    }

    private initializeMiddlewares() {
        this.app.use(express.json());

        this.app.use(express.urlencoded({ extended: true }));

        this.app.use(
            cors({
                origin: [
                    config.FRONTEND_ORIGIN,
                    config.FRONTEND_DEVELOPMENT,
                    "http://localhost:5173",
                    "http://localhost:8010",
                    "https://task.teleservat.com",
                ],
                credentials: true,
            })
        );

        this.app.use(
            session({
                name: "session",
                keys: [config.SESSION_SECRET],
                maxAge: 24 * 60 * 60 * 1000,
                sameSite: "lax",
                secure: false,
                httpOnly: true,
                path: "/",
            })
        );

        this.app.use(passport.initialize());
        this.app.use(passport.session());
    }
}
