/**
 * Comment controller.
 * @file 评论模块控制器
 * @module module/comment/controller
 * @author Surmon <https://github.com/surmon-china>
 */

import { PaginateResult } from 'mongoose';
import { Controller, Get, Put, Post, Patch, Delete, Body, UseGuards } from '@nestjs/common';
import { HumanizedJwtAuthGuard } from '@app/guards/humanized-auth.guard';
import { HttpProcessor } from '@app/decorators/http.decorator';
import { QueryParams, EQueryParamsField } from '@app/decorators/query-params.decorator';
import { JwtAuthGuard } from '@app/guards/auth.guard';
import { Comment, DelComments, PatchComments } from './comment.model';
import { CommentService } from './comment.service';
import { ESortType } from '@app/interfaces/state.interface';

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Get()
  @UseGuards(HumanizedJwtAuthGuard)
  @HttpProcessor.paginate()
  @HttpProcessor.handle('获取评论列表')
  getComments(@QueryParams([EQueryParamsField.CommentState, 'post_id']) { querys, options, origin }): Promise<PaginateResult<Comment>> {
    if (origin.sort === ESortType.Hot) {
      options.sort = { likes: ESortType.Desc };
    }
    if (origin.keyword) {
      const keywordRegExp = new RegExp(origin.keyword);
      querys.$or = [
        { content: keywordRegExp },
        { 'author.name': keywordRegExp },
        { 'author.email': keywordRegExp },
      ];
    }
    return this.commentService.getCommentsList(querys, options);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpProcessor.handle('添加评论')
  createComment(@Body() comment: Comment, @QueryParams() { visitors }): Promise<Comment> {
    return this.commentService.createComment(comment, visitors);
  }

  @Patch()
  @UseGuards(JwtAuthGuard)
  @HttpProcessor.handle('添加评论')
  patchComments(@QueryParams() { visitors }, @Body() body: PatchComments): Promise<Comment> {
    return this.commentService.patchCommentsState(body, visitors.referer);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  @HttpProcessor.handle('批量删除评论')
  delComments(@Body() body: DelComments): Promise<any> {
    return this.commentService.deleteList(body.comment_ids, body.post_ids);
  }

  @Get(':id')
  @HttpProcessor.handle('获取单个评论详情')
  getComment(@QueryParams() { params }): Promise<Comment> {
    return this.commentService.getItem(params.id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @HttpProcessor.handle('修改单个评论')
  putComment(@QueryParams() { params, visitors }, @Body() comment: Comment): Promise<Comment> {
    return this.commentService.putItem(params.id, comment, visitors.referer);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpProcessor.handle('删除单个评论')
  delComment(@QueryParams() { params }): Promise<any> {
    return this.commentService.deleteItem(params.id);
  }
}
