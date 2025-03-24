import { Content } from "../../../domain/entities/content";

export interface IImageVariant {
    generate: (
        image: Blob,
        n: number,
        spaceId: string
    ) => Promise<Content[]>;
}