/**
 * 5gen22 (lecture graphique des limites et asymptotes) — lots B–D, règles communes : aides à deux
 * niveaux (niveau 1 = ce qu'on lit et où, niveau 2 = la lecture posée pour CE graphique, jamais la
 * valeur) et messages ciblés (côté d'approche échangé, signe de l'infini, abscisse de l'asymptote
 * donnée au lieu de la limite, AV / AH confondues, pente ou ordonnée de l'oblique).
 */
import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import type { ExerciceLectureGraphiqueLimites } from "../core5e/lectureGraphiqueLimites.types";
import { listeAsymptotes, listeComportements, type PhaseLectureGraphiqueLimites, type ReponseNommerAsymptotes } from "../moteur5e/typesLectureGraphiqueLimites";
import { lireLimite, valeurExpression } from "../moteur5e/saisieLimites";
import { retirerPrefixeEquation } from "../moteur5e/verificationLectureGraphiqueLimites";
import type { AideTrig } from "./aidesTrigonometrie";

const t = (valeur: string): FragmentConsigne => ({ type: "texte", valeur });
const l = (valeur: string): FragmentConsigne => ({ type: "latex", valeur });

export function aidesLectureGraphique(e: ExerciceLectureGraphiqueLimites, phase: PhaseLectureGraphiqueLimites): AideTrig[] {
  const positions = e.vas.map((v) => `x=${v.position}`);
  if (phase === "completerLimites") {
    return [
      {
        texte: [
          t("Une limite se lit sur l'axe des ordonnées : vers quelle valeur de y va la courbe ? Le long d'une droite verticale, elle monte ("),
          l("+\\infty"),
          t(") ou descend ("),
          l("-\\infty"),
          t(") ; à gauche, on regarde la branche juste avant la droite ("),
          l("x\\to a^-"),
          t("), à droite la branche juste après ("),
          l("x\\to a^+"),
          t(")."),
        ],
      },
      {
        texte: [
          t("Ici, suis chaque branche avec le doigt : "),
          ...(positions.length ? [t("près de "), l(positions.join("\\ \\text{et}\\ ")), t(", d'abord à gauche puis à droite ; ")] : []),
          t("puis tout à gauche ("),
          l("x\\to-\\infty"),
          t(") et tout à droite ("),
          l("x\\to+\\infty"),
          t(") : la courbe se stabilise-t-elle à une hauteur, ou part-elle vers le haut ou le bas ?"),
        ],
      },
    ];
  }
  return [
    {
      texte: [
        t("Une limite infinie en "),
        l("x=a"),
        t(" donne l'asymptote verticale "),
        l("x=a"),
        t(" ; une limite finie b en "),
        l("\\pm\\infty"),
        t(" donne l'asymptote horizontale "),
        l("y=b"),
        t(" ; une droite non horizontale que la courbe longe en "),
        l("\\pm\\infty"),
        t(" est une asymptote oblique "),
        l("y=ax+b"),
        t("."),
      ],
    },
    {
      texte: [
        t("Ici, reprends les limites de l'écran précédent : chaque limite infinie en une valeur de x, chaque limite finie en "),
        l("\\pm\\infty"),
        t(". Pour une oblique, lis deux points de la droite en pointillés, par exemple en "),
        l("x=0"),
        t(" et en "),
        l("x=1"),
        t("."),
      ],
    },
  ];
}

