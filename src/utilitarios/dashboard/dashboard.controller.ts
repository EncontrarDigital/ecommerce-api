import { Controller, Get, Query } from '@nestjs/common';
import { DashboardState } from './model/dashboard.model'; // Importando a interface
import { ApiOkResponse } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { DashboardFilterDto } from './dto/dashboard-filter.dto';
import { ReqUser } from '../../auth/decorators/user.decorator';
import { User } from '../../users/models/user.entity';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @ApiOkResponse({ type: DashboardState, description: 'Dashboard data' })
  async getDashboard(
    @Query() filters: DashboardFilterDto,
    @ReqUser() user: User,
  ): Promise<DashboardState> {
    return this.dashboardService.getDashboardData(filters, user);
  }
}
