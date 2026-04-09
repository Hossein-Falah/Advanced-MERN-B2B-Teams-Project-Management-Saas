import { App } from "./app/app";
import { Routes } from "./app/routes";
import { Server } from "./app/server";

async function bootstrap() {
  const appInstance = new App();

  new Routes(appInstance.app);

  const server = new Server(appInstance.app);

  await server.start();
}

bootstrap();
