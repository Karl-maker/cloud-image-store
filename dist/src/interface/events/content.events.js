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
const client_s3_1 = require("@aws-sdk/client-s3");
const aws_remove_service_1 = require("../../application/services/remove/aws.remove.service");
const event_names_1 = require("../../domain/constants/event.names");
const event_bus_1 = require("../../infrastructure/event/event.bus");
const configuration_1 = require("../../application/configuration");
event_bus_1.eventBus.on(event_names_1.CONTENT_DELETED, (_a) => __awaiter(void 0, [_a], void 0, function* ({ content }) {
    try {
        const s3Config = {
            region: configuration_1.REGION_AWS,
            credentials: {
                accessKeyId: configuration_1.ACCESS_KEY_ID_AWS,
                secretAccessKey: configuration_1.SECRET_ACCESS_KEY_AWS,
            }
        };
        const bucketName = configuration_1.S3_BUCKET_NAME_AWS;
        const s3Client = new client_s3_1.S3(s3Config);
        const removeService = new aws_remove_service_1.AWSObjectRemover(s3Client, bucketName);
        removeService.removeObject(content.key);
    }
    catch (err) {
    }
}));
