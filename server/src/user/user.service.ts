import {
  Injectable,
  HttpException,
  BadRequestException,
  ConflictException,
  HttpStatus,
  NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository, UpdateResult } from 'typeorm';
import { validate, ValidationError } from 'class-validator';
import { EAFNOSUPPORT } from 'constants';
import { hash } from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>
  ) {}

  async create(newUser: Partial<User>): Promise<User> {
    await this._validate(newUser);
    newUser.password = await hash(newUser.password, 10);
    const user = (await this.userRepository.save(newUser)) as User;
    delete user.password;
    return user;
  }

  async update(newUser: User): Promise<User> {
    const oldUser = await this.userRepository.findOne({ id: newUser.id });
    if (!oldUser) {
      throw new NotFoundException(`User with id ${newUser.id} not found`);
    }
    const user = this.userRepository.merge(oldUser, newUser);
    await this._validate(user);
    delete user.password;
    await this.userRepository.update(user.id, user);
    return user;
  }

  async getById(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ id });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  private async _validate(data: Partial<User>) {
    const user = this.userRepository.create(data);
    const errors = await validate(user);
    const conflicts: ValidationError[] = [];
    if (errors.length) {
      throw new BadRequestException(errors);
    }
    const emailError = await this._checkUnique('email', user);
    if (emailError) {
      conflicts.push(emailError);
    }
    const phoneError = await this._checkUnique('phone', user);
    if (phoneError) {
      conflicts.push(phoneError);
    }
    if (conflicts.length) {
      throw new ConflictException(conflicts);
    }
  }

  private async _checkUnique(
    property: string,
    data: User
  ): Promise<ValidationError | void> {
    const user = await this.userRepository.findOne({
      [property]: data[property]
    });
    if (user && user.id !== data.id) {
      return {
        target: data,
        property,
        children: [],
        constraints: {
          unique: `User with ${property} ${data[property]} already exists`
        }
      };
    }
  }
}
