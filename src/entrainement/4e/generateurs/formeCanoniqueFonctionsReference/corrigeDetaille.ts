import type { ExerciceFormeCanoniqueFonctionReference, FamilleReference } from "../../core/formeCanoniqueFonctionsReference.types";
import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import { cibleFinale } from "../../moteur/verificationFormeCanoniqueFonctionsReference";
import {
  fonctionReferenceLatex,
  formatCibleLatex,
  formatFormeDepartLatex,
  formatGabaritEtape2Latex,
  formatGabaritEtape3Latex,
  formatGabaritEtape4Latex,
  formatGabaritLatex,
} from "../../ui/formatFormeCanoniqueFonctionsReference";
import { COURS_FAMILLES, COURS_TRANSFORMATIONS, lineaire, moinsH, nombreTexte, plusQ, q, qp, sansDoublons, somme } from "../../ui/corrigeChapitre3";
import { construireGrapheFonctionReference } from "../fonctionsReference/figures";

/**
 * Corrigé détaillé « comme au tableau » de gen11 (forme canonique d'une fonction de référence
 * transformée) — règle `.claude/rules/feuilles-evaluations.md`. Une étape par écran : a) famille,
 * b) forme canonique (calcul complet depuis la forme de départ), c) EH, CH, SOY, d) TH,
 * e) EV, CV, SOX, f) TV — les transformations sont UNE décomposition possible, lue sur le gabarit
 * affiché par l'écran (`formatGabaritLatex`). Valeurs tirées des fonctions de l'écran
 * (`cibleFinale`, `formatCibleLatex`, gabarits) ; partagé par l'adaptateur papier et l'appli. Les
 * fonctions intermédiaires f₁, f₂, f₃ viennent telles quelles, nom compris, des gabarits partiels
 * affichés par l'écran (`formatGabaritEtape2Latex`…, noms `FONCTION_ETAPE2`…) : une seule source.
 */

type E = ExerciceFormeCanoniqueFonctionReference;

const NOM_FAMILLE: Record<FamilleReference, string> = {
  carre: "fonction carré",
  cube: "fonction cube",
  racine_carree: "fonction racine carrée",
  racine_cubique: "fonction racine cubique",
  inverse: "fonction inverse",
  valeur_absolue: "fonction valeur absolue",
};

const ENVELOPPE: Record<FamilleReference, string> = {
  carre: "x n'apparaît qu'au premier et au second degré : un carré à compléter",
  cube: "l'expression en x est élevée au cube",
  racine_carree: "l'expression en x est sous une racine carrée",
  racine_cubique: "l'expression en x est sous une racine cubique",
  inverse: "x est au dénominateur d'une fraction",
  valeur_absolue: "l'expression en x est dans une valeur absolue",
};

const enDfrac = (l: string) => l.replace(/\\frac/g, "\\dfrac");
const sansF = (l: string) => enDfrac(l.replace(/^f\(x\) = /, ""));

function egal(a: number, b: number): boolean {
  return Math.abs(a - b) < 1e-9;
}

/** Préfixe d'un facteur placé devant une parenthèse : « », « - », « 3 », « \dfrac{1}{2} ». */
function devant(k: number): string {
  if (egal(k, 1)) return "";
  if (egal(k, -1)) return "-";
  return q(k);
}

