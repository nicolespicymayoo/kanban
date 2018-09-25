"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const entities_1 = require("./entities");
exports.getKanban = (connection) => async (req, res) => {
    const boards = await connection.manager.find(entities_1.Boards);
    res.send(boards);
};
//# sourceMappingURL=handlers.js.map