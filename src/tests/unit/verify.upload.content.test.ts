import { Request } from 'express';
import { verifyUploadPermissions } from '../../interface/express/middlewares/verify.upload.content';
import { UploadContentDTO } from '../../domain/interfaces/presenters/dtos/upload.content.dto';

describe('verifyUploadPermissions', () => {
  let mockRequest: Partial<Request>;
  let mockPayload: any;

  beforeEach(() => {
    mockRequest = {
      body: {} as UploadContentDTO,
      files: undefined,
      file: undefined
    };
    mockPayload = {
      id: 'user-1',
      spaceId: 'space-1',
      allowPhotos: true,
      allowVideos: true
    };
  });

  describe('space permissions', () => {
    it('should return true when payload has id but no spaceId', async () => {
      mockPayload = {
        id: 'user-1',
        allowPhotos: true,
        allowVideos: true
      };
      (mockRequest.body as UploadContentDTO).spaceId = 'any-space-id';

      const result = await verifyUploadPermissions(mockRequest as Request, mockPayload);

      expect(result).toBe(true);
    });

    it('should return true when spaceId matches payload spaceId', async () => {
      mockPayload.spaceId = 'space-1';
      (mockRequest.body as UploadContentDTO).spaceId = 'space-1';

      const result = await verifyUploadPermissions(mockRequest as Request, mockPayload);

      expect(result).toBe(true);
    });

    it('should return false when spaceId does not match payload spaceId', async () => {
      mockPayload.spaceId = 'space-1';
      (mockRequest.body as UploadContentDTO).spaceId = 'space-2';

      const result = await verifyUploadPermissions(mockRequest as Request, mockPayload);

      expect(result).toBe(false);
    });

    it('should return true when payload has no spaceId and request has no spaceId', async () => {
      mockPayload = {
        id: 'user-1',
        allowPhotos: true,
        allowVideos: true
      };
      (mockRequest.body as any).spaceId = undefined;

      const result = await verifyUploadPermissions(mockRequest as Request, mockPayload);

      expect(result).toBe(true);
    });

    it('should return false when payload has spaceId but request has no spaceId', async () => {
      mockPayload.spaceId = 'space-1';
      (mockRequest.body as any).spaceId = undefined;

      const result = await verifyUploadPermissions(mockRequest as Request, mockPayload);

      expect(result).toBe(false);
    });
  });

  describe('file type permissions - single file', () => {
    it('should return true when payload allows photos and file is image', async () => {
      mockPayload.allowPhotos = true;
      mockPayload.allowVideos = false;
      // Set matching spaceId to pass space permission check
      (mockRequest.body as UploadContentDTO).spaceId = 'space-1';
      (mockRequest as any).file = {
        mimetype: 'image/jpeg'
      };

      const result = await verifyUploadPermissions(mockRequest as Request, mockPayload);

      expect(result).toBe(true);
    });

    it('should return false when payload does not allow photos and file is image', async () => {
      mockPayload.allowPhotos = false;
      mockPayload.allowVideos = true;
      // Set matching spaceId to pass space permission check
      (mockRequest.body as UploadContentDTO).spaceId = 'space-1';
      (mockRequest as any).file = {
        mimetype: 'image/png'
      };

      const result = await verifyUploadPermissions(mockRequest as Request, mockPayload);

      expect(result).toBe(false);
    });

    it('should return true when payload allows videos and file is video', async () => {
      mockPayload.allowPhotos = false;
      mockPayload.allowVideos = true;
      // Set matching spaceId to pass space permission check
      (mockRequest.body as UploadContentDTO).spaceId = 'space-1';
      (mockRequest as any).file = {
        mimetype: 'video/mp4'
      };

      const result = await verifyUploadPermissions(mockRequest as Request, mockPayload);

      expect(result).toBe(true);
    });

    it('should return false when payload does not allow videos and file is video', async () => {
      mockPayload.allowPhotos = true;
      mockPayload.allowVideos = false;
      // Set matching spaceId to pass space permission check
      (mockRequest.body as UploadContentDTO).spaceId = 'space-1';
      (mockRequest as any).file = {
        mimetype: 'video/avi'
      };

      const result = await verifyUploadPermissions(mockRequest as Request, mockPayload);

      expect(result).toBe(false);
    });

    it('should return true when file has no mimetype', async () => {
      mockPayload.allowPhotos = false;
      mockPayload.allowVideos = false;
      // Set matching spaceId to pass space permission check
      (mockRequest.body as UploadContentDTO).spaceId = 'space-1';
      (mockRequest as any).file = {
        // no mimetype
      };

      const result = await verifyUploadPermissions(mockRequest as Request, mockPayload);

      expect(result).toBe(true);
    });

    it('should return true when file has unsupported mimetype', async () => {
      mockPayload.allowPhotos = false;
      mockPayload.allowVideos = false;
      // Set matching spaceId to pass space permission check
      (mockRequest.body as UploadContentDTO).spaceId = 'space-1';
      (mockRequest as any).file = {
        mimetype: 'application/pdf'
      };

      const result = await verifyUploadPermissions(mockRequest as Request, mockPayload);

      expect(result).toBe(true);
    });
  });

  describe('file type permissions - multiple files', () => {
    it('should return true when payload allows both photos and videos and files are mixed', async () => {
      mockPayload.allowPhotos = true;
      mockPayload.allowVideos = true;
      // Set matching spaceId to pass space permission check
      (mockRequest.body as UploadContentDTO).spaceId = 'space-1';
      (mockRequest as any).files = [
        { mimetype: 'image/jpeg' },
        { mimetype: 'video/mp4' }
      ];

      const result = await verifyUploadPermissions(mockRequest as Request, mockPayload);

      expect(result).toBe(true);
    });

    it('should return false when payload does not allow photos but files contain image', async () => {
      mockPayload.allowPhotos = false;
      mockPayload.allowVideos = true;
      // Set matching spaceId to pass space permission check
      (mockRequest.body as UploadContentDTO).spaceId = 'space-1';
      (mockRequest as any).files = [
        { mimetype: 'video/mp4' },
        { mimetype: 'image/png' },
        { mimetype: 'video/avi' }
      ];

      const result = await verifyUploadPermissions(mockRequest as Request, mockPayload);

      expect(result).toBe(false);
    });

    it('should return false when payload does not allow videos but files contain video', async () => {
      mockPayload.allowPhotos = true;
      mockPayload.allowVideos = false;
      // Set matching spaceId to pass space permission check
      (mockRequest.body as UploadContentDTO).spaceId = 'space-1';
      (mockRequest as any).files = [
        { mimetype: 'image/jpeg' },
        { mimetype: 'video/mp4' },
        { mimetype: 'image/gif' }
      ];

      const result = await verifyUploadPermissions(mockRequest as Request, mockPayload);

      expect(result).toBe(false);
    });

    it('should return false when payload allows neither photos nor videos', async () => {
      mockPayload.allowPhotos = false;
      mockPayload.allowVideos = false;
      // Set matching spaceId to pass space permission check
      (mockRequest.body as UploadContentDTO).spaceId = 'space-1';
      (mockRequest as any).files = [
        { mimetype: 'image/jpeg' },
        { mimetype: 'video/mp4' }
      ];

      const result = await verifyUploadPermissions(mockRequest as Request, mockPayload);

      expect(result).toBe(false);
    });

    it('should return true when files have no mimetype', async () => {
      mockPayload.allowPhotos = false;
      mockPayload.allowVideos = false;
      // Set matching spaceId to pass space permission check
      (mockRequest.body as UploadContentDTO).spaceId = 'space-1';
      (mockRequest as any).files = [
        { /* no mimetype */ },
        { /* no mimetype */ }
      ];

      const result = await verifyUploadPermissions(mockRequest as Request, mockPayload);

      expect(result).toBe(true);
    });

    it('should return true when files have unsupported mimetypes', async () => {
      mockPayload.allowPhotos = false;
      mockPayload.allowVideos = false;
      // Set matching spaceId to pass space permission check
      (mockRequest.body as UploadContentDTO).spaceId = 'space-1';
      (mockRequest as any).files = [
        { mimetype: 'application/pdf' },
        { mimetype: 'text/plain' }
      ];

      const result = await verifyUploadPermissions(mockRequest as Request, mockPayload);

      expect(result).toBe(true);
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle null files array', async () => {
      mockPayload.allowPhotos = false;
      mockPayload.allowVideos = false;
      // Set matching spaceId to pass space permission check
      (mockRequest.body as UploadContentDTO).spaceId = 'space-1';
      (mockRequest as any).files = null;

      const result = await verifyUploadPermissions(mockRequest as Request, mockPayload);

      expect(result).toBe(true);
    });

    it('should handle undefined files array', async () => {
      mockPayload.allowPhotos = false;
      mockPayload.allowVideos = false;
      // Set matching spaceId to pass space permission check
      (mockRequest.body as UploadContentDTO).spaceId = 'space-1';
      (mockRequest as any).files = undefined;

      const result = await verifyUploadPermissions(mockRequest as Request, mockPayload);

      expect(result).toBe(true);
    });

    it('should handle empty files array', async () => {
      mockPayload.allowPhotos = false;
      mockPayload.allowVideos = false;
      // Set matching spaceId to pass space permission check
      (mockRequest.body as UploadContentDTO).spaceId = 'space-1';
      (mockRequest as any).files = [];

      const result = await verifyUploadPermissions(mockRequest as Request, mockPayload);

      expect(result).toBe(true);
    });

    it('should handle null file in files array', async () => {
      mockPayload.allowPhotos = false;
      mockPayload.allowVideos = false;
      // Set matching spaceId to pass space permission check
      (mockRequest.body as UploadContentDTO).spaceId = 'space-1';
      (mockRequest as any).files = [
        { mimetype: 'image/jpeg' },
        null,
        { mimetype: 'video/mp4' }
      ];

      const result = await verifyUploadPermissions(mockRequest as Request, mockPayload);

      expect(result).toBe(false);
    });

    it('should handle undefined file in files array', async () => {
      mockPayload.allowPhotos = false;
      mockPayload.allowVideos = false;
      // Set matching spaceId to pass space permission check
      (mockRequest.body as UploadContentDTO).spaceId = 'space-1';
      (mockRequest as any).files = [
        { mimetype: 'image/jpeg' },
        undefined,
        { mimetype: 'video/mp4' }
      ];

      const result = await verifyUploadPermissions(mockRequest as Request, mockPayload);

      expect(result).toBe(false);
    });

    it('should handle null mimetype in file', async () => {
      mockPayload.allowPhotos = false;
      mockPayload.allowVideos = false;
      // Set matching spaceId to pass space permission check
      (mockRequest.body as UploadContentDTO).spaceId = 'space-1';
      (mockRequest as any).files = [
        { mimetype: null },
        { mimetype: 'image/jpeg' }
      ];

      const result = await verifyUploadPermissions(mockRequest as Request, mockPayload);

      expect(result).toBe(false);
    });

    it('should handle undefined mimetype in file', async () => {
      mockPayload.allowPhotos = false;
      mockPayload.allowVideos = false;
      // Set matching spaceId to pass space permission check
      (mockRequest.body as UploadContentDTO).spaceId = 'space-1';
      (mockRequest as any).files = [
        { mimetype: undefined },
        { mimetype: 'image/jpeg' }
      ];

      const result = await verifyUploadPermissions(mockRequest as Request, mockPayload);

      expect(result).toBe(false);
    });

    it('should handle empty string mimetype', async () => {
      mockPayload.allowPhotos = false;
      mockPayload.allowVideos = false;
      // Set matching spaceId to pass space permission check
      (mockRequest.body as UploadContentDTO).spaceId = 'space-1';
      (mockRequest as any).files = [
        { mimetype: '' },
        { mimetype: 'image/jpeg' }
      ];

      const result = await verifyUploadPermissions(mockRequest as Request, mockPayload);

      expect(result).toBe(false);
    });

    it('should handle various image mimetypes', async () => {
      mockPayload.allowPhotos = true;
      mockPayload.allowVideos = false;
      // Set matching spaceId to pass space permission check
      (mockRequest.body as UploadContentDTO).spaceId = 'space-1';
      (mockRequest as any).files = [
        { mimetype: 'image/jpeg' },
        { mimetype: 'image/png' },
        { mimetype: 'image/gif' },
        { mimetype: 'image/webp' },
        { mimetype: 'image/svg+xml' }
      ];

      const result = await verifyUploadPermissions(mockRequest as Request, mockPayload);

      expect(result).toBe(true);
    });

    it('should handle various video mimetypes', async () => {
      mockPayload.allowPhotos = false;
      mockPayload.allowVideos = true;
      // Set matching spaceId to pass space permission check
      (mockRequest.body as UploadContentDTO).spaceId = 'space-1';
      (mockRequest as any).files = [
        { mimetype: 'video/mp4' },
        { mimetype: 'video/avi' },
        { mimetype: 'video/mov' },
        { mimetype: 'video/wmv' },
        { mimetype: 'video/webm' }
      ];

      const result = await verifyUploadPermissions(mockRequest as Request, mockPayload);

      expect(result).toBe(true);
    });
  });

  describe('complex scenarios', () => {
    it('should handle space permission with file type restrictions', async () => {
      mockPayload.spaceId = 'space-1';
      mockPayload.allowPhotos = true;
      mockPayload.allowVideos = false;
      (mockRequest.body as UploadContentDTO).spaceId = 'space-1';
      (mockRequest as any).files = [
        { mimetype: 'image/jpeg' },
        { mimetype: 'video/mp4' }
      ];

      const result = await verifyUploadPermissions(mockRequest as Request, mockPayload);

      expect(result).toBe(false);
    });

    it('should handle user with id but no space permissions with file restrictions', async () => {
      mockPayload = {
        id: 'user-1',
        allowPhotos: false,
        allowVideos: true
      };
      (mockRequest.body as UploadContentDTO).spaceId = 'any-space';
      (mockRequest as any).files = [
        { mimetype: 'image/jpeg' },
        { mimetype: 'video/mp4' }
      ];

      const result = await verifyUploadPermissions(mockRequest as Request, mockPayload);

      // When payload has id but no spaceId, middleware returns true (bypass logic)
      expect(result).toBe(true);
    });

    it('should handle large number of files efficiently', async () => {
      mockPayload.allowPhotos = true;
      mockPayload.allowVideos = true;
      // Set matching spaceId to pass space permission check
      (mockRequest.body as UploadContentDTO).spaceId = 'space-1';
      const files = Array.from({ length: 100 }, (_, i) => ({
        mimetype: i % 2 === 0 ? 'image/jpeg' : 'video/mp4'
      }));
      (mockRequest as any).files = files;

      const result = await verifyUploadPermissions(mockRequest as Request, mockPayload);

      expect(result).toBe(true);
    });

    it('should handle payload with only allowPhotos set', async () => {
      mockPayload = {
        id: 'user-1',
        allowPhotos: true
        // allowVideos not set
      };
      (mockRequest as any).files = [
        { mimetype: 'image/jpeg' },
        { mimetype: 'video/mp4' }
      ];

      const result = await verifyUploadPermissions(mockRequest as Request, mockPayload);

      // When payload has id but no spaceId, middleware returns true (bypass logic)
      expect(result).toBe(true);
    });

    it('should handle payload with only allowVideos set', async () => {
      mockPayload = {
        id: 'user-1',
        allowVideos: true
        // allowPhotos not set
      };
      (mockRequest as any).files = [
        { mimetype: 'image/jpeg' },
        { mimetype: 'video/mp4' }
      ];

      const result = await verifyUploadPermissions(mockRequest as Request, mockPayload);

      // When payload has id but no spaceId, middleware returns true (bypass logic)
      expect(result).toBe(true);
    });

    it('should handle payload with neither allowPhotos nor allowVideos set', async () => {
      mockPayload = {
        id: 'user-1'
        // neither allowPhotos nor allowVideos set
      };
      (mockRequest as any).files = [
        { mimetype: 'image/jpeg' },
        { mimetype: 'video/mp4' }
      ];

      const result = await verifyUploadPermissions(mockRequest as Request, mockPayload);

      // When payload has id but no spaceId, middleware returns true (bypass logic)
      expect(result).toBe(true);
    });
  });
});
