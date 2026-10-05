import type { Enonce } from "../core/generateur.types";
import type { TermeCoefficient } from "../core/analyseFonction.types";

function valeurTerme(terme: TermeCoefficient, enonce: Enonce): number {
  return terme === "a" ? enonce.a : terme === "b" ? enonce.b : enonce.c;
}

/** "x^2", "3x^2", "x", "5x", "5" — jamais le coefficient 1/-1 explicite (convention du projet). */
function texteMagnitude(terme: TermeCoefficient, enonce: Enonce): string {
  const abs = Math.abs(valeurTerme(terme, enonce));
  if (terme === "c") return `${abs}`;
  const suffixe = terme === "a" ? "x^2" : "x";
  return abs === 1 ? suffixe : `${abs}${suffixe}`;
}

function joindre(parties: { signeNegatif: boolean; texte: string }[]): string {
  return parties
    .map((partie, index) => {
      if (index === 0) return partie.signeNegatif ? `-${partie.texte}` : partie.texte;
      return partie.signeNegatif ? `- ${partie.texte}` : `+ ${partie.texte}`;
    })
    .join(" ");
}

/**
 * f(x) = ... avec les termes non nuls affichés dans l'ordre fourni (mélangé à la génération,
 * section 2 de la spec) — jamais un terme nul affiché explicitement.
 */
export function formatFonctionOrdreLatex(enonce: Enonce, ordre: TermeCoefficient[]): string {
  if (ordre.length === 0) return "f(x) = 0";
  const corps = joindre(
    ordre.map((terme) => ({ signeNegatif: valeurTerme(terme, enonce) < 0, texte: texteMagnitude(terme, enonce) })),
  );
  return `f(x) = ${corps}`;
}

const COULEUR_A = "#d6336c";
const COULEUR_B = "#1971c2";
const COULEUR_C = "#2f9e44";
const COULEURS: Record<TermeCoefficient, string> = { a: COULEUR_A, b: COULEUR_B, c: COULEUR_C };

/**
 * f(x)=a·x²+b·x+c, toujours dans l'ordre canonique a,b,c (indépendamment de l'ordre mélangé de
 * l'étape 1) et coefficients colorés (bouton aide + révélation, section 2) — contrairement à
 * formatFonctionOrdreLatex, montre **toujours les 3 termes**, y compris un coefficient nul
 * (correction 2, prompt-8-corrections-analyse-fonction.md) : le but ici est de montrer où se
 * trouve chaque coefficient littéral dans l'expression canonique, pas d'écrire `f(x)` sous sa
 * forme mathématique la plus naturelle (qui, elle, omet bien les termes nuls — voir l'énoncé de
 * départ, étape 1, inchangé). Le coefficient littéral n'est jamais omis même s'il vaut 1/-1, pour
 * la même raison.
 */
export function formatFonctionColoreeLatex(enonce: Enonce): string {
  const ordre = ["a", "b", "c"] as const;

  const corps = joindre(
    ordre.map((terme) => {
      const abs = Math.abs(valeurTerme(terme, enonce));
      const suffixe = terme === "a" ? "x^2" : terme === "b" ? "x" : "";
      return { signeNegatif: valeurTerme(terme, enonce) < 0, texte: `\\textcolor{${COULEURS[terme]}}{${abs}}${suffixe}` };
    }),
  );
  return `f(x) = ${corps}`;
}

/** Tolérance réellement vérifiée sur AS/xS/yS = `0.005` (`diagnostiquerAxeSommet`,
 * `verificationAnalyseFonction.ts`) — soit un arrondi au centième, jamais annoncé jusqu'ici. */
export function consigneAxeSommet(): string {
  return "Donne l'axe de symétrie et les coordonnées du sommet (arrondi au centième accepté si besoin).";
}
