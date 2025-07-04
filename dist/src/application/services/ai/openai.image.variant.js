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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenaiImageVariant = void 0;
const axios_1 = __importDefault(require("axios"));
const generate_uuid_util_1 = require("../../../utils/generate.uuid.util");
class OpenaiImageVariant {
    constructor(openAiKey, openAiUrl, size = "1024x1024") {
        this.openAiKey = openAiKey;
        this.openAiUrl = openAiUrl;
        this.size = size;
    }
    generate(image, prompt, n, spaceId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const formData = new FormData();
                formData.append("image", image, "image.png"); // Default filename
                formData.append("n", n.toString());
                formData.append("size", this.size);
                const response = yield axios_1.default.post(this.openAiUrl, formData, {
                    headers: {
                        "Authorization": `Bearer ${this.openAiKey}`,
                        "Content-Type": "multipart/form-data",
                    },
                });
                const imageUrls = response.data.data.map((item) => item.url);
                const [width, height] = this.size.split("x").map(Number);
                return imageUrls.map((url) => {
                    const urlParts = url.split("/");
                    const key = urlParts[urlParts.length - 1]; // Extract last part of URL as key
                    return {
                        name: (0, generate_uuid_util_1.generateUuid)(),
                        description: null,
                        key,
                        mimeType: "image/png", // Assuming PNG as default
                        location: url,
                        uploadCompletion: 100,
                        spaceId: spaceId,
                        size: 0,
                        id: null,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        height,
                        width,
                    };
                });
            }
            catch (error) {
                console.error("Error generating image variations:", error);
                throw error;
            }
        });
    }
}
exports.OpenaiImageVariant = OpenaiImageVariant;
