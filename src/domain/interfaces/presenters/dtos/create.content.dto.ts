export type CreateContentDTO = {
    name: string;
    description: string | null;
    key: string;
    mimeType: string;
    location: string;
    spaceId: string;
    ai?: boolean;
}