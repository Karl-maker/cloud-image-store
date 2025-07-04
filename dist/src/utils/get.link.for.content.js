"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLinkForContent = void 0;
const configuration_1 = require("../application/configuration");
const api_routes_1 = require("../domain/constants/api.routes");
const getLinkForContent = (content) => {
    return `${configuration_1.MY_DOMAIN}${api_routes_1.CONTENT_VIEW_PATH}/${content.key}`;
};
exports.getLinkForContent = getLinkForContent;
