"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const manager = typeorm_1.getConnectionManager();
exports.default = manager.create({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "nicolemayo",
    password: "",
    database: "kanban",
    synchronize: true,
    logging: false
});
//# sourceMappingURL=dbConnection.js.map