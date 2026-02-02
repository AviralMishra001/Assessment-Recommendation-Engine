# AI-Powered Assessment Recommendation Engine - Design Document

## 1. High-Level Architecture

### 1.1 System Overview
The AI-Powered Assessment Recommendation Engine follows a modern web application architecture with a Next.js full-stack approach, combining frontend and backend capabilities in a single framework.

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Browser                           │
├─────────────────────────────────────────────────────────────┤
│                 Next.js Frontend                            │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐   │
│  │   UI Layer  │ │ State Mgmt  │ │   Client Utils      │   │
│  │ Components  │ │ (React)     │ │ (Validation, etc.)  │   │
│  └─────────────┘ └─────────────┘ └─────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                 Next.js API Routes                          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐   │
│  │ Recommend   │ │ Data Proc   │ │   NLP Pipeline      │   │
│  │ Endpoint    │ │ Middleware  │ │ (Embeddings, etc.)  │   │
│  └─────────────┘ └─────────────┘ └─────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                   Data Layer                                │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐   │
│  │ CSV Dataset │ │ Vector Store│ │   Cache Layer       │   │
│  │ (SHL Data)  │ │ (In-Memory) │ │ (Redis/Memory)      │   │
│  └─────────────┘ └─────────────┘ └─────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Technology Stack
- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js runtime
- **NLP Processing**: sentence-transformers (via Python bridge), OpenAI API
- **Data Storage**: CSV files, In-memory vector store
- **Caching**: Node.js memory cache or Redis
- **Deployment**: Vercel or similar serverless platform

## 2. Component Descriptions

### 2.1 Frontend Components

#### 2.1.1 Core UI Components
```typescript
// Main application layout
AppLayout: {
  - Header with branding
  - Main content area
  - Footer with links
}

// Job description input interface
JobInputForm: {
  - Text area for job description
  - LinkedIn URL input field
  - Submit button with loading states
  - Input validation and error display
}

// Results display components
RecommendationGrid: {
  - Grid layout for assessment cards
  - Sorting and filtering controls
  - Loading skeletons
}

AssessmentCard: {
  - Assessment title and description
  - Relevance score indicator
  - Skill tags
  - Duration and difficulty info
  - Click handler for detailed view
}

AssessmentModal: {
  - Detailed assessment information
  - Full description and requirements
  - Related assessments
  - Action buttons
}
```

#### 2.1.2 State Management
```typescript
// Global application state
interface AppState {
  jobDescription: string;
  linkedinUrl: string;
  recommendations: Assessment[];
  loading: boolean;
  error: string | null;
  filters: FilterState;
}

// Recommendation filters
interface FilterState {
  skillCategories: string[];
  difficultyLevels: string[];
  duration: DurationRange;
  sortBy: 'relevance' | 'duration' | 'difficulty';
}
```

### 2.2 Backend Components

#### 2.2.1 API Route Structure
```
/api/
├── recommend/
│   └── route.ts          # Main recommendation endpoint
├── assessments/
│   ├── route.ts          # Get all assessments
│   └── [id]/route.ts     # Get specific assessment
├── health/
│   └── route.ts          # Health check endpoint
└── linkedin/
    └── extract/route.ts  # LinkedIn URL processing
```

#### 2.2.2 Core Services
```typescript
// NLP Processing Service
class NLPService {
  generateEmbeddings(text: string): Promise<number[]>
  extractSkills(jobDescription: string): Promise<string[]>
  calculateSimilarity(embedding1: number[], embedding2: number[]): number
}

// Assessment Service
class AssessmentService {
  loadAssessments(): Promise<Assessment[]>
  searchByEmbedding(embedding: number[], limit: number): Assessment[]
  filterAssessments(assessments: Assessment[], filters: FilterState): Assessment[]
}

// Recommendation Engine
class RecommendationEngine {
  generateRecommendations(jobDescription: string): Promise<Recommendation[]>
  rerankWithLLM(assessments: Assessment[], jobDescription: string): Promise<Assessment[]>
}
```

## 3. Data Flow

