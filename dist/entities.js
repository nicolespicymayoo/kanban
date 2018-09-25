"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
// import { Session } from "inspector"
let Users = class Users {
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Users.prototype, "id", void 0);
__decorate([
    typeorm_1.Column({ select: false }),
    __metadata("design:type", String)
], Users.prototype, "username", void 0);
__decorate([
    typeorm_1.Column({ select: false }),
    __metadata("design:type", String)
], Users.prototype, "password", void 0);
__decorate([
    typeorm_1.OneToMany(() => Boards, boards => boards.user),
    __metadata("design:type", Array)
], Users.prototype, "boards", void 0);
__decorate([
    typeorm_1.OneToMany(() => Sessions, session => session.token),
    __metadata("design:type", Array)
], Users.prototype, "sessions", void 0);
Users = __decorate([
    typeorm_1.Entity()
], Users);
exports.Users = Users;
let Sessions = class Sessions {
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Sessions.prototype, "id", void 0);
__decorate([
    typeorm_1.Column({ nullable: true }),
    __metadata("design:type", String)
], Sessions.prototype, "token", void 0);
__decorate([
    typeorm_1.ManyToOne(() => Users, { nullable: false }),
    __metadata("design:type", Users)
], Sessions.prototype, "user", void 0);
Sessions = __decorate([
    typeorm_1.Entity()
], Sessions);
exports.Sessions = Sessions;
let Boards = class Boards {
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Boards.prototype, "id", void 0);
__decorate([
    typeorm_1.Column({ nullable: false }),
    __metadata("design:type", Number)
], Boards.prototype, "index", void 0);
__decorate([
    typeorm_1.Column({ nullable: true }),
    __metadata("design:type", String)
], Boards.prototype, "name", void 0);
__decorate([
    typeorm_1.OneToMany(() => Tasks, task => task.board),
    __metadata("design:type", Array)
], Boards.prototype, "tasks", void 0);
__decorate([
    typeorm_1.ManyToOne(() => Users, user => user.boards, { nullable: false }),
    __metadata("design:type", Users)
], Boards.prototype, "user", void 0);
Boards = __decorate([
    typeorm_1.Entity()
], Boards);
exports.Boards = Boards;
let Tasks = class Tasks {
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Tasks.prototype, "id", void 0);
__decorate([
    typeorm_1.ManyToOne(() => Boards, board => board.tasks),
    __metadata("design:type", Boards)
], Tasks.prototype, "board", void 0);
__decorate([
    typeorm_1.Column({ nullable: false }),
    __metadata("design:type", Number)
], Tasks.prototype, "index", void 0);
__decorate([
    typeorm_1.Column({ nullable: true }),
    __metadata("design:type", String)
], Tasks.prototype, "text", void 0);
Tasks = __decorate([
    typeorm_1.Entity()
], Tasks);
exports.Tasks = Tasks;
exports.default = [Boards, Tasks, Users, Sessions];
//# sourceMappingURL=entities.js.map