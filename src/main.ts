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
  
  app.use((req: any, res: any, next: any) => {
    // Verificar se a rota corresponde a alguma rota de imagem
    const isImageRoute = imageRoutes.some(route => {
      const regex = new RegExp('^' + route.replace(/\*/g, '[^/]+') + '$');
      return regex.test(req.path);
    });

    if (isImageRoute) {
      // Obter a origem da requisição
      const origin = req.headers.origin;
      const referer = req.headers.referer;
      
      // console.log(`[IMAGE CORS] Request to ${req.path} from origin: ${origin || 'none'}, referer: ${referer || 'none'}`);
      
      // Estratégia de CORS para imagens:
      // 1. Se há origin header, usar ele com credentials
      // 2. Se não há origin mas há referer, extrair origin do referer
      // 3. Se não há nenhum, usar * sem credentials (requisições diretas)
      
      let allowOrigin = '*';
      let allowCredentials = false;
      
      if (origin) {
        // Caso 1: Origin header presente (requisições AJAX)
        allowOrigin = origin;
        allowCredentials = true;
      } else if (referer) {
        // Caso 2: Sem origin mas com referer (algumas requisições de imagem)
        try {
          const refererUrl = new URL(referer);
          allowOrigin = `${refererUrl.protocol}//${refererUrl.host}`;
          allowCredentials = true;
        } catch (e) {
          // Se falhar ao parsear referer, usar *
          allowOrigin = '*';
          allowCredentials = false;
        }
      }
      // Caso 3: Sem origin nem referer, já está com * e false
      
      // Definir headers CORS
      res.header('Access-Control-Allow-Origin', allowOrigin);
      if (allowCredentials) {
        res.header('Access-Control-Allow-Credentials', 'true');
      }
      
      res.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      res.header('Access-Control-Max-Age', '86400');
      res.header('Cross-Origin-Resource-Policy', 'cross-origin');
      
      if (allowOrigin !== '*') {
        res.header('Vary', 'Origin'); // Importante para cache correto quando não é *
      }
      
      // console.log(`[IMAGE CORS] Headers set - Origin: ${allowOrigin}, Credentials: ${allowCredentials}`);
      
      // Responder imediatamente a OPTIONS
      if (req.method === 'OPTIONS') {
        // console.log('[IMAGE CORS] Responding to OPTIONS preflight');
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
