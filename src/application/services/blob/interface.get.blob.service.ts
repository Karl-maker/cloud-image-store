export interface GetBlobService {
    getBlob: (key: string) => Promise<Blob> 
}