/** Message ciblé pour l'écran « completerLimites » (première erreur repérée). */
export function cibleComportements(e: ExerciceLectureGraphiqueLimites, textes: string[]): FragmentConsigne[] | null {
  const slots = listeComportements(e);
  const valeurs = textes.map((s) => lireLimite(s));
  const egal = (v: number | null, c: (typeof slots)[number]["cible"]) => v !== null && (c.kind === "infini" ? v === c.signe * Infinity : Number.isFinite(v) && Math.abs(v - c.valeur) < 1e-9);
  for (let i = 0; i < slots.length; i++) {
    const v = valeurs[i];
    const s = slots[i];
    if (v === null || egal(v, s.cible)) continue;
    if (s.id.kind === "va") {
      const autre = slots.find((o) => o.id.kind === "va" && o.id.index === (s.id as { index: number }).index && o.id.cote !== (s.id as { cote: string }).cote);
      if (autre && egal(v, autre.cible)) return [t("Gauche et droite échangées : à gauche, on lit la branche juste AVANT la droite verticale ("), l("x\\to a^-"), t(").")];
      const va = e.vas[s.id.index];
      if (Number.isFinite(v) && Math.abs(v - va.position) < 1e-9 && s.cible.kind === "infini") return [t("C'est l'abscisse de l'asymptote : la limite se lit sur l'axe des ordonnées (la courbe monte ou descend le long de "), l(`x=${va.position}`), t(").")];
      if (s.cible.kind === "infini" && v === -s.cible.signe * Infinity) return [t("Signe de l'infini : regarde si la branche monte ("), l("+\\infty"), t(") ou descend ("), l("-\\infty"), t(") le long de la droite verticale.")];
      if (s.cible.kind === "fini") return [t("De ce côté, la courbe s'arrête en un point plein : la limite est son ordonnée, un nombre réel.")];
    } else {
      if (s.cible.kind === "fini" && !Number.isFinite(v)) return [t("En "), l(s.id.cote === "gauche" ? "-\\infty" : "+\\infty"), t(", la courbe se stabilise à une hauteur : la limite est un nombre réel (l'ordonnée de l'asymptote horizontale).")];
      if (s.cible.kind === "infini" && Number.isFinite(v)) return [t("En "), l(s.id.cote === "gauche" ? "-\\infty" : "+\\infty"), t(", la courbe ne se stabilise pas : elle part vers le haut ou vers le bas.")];
      if (s.cible.kind === "infini") return [t("Signe de l'infini : tout à "), t(s.id.cote === "gauche" ? "gauche" : "droite"), t(", la courbe monte-t-elle ou descend-elle ?")];
      return [t("Lis l'ordonnée de la droite horizontale que la courbe longe de ce côté.")];
    }
  }
  return null;
}

/** Message ciblé pour l'écran « nommerAsymptotes ». */
export function cibleAsymptotesNommees(e: ExerciceLectureGraphiqueLimites, r: ReponseNommerAsymptotes): FragmentConsigne[] | null {
  const slots = listeAsymptotes(e);
  if (r.aucune) return slots.length ? [t("Le graphique a des asymptotes : reprends les limites infinies (asymptotes verticales) et les limites finies en "), l("\\pm\\infty"), t(" (horizontales).")] : null;
  for (const ligne of r.lignes) {
    const texte = retirerPrefixeEquation(ligne.texte);
    const v = lireLimite(texte);
    if (ligne.type === "verticale" && v !== null && slots.some((s) => s.cible.kind === "horizontale" && Math.abs(s.cible.y - v) < 1e-9) && !slots.some((s) => s.cible.kind === "verticale" && Math.abs(s.cible.x - v) < 1e-9))
      return [t("Asymptotes verticale et horizontale confondues : une verticale s'écrit "), l("x=a"), t(" (une valeur de x où la courbe part à l'infini), une horizontale "), l("y=b"), t(".")];
    if (ligne.type === "horizontale" && v !== null && slots.some((s) => s.cible.kind === "verticale" && Math.abs(s.cible.x - v) < 1e-9) && !slots.some((s) => s.cible.kind === "horizontale" && Math.abs(s.cible.y - v) < 1e-9))
      return [t("Asymptotes horizontale et verticale confondues : une horizontale s'écrit "), l("y=b"), t(" (la hauteur atteinte en "), l("\\pm\\infty"), t(").")];
    if (ligne.type === "oblique") {
      const ao = slots.find((s) => s.cible.kind === "oblique");
      if (!ao) return [t("La courbe ne longe aucune droite oblique : en "), l("\\pm\\infty"), t(", elle se stabilise ou part sans suivre de droite.")];
      if (ao.cible.kind !== "oblique") continue;
      const y0 = valeurExpression(texte, 0);
      const y1 = valeurExpression(texte, 1);
      if (y0 === null || y1 === null) continue;
      const pente = y1 - y0;
      if (Math.abs(y0 - ao.cible.ordonnee) < 1e-9 && Math.abs(pente - ao.cible.pente) > 1e-9) return [t("L'ordonnée à l'origine est juste ; la pente se lit entre deux points de la droite : de combien monte-t-elle quand x augmente de 1 ?")];
      if (Math.abs(pente - ao.cible.pente) < 1e-9 && Math.abs(y0 - ao.cible.ordonnee) > 1e-9) return [t("La pente est juste ; l'ordonnée à l'origine est la hauteur de la droite en "), l("x=0"), t(".")];
    }
  }
  const nbAttendu = slots.length;
  if (r.lignes.length < nbAttendu) return [t("Il manque une asymptote : chaque limite infinie en un point et chaque limite finie en "), l("\\pm\\infty"), t(" en donne une.")];
  if (r.lignes.length > nbAttendu) return [t("Une asymptote de trop : deux limites finies égales en "), l("-\\infty"), t(" et "), l("+\\infty"), t(" donnent UNE seule asymptote horizontale.")];
  return null;
}
