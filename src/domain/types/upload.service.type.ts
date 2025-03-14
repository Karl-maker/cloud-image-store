export type UploadServiceResponse = {
    key: string;
    src: string;
    mimeType: string;
    fileSize?: number;
    length?: number; // if a video or audio get length
    height?: number; // if a image or video get height
    width?: number; // if a image or video get width
}

export type UploadServiceInput = {
    fileBuffer: Buffer; 
    fileName: string; 
    mimeType: string;
    metadata?: Record<string, any>; 
};