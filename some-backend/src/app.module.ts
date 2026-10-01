import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { PostModule } from './post/post.module';
import { Post } from './post/entities/post.entity';

@Module({
  imports: [
    // isGlobal means ConfigService can be injected anywhere without importing
    // this module again. Reads .env into process.env once, at start-up.
    //
    // The repo root .env is the single source of truth. A some-backend/.env
    // wins over it if one exists. Inside the container neither file is
    // present - Compose supplies the values through the environment directly,
    // and those always beat a file.
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../.env'],
    }),

    // forRootAsync waits for the configuration before opening the connection.
    // The connection is opened once here; every repository shares it.
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService): TypeOrmModuleOptions => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get('DB_USER'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),
        entities: [Post],
        // creates and alters tables from the entities. Useful now, never in
        // production - it will happily drop a column you renamed.
        synchronize: true,
      }),
    }),

    PostModule,
  ],
})
export class AppModule {}
