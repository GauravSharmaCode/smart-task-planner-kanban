"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_types_1 = require("./auth.types");
class AuthController {
    constructor(authService) {
        this.authService = authService;
        this.register = async (req, res, next) => {
            try {
                const validatedData = auth_types_1.RegisterSchema.parse(req.body);
                const result = await this.authService.register(validatedData);
                const response = {
                    success: true,
                    data: result
                };
                res.status(201).json(response);
            }
            catch (error) {
                next(error);
            }
        };
        this.login = async (req, res, next) => {
            try {
                const validatedData = auth_types_1.LoginSchema.parse(req.body);
                const result = await this.authService.login(validatedData);
                const response = {
                    success: true,
                    data: result
                };
                res.status(200).json(response);
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.AuthController = AuthController;
