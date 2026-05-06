import {
  Injectable,
  BadRequestException,
  ServiceUnavailableException,
  Logger,
} from '@nestjs/common';
import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';

const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);
const MAX_BYTES = 2 * 1024 * 1024;

@Injectable()
export class ReviewsUploadService {
  private readonly logger = new Logger(ReviewsUploadService.name);

  constructor() {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    if (cloudName && apiKey && apiSecret) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      });
    }
  }

  isEnabled(): boolean {
    return !!(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    );
  }

  async uploadReviewImage(
    buffer: Buffer,
    mimetype: string,
  ): Promise<{ url: string }> {
    if (!this.isEnabled()) {
      throw new ServiceUnavailableException(
        'Subida de imágenes no configurada (Cloudinary)',
      );
    }
    if (!ALLOWED_MIME.has(mimetype)) {
      throw new BadRequestException(
        'Tipo de archivo no permitido (usa JPEG, PNG, WebP o GIF)',
      );
    }
    if (buffer.length > MAX_BYTES) {
      throw new BadRequestException('Imagen demasiado grande (máx. 2 MB)');
    }
    const folder = process.env.CLOUDINARY_REVIEW_FOLDER ?? 'anirate/reviews';
    try {
      const result = await new Promise<UploadApiResponse>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: 'image',
            allowed_formats: ['jpg', 'png', 'webp', 'gif'],
            transformation: [{ quality: 'auto', fetch_format: 'auto' }],
          },
          (err, res) =>
            err || !res
              ? reject(err ?? new Error('Upload vacío'))
              : resolve(res),
        );
        stream.end(buffer);
      });
      if (!result.secure_url)
        throw new BadRequestException('No se obtuvo URL de la imagen');
      return { url: result.secure_url };
    } catch (e) {
      this.logger.warn(`Cloudinary upload failed: ${(e as Error).message}`);
      throw new BadRequestException('No se pudo subir la imagen');
    }
  }
}
