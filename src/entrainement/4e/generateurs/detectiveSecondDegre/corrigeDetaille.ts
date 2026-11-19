import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, ligne, piege as lignePiege, resultat, texte, utilise } from "../../../export/corrigeTableau";
import type { DonneesDetectiveSecondDegre } from "../../core/detectiveSecondDegre.types";
import { deltaEcrit, enonceLatex, ensembleSolutionLatex, indiceLigneFausse, interditDansBaseCopie, numerateurIR, solutionCopie, solutionCorrecte, symboleInverse, symboleLatex } from "../../moteur/modeleDetectiveSecondDegre";
import { coefsInequation, descriptionFragments, piege, regle, reponseFragments } from "../../ui/formatDetectiveSecondDegre";
import { lineaire, mono, moinsH, nombreTexte, polynome, q, sansDoublons } from "../../ui/corrigeChapitre3";

/**
 * Corrigé détaillé « comme au tableau » de gen121 (détective d'erreurs : second degré) — règle
 * `.claude/rules/feuilles-evaluations.md`. Trois étapes = trois écrans : a) la ligne fausse (on refait
 * le calcul de cette ligne et on le compare à la copie), b) l'erreur commise (la règle du cours, le
 * constat chiffré, la description de l'écran, le piège), c) la correction : la résolution complète,
 * une transformation par ligne, puis S. Valeurs du modèle (`moteur/modeleDetectiveSecondDegre.ts`) ;
 * partagé par l'adaptateur papier et l'appli.
 */

type E = DonneesDetectiveSecondDegre;
const lat = (valeur: string): FragmentConsigne => ({ type: "latex", valeur });

/** Les deux racines (−b ± s)/(2a) en lignes : « x_1 = (3 − 7)/4 », « = −1 ». */
function lignesRacines(a: number, b: number, s: number): LigneCalcul[] {
  const v1 = (-b - s) / (2 * a);
  const v2 = (-b + s) / (2 * a);
  return sansDoublons([
    ligne(`x_1=\\dfrac{${q(-b)}-${s}}{${2 * a}}`, "formule des racines, avec −√Δ"),
    ligne(`=${q(v1)}`),
    ligne(`x_2=\\dfrac{${q(-b)}+${s}}{${2 * a}}`, "avec +√Δ"),
    ligne(`=${q(v2)}`),
  ]);
}

function lignesDelta(a: number, b: number, c: number): LigneCalcul[] {
  const d = b * b - 4 * a * c;
  const p = -4 * a * c;
  return [ligne(`\\Delta=${deltaEcrit(a, b, c)}`, "Δ = b² − 4ac"), ligne(`=${b * b}${p < 0 ? "-" : "+"}${Math.abs(p)}`), ligne(`=${d}`)];
}

