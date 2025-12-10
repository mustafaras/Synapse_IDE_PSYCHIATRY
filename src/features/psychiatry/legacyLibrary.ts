import type { Card } from './lib/types';
import { mbcCards } from './legacy/mbc';
import { rapidTriageCards } from './legacy/rapidTriage';
import { medicationOrderCards } from './legacy/medicationOrders';
import { buildPsychotherapyCards } from './seeds/psychotherapies';
import { buildMedicationSelectionCards } from './seeds/medicationSelection';
import { buildPsychometricsCards } from './seeds/psychometrics';


export function buildLegacyLibrary(): Card[] {
  return [
    ...mbcCards,
    ...rapidTriageCards,
    ...medicationOrderCards,
    ...buildPsychotherapyCards(),
    ...buildMedicationSelectionCards(),
    ...buildPsychometricsCards(),
  ];
}
