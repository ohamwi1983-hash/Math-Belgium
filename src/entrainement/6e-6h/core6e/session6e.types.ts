/**
 * Couche core (6e) — réglages de session, propres à ce chantier (jamais `core/session.types.ts`
 * du 4e ni `core5e/session5e.types.ts` du 5e — voir CLAUDE.md, "Chantier 6e FWB (6h)" : aucun
 * contrat partagé entre les trois chantiers). Structurellement identique aux deux autres (même
 * besoin), délibérément dupliqué plutôt qu'importé.
 */
export interface ReglagesSession6e {
  nombreExercices: number;
  tentativesMax: number;
  penaliteActivee: boolean;
}
