import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GenerateDto } from './dto/generate.dto';

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

  constructor(private readonly config: ConfigService) {}

  async generate(dto: GenerateDto): Promise<unknown> {
    const {
      userApiKey,
      jobDescription,
      templateId: _templateId,
      jobTitle: _jobTitle,
      companyName: _companyName,
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

    if (!resultText) {
      // Groq can return 200 with an empty completion (e.g. a reasoning
      // model burning its whole token budget on hidden reasoning before
      // ever emitting a visible answer — more likely under a very tight
      // word/character limit combined with the fixed structure rules).
      // Treating this as success would let a caller silently save
      // "no content" as if it were a real cover letter.
      this.logger.error(
        'Groq returned no completion content',
        JSON.stringify(data),
      );
      throw new InternalServerErrorException(
        'The AI did not return any content. Please try again.',
      );
    }

    // ─── Rule Validation ───
    this.validateRules(resultText, {
      wordLimit,
      minimalChanges,
      sameLanguage,
      jobDescription,
    });

    // ─── Auth Persistence is handled by the frontend via POST /api/cover-letters ───
    // (we don't save here because the frontend sends richer data including jobDescription)

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