### 3.1 User Interaction Flow
```
1. User Input
   ├── Job Description Text → Validation → Processing
   └── LinkedIn URL → URL Extraction → Job Description Text

2. Processing Pipeline
   Job Description → NLP Analysis → Embedding Generation → Vector Search
   
3. Recommendation Generation
   Vector Results → LLM Reranking → Confidence Scoring → Response

4. UI Update
   API Response → State Update → Component Re-render → User Display
```

### 3.2 Detailed Data Flow Diagram
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   User      │───▶│  Frontend   │───▶│ API Route   │
│   Input     │    │ Validation  │    │ /recommend  │
└─────────────┘    └─────────────┘    └─────────────┘
                                              │
                                              ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ NLP Service │◀───│ Job Desc    │◀───│ Input       │
│ Embeddings  │    │ Processing  │    │ Sanitization│
└─────────────┘    └─────────────┘    └─────────────┘
       │
       ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Vector      │───▶│ Similarity  │───▶│ Initial     │
│ Search      │    │ Calculation │    │ Results     │
└─────────────┘    └─────────────┘    └─────────────┘
                                              │
                                              ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Final       │◀───│ LLM         │◀───│ Candidate   │
│ Response    │    │ Reranking   │    │ Assessments │
└─────────────┘    └─────────────┘    └─────────────┘
```

## 4. API Design

### 4.1 REST API Endpoints

#### 4.1.1 Recommendation Endpoint
```typescript
POST /api/recommend
Content-Type: application/json

Request Body:
{
  "jobDescription": string,
  "linkedinUrl"?: string,
  "filters"?: {
    "maxResults": number,
    "skillCategories": string[],
    "difficultyLevels": string[]
  }
}

Response:
{
  "success": boolean,
  "data": {
    "recommendations": [
      {
        "assessmentId": string,
        "title": string,
        "description": string,
        "relevanceScore": number,
        "skillCategories": string[],
        "duration": number,
        "difficultyLevel": string,
        "competencies": string[]
      }
    ],
    "processingTime": number,
    "totalFound": number
  },
  "error"?: string
}
```

#### 4.1.2 Assessment Details Endpoint
```typescript
GET /api/assessments/[id]

Response:
{
  "success": boolean,
  "data": {
    "assessment": {
      "id": string,
      "title": string,
      "fullDescription": string,
      "skillCategories": string[],
      "competencies": string[],
      "duration": number,
      "difficultyLevel": string,
      "prerequisites": string[],
      "targetRoles": string[],
      "sampleQuestions": string[]
    }
  }
}
```

#### 4.1.3 LinkedIn Extraction Endpoint
```typescript
POST /api/linkedin/extract
Content-Type: application/json

Request Body:
{
  "url": string
}

Response:
{
  "success": boolean,
  "data": {
    "jobDescription": string,
    "jobTitle": string,
    "company": string,
    "location": string
  },
  "error"?: string
}
```

### 4.2 Error Handling
```typescript
// Standardized error response format
interface APIError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

// Common error codes
enum ErrorCodes {
  INVALID_INPUT = "INVALID_INPUT",
  PROCESSING_ERROR = "PROCESSING_ERROR",
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
  EXTERNAL_API_ERROR = "EXTERNAL_API_ERROR",
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR"
}
```

## 5. Embedding & Similarity Matching Design

### 5.1 Embedding Generation Strategy
```typescript
// Embedding configuration
const EMBEDDING_CONFIG = {
  model: "sentence-transformers/all-MiniLM-L6-v2",
  dimensions: 384,
  maxTokens: 512,
  batchSize: 32
};

// Text preprocessing pipeline
class TextPreprocessor {
  cleanText(text: string): string {
    // Remove HTML tags, special characters
    // Normalize whitespace
    // Convert to lowercase
    // Remove stop words (optional)
  }
  
  extractKeyPhrases(text: string): string[] {
    // Extract important phrases and skills
    // Use NER for skill identification
    // Return weighted key phrases
  }
}
```

### 5.2 Vector Storage and Search
```typescript
// In-memory vector store implementation
class VectorStore {
  private vectors: Map<string, number[]> = new Map();
  private metadata: Map<string, Assessment> = new Map();
  
