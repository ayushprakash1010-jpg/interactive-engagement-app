import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SupportTicketDocument, SupportTicketEntity } from './schemas/support-ticket.schema';
import { AdminService } from '../admin/admin.service';
import { UsersService } from '../users/users.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto, AddNoteDto } from './dto/update-ticket.dto';
import { AuthenticatedUser } from '../auth/jwt.strategy';

@Injectable()
export class SupportService {
  constructor(
    @InjectModel(SupportTicketEntity.name) private ticketModel: Model<SupportTicketDocument>,
    private adminService: AdminService,
    private usersService: UsersService,
  ) {}

  async create(dto: CreateTicketDto): Promise<SupportTicketDocument> {
    const ticket = new this.ticketModel({
      ...dto,
    });
    return ticket.save();
  }

  async findAll(query: {
    status?: string;
    priority?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter: any = {};
    
    if (query.status) {
      filter.status = query.status;
    }
    
    if (query.priority) {
      filter.priority = query.priority;
    }

    if (query.search) {
      filter.$or = [
        { customerEmail: { $regex: query.search, $options: 'i' } },
        { customerName: { $regex: query.search, $options: 'i' } },
        { subject: { $regex: query.search, $options: 'i' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.ticketModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      this.ticketModel.countDocuments(filter).exec(),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<SupportTicketDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Ticket ${id} not found`);
    }
    const ticket = await this.ticketModel.findById(id).exec();
    if (!ticket) {
      throw new NotFoundException(`Ticket ${id} not found`);
    }
    return ticket;
  }

  async update(id: string, dto: UpdateTicketDto, adminUser: AuthenticatedUser): Promise<SupportTicketDocument> {
    const ticket = await this.findOne(id);
    
    const changes = [];
    if (dto.status && dto.status !== ticket.status) {
      changes.push(`status to ${dto.status}`);
      ticket.status = dto.status;
    }
    if (dto.priority && dto.priority !== ticket.priority) {
      changes.push(`priority to ${dto.priority}`);
      ticket.priority = dto.priority;
    }
    if (dto.assignedTo !== undefined) {
      const assignedToId = dto.assignedTo ? new Types.ObjectId(dto.assignedTo) : undefined;
      if (String(assignedToId) !== String(ticket.assignedTo)) {
        changes.push(assignedToId ? `assigned to ${dto.assignedTo}` : `unassigned`);
        ticket.assignedTo = assignedToId;
      }
    }
    if (dto.resolutionNote !== undefined) {
      ticket.resolutionNote = dto.resolutionNote;
      changes.push('updated resolution note');
    }

    if (changes.length > 0) {
      await ticket.save();
      await this.adminService.createAuditLog({
        adminId: adminUser.auth0Sub,
        adminEmail: adminUser.email || 'unknown',
        actionType: 'TICKET_UPDATED',
        targetResourceId: id,
        targetResourceType: 'SupportTicket',
        reason: `Updated ${changes.join(', ')}`,
        metadata: {},
      });
    }

    return ticket;
  }

  async addNote(id: string, dto: AddNoteDto, adminUser: AuthenticatedUser): Promise<SupportTicketDocument> {
    const ticket = await this.findOne(id);
    
    ticket.internalNotes.push({
      authorId: new Types.ObjectId(adminUser.id),
      authorName: adminUser.email || 'Admin',
      note: dto.note,
      createdAt: new Date(),
    });

    await ticket.save();
    
    await this.adminService.createAuditLog({
      adminId: adminUser.auth0Sub,
      adminEmail: adminUser.email || 'unknown',
      actionType: 'TICKET_NOTE_ADDED',
      targetResourceId: id,
      targetResourceType: 'SupportTicket',
      reason: 'Added internal note',
      metadata: {},
    });

    return ticket;
  }
}
