import { Blog } from './types/blogs.types';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class BlogsRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}
  async getBlogById(blogId: string): Promise<Blog> {
    try {
      const result: Blog[] = await this.dataSource.query(
        `
        SELECT * FROM "BLOGS" AS b
        WHERE b."id" = $1
        `,
        [blogId],
      );
      if (result.length < 1) return null;
      return result[0];
    } catch (e) {
      console.log(e);
      return null;
    }
  }
  async createBlog(newBlog: Blog): Promise<Blog> {
    try {
      await this.dataSource.query(
        `
        INSERT INTO "BLOGS"
        ("id", "name", "description", "websiteUrl", "createdAt", "isMembership", "ownerId", "isBanned", "banDate")
        VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `,
        [
          newBlog.id,
          newBlog.name,
          newBlog.description,
          newBlog.websiteUrl,
          newBlog.createdAt,
          newBlog.isMembership,
          newBlog.ownerId,
          newBlog.isBanned,
          newBlog.banDate,
        ],
      );
      return await this.getBlogById(newBlog.id);
    } catch (e) {
      console.log(e);
      return null;
    }
  }
  async updateBlog(
    id: string,
    name: string,
    description: string,
    websiteUrl: string,
    userId: string,
  ): Promise<boolean> {
    const blog = await this.getBlogById(id);
    if (!blog) throw new NotFoundException();
    if (blog.ownerId !== userId) throw new ForbiddenException();
    try {
      if (name)
        await this.dataSource.query(
          `
      UPDATE "BLOGS"
      SET "name" = $1
      WHERE "id" = $2
      `,
          [name, id],
        );
      if (description)
        await this.dataSource.query(
          `
      UPDATE "BLOGS"
      SET "description" = $1
      WHERE "id" = $2
      `,
          [description, id],
        );
      if (websiteUrl)
        await this.dataSource.query(
          `
      UPDATE "BLOGS"
      SET "websiteUrl" = $1
      WHERE "id" = $2
      `,
          [websiteUrl, id],
        );
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
  async deleteBlog(blogId: string, userId: string): Promise<void> {
    const blog = await this.getBlogById(blogId);
    if (!blog) throw new NotFoundException();
    if (blog.ownerId !== userId) throw new ForbiddenException();
    try {
      await this.dataSource.query(
        `
        DELETE FROM "BLOGS"
        WHERE "id" = $1;
        `,
        [blogId],
      );
      return;
    } catch (e) {
      console.log(e);
      return;
    }
  }
  async banBlogById(blogId: string, isBanned: boolean): Promise<void> {
    try {
      let banDate: Date | null;
      const blogInstance = await this.getBlogById(blogId);
      blogInstance.isBanned = isBanned;
      if (isBanned) banDate = new Date();
      else banDate = null;
      await this.dataSource.query(
        `
      UPDATE "BLOGS"
      SET "isBanned" = $1, "banDate" = $2
      WHERE "id" = $3
      `,
        [isBanned, banDate, blogId],
      );
      return;
    } catch (e) {
      console.log(e);
      return;
    }
  }
  async bindUser(blogId: string, userId: string): Promise<void> {
    try {
      await this.dataSource.query(
        `
        UPDATE "BLOGS"
        SET "ownerId" = $1
        WHERE "id" = $2
        `,
        [userId, blogId],
      );
      return;
    } catch (e) {
      console.log(e);
      return;
    }
  }
}
