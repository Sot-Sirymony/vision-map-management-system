import type { ObstacleType, PartnerSupportType } from '../types/vision';

export type PartnerSuggestion = {
  supportType: PartnerSupportType;
  label: string;
};

const obstacleTypeToPartnerSuggestion: Record<ObstacleType, PartnerSuggestion | null> = {
  KNOWLEDGE: { supportType: 'MENTOR', label: 'Mentor or expert' },
  SKILL: { supportType: 'TECHNICAL', label: 'Technical expert or trainer' },
  TIME: { supportType: 'COLLEAGUE', label: 'Delegate or assistant' },
  MONEY: { supportType: 'FINANCIAL', label: 'Financial partner or sponsor' },
  MOTIVATION: { supportType: 'EMOTIONAL', label: 'Accountability partner' },
  DECISION: { supportType: 'ADVISOR', label: 'Advisor' },
  PARTNER: null,
  SYSTEM: null,
  OTHER: null,
};

export function suggestPartnerFor(obstacleType: ObstacleType): PartnerSuggestion | null {
  return obstacleTypeToPartnerSuggestion[obstacleType];
}
