import { Application, Router, ServerSentEvent } from "https://deno.land/x/oak@v12.1.0/mod.ts";

const app = new Application();
const router = new Router();

router.get("/", (ctx) => {
    const target = ctx.sendEvents();

    let i = 0;

    const interval = setInterval(() => {
        const event = new ServerSentEvent("message", { data: "Hello World!" });
        target.dispatchEvent(event);

        i++;

        if (i >= 5) {
            target.close();
        }
    }, 1000);

    target.addEventListener("close", () => {
        console.log("Connection closed");
        clearInterval(interval);
    });
});

app.use(router.routes());

await app.listen({ port: 8000 });