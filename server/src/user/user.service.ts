import { Injectable, HttpException, BadRequestException, ConflictException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository, UpdateResult } from 'typeorm';
import { validate } from 'class-validator';
import { EAFNOSUPPORT } from 'constants';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {
  }

  async create(user: Partial<User>): Promise<User> {
    await this._validate(user);
    return await this._catchSaveErrors<User>(
      async () => await this.userRepository.save(user) as User
    );
  }

  async update(user: User): Promise<UpdateResult> {
    await this._validate(user);
    return await this._catchSaveErrors<UpdateResult>(
      async () => await this.userRepository.update(user.id, user)
    );
  }

  private async _validate(data: Partial<User>) {
    const user = this.userRepository.create(data);
    const errors = await validate(user);
    if (errors.length) {
      throw new BadRequestException(errors);
    }
  }

  private async _catchSaveErrors<T>(fn: () => Promise<T>): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (error.errno === 1062) {
        throw new ConflictException(error);
      }
      throw error;
    }
  }
}