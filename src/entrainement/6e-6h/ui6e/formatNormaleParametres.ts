import type { DonneeNP, ExerciceNP, PhaseNP } from "../core6e/normaleParametres";
import { phases, proportion, valeurTable, xDe, zDe } from "../core6e/normaleParametres";
import type { AideEcran, ChampEcran, DefinitionEcrans, Frag } from "../../5e-4h/ui5e/ecransTrigo.types";
import { lx, tx } from "../../5e-4h/ui5e/ecransTrigo.types";
import { nL, p4L, pctL, zL } from "./textesLoisLotH2";
import { approchee, diagnostiquer, messageIllisible, piege } from "../moteur6e/verificationNormaleParametres";
import { correctionDetailleeNP } from "../generateurs6e/normaleParametres/corrigeDetaille";

/**
 * Couche C — textes de `6gen120` « Loi normale : retrouver μ ou σ ». Source unique de l'écran, du
 * papier et du corrigé. Notation : 𝒩(μ ; σ), Φ, x = μ + zσ (cours, § 6, sens inverse).
 */

type E = ExerciceNP;
type P = PhaseNP;
const t = tx;
const l = lx;

export const CONTEXTES_NP: { phrase: string; objets: string; verbe: string; unite: string }[] = [
  { phrase: "La taille des élèves de 6e année d'une grande école", objets: "élèves", verbe: "mesurent", unite: "cm" },
  { phrase: "La masse des paquets de pâtes remplis par une machine", objets: "paquets", verbe: "pèsent", unite: "g" },
  { phrase: "La durée de vie des ampoules d'une marque", objets: "ampoules", verbe: "durent", unite: "h" },
];

const ctx = (e: E) => CONTEXTES_NP[e.ctx]!;
export const uL = (e: E, x: number) => `${nL(x)}\\text{ ${ctx(e).unite}}`;

function phraseDonnee(e: E, d: DonneeNP, premiere: boolean): Frag[] {
  const c = ctx(e);
  return [l(pctL(proportion(d) * 100, 2)), t(premiere ? ` des ${c.objets} ${c.verbe} ` : ` ${c.verbe} `), t(d.sens === "inf" ? "moins de " : "plus de "), l(uL(e, xDe(e, d)))];
}

export function situation(e: E): Frag[] {
  const c = ctx(e);
  const d = e.donnees;
  if (e.variante === "sigma") return [t(`${c.phrase} suit une loi normale de moyenne `), l(uL(e, e.mu)), t(". On sait que "), ...phraseDonnee(e, d[0]!, true), t(".")];
  if (e.variante === "mu") return [t(`${c.phrase} suit une loi normale d'écart-type `), l(uL(e, e.sigma)), t(". On sait que "), ...phraseDonnee(e, d[0]!, true), t(".")];
  return [t(`${c.phrase} suit une loi normale. On sait que `), ...phraseDonnee(e, d[0]!, true), t(" et que "), ...phraseDonnee(e, d[1]!, false), t(".")];
}

export function question(e: E): Frag[] {
  if (e.variante === "sigma") return [t("Détermine l'écart-type "), l("\\sigma"), t(" de cette loi, au dixième.")];
  if (e.variante === "mu") return [t("Détermine la moyenne "), l("\\mu"), t(" de cette loi, au dixième.")];
  return [t("Détermine la moyenne "), l("\\mu"), t(" et l'écart-type "), l("\\sigma"), t(" de cette loi, au dixième.")];
}

export const consigneGenerale = (e: E): Frag[] => [...situation(e), t(" "), ...question(e)];

export const libelle = (_e: E, p: P): string => (p === "z" ? "Valeur(s) de z" : p === "sigma" ? "Écart-type σ" : "Moyenne μ");

export function consigne(e: E, p: P): Frag[] {
  if (p === "z")
    return e.variante === "systeme"
      ? [t("Donne "), l("z_1"), t(" et "), l("z_2"), t(" tels que "), l(`${nL(xDe(e, e.donnees[0]!))}=\\mu+z_1\\sigma`), t(" et "), l(`${nL(xDe(e, e.donnees[1]!))}=\\mu+z_2\\sigma`), t(" (table de "), l("\\Phi"), t(", au centième, avec leur signe).")]
      : [t("Donne le réel "), l("z"), t(" tel que "), l(`${nL(xDe(e, e.donnees[0]!))}=\\mu+z\\sigma`), t(" (table de "), l("\\Phi"), t(", au centième, avec son signe).")];
  if (p === "sigma") return [t("Calcule l'écart-type "), l("\\sigma"), t(", au dixième.")];
  return [t("Calcule la moyenne "), l("\\mu"), t(", au dixième.")];
}

