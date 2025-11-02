# Implementation Notes

This document consolidates technical implementation details, decisions, and fixes applied to this project.

---

## Architecture Overview

### State Machine
Images flow through a robust state machine:
- `AWAITING_UPLOAD` → `VERIFYING` → `PROCESSING` → `ACCEPTED/REJECTED/UPLOAD_FAILED`

### Key Components
- **Frontend**: Next.js 16 with React 19, Tailwind CSS v4
- **Backend**: Next.js API Routes
- **Storage**: Cloudflare R2 (S3-compatible)
- **Database**: PostgreSQL with Prisma ORM
- **Queue**: BullMQ with Redis for async processing
- **Validation**: Sharp for image processing, perceptual hashing for duplicates

---

## BullMQ Implementation

### Queue Setup
```typescript
// workers/index.ts
const queue = new Queue('image-validation', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 }
  }
});
```

### Worker Configuration
- **Concurrency**: 5 jobs processed simultaneously
- **Retry Strategy**: Exponential backoff (2s, 4s, 8s)
- **Job Lifecycle**: Complete → Remove completed jobs after 1 hour
- **Failed Jobs**: Kept for 24 hours for debugging

### Job Processing
1. Image validation (blur, face detection, size)
2. Duplicate detection via perceptual hash
3. Status updates to database
4. Automatic retry on transient failures

---

## Idempotency & Race Conditions

### Problems Fixed

#### 1. Double Processing
**Issue**: Multiple workers could process the same image
**Solution**: Added `verificationAttempts` and `lastVerificationAt` to track processing

#### 2. Status Race Conditions  
**Issue**: Concurrent updates could overwrite each other
**Solution**: Atomic database updates with version checking

#### 3. Presigned URL Reuse
**Issue**: Same presigned URL could be used multiple times
**Solution**: Track expiry and validate one-time use

### Key Patterns

```typescript
// Idempotent job processing
const record = await prisma.image.findUnique({ where: { id } });
if (record.status !== 'VERIFYING') {
  return; // Already processed
}

// Atomic status updates
await prisma.image.update({
  where: { 
    id,
    status: 'VERIFYING' // Only update if still in expected state
  },
  data: { status: 'PROCESSING' }
});
```

---

## Code Quality Improvements

### 1. Separation of Concerns
- **Data**: Moved requirements/restrictions to `/lib/data/`
- **Icons**: Extracted inline SVGs to `/components/icons/`
- **UI Components**: Created reusable components in `/components/ui/`
- **Theme**: Centralized design tokens in `/lib/theme.ts`

### 2. Type Safety
- Explicit TypeScript interfaces for all data structures
- Exported types from data files
- Proper type checking for theme values

### 3. Component Structure
```
components/
  ui/           # Reusable UI primitives
    - Button.tsx
    - ProgressBar.tsx
    - CollapsibleCard.tsx
  icons/        # SVG icon components
  [features]/   # Feature-specific components
lib/
  data/         # Static data & constants
  theme.ts      # Design system
  services/     # Business logic
```

