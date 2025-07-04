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
exports.DeepaiImageVariant = void 0;
const generate_uuid_util_1 = require("../../../utils/generate.uuid.util");
class DeepaiImageVariant {
    constructor(deepAiKey, deepAiUrl, size = "1024x1024") {
        this.deepAiKey = deepAiKey;
        this.deepAiUrl = deepAiUrl;
        this.size = size;
    }
    generate(image, prompt, n, spaceId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const formData = new FormData();
                const promptBlob = new Blob([prompt], { type: "text/plain" });
                formData.append("image", image); // Default filename
                formData.append("text", promptBlob);
                const resp = yield fetch(this.deepAiUrl, {
                    method: 'POST',
                    headers: {
                        'api-key': this.deepAiKey
                    },
                    body: formData
                });
                const data = yield resp.json();
                const imageUrls = [data.output_url];
                const [width, height] = this.size.split("x").map(Number);
                return imageUrls.map((url) => {
                    const urlParts = url.split("/");
                    const key = urlParts[urlParts.length - 1]; // Extract last part of URL as key
                    return {
                        name: (0, generate_uuid_util_1.generateUuid)(),
                        description: null,
                        key,
                        mimeType: "image/png",
                        location: url,
                        uploadCompletion: 100,
                        spaceId: spaceId,
                        size: 0,
                        id: null,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        height,
                        width,
                        ai: true
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
exports.DeepaiImageVariant = DeepaiImageVariant;
