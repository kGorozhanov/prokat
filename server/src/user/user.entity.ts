import { Entity, PrimaryGeneratedColumn, Column, Unique, CreateDateColumn } from 'typeorm';
import { MaxLength, IsEmail, IsDate, IsMobilePhone, IsNotEmpty } from 'class-validator';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsNotEmpty()
  firstName: string;

  @Column()
  @IsNotEmpty()
  lastName: string;

  @Column({default: ''})
  photoUrl: string;

  @Column({unique: true})
  @IsEmail()
  email: string;

  @Column({unique: true})
  @IsMobilePhone('uk-UA')
  phone: string;

  @Column({default: false})
  emailVerified: boolean;

  @CreateDateColumn()
  dateCreate: Date;
}