# Cloudinary Setup Guide

This guide will help you set up Cloudinary for asset management in the ATOME backend.

## Prerequisites

1. A Cloudinary account (sign up at [cloudinary.com](https://cloudinary.com))
2. Node.js and npm installed
3. Access to your backend environment variables

## Step 1: Create a Cloudinary Account

1. Go to [cloudinary.com](https://cloudinary.com) and sign up for a free account
2. Verify your email address
3. Log in to your Cloudinary dashboard

## Step 2: Get Your Cloudinary Credentials

1. In your Cloudinary dashboard, go to the "Dashboard" section
2. Copy the following values:
   - **Cloud Name**: Found in the "Account Details" section
   - **API Key**: Found in the "Account Details" section
   - **API Secret**: Found in the "Account Details" section (click "Show" to reveal)

## Step 3: Set Up Environment Variables

Create a `.env` file in your backend directory (if it doesn't exist) and add the following variables:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
CLOUDINARY_FOLDER=atome-assets
CLOUDINARY_UPLOAD_PRESET=atome-upload-preset

# File Upload Configuration
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp,image/svg+xml
```

Replace the placeholder values with your actual Cloudinary credentials.

## Step 4: Install Dependencies

Run the following command in your backend directory:

```bash
npm install
```

This will install the required dependencies including:
- `cloudinary` - Cloudinary SDK
- `multer` - File upload middleware

## Step 5: Set Up Upload Preset (Optional but Recommended)

1. In your Cloudinary dashboard, go to "Settings" > "Upload"
2. Click "Add upload preset"
3. Configure the preset:
   - **Preset name**: `atome-upload-preset`
   - **Signing Mode**: Unsigned (for easier client-side uploads)
   - **Folder**: `atome-assets`
   - **Resource Type**: Auto
   - **Quality**: Auto
   - **Format**: Auto
4. Save the preset

## Step 6: Test the Setup

1. Start your backend server:
   ```bash
   npm run dev
   ```

2. Test the assets health endpoint:
   ```bash
   curl http://localhost:5000/api/assets/health
   ```

   You should get a response indicating that Cloudinary is configured.

## API Endpoints

Once set up, you can use the following endpoints:

### Upload Single File
```bash
POST /api/assets/upload
Content-Type: multipart/form-data

# Form data:
# file: [file]
# folder: (optional) custom folder
# public_id: (optional) custom public ID
# tags: (optional) comma-separated tags
```

### Upload Multiple Files
```bash
POST /api/assets/upload-multiple
Content-Type: multipart/form-data

# Form data:
# files: [file1, file2, ...]
# folder: (optional) custom folder
# public_ids: (optional) comma-separated public IDs
# tags: (optional) comma-separated tags
```

### Delete File
```bash
DELETE /api/assets/:publicId
```

### Get Optimized Image URL
```bash
GET /api/assets/optimize/:publicId?width=300&height=200&quality=auto&format=auto
```

### Get Asset Info
```bash
GET /api/assets/info/:publicId
```

## File Upload Limits

- **Maximum file size**: 10MB (configurable via `MAX_FILE_SIZE` env var)
- **Allowed file types**: JPEG, PNG, GIF, WebP, SVG (configurable via `ALLOWED_FILE_TYPES` env var)
- **Maximum files per request**: 5 files

## Security Notes

1. **Authentication**: All asset endpoints require authentication
2. **File validation**: Files are validated by type and size
3. **Rate limiting**: Upload endpoints are subject to rate limiting
4. **CORS**: Configure CORS settings for your frontend domain

## Troubleshooting

### Common Issues

1. **"Cloudinary not configured" error**
   - Check that all Cloudinary environment variables are set
   - Verify the credentials are correct

2. **"File type not allowed" error**
   - Check the `ALLOWED_FILE_TYPES` environment variable
   - Ensure the file MIME type is in the allowed list

3. **"File too large" error**
   - Check the `MAX_FILE_SIZE` environment variable
   - The default limit is 10MB

4. **Upload fails**
   - Check your Cloudinary account limits
   - Verify your API credentials
   - Check the Cloudinary dashboard for any errors

### Testing with cURL

```bash
# Test single file upload
curl -X POST \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/your/image.jpg" \
  -F "folder=test-uploads" \
  -F "tags=test,upload" \
  http://localhost:5000/api/assets/upload

# Test multiple file upload
curl -X POST \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "files=@/path/to/image1.jpg" \
  -F "files=@/path/to/image2.jpg" \
  -F "folder=test-uploads" \
  http://localhost:5000/api/assets/upload-multiple
```

## Production Considerations

1. **Environment Variables**: Use secure environment variable management
2. **Rate Limiting**: Adjust rate limits for production use
3. **File Size Limits**: Consider your Cloudinary plan limits
4. **Monitoring**: Set up monitoring for upload success/failure rates
5. **Backup**: Consider implementing backup strategies for critical assets

## Support

For issues related to:
- **Cloudinary**: Check [Cloudinary documentation](https://cloudinary.com/documentation)
- **Backend integration**: Check the ATOME backend documentation
- **File uploads**: Check the multer documentation
