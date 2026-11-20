import type { ExerciceLireTransformee } from "../core6e/lireTransformeeArc";
import type { DefinitionEcrans } from "../../5e-4h/ui5e/ecransTrigo.types";
import type { PhaseLireTransformee } from "./formatLireTransformeeArc";
import { aide1, aide2, champs, consigne, consigneGenerale, figure, libelle, messageIllisible, phases, recap, reponse } from "./formatLireTransformeeArc";
import { approchee, diagnostiquer, piege } from "../moteur6e/verificationLireTransformeeArc";
import { correctionDetailleeLireTransformee } from "../generateurs6e/lireTransformeeArc/corrigeDetaille";

/** `6gen158` sur le socle d'écrans partagé : domaine et image (intervalles), puis m, n et k, c (champs
 * exacts) — pour arctan, k et c avant m et n. Figure : grille honnête (entiers / multiples de π/4). */
export const DEFINITION_LIRE_TRANSFORMEE: DefinitionEcrans<ExerciceLireTransformee, PhaseLireTransformee> = {
  phases,
  estChoix: () => false,
  mode: (e, p) =>
    p === "domaine" || p === "image"
      ? { type: "intervalles", variable: p === "domaine" ? "x" : "y", placeholders: p === "domaine" ? ["ex. : -3 ou -∞", "ex. : 1 ou +∞"] : ["ex. : -3π/4", "ex. : π/4"] }
      : { type: "champs", champs: champs(e, p) },
  libelle,
  consigneGenerale,
  figure: (e) => figure(e, "ecran"),
  consigne,
  approchee,
  aide1,
  aide2,
  diagnostiquer,
  piege,
  messageIllisible,
  reponseAttendue: reponse,
  recap,
  correction: correctionDetailleeLireTransformee,
};