  addVector(id: string, vector: number[], metadata: Assessment): void
  
  searchSimilar(queryVector: number[], topK: number): SearchResult[] {
    // Calculate cosine similarity for all vectors
    // Return top K results with scores
  }
  
  private cosineSimilarity(a: number[], b: number[]): number {
    // Implement cosine similarity calculation
  }
}

// Search result structure
interface SearchResult {
  id: string;
  score: number;
  assessment: Assessment;
}
```

### 5.3 Similarity Matching Algorithm
```typescript
class SimilarityMatcher {
  async findSimilarAssessments(
    jobDescription: string,
    options: SearchOptions
  ): Promise<SearchResult[]> {
    
    // 1. Generate embedding for job description
    const queryEmbedding = await this.nlpService.generateEmbeddings(jobDescription);
    
    // 2. Perform vector search
    const vectorResults = this.vectorStore.searchSimilar(
      queryEmbedding, 
      options.maxResults * 2 // Get more for reranking
    );
    
    // 3. Apply filters
    const filteredResults = this.applyFilters(vectorResults, options.filters);
    
    // 4. LLM reranking (optional)
    if (options.enableLLMReranking) {
      return await this.rerankWithLLM(filteredResults, jobDescription);
    }
    
    return filteredResults.slice(0, options.maxResults);
  }
}
```

## 6. Data Storage Design

### 6.1 CSV Data Structure
```csv
assessment_id,title,description,skill_categories,competencies,duration_minutes,difficulty_level,target_roles,prerequisites
SHL001,"Numerical Reasoning","Assesses ability to work with numerical data...","Analytical,Mathematical","Data Analysis,Problem Solving",45,"Intermediate","Data Analyst,Financial Analyst",""
SHL002,"Verbal Reasoning","Evaluates comprehension and reasoning...","Verbal,Communication","Reading Comprehension,Critical Thinking",30,"Beginner","All Roles",""
```

### 6.2 Data Loading and Caching Strategy
```typescript
// Assessment data loader
class AssessmentDataLoader {
  private cache: Map<string, Assessment> = new Map();
  private lastLoaded: Date | null = null;
  private readonly CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
  
  async loadAssessments(): Promise<Assessment[]> {
    if (this.shouldReload()) {
      await this.reloadFromCSV();
    }
    return Array.from(this.cache.values());
  }
  
  private async reloadFromCSV(): Promise<void> {
    // Read CSV file
    // Parse and validate data
    // Generate embeddings for new assessments
    // Update cache
  }
}

// Assessment data model
interface Assessment {
  id: string;
  title: string;
  description: string;
  skillCategories: string[];
  competencies: string[];
  duration: number;
  difficultyLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  targetRoles: string[];
  prerequisites: string[];
  embedding?: number[]; // Cached embedding vector
}
```

### 6.3 Embedding Storage Strategy
```typescript
// Embedding cache management
class EmbeddingCache {
  private embeddings: Map<string, CachedEmbedding> = new Map();
  
  async getOrGenerateEmbedding(text: string): Promise<number[]> {
    const hash = this.hashText(text);
    
    if (this.embeddings.has(hash)) {
      const cached = this.embeddings.get(hash)!;
      if (!this.isExpired(cached)) {
        return cached.vector;
      }
    }
    
    // Generate new embedding
    const vector = await this.nlpService.generateEmbeddings(text);
    this.embeddings.set(hash, {
      vector,
      timestamp: new Date(),
      text: text.substring(0, 100) // Store snippet for debugging
    });
    
    return vector;
  }
}

interface CachedEmbedding {
  vector: number[];
  timestamp: Date;
  text: string;
}
```

## 7. Security Considerations

### 7.1 Input Validation and Sanitization
```typescript
// Input validation schemas
const JobDescriptionSchema = z.object({
  jobDescription: z.string()
    .min(50, "Job description too short")
    .max(10000, "Job description too long")
    .refine(text => !containsMaliciousContent(text), "Invalid content"),
  
  linkedinUrl: z.string()
    .url()
    .refine(url => isValidLinkedInUrl(url), "Invalid LinkedIn URL")
    .optional()
});

