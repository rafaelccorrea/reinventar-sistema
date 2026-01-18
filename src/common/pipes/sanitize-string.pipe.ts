import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class SanitizeStringPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (typeof value === 'object' && value !== null) {
      // Aplica a sanitização recursivamente em objetos
      return this.sanitizeObject(value);
    }
    // Aplica a sanitização em strings
    return this.sanitizeString(value);
  }

  private sanitizeObject(obj: any): any {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        if (typeof value === 'string') {
          obj[key] = this.sanitizeString(value);
        } else if (typeof value === 'object' && value !== null) {
          obj[key] = this.sanitizeObject(value);
        }
      }
    }
    return obj;
  }

  private sanitizeString(value: any): any {
    if (typeof value === 'string') {
      // Remove espaços em branco no início e fim, e substitui múltiplos espaços por um único
      return value.trim().replace(/\s\s+/g, ' ');
    }
    return value;
  }
}