/** Résolution CORRECTE, en blocs (intitulé, lignes). */
function blocsResolution(e: E): { titre: string; lignes: LigneCalcul[] }[] {
  switch (e.variante) {
    case "discriminant": {
      const s = Math.round(Math.sqrt(e.b * e.b - 4 * e.a * e.c));
      return [
        { titre: "Discriminant", lignes: lignesDelta(e.a, e.b, e.c) },
        { titre: "Racines", lignes: [ligne(`\\sqrt{\\Delta}=${s}`, "Δ > 0 : deux solutions"), ...lignesRacines(e.a, e.b, s)] },
      ];
    }
    case "miseEnEvidence": {
      if (e.forme === "x") {
        const lin = lineaire(e.k, -e.m);
        return [
          {
            titre: "Mise en évidence",
            lignes: [ligne(`${mono(e.k, "x^2")}=${mono(e.m, "x")}`), ligne(`${polynome([e.k, -e.m, 0])}=0`, "on passe tout dans le membre de gauche"), ligne(`x(${lin})=0`, "x mis en évidence")],
          },
          {
            titre: "Produit nul",
            lignes: sansDoublons([ligne("x=0", "premier facteur nul"), ligne(`${lin}=0`, "second facteur nul"), ligne(`${mono(e.k, "x")}=${q(e.m)}`), ligne(`x=${q(e.m / e.k)}`, `on divise par ${nombreTexte(e.k)}`)]),
          },
        ];
      }
      const f = moinsH(-e.p);
      const g = moinsH(e.m - e.p);
      const k = Math.abs(e.m);
      return [
        {
          titre: "Mise en évidence",
          lignes: [
            ligne(`(${f})^2${e.m > 0 ? "-" : "+"}${k === 1 ? "" : k}(${f})=0`, "on passe tout dans le membre de gauche"),
            ligne(`(${f})\\,[(${f})${e.m > 0 ? "-" : "+"}${k}]=0`, `(${f.replace(/-/g, "−")}) mis en évidence`),
            ligne(`(${f})(${g})=0`, "on réduit le second facteur"),
          ],
        },
        { titre: "Produit nul", lignes: [ligne(`${f}=0\\iff x=${q(-e.p)}`, "premier facteur nul"), ligne(`${g}=0\\iff x=${q(e.m - e.p)}`, "second facteur nul")] },
      ];
    }
    case "sansSolution":
      return [{ titre: "Discriminant", lignes: [...lignesDelta(e.a, e.b, e.c), ligne("\\Delta<0", "aucune solution réelle")] }];
    case "inequation": {
      const s = e.r1 + e.r2;
      const P = e.r1 * e.r2;
      const inv = symboleInverse(e.symbole);
      const d = Math.abs(e.r2 - e.r1);
      return [
        {
          titre: "Simplification",
          lignes: [ligne(`${polynome(coefsInequation(e))}${symboleLatex(e.symbole)}0`), ligne(`${polynome([1, -s, P])}${symboleLatex(inv)}0`, `on divise par ${nombreTexte(e.k)} < 0 : le sens change`)],
        },
        { titre: "Racines", lignes: [...lignesDelta(1, -s, P), ...lignesRacines(1, -s, d)] },
        { titre: "Signe", lignes: [ligne("a=1>0", "positif à l'extérieur des racines, négatif entre elles")] },
      ];
    }
    case "rationnelle": {
      const s = e.p + e.r;
      const P = e.p * e.r;
      const d = Math.abs(e.p - e.r);
      return [
        { titre: "Condition d'existence", lignes: [ligne(`${moinsH(e.p)}\\neq 0`, "dénominateur non nul"), ligne(`x\\neq ${q(e.p)}`)] },
        { titre: "Équation", lignes: [ligne(`x^2=${lineaire(s, -P)}`, `on multiplie par ${moinsH(e.p).replace(/-/g, "−")} ≠ 0`), ligne(`${polynome([1, -s, P])}=0`, "on passe tout dans le membre de gauche")] },
        { titre: "Racines", lignes: [...lignesDelta(1, -s, P), ...lignesRacines(1, -s, d)] },
        { titre: "Valeur interdite", lignes: [ligne(`x=${q(e.p)}`, "rejetée : elle annule le dénominateur")] },
      ];
    }
    case "inequationRationnelle": {
      const sym = symboleLatex(e.symbole);
      const num = numerateurIR(e);
      const den = moinsH(e.p);
      return [
        { titre: "Condition d'existence", lignes: [ligne(`${den}\\neq 0`, "dénominateur non nul"), ligne(`x\\neq ${q(e.p)}`)] },
        {
          titre: "Signe d'un quotient",
          lignes: [
            ligne(`\\dfrac{${num}}{${den}}-1${sym}0`, "on passe 1 dans le membre de gauche"),
            ligne(`\\dfrac{${num}-(${den})}{${den}}${sym}0`, "même dénominateur"),
            ligne(`\\dfrac{${moinsH(e.z)}}{${den}}${sym}0`, "on réduit le numérateur"),
            ligne(`${moinsH(e.z)}=0\\iff x=${q(e.z)}`, "le quotient s'annule (valeur incluse)"),
            ligne(`${den}=0\\iff x=${q(e.p)}`, "valeur interdite (toujours exclue)"),
          ],
        },
      ];
    }
  }
}

