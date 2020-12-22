import { Injectable } from '@nestjs/common';
import { InjectModel } from 'nestjs-typegoose';
import { DocumentType, ReturnModelType } from '@typegoose/typegoose';
import { CreateSessionDto, UpdateSessionDto } from './dto';
import { Session } from './sessions.model';
import * as fs from 'fs';
import { join } from 'path';
import { Research } from 'src/researches/researches.model';
import { plainToClass } from 'class-transformer';
import { SessionResult } from 'src/common/models/sessionResult/sessionResult.model';

function copyFiles(files, destDir): any[] {
  files.map(f => {
    fs.copyFileSync(f.path, join(destDir, f.originalname));
  });

  return files.map(f => {
    return {
      path: join(destDir, f.originalname),
      originalname: f.originalname,
    };
  });
}

@Injectable()
export class SessionsService {
  constructor(
    @InjectModel(Session)
    private readonly sessions: ReturnModelType<typeof Session>,
    @InjectModel(Research)
    private readonly researches: ReturnModelType<typeof Research>,
  ) {}

  async findOne(id: string): Promise<Session> | null {
    return await this.sessions.findById(id).exec();
  }

  async findAll(): Promise<Session[] | null> {
    return await this.sessions
      .find()
      .populate('made_by')
      .populate('location_id')
      .exec();
  }

  async create(dto: CreateSessionDto, files: any): Promise<Session> {
    const session = await new this.sessions(dto).save();
    const research = await this.researches.findById(dto.research);

    //TODO CHECK IF RESEARCH IS NOT NULL

    const dist_path = join(
      'public',
      'files',
      'researches',
      research._id.toString(),
      'sessions',
      session._id.toString(),
    );

    fs.mkdirSync(dist_path, { recursive: true });

    const newFilePaths = copyFiles(files, dist_path);

    session.results.forEach(r => {
      newFilePaths.forEach(n => {
        if (r.file.fileName === n.originalname) {
          r.file.filePath = n.path;
        }
      });
    });

    console.log(session.results);

    return session;
  }

  async update(id: string, dto: UpdateSessionDto): Promise<Session> {
    dto.updated_at = new Date();
    return await this.sessions.findByIdAndUpdate(
      id,
      { $set: dto },
      { new: true },
    );
  }

  async deleteOne(id: string): Promise<any> {
    const destroyed: any = await this.sessions.deleteOne({ _id: id });
    destroyed.id = id;
    return destroyed;
  }
}
