import { defineCollection, z } from 'astro:content';

// 보험 매거진 글 스키마
// pillar — 생애주기 IA (태아 코어 → 단계 확장)
// type — pillar(허브 글) / cluster(개별 글) / case(케이스 스토리) / tool(인터랙티브 도구)
// intent — 검색의도 분류 (SEO 카니발리제이션 회피용)
const articles = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pillar: z.enum([
      'pregnancy',
      'newborn',
      'toddler',
      'school',
      'teen',
      'case',
    ]),
    type: z.enum(['pillar', 'cluster', 'case', 'tool']),
    intent: z.array(z.enum([
      'information',
      'timing',
      'condition',
      'comparison',
      'rejection',
      'claim',
      'case-story',
      'tool',
    ])),
    keywords: z.array(z.string()),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    reviewedBy: z.string().default('베이비빌리 보험 자문단'),
    reviewedAt: z.coerce.date().optional(),
    author: z.string().default('베이비빌리 매거진 편집팀'),
    related: z.array(z.string()).default([]),
    faq: z.array(z.object({
      q: z.string(),
      a: z.string(),
    })).default([]),
    cover: z.string().optional(),
    leadTool: z.enum(['fit-check', 'kakao-talk', 'none']).default('fit-check'),
    draft: z.boolean().default(false),
  }),
});

export const collections = { articles };