/** a) La ligne fausse refaite et comparée à la copie. */
function lignesControle(e: E): LigneCalcul[] {
  const i = indiceLigneFausse(e) + 1;
  const copie = `ce qu'écrit la copie à la ligne ${i}`;
  switch (e.type) {
    case "carreNegatif": {
      if (e.variante !== "discriminant") return [];
      return [ligne(`(${e.b})^2=${e.b * e.b}`, "le carré d'un nombre négatif est positif"), ligne(`${e.b * e.b}\\neq -${e.b * e.b}`, copie)];
    }
    case "moinsB": {
      if (e.variante !== "discriminant") return [];
      return [ligne(`-b=${q(-e.b)}`, `car b = ${nombreTexte(e.b)}`), ligne(`${q(-e.b)}\\neq ${q(e.b)}`, `début du numérateur de la copie à la ligne ${i}`)];
    }
    case "divisionFacteur": {
      if (e.variante !== "miseEnEvidence") return [];
      const f = e.forme === "x" ? "x" : moinsH(-e.p);
      const zero = e.forme === "x" ? 0 : -e.p;
      return [ligne(`${f}=0\\iff x=${q(zero)}`, "le diviseur peut être nul"), ligne(e.forme === "x" ? `${mono(e.k, "x^2")}=${mono(e.m, "x")}\\quad\\text{pour}\\quad x=0` : `(${q(zero)}${e.p < 0 ? "-" : "+"}${Math.abs(e.p)})^2=0=${e.m}\\cdot 0`, e.forme === "x" ? "0 = 0 : x = 0 est solution" : `x = ${nombreTexte(zero)} est solution`)];
    }
    case "signesRacines": {
      if (e.variante !== "miseEnEvidence") return [];
      if (e.forme === "x") return [ligne(`${lineaire(e.k, -e.m)}=0\\iff x=${q(e.m / e.k)}`, "second facteur nul"), ligne(`${q(e.m / e.k)}\\neq ${q(-e.m / e.k)}`, copie)];
      return [ligne(`${moinsH(-e.p)}=0\\iff x=${q(-e.p)}`, "premier facteur nul"), ligne(`${q(-e.p)}\\neq ${q(e.p)}`, copie)];
    }
    case "signe4ac": {
      if (e.variante !== "sansSolution") return [];
      return [ligne(`-4\\cdot ${e.a}\\cdot ${e.c}=${-4 * e.a * e.c}`, "a et c sont de même signe : ce terme est négatif"), ligne(`${e.b * e.b}-${4 * e.a * e.c}=${e.b * e.b - 4 * e.a * e.c}`), ligne(`${e.b * e.b - 4 * e.a * e.c}\\neq ${e.b * e.b + 4 * e.a * e.c}`, copie)];
    }
    case "deltaNegatifUneSolution":
      return [ligne("\\Delta<0", "aucune solution réelle : la copie annonce une racine double")];
    case "sensNonInverse": {
      if (e.variante !== "inequation") return [];
      return [ligne(`${polynome(coefsInequation(e))}${symboleLatex(e.symbole)}0`), ligne(`${polynome([1, -(e.r1 + e.r2), e.r1 * e.r2])}${symboleLatex(symboleInverse(e.symbole))}0`, `on divise par ${nombreTexte(e.k)} < 0 : le sens change ; la copie garde le sens`)];
    }
    case "signeEntre":
      return [ligne("a=1>0", "positif à l'extérieur des racines ; la copie le dit positif entre elles")];
    case "ceFausse": {
      if (e.variante !== "rationnelle") return [];
      return [ligne(`${moinsH(e.p)}=0\\iff x=${q(e.p)}`, "valeur qui annule le dénominateur"), ligne(`${q(e.p)}\\neq ${q(-e.p)}`, copie)];
    }
    case "racineEtrangere": {
      if (e.variante !== "rationnelle") return [];
      return [ligne(`x=${q(e.p)}`, "deuxième valeur trouvée"), ligne(`${q(e.p)}-${q(e.p).startsWith("-") ? `(${q(e.p)})` : q(e.p)}=0`, "elle annule le dénominateur : elle est interdite")];
    }
    case "produitEnCroix": {
      if (e.variante !== "inequationRationnelle") return [];
      return [ligne(`${moinsH(e.p)}<0\\iff x<${q(e.p)}`, "le signe du dénominateur dépend de x"), ligne(`${numerateurIR(e)}${symboleLatex(e.symbole)}${moinsH(e.p)}`, "la copie multiplie sans connaître ce signe")];
    }
    case "valeurCEIncluse": {
      if (e.variante !== "inequationRationnelle") return [];
      return [ligne(`x\\neq ${q(e.p)}`, "condition d'existence (ligne 1)"), ligne(`${q(e.p)}\\in ${ensembleSolutionLatex(solutionCopie(e))}`, "la copie garde la valeur interdite")];
    }
  }
}

