"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentController = void 0;
const event_bus_1 = require("../../../infrastructure/event/event.bus");
const event_names_1 = require("../../../domain/constants/event.names");
const api_routes_1 = require("../../../domain/constants/api.routes");
const get_link_for_content_1 = require("../../../utils/get.link.for.content");
const configuration_1 = require("../../../application/configuration");
const bytes_to_mb_1 = require("../../../utils/bytes.to.mb");
class ContentController {
    constructor(usecase) {
        this.usecase = usecase;
        this.redirectToS3 = (bucketName, s3Config) => (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const key = req.params[0];
                const rangeHeader = req.headers.range;
                const { data, stream } = yield this.usecase.redirectToS3(key, bucketName, s3Config, rangeHeader);
                const contentType = data.ContentType || 'application/octet-stream';
                const contentLength = data.ContentLength;
                const contentRange = data.ContentRange;
                res.setHeader('Access-Control-Allow-Origin', configuration_1.COMPANY_DOMAIN);
                res.setHeader('Access-Control-Allow-Headers', 'Range');
                res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Range');
                res.setHeader('Accept-Ranges', 'bytes');
                res.setHeader('Content-Type', contentType);
                res.setHeader('Cache-Control', 'public, max-age=31536000');
                if (rangeHeader && contentRange) {
                    res.status(206); // Partial Content
                    res.setHeader('Content-Range', contentRange);
                    res.setHeader('Content-Length', (contentLength === null || contentLength === void 0 ? void 0 : contentLength.toString()) || '');
                }
                else {
                    res.setHeader('Content-Length', (contentLength === null || contentLength === void 0 ? void 0 : contentLength.toString()) || '');
                }
                data.Body.pipe(res);
            }
            catch (error) {
                next(error);
            }
        });
    }
    create(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const content = yield this.usecase.create(req.body);
                event_bus_1.eventBus.emit(event_names_1.CONTENT_CREATED, { content });
                res.status(201).end();
            }
            catch (error) {
                next(error);
            }
        });
    }
    upload(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.usecase.upload({
                    spaceId: req.body.spaceId,
                    files: req.files
                });
                res.status(201).end();
            }
            catch (error) {
                next(error);
            }
        });
    }
    deleteById(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const content = yield this.usecase.findById(req.params[api_routes_1.CONTENT_PARAM]);
                if (content instanceof Error)
                    throw content;
                const data = {
                    deactivatedAt: new Date()
                };
                yield this.usecase.update(req.params[api_routes_1.CONTENT_PARAM], data);
                yield this.usecase.spaceUsecase.addMemory(content.spaceId, -1 * content.size);
                event_bus_1.eventBus.emit(event_names_1.CONTENT_DELETED, { content });
                res.status(204).end();
            }
            catch (error) {
                next(error);
            }
        });
    }
    updateById(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const content = yield this.usecase.update(req.params[api_routes_1.CONTENT_PARAM], req.body);
                content.location = (0, get_link_for_content_1.getLinkForContent)(content);
                content.downloadUrl = content.location;
                res.status(200).json(content);
            }
            catch (error) {
                next(error);
            }
        });
    }
    findById(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const content = yield this.usecase.findById(req.params[api_routes_1.CONTENT_PARAM]);
                if (content instanceof Error)
                    throw content;
                content.location = (0, get_link_for_content_1.getLinkForContent)(content);
                content.downloadUrl = content.location;
                content.size = (0, bytes_to_mb_1.bytesToMB)(content.size);
                res.status(200).json(content);
            }
            catch (error) {
                next(error);
            }
        });
    }
    findMany(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const results = yield this.usecase.findMany(req.query);
                res.status(200).json(Object.assign(Object.assign({}, results), { data: results.data.map((d) => {
                        d.location = (0, get_link_for_content_1.getLinkForContent)(d);
                        d.downloadUrl = d.location;
                        d.size = (0, bytes_to_mb_1.bytesToMB)(d.size);
                        return d;
                    }) }));
            }
            catch (error) {
                next(error);
            }
        });
    }
    generateVariant(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.usecase.generateContentVariant({
                    contentId: req.params[api_routes_1.CONTENT_PARAM],
                    prompt: req.body
                });
                res.status(201).end();
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.ContentController = ContentController;
