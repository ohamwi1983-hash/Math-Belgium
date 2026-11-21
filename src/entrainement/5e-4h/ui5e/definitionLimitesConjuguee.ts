import type { ExerciceConjuguee } from "../core5e/limitesConjuguee";
import type { ChampEcran, DefinitionEcrans } from "./ecransTrigo.types";
import type { PhaseConjuguee } from "./formatLimitesConjuguee";
import { aide1, aide2, champsPartielles, consigne, consigneGenerale, libelle, libelleLimite, messageIllisible, optionsForme, PHASES, RACCOURCIS_LIMITE, recap, reponse } from "./formatLimitesConjuguee";
import { approchee, aReprendre, diagnostiquer, piege } from "../moteur5e/verificationLimitesConjuguee";
import { saisieTrigVersLatex } from "../moteur5e/saisieTrig";
import { correctionDetailleeConjuguee } from "../generateurs5e/limitesConjuguee/corrigeDetaille";

/** Aperçu KaTeX d'un nombre saisi (rien pour un entier simple ni pour un infini). */
function apercuNombre(t: string): string | null {
  if (/∞|inf/i.test(t)) return null;
  const l = saisieTrigVersLatex(t);
  return l && !/^-?[\d{},]+$/.test(l) ? l : null;
}

const RACCOURCIS_EXPR = [
  { libelle: "√", texte: "√(" },
  { libelle: "x²", texte: "x²" },
  { libelle: ")", texte: ")" },
];

function champsTransformer(e: ExerciceConjuguee): ChampEcran[] {
  if (e.sous === "E1") return [{ label: "Facteur devant la racine", placeholder: "ex. : 2x", apercu: true }];
  return [
    { label: "Expression conjuguée", placeholder: "ex. : √(x + 7) − 2", apercu: true, raccourcis: RACCOURCIS_EXPR },
    { label: "Produit de l'expression par sa conjuguée", placeholder: "ex. : 7x − 2", apercu: true, raccourcis: RACCOURCIS_EXPR },
  ];
}

/** `5gen64` : forme (choix fermé), transformation (conjuguée + produit, ou facteur |x| = −x),
 * limites partielles (deux champs), limite exacte (un champ). */
export const DEFINITION_LIMITES_CONJUGUEE: DefinitionEcrans<ExerciceConjuguee, PhaseConjuguee> = {
  phases: () => PHASES,
  estChoix: (_e, p) => p === "forme",
  mode: (e, p) => {
    if (p === "forme") return { type: "choix", options: optionsForme() };
    if (p === "transformer") return { type: "champs", champs: champsTransformer(e) };
    if (p === "partielles") return { type: "champs", champs: champsPartielles(e).map((c) => ({ ...c, apercuLatex: apercuNombre })) };
    return { type: "champs", champs: [{ label: "Valeur exacte de la limite", labelLatex: libelleLimite(e), placeholder: "ex. : 3/2, −1/4 ou √3/6", apercuLatex: apercuNombre, raccourcis: RACCOURCIS_LIMITE }] };
  },
  libelle,
  consigneGenerale,
  consigne,
  aide1,
  aide2,
  aidesChoixDeuxNiveaux: true,
  diagnostiquer,
  piege,
  approchee,
  aReprendre,
  piegeChoixRevele: true,
  messageIllisible,
  reponseAttendue: reponse,
  recap,
  correction: correctionDetailleeConjuguee,
};
