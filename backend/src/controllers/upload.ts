import { constants } from 'http2'
import { NextFunction, Request, Response } from 'express'

import { detectXml } from '@file-type/xml'
import { FileTypeParser } from 'file-type'

import BadRequestError from '../errors/bad-request-error'

const types = [
    'image/png',
    'image/jpg',
    'image/jpeg',
    'image/gif',
    'image/svg+xml',
]

export const uploadFile = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {

    if (!req.file) {
        return next(new BadRequestError('Файл не загружен'))
    }
    if (req.file.size <= 2 * 1024) {
        return next(new BadRequestError('Файл слишком мал'))
    }
    const parser = new FileTypeParser({customDetectors: [detectXml]});
    const check = await parser.fromFile(req.file.path);
    if (!check) {
        return next(new BadRequestError('Файл некорректен'))
    }
    if (check && !types.includes(check?.mime)) {
        return next(new BadRequestError('Файл не является изображением'))
    }
    try {
        const fileName = process.env.UPLOAD_PATH
            ? `/${process.env.UPLOAD_PATH}/${req.file.filename}`
            : `/${req.file?.filename}`
        return res.status(constants.HTTP_STATUS_CREATED).send({
            fileName,
            originalName: req.file?.originalname,
        })
    } catch (error) {
        return next(error)
    }
}

export default {}