function lignesCanonique(e: E): LigneCalcul[] {
  const f = e.formeDepart;
  const cible = sansF(formatCibleLatex(e.famille, cibleFinale(e)));
  const lignes: LigneCalcul[] = [ligne(formatFormeDepartLatex(e), "forme de départ")];
  const fin = (justification: string) => lignes.push(ligne(`=${cible}`, justification));
  const K = (e.sox ? -1 : 1) * (e.ev / e.cv);
  const Q = e.tv;
  switch (f.type) {
    case "carre": {
      const p = -f.b / (2 * f.a);
      if (egal(p, 0)) {
        fin("pas de terme en x : déjà la forme canonique, avec p = 0");
        break;
      }
      const lin = somme([
        [1, "x^2"],
        [f.b / f.a, "x"],
      ]);
      if (!egal(f.a, 1)) lignes.push(ligne(`=${devant(f.a)}(${lin})${plusQ(f.c)}`, `on met ${nombreTexte(f.a)} en évidence dans les termes en x`));
      const crochet = `(${moinsH(p)})^2-${qp(p)}^2`;
      lignes.push(ligne(`=${egal(f.a, 1) ? crochet : `${devant(f.a)}[${crochet}]`}${plusQ(f.c)}`, "x² + 2kx = (x + k)² − k²"));
      if (!egal(f.a, 1)) lignes.push(ligne(`=${devant(f.a)}(${moinsH(p)})^2${plusQ(-f.a * p * p)}${plusQ(f.c)}`, `on distribue ${nombreTexte(f.a)}`));
      fin("on regroupe les constantes");
      break;
    }
    case "cube": {
      const p = -f.a / f.b;
      const b3 = f.b ** 3;
      if (egal(p, 0)) {
        lignes.push(ligne(`=${devant(K)}${egal(K, 1) || egal(K, -1) ? "" : "\\cdot "}${qp(f.b)}^3x^3${plusQ(Q)}`, "(b·x)³ = b³·x³"));
      } else {
        lignes.push(ligne(`=${devant(K)}[${devant(f.b)}(${moinsH(p)})]^3${plusQ(Q)}`, `on met ${nombreTexte(f.b)} en évidence dans le cube`));
        lignes.push(ligne(`=${devant(K)}${egal(K, 1) || egal(K, -1) ? "" : "\\cdot "}${qp(f.b)}^3(${moinsH(p)})^3${plusQ(Q)}`, "(b·u)³ = b³·u³"));
      }
      fin(`on calcule le coefficient : ${egal(K, 1) ? "" : `${nombreTexte(K)} × `}(${nombreTexte(f.b)})³ = ${nombreTexte(K * b3)}`);
      break;
    }
    case "racine_carree":
    case "racine_cubique": {
      const p = -f.b / f.a;
      if (egal(p, 0)) {
        fin("pas de terme constant sous la racine : déjà la forme canonique, avec p = 0");
        break;
      }
      fin(`on met ${nombreTexte(f.a)} en évidence sous la racine ; ce coefficient y reste`);
      break;
    }
    case "valeur_absolue": {
      const p = -f.b / f.a;
      const rac = egal(p, 0) ? "x" : `${devant(f.a)}(${moinsH(p)})`;
      if (!egal(p, 0)) lignes.push(ligne(`=${devant(K)}|${rac}|${plusQ(Q)}`, `on met ${nombreTexte(f.a)} en évidence dans la valeur absolue`));
      if (!egal(f.a, 1)) lignes.push(ligne(`=${devant(K)}${egal(K, 1) || egal(K, -1) ? "" : "\\cdot "}${q(f.a)}\\,|${moinsH(p)}|${plusQ(Q)}`, `|a·u| = |a|·|u|, avec |${nombreTexte(f.a)}| = ${nombreTexte(Math.abs(f.a))}`));
      fin("on calcule le coefficient devant la valeur absolue");
      break;
    }
    case "inverse": {
      const quotient = f.a / f.c;
      const reste = f.b - (f.a * f.d) / f.c;
      const p = -f.d / f.c;
      const den = lineaire(f.c, f.d);
      if (!egal(quotient, 0)) {
        lignes.push(ligne(`=\\dfrac{${devant(quotient)}(${den})${plusQ(reste)}}{${den}}`, `on écrit le numérateur à l'aide du dénominateur : ${nombreTexte(quotient)} fois le dénominateur, plus un reste`));
        lignes.push(ligne(`=${q(quotient)}+\\dfrac{${q(reste)}}{${den}}`, "on sépare la fraction en deux termes"));
      }
      if (!egal(f.c, 1)) {
        const avant = egal(quotient, 0) ? "" : `${q(quotient)}+`;
        lignes.push(ligne(`=${avant}\\dfrac{${q(reste)}}{${q(f.c)}(${moinsH(p)})}`, `on met ${nombreTexte(f.c)} en évidence au dénominateur`));
      }
      fin(egal(f.c, 1) ? "on écrit le terme constant à la fin" : `on divise ${nombreTexte(reste)} par ${nombreTexte(f.c)}`);
      break;
    }
  }
  return sansDoublons(lignes);
}

