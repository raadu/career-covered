import { Test, TestingModule } from '@nestjs/testing';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { GenerateDto } from './dto/generate.dto';
import { Request } from 'express';

describe('AiController', () => {
  let controller: AiController;
  let service: AiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiController],
      providers: [
        {
          provide: AiService,
          useValue: {
            generate: jest.fn().mockResolvedValue({
              choices: [{ message: { content: 'mock letter' } }],
            }),
          },
        },
      ],
    }).compile();

    controller = module.get<AiController>(AiController);
    service = module.get<AiService>(AiService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call aiService.generate with DTO and session token', async () => {
    const dto: GenerateDto = {
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: 'write letter' }],
    };
    const req = {
      cookies: { session: 'mock-token' },
    } as unknown as Request;

    const result = await controller.generate(dto, req);
    expect(service.generate).toHaveBeenCalledWith(dto, 'mock-token');
    expect(result).toEqual({
      choices: [{ message: { content: 'mock letter' } }],
    });
  });
});
