import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { RedocModule } from 'nestjs-redoc';
import * as crypto from 'crypto';
if (!(global as any).crypto) {
  (global as any).crypto = crypto;
}
if (!(global as any).crypto.randomUUID) {
  (global as any).crypto.randomUUID = () => crypto.randomBytes(16).toString('hex');
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const nodeEnv = configService.get('nodeEnv');

  // Trust proxy for production (important for cookies behind reverse proxy)
  if (nodeEnv === 'production') {
    app.getHttpAdapter().getInstance().set('trust proxy', 1);
  }

  // Middleware adicional para rotas de imagens (permite qualquer origem)
  // IMPORTANTE: Este middleware deve vir ANTES do enableCors para ter precedência
  const imageRoutes = ['/products/*/photos/*', '/banners/*/image', '/splash-screens/*/image'];
  
  app.use((req, res, next) => {
    // Verificar se a rota corresponde a alguma rota de imagem
    const isImageRoute = imageRoutes.some(route => {
      const regex = new RegExp('^' + route.replace(/\*/g, '[^/]+') + '$');
      return regex.test(req.path);
    });

    if (isImageRoute) {
      // Obter a origem da requisição
      const origin = req.headers.origin || req.headers.referer || '*';
      
      // Headers CORS permissivos para imagens
      // Se houver origem, usar ela; senão usar *
      if (origin && origin !== '*') {
        res.header('Access-Control-Allow-Origin', origin);
        res.header('Access-Control-Allow-Credentials', 'true');
      } else {
        res.header('Access-Control-Allow-Origin', '*');
      }
      
      res.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      res.header('Access-Control-Max-Age', '86400');
      res.header('Cross-Origin-Resource-Policy', 'cross-origin');
      res.header('Vary', 'Origin'); // Importante para cache correto
      
      // Responder imediatamente a OPTIONS
      if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
      }
    }
    
    next();
  });

  // Configure CORS based on environment
  if (nodeEnv === 'production') {
    app.enableCors({
      origin: [
        'https://admin.encontrarshopping.com',
        'https://encontrarshopping.com',
        'https://www.encontrarshopping.com',
        'https://www.admin.encontrarshopping.com'
      ],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      exposedHeaders: ['Content-Type', 'Content-Disposition'], // Importante para imagens
    });
  } else {
    app.enableCors({
      origin: true,
      credentials: true,
    });
  }
  

  const swaggerConfig = new DocumentBuilder()
    .setTitle('E-commerce platform API')
    .setVersion(process.env.npm_package_version ?? '1.0.0')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig, {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  });
  await RedocModule.setup('docs', app, document, {});

  const port = configService.get('port');
  await app.listen(port);

  console.log(`App running on port ${port}`);
}
bootstrap();
