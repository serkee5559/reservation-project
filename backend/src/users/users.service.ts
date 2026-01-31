
import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

  async create(createUserDto: CreateUserDto) {
    return this.prisma.appUser.create({
      data: {
        // id: createUserDto.id, // Let database generate UUID if not provided. If provided, use it.
        ...(createUserDto.id && { id: createUserDto.id }),
        username: createUserDto.username,
        email: createUserDto.email,
        name: createUserDto.name,
        password: createUserDto.password || 'default', // Store password
        role: createUserDto.role || 'user',
      },
    });
  }

  async login(username: string, password: string) {
    const user = await this.prisma.appUser.findUnique({ where: { username } });
    if (!user) return null;
    if (user.password !== password) return null; // Simple check
    return user;
  }

  findAll() {
    return this.prisma.appUser.findMany();
  }

  findOne(id: string) {
    return this.prisma.appUser.findUnique({ where: { id } });
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return this.prisma.appUser.update({
      where: { id },
      data: updateUserDto,
    });
  }

  remove(id: string) {
    return this.prisma.appUser.delete({ where: { id } });
  }
}
