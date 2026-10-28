import express from "express";
import { createServer } from "http";
import cors from "cors";
import "./extensions.js";
import "./loader.js"
import { Input } from "./Input.js";

const corsConfig = {
    origin: "http://localhost:5173",
    methods: [ "GET", "POST" ],
    credentials: true
};

const app = express();
app.use(cors(corsConfig));

const server = createServer(app);
Input.init(server, corsConfig);

server.listen(3000, () => {
    console.log("Server listening on port 3000.");
});
