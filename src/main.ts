import { Application, Router, ServerSentEvent } from "https://deno.land/x/oak@v12.1.0/mod.ts";

const app = new Application();
const router = new Router();

router.get("/:room", (ctx) => {
    const room = ctx.params.room;

    if(!room) {
        ctx.throw(400, "Room is required - connect to /:room");
    }
    const bc = new BroadcastChannel(room);

    const target = ctx.sendEvents();
    bc.addEventListener("message", (e) => {
        const event = new ServerSentEvent("message", { data: e.data });
        target.dispatchEvent(event);
    });
    target.addEventListener("close", () => {
        bc.close();
    });
});

router.post("/:room", async (ctx) => {
    const room = ctx.params.room;
    if(!room) {
        ctx.throw(400, "Room is required - connect to /:room");
    }
    const bc = new BroadcastChannel(room);
    const body = ctx.request.body();
    const message = await body.value;

    if(!message || typeof message !== "string") {
        ctx.throw(400, "Body is required and must be a string");
    }

    bc.postMessage(message);
    bc.close();
    
    ctx.response.status = 200;
});

app.use(router.routes());

await app.listen({ port: 8000 });