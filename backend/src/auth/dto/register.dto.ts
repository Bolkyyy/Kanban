import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class RegisterDto {
    @IsEmail()
    @IsNotEmpty()
    email!: string
    
    @IsNotEmpty()
    @MinLength(7)
    password!: string 

    @IsString()
    @MinLength(2)
    name!: string
}