// Content sanitization
class ContentSanitizer {
  sanitizeJobDescription(text: string): string {
    // Remove HTML tags
    // Escape special characters
    // Remove potentially malicious content
    // Normalize whitespace
    return sanitized;
  }
  
  validateLinkedInUrl(url: string): boolean {
    // Check domain whitelist
    // Validate URL structure
    // Check for suspicious parameters
    return isValid;
  }
}
```

### 7.2 Rate Limiting and Abuse Prevention
```typescript
// Rate limiting implementation
class RateLimiter {
  private requests: Map<string, RequestLog[]> = new Map();
  
  async checkRateLimit(clientId: string): Promise<boolean> {
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute window
    const maxRequests = 10; // Max 10 requests per minute
    
    const clientRequests = this.requests.get(clientId) || [];
    const recentRequests = clientRequests.filter(
      req => now - req.timestamp < windowMs
    );
    
    if (recentRequests.length >= maxRequests) {
      return false; // Rate limit exceeded
    }
    
    recentRequests.push({ timestamp: now });
    this.requests.set(clientId, recentRequests);
    return true;
  }
}
```

### 7.3 Data Privacy and Protection
```typescript
// Data privacy measures
class PrivacyManager {
  // Don't store job descriptions permanently
  processJobDescription(jobDesc: string): ProcessedData {
    // Process immediately
    // Generate embeddings
    // Return results
    // Clear sensitive data from memory
  }
  
  // Anonymize logs
  createAuditLog(request: any): AuditLog {
    return {
      timestamp: new Date(),
      endpoint: request.url,
      method: request.method,
      userAgent: this.hashUserAgent(request.headers['user-agent']),
      ipHash: this.hashIP(request.ip),
      // Don't log actual job description content
      contentLength: request.body?.jobDescription?.length || 0
    };
  }
}
```

## 8. Scalability Considerations

### 8.1 Performance Optimization
```typescript
// Caching strategy
class PerformanceOptimizer {
  // Cache frequently requested assessments
  private assessmentCache = new LRUCache<string, Assessment[]>({
    max: 1000,
    ttl: 1000 * 60 * 30 // 30 minutes
  });
  
  // Cache embedding results
  private embeddingCache = new LRUCache<string, number[]>({
    max: 5000,
    ttl: 1000 * 60 * 60 * 24 // 24 hours
  });
  
  // Batch processing for multiple requests
  async batchProcessRequests(requests: JobRequest[]): Promise<BatchResult[]> {
    // Group similar requests
    // Process embeddings in batches
    // Return individual results
  }
}
```

### 8.2 Horizontal Scaling Strategy
```typescript
// Stateless design for easy scaling
class ScalableRecommendationService {
  // All state stored in external systems
  // No server-side sessions
  // Stateless API endpoints
  
  async processRecommendation(request: RecommendationRequest): Promise<RecommendationResponse> {
    // Load data from external source
    // Process request independently
    // Return results without storing state
  }
}

// Load balancing considerations
const SCALING_CONFIG = {
  // Use CDN for static assets
  cdnEnabled: true,
  
  // Database connection pooling
  maxConnections: 100,
  
  // Memory usage limits
  maxMemoryUsage: '512MB',
  
  // Request timeout
  requestTimeout: 30000, // 30 seconds
  
  // Auto-scaling triggers
  cpuThreshold: 70,
  memoryThreshold: 80
};
```

### 8.3 Database Scaling (Future)
```typescript
// Future database implementation
interface DatabaseScalingStrategy {
  // Read replicas for assessment data
  readReplicas: DatabaseConnection[];
  
  // Vector database for embeddings
  vectorDB: VectorDatabase;
  
  // Caching layer
  redis: RedisConnection;
  
  // Sharding strategy for large datasets
  shardingKey: 'assessment_category' | 'skill_type';
}
```

## 9. Future Enhancements

### 9.1 Advanced NLP Features
```typescript
// Enhanced NLP pipeline
class AdvancedNLPService {
  // Multi-language support
  async detectLanguage(text: string): Promise<string>
  async translateToEnglish(text: string, sourceLanguage: string): Promise<string>
  
