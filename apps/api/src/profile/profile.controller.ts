import { Controller, Patch, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiCookieAuth } from '@nestjs/swagger';
import { ProfileService } from './profile.service';
import {
  UpdateProfileLinksDto,
  type ProfileResponseDto,
} from './dto/profile.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import * as db from '@career-covered/db';

@ApiTags('Profile')
@ApiCookieAuth('session')
@Controller('api/profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Patch('links')
  @ApiOperation({
    summary: "Update the current user's quick-copy profile links",
  })
  async updateLinks(
    @Body() dto: UpdateProfileLinksDto,
    @CurrentUser() user: db.User,
  ): Promise<ProfileResponseDto> {
    return this.profileService.updateLinks(user.id, dto);
  }
}