### 4. Best Practices Applied
- ✅ Single responsibility principle
- ✅ DRY (Don't Repeat Yourself)
- ✅ Proper prop drilling vs context
- ✅ Accessibility (ARIA labels, keyboard navigation)
- ✅ Performance (useCallback, proper state management)

---

## Database Schema

### Users Table (Prototype Feature)
```prisma
model User {
  id        String   @id @default(uuid())
  name      String
  email     String   @unique
  avatar    String?
  images    Image[]
}
```

### Images Table
```prisma
model Image {
  id              String      @id @default(uuid())
  userId          String
  user            User        @relation(fields: [userId], references: [id])
  
  // File metadata
  filename        String
  originalName    String
  mimeType        String
  fileSize        Int?
  width           Int?
  height          Int?
  
  // Storage
  r2Key           String      @unique
  r2Url           String?
  
  // State machine
  status          ImageStatus @default(AWAITING_UPLOAD)
  rejectionReasons String[]   @default([])
  
  // Validation results
  phash           String?
  blurScore       Float?
  faceCount       Int?
  faceSize        Float?
  
  // Tracking
  presignedUrlExpiry    DateTime?
  uploadCompletedAt     DateTime?
  verificationAttempts  Int       @default(0)
  lastVerificationAt    DateTime?
  
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  processedAt     DateTime?
}
```

---

## UI/UX Improvements

### Theme System
All design tokens centralized in `/lib/theme.ts`:
- Colors (primary, success, error, neutrals)
- Typography (fonts, sizes, weights)
- Spacing scale
- Border radius
- Shadows
- Layout constraints

### Reusable Components

**Button**
- Variants: gradient-primary, outline, ghost
- Sizes: sm, md, lg
- Full accessibility support

**ProgressBar**
- Configurable colors, height
- Checkpoint markers
- Smooth animations
- ARIA attributes

**CollapsibleCard**
- Expandable/collapsible sections
- Custom icons and backgrounds
- Smooth transitions
- Keyboard accessible

### Accessibility Features
- Proper ARIA labels
- Keyboard navigation
- Focus management
- Screen reader support
- Semantic HTML

---

## Performance Optimizations

1. **Code Splitting**: Components lazy-loaded where appropriate
2. **State Management**: Efficient use of React hooks, minimal re-renders
3. **Database Indexes**: Created on frequently queried columns
4. **Queue Processing**: Concurrent job execution with rate limiting
5. **Image Optimization**: Next.js Image component for static images

---

## Testing Strategy

### Unit Tests
- Image validation functions
- Utility functions
- State machine transitions

### Integration Tests
- API endpoints
- Database operations
- Queue job processing

### Manual Testing Checklist
- [ ] Upload various image formats
- [ ] Test rejection scenarios
- [ ] Verify duplicate detection
- [ ] Test concurrent uploads
- [ ] Check error handling
- [ ] Validate UI responsiveness

---

## Known Limitations

1. **Authentication**: Currently prototype-level user switching
2. **File Size**: 120MB limit per file
3. **Concurrency**: Limited to 5 concurrent validations
4. **Storage**: No CDN in front of R2
5. **Real-time**: Polling-based updates (no WebSockets)

---

## Future Enhancements

### Phase 1: Production-Ready
- [ ] Real authentication (NextAuth.js)
- [ ] WebSocket for real-time updates
- [ ] CDN integration
- [ ] Rate limiting per user
- [ ] Comprehensive error logging

### Phase 2: Advanced Features
- [ ] Batch upload support
- [ ] Image editing tools
- [ ] AI-powered tagging
- [ ] Smart collections
- [ ] Analytics dashboard

### Phase 3: Scale
- [ ] Multi-region deployment
- [ ] Image processing pipeline optimization
- [ ] Advanced caching strategies
- [ ] Monitoring and observability
- [ ] Load testing and optimization

---

## Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run worker          # Start background worker

# Database
npm run db:up           # Start PostgreSQL
npm run migrate         # Run migrations
npm run db:seed         # Seed demo data
npm run db:studio       # Open Prisma Studio

# Testing
npm test                # Run tests
npm run test:watch      # Watch mode
npm run test:coverage   # Coverage report

# Code Quality
npm run lint            # Lint code
npm run format          # Format with Prettier
```

---

## Troubleshooting

### Common Issues

**Images stuck in VERIFYING state**
- Check worker is running: `npm run worker`
- Verify Redis connection
- Check worker logs for errors

**Upload fails immediately**
- Verify R2 credentials in .env
- Check file size < 120MB
- Ensure correct MIME types

**Database connection errors**
- Ensure PostgreSQL is running: `npm run db:up`
- Verify DATABASE_URL in .env
- Run migrations: `npm run migrate`

**Queue not processing**
- Check Redis connection
- Restart worker: `npm run worker`
- Clear failed jobs in Redis

---

## References

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [BullMQ Guide](https://docs.bullmq.io/)
- [Cloudflare R2 Docs](https://developers.cloudflare.com/r2/)
- [Tailwind CSS v4](https://tailwindcss.com/docs)

---

Last Updated: November 2025

