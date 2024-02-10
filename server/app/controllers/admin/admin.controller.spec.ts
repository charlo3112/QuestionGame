import { HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { AdminController } from './admin.controller';

describe('AdminController', () => {
    let controller: AdminController;

    beforeEach(async () => {
        controller = new AdminController();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('login() should return OK when password is correct', async () => {
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.send = () => res;

        process.env.ADMIN_PASSWORD = 'password';
        await controller.login({ password: 'password' }, res);
    });

    it('login() should return FORBIDDEN when password is incorrect', async () => {
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.FORBIDDEN);
            return res;
        };
        res.send = () => res;

        process.env.ADMIN_PASSWORD = 'password';
        await controller.login({ password: 'wrong' }, res);
    });
});
