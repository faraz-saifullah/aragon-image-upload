# Aragon.ai Image Upload & Validation Platform

A production-quality image upload and validation platform built for the Aragon.ai technical challenge. Features presigned URL uploads to Cloudflare R2, comprehensive image validation, and a modern React UI.

## 🎯 Project Overview

This application allows users to upload images which are automatically validated against multiple criteria:

- **Format validation**: Only JPEG, PNG, and HEIC formats accepted
- **Size validation**: Minimum file size and resolution requirements
- **Duplicate detection**: Perceptual hash (pHash) comparison
- **Quality checks**: Blur detection using edge analysis
- **Face detection**: Validates single face presence and size (stubbed)

### Key Features

✅ **Presigned URL Upload Flow**: Direct uploads to Cloudflare R2 for scalability  
✅ **Retry Verification Mechanism**: Handles eventual consistency with configurable retries  
✅ **State Machine**: Well-defined image lifecycle with atomic transitions  
✅ **Real-time Updates**: Polling-based status updates with React hooks  
✅ **Comprehensive Validation**: Multiple validation checks with detailed rejection reasons  
✅ **Modern UI**: Clean, responsive interface built with React and Tailwind CSS  
✅ **Type Safety**: Full TypeScript coverage across frontend and backend  
✅ **Database Integrity**: PostgreSQL with Prisma ORM for robust data management

---

## 📋 Architecture

### Flow Diagram

