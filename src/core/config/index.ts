import dbConfig from "src/infra/db/db.config";
import queueConfig from "src/infra/queue/queue.config";

// register all custom config here
export default [
    dbConfig,
    queueConfig
]