/** Résultat a) : ce que la copie fait de travers. */
function constat(e: E): FragmentConsigne[] {
  const i = indiceLigneFausse(e) + 1;
  const debut = texte(`La ligne ${i} est fausse : `);
  switch (e.type) {
    case "carreNegatif":
      return [debut, texte("le carré de b y est négatif.")];
    case "moinsB":
      return [debut, texte("la formule y commence par b au lieu de −b.")];
    case "divisionFacteur":
      return [debut, texte("la division perd une solution.")];
    case "signesRacines":
      return [debut, texte("les solutions y ont le mauvais signe.")];
    case "signe4ac":
      return [debut, texte("le terme −4ac y est ajouté au lieu d'être soustrait.")];
    case "deltaNegatifUneSolution":
      return [debut, texte("Δ < 0 n'y donne pas « aucune solution ».")];
    case "sensNonInverse":
      return [debut, texte("le sens de l'inégalité n'y change pas.")];
    case "signeEntre":
      return [debut, texte("les zones de signe y sont inversées.")];
    case "ceFausse":
      return [debut, texte("la valeur interdite y est fausse.")];
    case "racineEtrangere":
      return [debut, texte("la valeur interdite y est gardée.")];
    case "produitEnCroix":
      return [debut, texte("on y multiplie par une expression de signe inconnu.")];
    case "valeurCEIncluse":
      return [debut, texte("la valeur interdite y est incluse.")];
  }
}

function correctionBrute(e: E): EtapeCorrection[] {
  const i = indiceLigneFausse(e);
  return [
    utilise("a", [texte("On refait la résolution ligne par ligne à partir de l'énoncé "), lat(enonceLatex(e)), texte(" : la première ligne qui ne redonne pas le même résultat est la ligne fausse.")]),
    calcul("a", lignesControle(e), [texte(`Ligne ${i + 1} refaite :`)]),
    resultat("a", constat(e)),
    utilise("b", regle(e)),
    calcul("b", lignesControle(e).slice(-1)),
    resultat("b", descriptionFragments(e.type, e)),
    lignePiege("b", piege(e)),
    utilise("c", [texte("On reprend toute la résolution, sans l'erreur.")]),
    ...blocsResolution(e).map((b) => calcul("c", b.lignes, [], b.titre)),
    resultat("c", reponseFragments(e)),
  ];
}

export function correctionDetailleeDetectiveSecondDegre(e: E): EtapeCorrection[] {
  return correctionBrute(e);
}

/** L'ensemble de la copie (pour le barème : « résultat de la copie recopié »). */
export function ensembleCopieLatex(e: E): string {
  return ensembleSolutionLatex(solutionCopie(e));
}

export { solutionCorrecte, interditDansBaseCopie };
