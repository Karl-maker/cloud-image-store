import { Content } from "../../../domain/entities/content";

export interface IImageVariant {
    generate: (
        image: Blob,
        prompt: string,
        n: number,
        spaceId: string
    ) => Promise<Content[]>;
}