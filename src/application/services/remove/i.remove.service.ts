export interface ObjectRemover {
    /**
     * Removes an object from the specified S3 bucket.
     * @param key - The key (path) of the object to remove.
     * @returns A promise that resolves when the object is removed.
     */
    removeObject(key: string): Promise<void>;
}
