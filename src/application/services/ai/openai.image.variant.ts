import axios from "axios";
import { Content } from "../../../domain/entities/content";
import { IImageVariant } from "./interface.image.variant";
import { generateUuid } from "../../../utils/generate.uuid.util";

export class OpenaiImageVariant implements IImageVariant {
    constructor(
        private openAiKey: string, 
        private openAiUrl: string, 
        private size: string = "1024x1024"
    ) {}

    async generate(image: Blob, n: number, spaceId: string): Promise<Content[]> {
        try {
            const formData = new FormData();
            formData.append("image", image, generateUuid()); // Default filename
            formData.append("n", n.toString());
            formData.append("size", this.size);

            const response = await axios.post(this.openAiUrl, formData, {
                headers: {
                    "Authorization": `Bearer ${this.openAiKey}`,
                    "Content-Type": "multipart/form-data",
                },
            });

            const imageUrls = response.data.data.map((item: { url: string }) => item.url);
            const [width, height] = this.size.split("x").map(Number);

            return imageUrls.map((url: string) => {
                const urlParts = url.split("/");
                const key = urlParts[urlParts.length - 1]; // Extract last part of URL as key

                return {
                    name: generateUuid(),
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
                } as Content;
            });
        } catch (error) {
            console.error("Error generating image variations:", error);
            throw error;
        }
    }
}
