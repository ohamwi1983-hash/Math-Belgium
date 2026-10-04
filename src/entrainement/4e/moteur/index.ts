/**
 * Couche B — moteur de session (section 3 de la spec).
 * N'importe jamais rien de src/generateurs : générique pour tout générateur respectant
 * le contrat GenerateurExercice (voir src/moteur/session.test.ts pour la preuve avec
 * un générateur factice minimal).
 */
export type { EtatSession, Phase, ReponseZeros, ResultatExercice } from "./types";
export {
  activerAideChamp1,
  activerAideDevelopper,
  activerAideIsolement,
  activerAideSimplification,
  activerAideZeros,
  demarrerSession,
  soumettreChoixCategorie,
  soumettreReponseChamp1,
  soumettreReponseChamp2,
  soumettreReponseDevelopper,
  soumettreReponseIsolement,
  soumettreReponseSimplification,
} from "./session";
export { enonceSimplifie, exerciceSimplifie, facteurCommun, necessiteSimplification } from "./simplificationEquation";
export type { ConfigEtapeTentatives, EtatEtapeTentatives, ReglagesEtape } from "./etapeTentatives";
export { demarrerEtapeTentatives, soumettreEtapeTentatives } from "./etapeTentatives";
export type { StatutVerification } from "./statutVerification";
export {
  diagnostiquerChampPrincipal,
  diagnostiquerIsolement,
  diagnostiquerSimplification,
  verifierChampPrincipal,
  verifierIsolement,
  verifierRacines,
  verifierSimplification,
  verifierZeros,
} from "./verification";
export {
  evaluerExpression,
  verifierFormeCanonique,
  verifierFormeFactorisee,
  verifierMiseEnEvidenceGeneralisee,
} from "./expressionAlgebrique";
