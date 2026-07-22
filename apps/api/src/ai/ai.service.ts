import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GenerateDto } from './dto/generate.dto';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

interface GroqResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  async generate(dto: GenerateDto, sessionToken?: string): Promise<unknown> {
    const {
      userApiKey,
      jobDescription,
      templateId,
      jobTitle,
      companyName,
      wordLimit,
      minimalChanges,
      sameLanguage,
      ...groqBody
    } = dto;

    const apiKey = userApiKey ?? this.config.get<string>('GROQ_API_KEY');

    if (!apiKey) {
      throw new InternalServerErrorException('No Groq API key configured');
    }

    this.logger.log(`Generating cover letter with model: ${dto.model}`);

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(groqBody),
    });

    const data = (await response.json()) as GroqResponse & {
      error?: { message: string };
    };

    if (!response.ok) {
      this.logger.error('Groq API error', JSON.stringify(data));
      throw new InternalServerErrorException(
        data?.error?.message ?? 'Groq API request failed',
      );
    }

    const resultText = data.choices?.[0]?.message?.content;

    if (resultText) {
      // ─── Rule Validation ───
      this.validateRules(resultText, {
        wordLimit,
        minimalChanges,
        sameLanguage,
        jobDescription,
      });

      // ─── Optional Auth Persistence ───
      if (sessionToken) {
        try {
          const user = await this.authService.validateSession(sessionToken);
          if (user) {
            this.logger.log(
              `Persisting generated cover letter for user: ${user.id}`,
            );
            await this.prisma.coverLetter.create({
              data: {
                userId: user.id,
                templateId: templateId || null,
                jobTitle: jobTitle || 'Unspecified Position',
                companyName: companyName || 'Unspecified Company',
                jobDescription: jobDescription || '',
                generatedText: resultText,
                model: dto.model,
                wordLimit: wordLimit || null,
              },
            });
          }
        } catch (dbErr) {
          this.logger.error('Failed to save cover letter to database', dbErr);
        }
      }
    }

    return data;
  }

  private validateRules(
    text: string,
    rules: {
      wordLimit?: number;
      minimalChanges?: boolean;
      sameLanguage?: boolean;
      jobDescription?: string;
    },
  ): void {
    const words = text
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 0);
    const wordCount = words.length;

    if (rules.wordLimit && wordCount > rules.wordLimit) {
      this.logger.warn(
        `Rule Violation [Word Limit]: Output has ${wordCount} words, limit requested was ${rules.wordLimit}`,
      );
    }

    if (rules.sameLanguage && rules.jobDescription) {
      // Simple heuristic: check if common stop words of one language match
      const isEnglish = (str: string) =>
        /\b(the|and|is|in|at|to|with)\b/i.test(str);
      const outputIsEnglish = isEnglish(text);
      const inputIsEnglish = isEnglish(rules.jobDescription);

      if (outputIsEnglish !== inputIsEnglish) {
        this.logger.warn(
          `Rule Violation [Language Constraint]: Generated letter may not match job description language profile.`,
        );
      }
    }
  }
}
