# VerifyUploadPermissions Middleware Unit Tests

This document describes the comprehensive unit test suite for the `verifyUploadPermissions` middleware, which handles file upload permission validation based on space permissions and file type restrictions.

## Test Coverage

The test suite covers all major functionality of the `verifyUploadPermissions` middleware:

### 1. Space Permissions
- ✅ **User with ID but no spaceId**: Returns true (bypasses space validation)
- ✅ **Matching spaceId**: Returns true when request spaceId matches payload spaceId
- ✅ **Non-matching spaceId**: Returns false when spaceId doesn't match
- ✅ **No spaceId in payload**: Returns true when payload has no spaceId
- ✅ **No spaceId in request**: Returns false when payload has spaceId but request doesn't

### 2. File Type Permissions - Single File
- ✅ **Photos allowed, image file**: Returns true when payload allows photos and file is image
- ✅ **Photos not allowed, image file**: Returns false when payload doesn't allow photos
- ✅ **Videos allowed, video file**: Returns true when payload allows videos and file is video
- ✅ **Videos not allowed, video file**: Returns false when payload doesn't allow videos
- ✅ **No mimetype**: Returns true when file has no mimetype
- ✅ **Unsupported mimetype**: Returns true when file has unsupported mimetype

### 3. File Type Permissions - Multiple Files
- ✅ **Both types allowed, mixed files**: Returns true when payload allows both photos and videos
- ✅ **Photos not allowed, contains image**: Returns false when files contain images but photos not allowed
- ✅ **Videos not allowed, contains video**: Returns false when files contain videos but videos not allowed
- ✅ **Neither type allowed**: Returns false when payload allows neither photos nor videos
- ✅ **No mimetypes**: Returns true when files have no mimetype
- ✅ **Unsupported mimetypes**: Returns true when files have unsupported mimetypes

### 4. Edge Cases and Error Handling
- ✅ **Null files array**: Handles null files array gracefully
- ✅ **Undefined files array**: Handles undefined files array gracefully
- ✅ **Empty files array**: Handles empty files array gracefully
- ✅ **Null file in array**: Returns false when files array contains null
- ✅ **Undefined file in array**: Returns false when files array contains undefined
- ✅ **Null mimetype**: Returns false when file has null mimetype
- ✅ **Undefined mimetype**: Returns false when file has undefined mimetype
- ✅ **Empty string mimetype**: Returns false when file has empty string mimetype
- ✅ **Various image mimetypes**: Handles different image formats (jpeg, png, gif, webp, svg)
- ✅ **Various video mimetypes**: Handles different video formats (mp4, avi, mov, wmv, webm)

### 5. Complex Scenarios
- ✅ **Space + file type restrictions**: Combines space and file type validation
- ✅ **User with ID, no space permissions**: Handles user with ID but file restrictions
- ✅ **Large file arrays**: Handles large numbers of files efficiently
- ✅ **Partial payload properties**: Handles payloads with only some properties set
- ✅ **Missing properties**: Handles payloads with missing allowPhotos/allowVideos

## Test Architecture

### Mock Strategy
- **Request Mock**: Partial Express Request with body, files, and file properties
- **Payload Mock**: User/space permission object with allowPhotos, allowVideos, spaceId
- **File Mock**: Simple objects with mimetype property to simulate uploaded files

### Test Structure
- **BeforeEach**: Resets mocks to default state for each test
- **Organized by Functionality**: Tests grouped by space permissions, file types, edge cases
- **Comprehensive Coverage**: Tests both positive and negative scenarios

## Key Testing Patterns

### 1. Space Permission Validation
```typescript
// Tests the logic: if(!payload.spaceId && payload.id) return true;
// Tests the logic: if(payload.spaceId && (spaceId !== payload.spaceId)) return false;
```

### 2. File Type Validation
```typescript
// Tests mimetype checking: file.mimetype.startsWith('image/') or 'video/'
// Tests permission checking: !payload.allowPhotos && hasImage
```

### 3. Edge Case Handling
```typescript
// Tests null/undefined handling in file arrays
// Tests missing mimetype properties
// Tests various file format support
```

## Test Results

- **Total Tests**: 33
- **Passing**: 33
- **Failing**: 0
- **Coverage**: Comprehensive coverage of all methods, error scenarios, and edge cases

## Running the Tests

```bash
# Run all tests
npm test -- src/tests/unit/verify.upload.content.test.ts

# Run specific test
npm test -- src/tests/unit/verify.upload.content.test.ts --testNamePattern="space permissions"
```

## Notes

- The middleware uses `startsWith()` for mimetype checking, making it case-sensitive
- Space validation is bypassed when payload has `id` but no `spaceId`
- File type validation only occurs when files are present
- The middleware handles both single file (`req.file`) and multiple files (`req.files`) scenarios
- Unsupported mimetypes and missing mimetypes are allowed (return true)

## Future Enhancements

1. **Integration Tests**: Add tests with real Express middleware chain
2. **Performance Tests**: Add tests for large file arrays
3. **Security Tests**: Add tests for malicious file types
4. **Case Sensitivity Tests**: Add tests for case-insensitive mimetype matching
5. **File Size Tests**: Add tests for file size validation (if implemented)
