// import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.dev';
import { promises as fs } from 'fs';
// import pdf from 'pdf-parse';
import { QdrantClient } from '@qdrant/js-client-rest';
import { v4 as uuidv4 } from 'uuid';
const pdf = require('pdf-parse');

export class FileParseService {
  private qdrant: QdrantClient;
  private readonly collectionName = environment.qdrantCollection;
  private readonly vectorSize = environment.vectorSize;
  documentChunks: any[] = [];

  constructor() {
    this.qdrant = new QdrantClient({
      url: environment.qdrantBaseUrl,
    });
    this.initializeQdrant();
  }
  private async initializeQdrant() {
    try {
      // Check if collection exists
      const collections = await this.qdrant.getCollections();
      const exists = collections.collections.some(
        (c) => c.name === this.collectionName
      );

      if (!exists) {
        await this.qdrant.createCollection(this.collectionName, {
          vectors: {
            size: this.vectorSize,
            distance: 'Cosine',
          },
        });
        console.log('Qdrant collection initialized');
      } else {
        await this.qdrant.deleteCollection(this.collectionName);
        await this.qdrant.createCollection(this.collectionName, {
          vectors: {
            size: this.vectorSize,
            distance: 'Cosine',
          },
        });
        console.log('Collection recreated with correct dimensions');
      }
    } catch (error) {
      console.error('Error initializing Qdrant:', error);
      throw error;
    }
  }
  public async loadPdfContent(filePath: string) {
    try {
      console.log('Loading PDF from:', filePath);

      const dataBuffer = await fs.readFile(filePath);
      console.log('Data Buffer', dataBuffer);
      const pdfData = await pdf(Buffer.from(dataBuffer));

      console.log('PDF Data', pdfData);

      const chunks = this.splitIntoChunks(pdfData.text);
      console.log('chunks', chunks);
      this.documentChunks = [...this.documentChunks, ...chunks];
      console.log('PDF processed into', chunks.length, 'chunks');
      console.log('Printing the chunks ' + chunks);
      await this.indexChunks(this.documentChunks, filePath);

      return chunks.toString();
    } catch (error) {
      console.error('Error loading PDF:', error);
      return 'Error Message';
    }
  }
  public splitIntoChunks(text: any, chunkSize = 500) {
    const chunks = [];
    const sentences = text.split(/[.!?]\s+/);
    let currentChunk = '';

    for (const sentence of sentences) {
      if ((currentChunk + sentence).length > chunkSize && currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = sentence;
      } else {
        currentChunk += (currentChunk ? ' ' : '') + sentence;
      }
    }
    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }
    return chunks;
  }
  private async indexChunks(chunks: string[], source: string) {
    console.log('Inside the Index Chunks');
    try {
      const points = [];
      for (const chunk of chunks) {
        try {
          const embedding = await this.generateEmbedding(chunk);
          if (embedding && embedding.length > 0) {
            points.push({
              id: uuidv4(),
              vector: embedding,
              payload: {
                text: chunk,
                source: source,
                timestamp: new Date().toISOString(),
              },
            });
          }
        } catch (embedError) {
          console.error('Error generating embedding for chunk:', embedError);
        }
      }

      if (points.length > 0) {
        await this.qdrant.upsert(this.collectionName, {
          wait: true,
          points: points,
        });
        console.log(`Successfully indexed ${points.length} chunks`);
      }
      console.log('Ended the Index Chunks');
    } catch (error) {
      console.error('Error in indexChunks:', error);
      throw error;
    }
  }
  private async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await fetch(
        `${environment.ollamaBaseUrl}/api/embeddings`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: environment.ollamaModel,
            prompt: text,
            options: environment.modelOptions,
          }),
          keepalive: true,
        }
      );

      if (!response.ok) {
        throw new Error(environment.errors.ollamaConnection);
      }

      const data = await response.json();
      return data.embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
      if (
        error instanceof TypeError &&
        error.message.includes('fetch failed')
      ) {
        console.error(
          'Could not connect to Ollama server. Please ensure it is running at 172.18.104.23:11434'
        );
      }
      throw error;
    }
  }
}
