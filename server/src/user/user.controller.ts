import { Controller, Post, Body, Put, Get, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';
import { UpdateEvent, UpdateResult } from 'typeorm';

@Controller('users')
export class UserController {
  constructor(private _userService: UserService) {}

  @Post()
  async create(@Body() user: User): Promise<User> {
    return await this._userService.create(user);
  }

  @Put()
  async update(@Body() user: User): Promise<User> {
    return await this._userService.update(user);
  }

  @Get(':id')
  async getUserById(@Param('id') id: number): Promise<User> {
    return await this._userService.getById(id);
  }
}
