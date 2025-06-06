import { Client, BucketItem } from 'minio';

class MinioService {
  private static instance: MinioService;
  private client: Client | null = null;
  private isConfigured: boolean = false;

  private constructor() {
    this.initialize();
  }

  public static getInstance(): MinioService {
    if (!MinioService.instance) {
      MinioService.instance = new MinioService();
    }
    return MinioService.instance;
  }

  private initialize() {
    const endpoint = process.env.MINIO_ENDPOINT;
    const accessKey = process.env.MINIO_ACCESS_KEY;
    const secretKey = process.env.MINIO_SECRET_KEY;
    const useSSL = process.env.MINIO_USE_SSL === 'true';

    if (!endpoint || !accessKey || !secretKey) {
      this.isConfigured = false;
      return;
    }

    try {
      this.client = new Client({
        endPoint: endpoint,
        port: parseInt(process.env.MINIO_PORT || '9000'),
        useSSL,
        accessKey,
        secretKey
      });
      this.isConfigured = true;
    } catch (error) {
      console.error('Erro ao inicializar MinIO client:', error);
      this.isConfigured = false;
    }
  }

  public getStatus(): { isConfigured: boolean; message: string } {
    return {
      isConfigured: this.isConfigured,
      message: this.isConfigured 
        ? 'Storage configurado e pronto para uso'
        : 'Storage não configurado. Configure as variáveis de ambiente para habilitar o gerenciamento de mídia.'
    };
  }

  public async uploadFile(file: Buffer, fileName: string, contentType: string): Promise<string> {
    if (!this.isConfigured || !this.client) {
      throw new Error('Storage não configurado');
    }

    const bucket = process.env.MINIO_BUCKET || 'media';
    
    // Garante que o bucket existe
    const bucketExists = await this.client.bucketExists(bucket);
    if (!bucketExists) {
      await this.client.makeBucket(bucket);
      // Configura a política de acesso público para o bucket
      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${bucket}/*`]
          }
        ]
      };
      await this.client.setBucketPolicy(bucket, JSON.stringify(policy));
    }

    // Upload do arquivo
    await this.client.putObject(bucket, fileName, file, {
      'Content-Type': contentType
    } as any); // Usando any temporariamente devido a um problema de tipos do MinIO

    // Retorna a URL pública do arquivo
    return `${process.env.MINIO_PUBLIC_URL || `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}`}/${bucket}/${fileName}`;
  }

  public async listFiles(): Promise<Array<{ name: string; url: string; size: number; lastModified: Date }>> {
    if (!this.isConfigured || !this.client) {
      throw new Error('Storage não configurado');
    }

    const bucket = process.env.MINIO_BUCKET || 'media';
    const baseUrl = process.env.MINIO_PUBLIC_URL || `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}`;
    
    const stream = this.client.listObjects(bucket);
    const files: Array<{ name: string; url: string; size: number; lastModified: Date }> = [];

    return new Promise((resolve, reject) => {
      stream.on('data', (obj: BucketItem) => {
        if (obj.name && obj.size && obj.lastModified) {
          files.push({
            name: obj.name,
            url: `${baseUrl}/${bucket}/${obj.name}`,
            size: obj.size,
            lastModified: obj.lastModified
          });
        }
      });

      stream.on('error', (err) => {
        reject(err);
      });

      stream.on('end', () => {
        resolve(files);
      });
    });
  }

  public async deleteFile(fileName: string): Promise<void> {
    if (!this.isConfigured || !this.client) {
      throw new Error('Storage não configurado');
    }

    const bucket = process.env.MINIO_BUCKET || 'media';
    await this.client.removeObject(bucket, fileName);
  }
}

export const minioService = MinioService.getInstance(); 