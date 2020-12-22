import { Aimodel } from 'src/aimodels/aimodels.model';

export class UpdateSessionDto {
  name: string;

  description: string;

  aimodel: Aimodel;

  updated_at: Date;
}