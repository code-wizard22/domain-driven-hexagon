import { Body, Controller, Get, HttpStatus, Query } from '@nestjs/common';
import { routesV1 } from '@config/app.routes';
import { QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Result } from 'oxide.ts';
import { FindUsersRequestDto } from './find-users.request.dto';
import { UserEntity } from '@modules/user/domain/user.entity';
import { FindUsersQuery } from './find-users.query-handler';
import { UserMapper } from '@modules/user/user.mapper';
import { Paginated } from '@src/libs/ddd';
import { UserPaginatedResponseDto } from '../../dtos/user.paginated.response.dto';
import { PaginatedQueryRequestDto } from '@src/libs/api/paginated-query.request.dto';

@Controller(routesV1.version)
export class FindUsersHttpController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly userMapper: UserMapper,
  ) {}

  @Get(routesV1.user.root)
  @ApiOperation({ summary: 'Find users' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: UserPaginatedResponseDto,
  })
  async findUsers(
    @Body() request: FindUsersRequestDto,
    @Query() queryParams: PaginatedQueryRequestDto,
  ): Promise<UserPaginatedResponseDto> {
    const query = new FindUsersQuery({
      ...request,
      limit: queryParams?.limit,
      page: queryParams?.page,
    });
    const result: Result<
      Paginated<UserEntity>,
      Error
    > = await this.queryBus.execute(query);

    const users = result.unwrap();

    return new UserPaginatedResponseDto({
      ...users,
      data: users.data.map(this.userMapper.toResponse),
    });
  }
}
