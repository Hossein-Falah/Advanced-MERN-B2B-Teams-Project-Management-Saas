import http from "http";
import schedule from "node-schedule";
import { Application } from "express";
import { registerSocket } from "../socket";
import { config } from "../config/app.config";
import connectDatabase from "../config/database.config";
import { scheduler } from "../modules/automation/workers/scheduler.service";

export class Server {
    private server: http.Server;

    constructor(private app: Application) {
        this.server = http.createServer(this.app);
    }

    public async start() {
        registerSocket(this.server);

        this.initializeJobs();

        this.server.listen(config.PORT, async () => {
            console.log(
                `Server listening on port ${config.PORT} in ${config.NODE_ENV}`
            );

            await connectDatabase();
        });
    }

    private initializeJobs() {
        schedule.scheduleJob("*/1 * * * *", async () => {
            console.log("runs every minute");

            try {
                await scheduler();
            } catch (error) {
                console.log(error);
            }
        });
    }
}