export function champs(e: E, p: P): ChampEcran[] {
  if (p === "z")
    return e.variante === "systeme"
      ? [
          { label: "z₁", labelLatex: "z_1=", placeholder: "au centième" },
          { label: "z₂", labelLatex: "z_2=", placeholder: "au centième" },
        ]
      : [{ label: "z", labelLatex: "z=", placeholder: "au centième" }];
  return [{ label: p === "sigma" ? "Écart-type σ" : "Moyenne μ", labelLatex: p === "sigma" ? "\\sigma=" : "\\mu=", placeholder: "au dixième", unite: ctx(e).unite }];
}

export function reponse(e: E, p: P): Frag[] {
  if (p === "z") return e.donnees.length === 2 ? [l(`z_1=${zL(zDe(e.donnees[0]!))}`), t(" et "), l(`z_2=${zL(zDe(e.donnees[1]!))}`)] : [l(`z=${zL(zDe(e.donnees[0]!))}`)];
  if (p === "sigma") return [l(`\\sigma=${uL(e, e.sigma)}`)];
  return [l(`\\mu=${uL(e, e.mu)}`)];
}

export const recap = reponse;

export function aide1(e: E, p: P): AideEcran {
  if (p === "z") return { texte: [t("Sens inverse (cours, point 6) : avec "), l("Z=\\dfrac{X-\\mu}{\\sigma}"), t(", la proportion donne "), l("\\Phi(z)"), t(" ; cherche-la dans le corps de la table. Une borne sous la moyenne a un "), l("z"), t(" négatif :")], latex: "P(X\\ge x)=1-\\Phi(z)\\qquad \\Phi(-z)=1-\\Phi(z)" };
  if (p === "sigma") return e.variante === "systeme" ? { texte: [t("Soustrais les deux égalités : "), l("\\mu"), t(" disparaît.")], latex: "x_2-x_1=(z_2-z_1)\\,\\sigma" } : { texte: [t("Relation entre une valeur et son "), l("z"), t(" :")], latex: "x=\\mu+z\\sigma" };
  return { texte: [t("Relation entre une valeur et son "), l("z"), t(" :")], latex: "x=\\mu+z\\sigma" };
}

export function aide2(e: E, p: P): AideEcran | null {
  const d = e.donnees;
  if (p === "z") {
    const morceaux: Frag[] = [t("Ici :")];
    const lignes = d.map((x, i) => {
      const nom = d.length === 2 ? `z_${i + 1}` : "z";
      const pr = p4L(proportion(x));
      return x.sens === "inf" ? `\\Phi(${nom})=${pr}` : `1-\\Phi(${nom})=${pr}`;
    });
    return { texte: [...morceaux, t(" (si la probabilité de gauche est inférieure à "), l("0{,}5"), t(", le "), l("z"), t(" est négatif)")], latex: lignes.join("\\qquad ") };
  }
  if (p === "sigma") {
    if (e.variante === "systeme") return { texte: [t("Ici :")], latex: `${nL(xDe(e, d[1]!))}-${nL(xDe(e, d[0]!))}=(${zL(zDe(d[1]!))}-(${zL(zDe(d[0]!))}))\\,\\sigma` };
    return { texte: [t("Ici :")], latex: `${nL(xDe(e, d[0]!))}=${nL(e.mu)}+(${zL(zDe(d[0]!))})\\,\\sigma` };
  }
  const di = d[0]!;
  return { texte: [t("Ici :")], latex: `${nL(xDe(e, di))}=\\mu+(${zL(zDe(di))})\\times ${nL(e.sigma)}` };
}

export const valeurTableL = (d: DonneeNP) => p4L(valeurTable(d));

/** `6gen120` : z (un ou deux champs), puis σ et / ou μ. */
export const DEFINITION_NP: DefinitionEcrans<E, P> = {
  phases,
  estChoix: () => false,
  mode: (e, p) => ({ type: "champs", champs: champs(e, p) }),
  libelle,
  consigneGenerale,
  consigne,
  approchee,
  aide1,
  aide2,
  diagnostiquer,
  piege,
  messageIllisible,
  reponseAttendue: reponse,
  recap,
  correction: correctionDetailleeNP,
};