function methode(e: E): string {
  switch (e.formeDepart.type) {
    case "carre":
      return "Compléter le carré : on met le coefficient de x² en évidence dans les termes en x, puis x² + 2kx = (x + k)² − k²";
    case "inverse":
      return "Diviser : on écrit le numérateur à l'aide du dénominateur, on sépare la fraction, puis on met le coefficient de x en évidence au dénominateur";
    case "cube":
      return "On met le coefficient de x en évidence dans le cube, puis il sort au cube : (b·u)³ = b³·u³";
    case "racine_carree":
    case "racine_cubique":
      return "On met le coefficient de x en évidence sous la racine pour faire apparaître x − p ; ce coefficient reste sous la racine";
    case "valeur_absolue":
      return "On met le coefficient de x en évidence dans la valeur absolue, puis il sort en valeur absolue : |a·u| = |a|·|u|";
  }
}

function piegeCanonique(e: E): string {
  switch (e.formeDepart.type) {
    case "carre":
      return "En complétant le carré, le terme soustrait p² est lui aussi multiplié par le coefficient mis en évidence.";
    case "inverse":
      return "Le reste de la division doit encore être divisé par le coefficient de x du dénominateur, pour faire apparaître x − p.";
    case "cube":
      return "Le coefficient mis en évidence dans le cube sort au cube, pas tel quel.";
    case "racine_carree":
    case "racine_cubique":
      return "Le coefficient mis en évidence reste sous la racine : on ne le fait pas sortir.";
    case "valeur_absolue":
      return "Le coefficient sort de la valeur absolue en valeur absolue : un coefficient négatif devient positif.";
  }
}

function rapport(n: number, d: number): string {
  return d === 1 ? `${n}` : `\\dfrac{${n}}{${d}}`;
}

