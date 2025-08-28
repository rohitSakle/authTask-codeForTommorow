import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
} from "typeorm";

import { User } from "../entity/User";

@Entity()
export class Session {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  refreshToken: string;

  @CreateDateColumn({ type: "timestamp" })
  createAt: Date;

  @OneToOne(() => User, (user) => user.session, {
    cascade: ["insert", "update"],
  })
  user: User;

  @Column()
  userId: number;
}