\`\`\`
┌─────────────┐ 1. Request Presigned URL ┌─────────────┐
│ │ ──────────────────────────────> │ │
│ Frontend │ │ Backend │
│ │ <────────────────────────────── │ │
└─────────────┘ 2. Return Presigned URL └─────────────┘
│ │
│ 3. Upload directly to R2 │
├───────────────────────────────────────────────┤
│ │
│ 4. Notify upload complete │
├──────────────────────────────────────────────>│
│ │
│ 5. Verify with Retries
│ 6. Run Validations
│ 7. Update Status
│ │
│ 8. Poll for status updates │
│ <──────────────────────────────────────────── │
\`\`\`

### State Machine

\`\`\`
AWAITING_UPLOAD → VERIFYING → PROCESSING → ACCEPTED
│
└──→ REJECTED
│
└──────────────────────────→ UPLOAD_FAILED
\`\`\`

| State               | Description                              | Next States                       |
| ------------------- | ---------------------------------------- | --------------------------------- |
| \`AWAITING_UPLOAD\` | Presigned URL issued, awaiting upload    | \`VERIFYING\`                     |
| \`VERIFYING\`       | Checking upload completion in R2         | \`PROCESSING\`, \`UPLOAD_FAILED\` |
| \`PROCESSING\`      | Running validation pipeline              | \`ACCEPTED\`, \`REJECTED\`        |
| \`ACCEPTED\`        | All validations passed                   | Final state                       |
| \`REJECTED\`        | One or more validations failed           | Final state                       |
| \`UPLOAD_FAILED\`   | Upload verification failed after retries | Final state                       |

---

## 🚀 Setup Instructions

### Prerequisites

- Node.js 20+ and npm
- Docker and Docker Compose (for PostgreSQL)
- Cloudflare R2 account (or AWS S3-compatible storage)

### 1. Clone and Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 2. Configure Environment Variables

Copy the example environment file and configure your settings:

\`\`\`bash
cp env.example .env
\`\`\`

Edit \`.env\` with your configuration:

\`\`\`env

# Database

DATABASE_URL=postgresql://dev:devpassword@localhost:5432/aragon_dev?schema=public

# Cloudflare R2 Configuration

S3_ENDPOINT=https://<YOUR_ACCOUNT_ID>.r2.cloudflarestorage.com
S3_BUCKET=aragon-uploads
AWS_ACCESS_KEY_ID=<YOUR_ACCESS_KEY>
AWS_SECRET_ACCESS_KEY=<YOUR_SECRET_KEY>
S3_REGION=auto

# Validation Settings

MAX_UPLOAD_SIZE_BYTES=8000000
MIN_WIDTH=400
MIN_HEIGHT=400
MIN_FILE_SIZE_BYTES=51200
PHASH_THRESHOLD=10

# Upload Verification

MAX_VERIFICATION_ATTEMPTS=3
VERIFICATION_RETRY_DELAY_MS=5000
\`\`\`

### 3. Start PostgreSQL

\`\`\`bash
npm run db:up
\`\`\`

### 4. Run Database Migrations

\`\`\`bash
npm run migrate
\`\`\`

### 5. Start Development Server

\`\`\`bash
npm run dev
\`\`\`

The application will be available at [http://localhost:3000](http://localhost:3000)

---

## 🧪 Testing

Run the integration test suite:

\`\`\`bash
npm test
\`\`\`

With coverage:

\`\`\`bash
npm run test:coverage
\`\`\`

---

## 📁 Project Structure

\`\`\`
aragon-image-upload/
├── app/ # Next.js app directory
│ ├── api/ # API routes
│ │ ├── uploads/
│ │ │ ├── sign/route.ts # POST: Generate presigned URL
│ │ │ └── complete/route.ts # POST: Complete upload & trigger validation
│ │ └── images/
│ │ ├── route.ts # GET: Fetch all images
│ │ └── [id]/route.ts # GET: Fetch single image status
│ ├── layout.tsx # Root layout
│ └── page.tsx # Main upload page
├── components/ # React components
│ ├── ImageUploader.tsx # Drag-drop upload component
│ ├── ImageGallery.tsx # Image grid display
│ └── ImageCard.tsx # Individual image card with status
├── lib/
│ ├── services/ # Backend services
│ │ ├── db.ts # Prisma client singleton
│ │ ├── r2Storage.ts # Cloudflare R2 integration
│ │ └── imageValidation.ts # Validation pipeline
│ ├── types/ # TypeScript types
│ │ └── image.ts # Image metadata types
│ └── utils/ # Utilities
│ ├── env.ts # Environment variable handling
│ └── uploadClient.ts # Client-side upload helpers
├── prisma/
│ └── schema.prisma # Database schema
├── **tests**/
│ └── upload-flow.test.ts # Integration tests
└── docker-compose.yml # PostgreSQL service
\`\`\`

---

## 🔧 Technology Stack

### Frontend

- **Next.js 16**: React framework with App Router
- **React 19**: UI library with modern hooks
- **TypeScript**: Type-safe development
- **Tailwind CSS 4**: Utility-first styling

### Backend

- **Next.js API Routes**: Serverless API endpoints
- **Prisma 6**: Type-safe ORM
- **PostgreSQL 14**: Relational database
- **AWS SDK v3**: S3-compatible client for R2

### Image Processing

- **Sharp**: High-performance image manipulation
- **image-hash**: Perceptual hash generation
- **Laplacian variance**: Blur detection (via Sharp stats)

### Testing

- **Jest**: Testing framework
- **ts-jest**: TypeScript support for Jest

---

## 🔐 Security Considerations

1. **Presigned URLs**: Time-limited (5 minutes) to prevent abuse
2. **File Type Validation**: Frontend and backend validation for allowed types
3. **Size Limits**: Enforced at multiple layers (client, API, validation)
4. **SQL Injection**: Protected via Prisma's parameterized queries
5. **CORS**: Configured on R2 bucket for secure cross-origin uploads

---

## 🎨 Design Decisions & Tradeoffs

### 1. Presigned URLs vs Direct Upload

**Choice**: Presigned URLs to Cloudflare R2

**Rationale**:

- Scalability: Frontend uploads directly to storage, reducing backend load
- Performance: No backend streaming or buffering required
- Production-ready: Industry standard for large file uploads
- Cost-effective: Minimizes serverless function execution time

**Tradeoff**: Slightly more complex flow requiring client-side upload logic

### 2. Cloudflare R2 vs MinIO/LocalStack

**Choice**: Cloudflare R2 (real cloud storage)

**Rationale**:

- Production realism: Tests against actual cloud infrastructure
- Durability: 11 9's durability guarantee
- Simplicity: No local S3 emulation setup required
- Cost: R2 has no egress fees

**Tradeoff**: Requires R2 account setup vs purely local development

### 3. Retry Verification Mechanism

**Choice**: 3 retries with 5-second intervals

**Rationale**:

- Handles R2 eventual consistency gracefully
- Balances user experience (fast) with reliability
- Prevents false "upload failed" errors
- Configurable via environment variables

**Tradeoff**: Adds 10-15 seconds to worst-case upload flow

### 4. Polling vs WebSockets

**Choice**: HTTP polling every 2 seconds

**Rationale**:

- Simpler implementation under time constraints
- No WebSocket infrastructure required
- Works with standard HTTP/REST architecture
- Sufficient for real-time feel (<2s latency)

**Tradeoff**: Slightly higher API call volume vs true push updates

### 5. Stubbed Computer Vision Features

**Choice**: Stub blur detection (simplified) and face detection (simulated)

**Rationale**:

- Time constraints prevent full CV integration
- Demonstrates architecture and flow
- Clearly documented for future implementation
- Blur detection uses Sharp's statistical analysis as placeholder

**Implementation Path**:

- Blur: Integrate OpenCV Laplacian variance
- Faces: Integrate AWS Rekognition or Google Vision API

---

## 🔄 Validation Pipeline

### 1. Format Validation

- **Check**: File MIME type is JPEG, PNG, or HEIC
- **Rejection**: \`INVALID_FORMAT\`

### 2. File Size Validation

- **Check**: File size between 50KB and 8MB
- **Rejection**: \`FILE_TOO_SMALL\`

### 3. Resolution Validation

- **Check**: Image dimensions ≥ 400×400px
- **Rejection**: \`RESOLUTION_TOO_LOW\`

### 4. Duplicate Detection

- **Algorithm**: Perceptual hash (pHash) with Hamming distance
- **Threshold**: Hamming distance ≤ 10 (configurable)
- **Rejection**: \`DUPLICATE_IMAGE\`

### 5. Blur Detection (Stub)

- **Algorithm**: Edge variance using Sharp statistics
- **Threshold**: Standard deviation < 10
- **Rejection**: \`IMAGE_TOO_BLURRY\`
- **Note**: STUB - Production should use Laplacian variance

### 6. Face Detection (Stub)

- **Status**: STUBBED with simulated results
- **Expected**: AWS Rekognition or OpenCV integration
- **Rejection**: \`MULTIPLE_FACES\`, \`FACE_TOO_SMALL\`
- **Note**: Currently returns mock data for demonstration

---

## 📊 API Endpoints

### POST /api/uploads/sign

Request presigned URL for upload.

**Request Body**:
\`\`\`json
{
"filename": "photo.jpg",
"contentType": "image/jpeg",
"fileSize": 1024000
}
\`\`\`

**Response**:
\`\`\`json
{
"imageId": "uuid",
"uploadUrl": "https://...",
"r2Key": "uploads/uuid.jpg",
"expiresAt": "2024-01-01T00:05:00Z"
}
\`\`\`

### POST /api/uploads/complete

Notify backend of upload completion.

**Request Body**:
\`\`\`json
{
"imageId": "uuid"
}
\`\`\`

**Response**:
\`\`\`json
{
"imageId": "uuid",
"status": "VERIFYING",
"message": "Upload verification started"
}
\`\`\`

### GET /api/images/:id

Fetch single image status.

**Response**:
\`\`\`json
{
"id": "uuid",
"status": "ACCEPTED",
"filename": "uuid.jpg",
"originalName": "photo.jpg",
"width": 1920,
"height": 1080,
"rejectionReasons": [],
...
}
\`\`\`

### GET /api/images

Fetch all images (optional status filter).

**Query Parameters**:

- \`status\` (optional): Filter by image status

---

## 🔨 Reused Configuration

The following configuration files were reused from \`aragon-todo-app/\`:

- \`docker-compose.yml\`: PostgreSQL service configuration
- \`.prettierrc\`: Code formatting rules
- \`.prettierignore\`: Prettier ignore patterns
- \`jest.config.js\`: Jest testing configuration
- \`jest.setup.js\`: Jest test environment setup
- \`prisma.config.ts\`: Prisma configuration
- \`postcss.config.mjs\`: PostCSS and Tailwind configuration

All configurations were adapted to fit the image upload platform's requirements.

---

## 📝 Known Limitations & Future Improvements

### Current Limitations

1. **Face Detection**: Stubbed with simulated results
   - **Improvement**: Integrate AWS Rekognition or OpenCV

2. **Blur Detection**: Simplified statistical approach
   - **Improvement**: Implement Laplacian variance algorithm

3. **Status Updates**: HTTP polling
   - **Improvement**: Replace with Server-Sent Events or WebSockets

4. **HEIC Conversion**: Done during validation
   - **Improvement**: Convert during upload for consistency

5. **Image Previews**: Not generating R2 public URLs
   - **Improvement**: Configure R2 public bucket or presigned GET URLs

### Future Enhancements

- Batch upload with progress aggregation
- Image cropping and editing tools
- Advanced duplicate detection (visual similarity AI)
- Export accepted images as ZIP
- Admin dashboard for manual review
- Rate limiting on API endpoints
- CDN integration for accepted images

---

## 📄 License

This project was created for the Aragon.ai technical challenge.

---

## 📞 Contact

For questions or issues, please contact the development team.
