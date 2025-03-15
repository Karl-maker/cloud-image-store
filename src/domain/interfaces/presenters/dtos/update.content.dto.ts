export type UpdateContentDTO = {
    name: string;
    description: string | null;
    key: string;
    mimeType: string;
    location: string;
    spaceId: string;
    uploadCompletion: number;
}