export function correctionDetailleeFormeCanoniqueFonctionsReference(e: E): EtapeCorrection[] {
  const cible = formatCibleLatex(e.famille, cibleFinale(e));
  const gabarit = formatGabaritLatex(e);
  const intro = (titre: string) => [texte(`${titre} (une décomposition possible), lue sur le gabarit `), latex(gabarit), texte(" :")];
  const signeH = e.soy ? "-" : "";
  const signeV = e.sox ? "-" : "";
  return [
    // a) Famille
    utilise("a", [texte(`On repère dans quelle fonction de référence l'expression en x est « enveloppée » ${COURS_FAMILLES}.`)]),
    calcul("a", [ligne(formatFormeDepartLatex(e), ENVELOPPE[e.famille])]),
    resultat("a", [texte(`La ${NOM_FAMILLE[e.famille]} : `), latex(fonctionReferenceLatex(e.famille)), texte(".")]),
    // b) Forme canonique
    utilise("b", [texte(`${methode(e)} ${COURS_TRANSFORMATIONS}.`)]),
    calcul("b", lignesCanonique(e)),
    resultat("b", [latex(cible)]),
    piege("b", [texte(e.th !== 0 && e.formeDepart.type !== "carre" && e.formeDepart.type !== "inverse" ? `${piegeCanonique(e)} Et x + 3 = x − (−3) : le point caractéristique est en x = −3, pas en x = 3.` : piegeCanonique(e))]),
    // c) EH, CH, SOY
    utilise("c", [
      texte("Formule unifiée : "),
      latex("f(x)=\\text{SOX}\\cdot\\dfrac{\\text{EV}}{\\text{CV}}\\cdot g\\!\\left(\\text{SOY}\\cdot\\dfrac{\\text{CH}}{\\text{EH}}\\cdot(x-\\text{TH})\\right)+\\text{TV}"),
      texte(` ; le coefficient de l'argument donne SOY (son signe) et le rapport CH/EH — seul ce rapport compte ${COURS_TRANSFORMATIONS}.`),
    ]),
    calcul(
      "c",
      [
        ligne(`\\text{SOY}\\cdot\\dfrac{\\text{CH}}{\\text{EH}}=${signeH}${rapport(e.ch, e.eh)}`, e.soy ? "coefficient négatif : symétrie d'axe Oy" : "coefficient positif : pas de symétrie d'axe Oy"),
        ligne(`\\text{CH}=${e.ch}`, e.ch > 1 ? "compression horizontale" : "pas de compression"),
        ligne(`\\text{EH}=${e.eh}`, e.eh > 1 ? "étirement horizontal" : "pas d'étirement"),
        ligne(enDfrac(formatGabaritEtape2Latex(e)), "on applique à g seulement EH, CH et SOY"),
      ],
      intro("EH, CH et SOY"),
    ),
    resultat("c", [latex(`\\text{EH}=${e.eh},\\ \\text{CH}=${e.ch}`), texte(`, SOY : ${e.soy ? "oui" : "non"} ; `), latex(enDfrac(formatGabaritEtape2Latex(e)))]),
    // d) TH
    utilise("d", [texte(`TH est le nombre soustrait à x dans l'argument : le point caractéristique est en x = TH ${COURS_TRANSFORMATIONS}.`)]),
    calcul(
      "d",
      [
        ligne(`x-\\text{TH}=${moinsH(e.th)}`, "parenthèse de l'argument"),
        ligne(`\\text{TH}=${q(e.th)}`, e.th === 0 ? "pas de translation horizontale" : `translation de ${nombreTexte(Math.abs(e.th))} vers ${e.th > 0 ? "la droite" : "la gauche"}`),
        ligne(enDfrac(formatGabaritEtape3Latex(e)), "x devient x − TH dans l'argument"),
      ],
      intro("TH"),
    ),
    resultat("d", [latex(`\\text{TH}=${q(e.th)}`), texte(" ; "), latex(enDfrac(formatGabaritEtape3Latex(e)))]),
    piege("d", [texte("Le signe de TH est l'opposé de celui qu'on lit dans la parenthèse : "), latex("x+3=x-(-3)"), texte(" donne TH = −3.")]),
    // e) EV, CV, SOX
    // Jamais « |a| » : a n'est pas défini à cet endroit, et le coefficient de la forme canonique
    // combine aussi CH et EH. Même formulation que l'écran EV/CV/SOX (`EtapeEvCvSoxFR.tsx`).
    utilise("e", [texte(`Le facteur écrit devant g dans le gabarit donne SOX (un signe « − ») et le rapport EV/CV (sa valeur sans le signe, 1 s'il n'y a pas de facteur) — seul ce rapport compte ${COURS_TRANSFORMATIONS}.`)]),
    calcul(
      "e",
      [
        ligne(`\\text{SOX}\\cdot\\dfrac{\\text{EV}}{\\text{CV}}=${signeV}${rapport(e.ev, e.cv)}`, e.sox ? "facteur négatif : symétrie d'axe Ox" : "facteur positif : pas de symétrie d'axe Ox"),
        ligne(`\\text{EV}=${e.ev}`, e.ev > 1 ? "étirement vertical" : "pas d'étirement"),
        ligne(`\\text{CV}=${e.cv}`, e.cv > 1 ? "compression verticale" : "pas de compression"),
        ligne(enDfrac(formatGabaritEtape4Latex(e)), "la fonction est multipliée par ce facteur"),
      ],
      intro("EV, CV et SOX"),
    ),
    resultat("e", [latex(`\\text{EV}=${e.ev},\\ \\text{CV}=${e.cv}`), texte(`, SOX : ${e.sox ? "oui" : "non"} ; `), latex(enDfrac(formatGabaritEtape4Latex(e)))]),
    // f) TV
    utilise("f", [texte(`TV est le nombre ajouté à la fin : le point caractéristique est à la hauteur y = TV ${COURS_TRANSFORMATIONS}.`)]),
    {
      ...calcul(
        "f",
        [ligne(`\\text{TV}=${q(e.tv)}`, e.tv === 0 ? "pas de translation verticale" : `translation de ${nombreTexte(Math.abs(e.tv))} vers ${e.tv > 0 ? "le haut" : "le bas"}`), ligne(`f(x)=${sansF(gabarit)}`, "on ajoute TV")],
        intro("TV"),
      ),
      // Graphique de f (forme canonique) avec g en pointillés : (0 ; 0) arrive au point
      // caractéristique (TH ; TV), (1 ; 1) au point croix.
      figureHtml: construireGrapheFonctionReference(e, true, "f (forme canonique)"),
    },
    resultat("f", [latex(`\\text{TV}=${q(e.tv)}`), texte(" ; "), latex(gabarit)]),
    verification("f", [texte("Le gabarit et la forme canonique de l'étape 2 sont la même fonction :")], [ligne(`f(x)=${sansF(gabarit)}`), ligne(`=${sansF(cible)}`, "on combine les facteurs")]),
  ];
}

