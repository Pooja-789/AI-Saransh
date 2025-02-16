// Development environment
export const environment = {   
  // API Endpoints
  ollamaApiGenerateUrl: 'http://172.18.104.23:11434/api/generate',
  ollamaBaseUrl: 'http://172.18.104.23:11434',
  qdrantBaseUrl: 'http://172.18.104.23:6333',
  
  // Ollama Model Configuration
  ollamaModel: 'phi3',
  modelOptions: {
    num_ctx: 4096,
    num_predict: 2048,
    temperature: 0.1,
    top_k: 10,
    top_p: 0.9,
    wait_for_model: true
  },

  // Qdrant Configuration
  qdrantCollection: 'leave_policy_test',
  vectorSize: 3072,
  similarityThreshold: 0.7,
  maxResults: 25,

  // File Upload Configuration
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedFileTypes: ['.pdf'],
  maxFilesCount: 10,
  uploadDir : '/apps/ask-hr/uploads',

  // UI Constants
  defaultTitle: 'Where should we start?',
  footerText: 'Opteamix HR Policy',
  loadingText: 'Loading...',
  placeholderText: 'Ask HR',

  // Error Messages
  errors: {
    qdrantConnection: 'Failed to initialize Qdrant connection. Please ensure Qdrant is running.',
    ollamaConnection: 'Could not connect to Ollama server. Please ensure it is running.',
    fileUpload: 'Error uploading file. Please try again.',
    invalidFileType: 'Invalid file type. Only PDF files are allowed.',
    noRelevantInfo: 'I couldn\'t find relevant information to answer your question.',
    generalError: 'An error occurred. Please try again.'
  },

  port:8000
}; 