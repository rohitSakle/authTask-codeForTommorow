import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  OneToOne,
  JoinColumn,
} from "typeorm";

import { Session } from "../entity/Session";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @CreateDateColumn({ type: "timestamp" })
  createAt: Date;

  @OneToOne(() => Session, (session) => session.user) // specify inverse side as a second parameter
  session: Session[];
}
