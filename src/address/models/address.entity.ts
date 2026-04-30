import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('addresses')
export class Address {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  slug?: string;

  @Column({ default: true })
  visible: boolean;

  @Column({ 
    type: 'double precision', 
    nullable: true,
    transformer: {
      to: (value: number | null | undefined) => value,
      from: (value: number | null | undefined) => value != null ? Math.round(value) : value
    }
  })
  price?: number;

  @Column({ 
    type: 'decimal', 
    precision: 10, 
    scale: 8, 
    nullable: true,
    comment: 'Latitude da zona de entrega'
  })
  latitude?: number;

  @Column({ 
    type: 'decimal', 
    precision: 11, 
    scale: 8, 
    nullable: true,
    comment: 'Longitude da zona de entrega'
  })
  longitude?: number;

  @Column({ 
    type: 'int', 
    nullable: true, 
    default: 5,
    comment: 'Raio de cobertura em km'
  })
  radius_km?: number;

  @Column({ 
    type: 'boolean', 
    default: false,
    comment: 'Se é uma zona de entrega com coordenadas'
  })
  is_zone: boolean;

  @ManyToOne(() => Address, (address) => address.childAddresses, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  parentAddress?: Address;

  @OneToMany(() => Address, (address) => address.parentAddress, {
    onDelete: 'SET NULL',
  })
  childAddresses: Address[];
} 