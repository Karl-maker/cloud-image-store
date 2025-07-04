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
exports.ContentUsecase = void 0;
const usecases_1 = require("./usecases");
const generate_uuid_util_1 = require("../../utils/generate.uuid.util");
const bucket_name_1 = require("../constants/bucket.name");
const not_found_1 = require("../../application/exceptions/not.found");
const download_blob_from_link_util_1 = require("../../utils/download.blob.from.link.util");
const convert_params_to_filters_util_1 = require("../../utils/convert.params.to.filters.util");
const client_s3_1 = require("@aws-sdk/client-s3");
const http_exception_1 = require("../../application/exceptions/http.exception");
class ContentUsecase extends usecases_1.Usecases {
    constructor(repository, uploadService, spaceUsecase, imageVariantService, blobService, temporaryLinkService) {
        super(repository);
        this.uploadService = uploadService;
        this.spaceUsecase = spaceUsecase;
        this.imageVariantService = imageVariantService;
        this.blobService = blobService;
        this.temporaryLinkService = temporaryLinkService;
    }
    mapCreateDtoToEntity(data) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const content = {
                id: null,
                createdAt: new Date(),
                updatedAt: new Date(),
                name: data.name,
                description: data.description,
                key: data.key,
                mimeType: data.mimeType,
                location: data.location,
                uploadCompletion: 0,
                spaceId: data.spaceId,
                ai: (_a = data.ai) !== null && _a !== void 0 ? _a : false,
                size: 0
            };
            return content;
        });
    }
    mapUpdateDtoToEntity(data, item) {
        return __awaiter(this, void 0, void 0, function* () {
            const content = Object.assign(Object.assign({}, item), data);
            return content;
        });
    }
    redirectToS3(key, bucketName, s3Config, rangeHeader) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const s3 = new client_s3_1.S3Client(s3Config);
                const command = new client_s3_1.GetObjectCommand({
                    Bucket: bucketName,
                    Key: key,
                    Range: rangeHeader
                });
                const data = yield s3.send(command);
                const stream = data.Body;
                return {
                    data,
                    stream
                };
            }
            catch (err) {
                throw new http_exception_1.HttpException('Unexpected Error', 'Issue generating temp url', 500);
            }
        });
    }
    upload(data) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const item of data.files) {
                const name = (0, generate_uuid_util_1.generateUuid)();
                const spaceId = data.spaceId;
                let content = {
                    name: item.originalname,
                    description: null,
                    key: "",
                    mimeType: "",
                    location: "",
                    uploadCompletion: 0,
                    spaceId: data.spaceId,
                    id: null,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    size: item.size
                };
                yield this.uploadService.upload({
                    fileBuffer: item.buffer,
                    fileName: bucket_name_1.BUCKET_NAME_PRIVATE + '/' + name,
                    mimeType: item.mimetype,
                }, (err, data) => __awaiter(this, void 0, void 0, function* () {
                    if (err)
                        content.uploadError = 'Issue Uploading Content';
                    if (data) {
                        content.key = data.key;
                        content.location = data.src;
                        content.mimeType = data.mimeType;
                        content.size = item.size;
                        content.height = data.height;
                        content.downloadUrl = data.downloadUrl;
                        content.width = data.width;
                        content = yield this.repository.save(content);
                        yield this.spaceUsecase.addMemory(spaceId, item.size);
                    }
                }), (precentage) => __awaiter(this, void 0, void 0, function* () {
                    if (precentage && content.id) {
                        content.uploadCompletion = precentage;
                        yield this.repository.save(content);
                    }
                }));
            }
        });
    }
    generateContentVariant(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const content = yield this.repository.findById(data.contentId);
            if (!content)
                throw new not_found_1.NotFoundException('content not found');
            let pngBlob;
            const blob = yield this.blobService.getBlob(content.key);
            // if(content.mimeType === 'image/jpeg') pngBlob = await convertJpegToPngBlob(await blobToBuffer(blob))
            // if(content.mimeType === 'image/png') pngBlob = blob
            // if(!pngBlob) throw new Error('cannot convert to png');
            // const compressed = isImageSizeLessThanTargetInBytes(pngBlob.size, 4 * 1024 * 1024) ? pngBlob : await compressBlobToSize(await blobToBuffer(pngBlob), 3.5);
            const results = yield this.imageVariantService.generate(blob, data.prompt, 1, content.spaceId);
            yield Promise.all(results.map((content) => __awaiter(this, void 0, void 0, function* () {
                const img = yield (0, download_blob_from_link_util_1.downloadImageWithMetadata)(content.location);
                const name = (0, generate_uuid_util_1.generateUuid)();
                yield this.uploadService.upload({
                    fileBuffer: img.buffer,
                    fileName: bucket_name_1.BUCKET_NAME_PRIVATE + '/' + name,
                    mimeType: img.mimeType,
                }, (err, data) => __awaiter(this, void 0, void 0, function* () {
                    if (err)
                        content.uploadError = 'Issue Uploading Content';
                    if (data) {
                        content.key = data.key;
                        content.location = data.src;
                        content.mimeType = img.mimeType;
                        content.size = img.size;
                        content.height = data.height;
                        content.width = data.width;
                        content.downloadUrl = data.downloadUrl;
                        content = yield this.repository.save(content);
                        yield this.spaceUsecase.addMemory(content.spaceId, img.size);
                    }
                }), (precentage) => __awaiter(this, void 0, void 0, function* () {
                    if (precentage && content.id) {
                        content.uploadCompletion = precentage;
                        yield this.repository.save(content);
                    }
                }));
                yield this.repository.save(content);
            })));
        });
    }
    findMany(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const input = {
                pageNumber: params.page_number,
                pageSize: params.page_size,
                sortBy: params.by,
                sortOrder: params.order,
            };
            const objectParams = params;
            delete objectParams['page_number'];
            delete objectParams['page_size'];
            delete objectParams['by'];
            delete objectParams['order'];
            // assume everything else is filters;
            const filters = (0, convert_params_to_filters_util_1.convertToFilters)(objectParams);
            input.filters = filters;
            const data = yield this.repository.findMany(input);
            const finalized = yield Promise.all(data.data.map((v, i) => __awaiter(this, void 0, void 0, function* () {
                if (v.locationExpiration && v.locationExpiration < new Date())
                    return v;
                const results = yield this.temporaryLinkService.generate(v.key);
                v.locationExpiration = results.expDate;
                v.location = results.url;
                v.downloadUrl = results.url;
                yield this.repository.save(v);
                return v;
            })));
            return Object.assign(Object.assign({}, data), { data: finalized });
        });
    }
}
exports.ContentUsecase = ContentUsecase;
