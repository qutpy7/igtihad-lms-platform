import { Request, Response, NextFunction } from 'express'
import { ObjectSchema } from 'joi'
import { badRequest } from '../utils/response'

export const validate = (schema: ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, { abortEarly: false, stripUnknown: true })
    if (error) {
      const messages = error.details.map(d => d.message).join(' - ')
      return badRequest(res, messages)
    }
    next()
  }
}
