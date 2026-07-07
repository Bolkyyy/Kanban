import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  //     РЕГИСТРАЦИЯ ПОЛЬЗОВАТЕЛЯ
  async Register(registerDto: RegisterDto) {
    const emailChecking = await this.usersRepository.findOne({
      where: {email: registerDto.email}
    })

    if (emailChecking) {
      throw new ConflictException('Данная почта уже зарегистрирована')
    } 

    const hashedPass = await argon2.hash(registerDto.password)
    
    const newUser = this.usersRepository.create({
      email: registerDto.email,
      password: hashedPass,
      name: registerDto.name
    })

    await this.usersRepository.save(newUser)

    return this.generateToken(newUser)
  }

  //     ЛОГИН
  async Login(loginDto: LoginDto) {
    const user = await this.usersRepository.findOne({
      where: {email: loginDto.email}
    })

    if (!user) {
      throw new UnauthorizedException('Неверный email')
    }

    const unhashedPass = await argon2.verify(user.password, loginDto.password)

    if(!unhashedPass) {
      throw new UnauthorizedException("Неверный пароль")
    }

    return this.generateToken(user);
  }


  private generateToken(user: User) {
    const payload = { sub: user.id, email: user.email };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }

}
