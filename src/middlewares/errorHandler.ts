import Context from 'koa';
import { IMiddleware } from 'koa-router';
import BadRequest from '../errors/BadRequest';
import NotFound from '../errors/NotFound';


export default async (ctx: Context, next: () => Promise<any>): IMiddleware => {
    try {
        await next();
    } catch (e) {
        ctx.status = 500;
        if (e instanceof NotFound) {
            ctx.status = 404;
        } else if (e instanceof BadRequest) {
            ctx.status = 400;
        }
        ctx.body = e.message;
    }
};