  // Named Entity Recognition for skills
  async extractSkillEntities(text: string): Promise<SkillEntity[]>
  
  // Sentiment analysis for job requirements
  async analyzeSentiment(text: string): Promise<SentimentScore>
  
  // Industry classification
  async classifyIndustry(jobDescription: string): Promise<IndustryCategory>
}

interface SkillEntity {
  skill: string;
  confidence: number;
  category: string;
  importance: number;
}
```

### 9.2 Machine Learning Improvements
```typescript
// Feedback learning system
class FeedbackLearningSystem {
  // Collect user feedback on recommendations
  async recordFeedback(
    jobDescriptionId: string,
    assessmentId: string,
    feedback: UserFeedback
  ): Promise<void>
  
  // Retrain models based on feedback
  async retrainModel(): Promise<void>
  
  // A/B testing for different algorithms
  async runABTest(
    userId: string,
    algorithms: RecommendationAlgorithm[]
  ): Promise<RecommendationResult>
}

// Personalization features
class PersonalizationEngine {
  // Company-specific recommendations
  async getCompanyProfile(companyId: string): Promise<CompanyProfile>
  
  // Role-based customization
  async customizeForRole(
    recommendations: Assessment[],
    userRole: UserRole
  ): Promise<Assessment[]>
}
```

### 9.3 Integration Capabilities
```typescript
// External system integrations
class IntegrationManager {
  // ATS (Applicant Tracking System) integration
  async integrateWithATS(atsProvider: string, config: ATSConfig): Promise<void>
  
  // HRIS integration
  async syncWithHRIS(hrisData: HRISData): Promise<void>
  
  // Assessment platform APIs
  async scheduleAssessment(
    candidateId: string,
    assessmentId: string
  ): Promise<ScheduleResult>
  
  // Reporting and analytics
  async generateAnalyticsReport(
    timeRange: DateRange,
    filters: AnalyticsFilters
  ): Promise<AnalyticsReport>
}
```

### 9.4 Advanced UI Features
```typescript
// Enhanced user interface
class AdvancedUIFeatures {
  // Drag-and-drop job description upload
  handleFileUpload(file: File): Promise<string>
  
  // Real-time collaboration
  enableRealTimeSharing(sessionId: string): Promise<void>
  
  // Assessment comparison tools
  compareAssessments(assessmentIds: string[]): Promise<ComparisonResult>
  
  // Custom assessment builder suggestions
  suggestCustomAssessment(requirements: CustomRequirements): Promise<AssessmentTemplate>
  
  // Mobile app support
  optimizeForMobile(): Promise<void>
}
```

## 10. Monitoring and Analytics

### 10.1 Performance Monitoring
```typescript
// Application monitoring
class MonitoringService {
  // Track API response times
  trackResponseTime(endpoint: string, duration: number): void
  
  // Monitor error rates
  trackError(error: Error, context: ErrorContext): void
  
  // Track user engagement
  trackUserAction(action: UserAction, metadata: ActionMetadata): void
  
  // System health checks
  async performHealthCheck(): Promise<HealthStatus>
}

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  services: {
    api: ServiceStatus;
    nlp: ServiceStatus;
    database: ServiceStatus;
    cache: ServiceStatus;
  };
  timestamp: Date;
}
```

### 10.2 Business Analytics
```typescript
// Business intelligence
class BusinessAnalytics {
  // Recommendation accuracy tracking
  async calculateAccuracyMetrics(): Promise<AccuracyMetrics>
  
  // User behavior analysis
  async analyzeUserBehavior(timeRange: DateRange): Promise<BehaviorReport>
  
  // Assessment popularity tracking
  async getPopularAssessments(): Promise<PopularityReport>
  
  // ROI calculations
  async calculateROI(): Promise<ROIMetrics>
}
```

This design document provides a comprehensive blueprint for implementing the AI-Powered Assessment Recommendation Engine with scalability, security, and future growth in mind.
