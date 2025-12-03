export const corsConfig = {
    origin: [
        "http://127.0.0.1:3000",
        "http://localhost:3000",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
        "Content-Type",
        "Authorization",
        "Accept",
        "X-Requested-With",
    ],
    credentials: true,
};

