/**
 * Couche core (5e) — réglages de session, propres à ce chantier (jamais `core/session.types.ts`
 * du 4e — voir CLAUDE.md, "Chantier 5e FWB (4h)" : aucun contrat partagé entre les deux chantiers).
 * Structurellement identique au contrat 4e (même besoin), délibérément dupliqué plutôt qu'importé.
 */
export interface ReglagesSession5e {
  nombreExercices: number;
  tentativesMax: number;
  penaliteActivee: boolean;
}
