import axios from "axios";
import { Content } from "../../../domain/entities/content";
import { IImageVariant } from "./interface.image.variant";
import { generateUuid } from "../../../utils/generate.uuid.util";

export class DeepaiImageVariant implements IImageVariant {
    constructor(
        private deepAiKey: string, 
        private deepAiUrl: string, 
        private size: string = "1024x1024"
    ) {}

    async generate(image: Blob, prompt: string, n: number, spaceId: string): Promise<Content[]> {
        try {
            const formData = new FormData();
            const promptBlob = new Blob([prompt], { type: "text/plain" });
            formData.append("image", image); // Default filename
            formData.append("text", promptBlob);

            const resp = await fetch(this.deepAiUrl, {
                method: 'POST',
                headers: {
                    'api-key': this.deepAiKey
                },
                body: formData
            });
     
            const data = await resp.json();

            const imageUrls = [data.output_url];
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
