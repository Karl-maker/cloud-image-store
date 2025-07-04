"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventBus = exports.EventBus = void 0;
const events_1 = require("events");
class EventBus extends events_1.EventEmitter {
}
exports.EventBus = EventBus;
exports.eventBus = new EventBus();
