import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise } from "../../../export/corrigeTableau";
import type { ExerciceValeurExacte, TermeTrig } from "../../core/valeurExacte.types";
import { exactLatex, oppose, produit, RADICANDES, valeurApprochee, type NombreExact } from "../../moteur/corpsValeurExacte";
import { angleAssocie, angleReduit, groupesAdditifs, necessiteReduction, quadrantDe, signeDe, valeurFonction, valeurGroupe, valeurRemarquable } from "../../moteur/modeleValeurExacte";
import { ecransDe, type EcranValeurExacte } from "../../moteur/sessionValeurExacte";
import { aDesProduitsOuCarres, angleLatex, angleTravail, expressionLatex, fonctionAngleLatex, groupesLatex, resultatLatex, substitutionLatex } from "../../ui/formatValeurExacte";
import { libelleQuadrant } from "../../ui/formatCercleTrigonometrique";
import {
  avecFinale,
  COURS_ASSOCIES,
  COURS_CERCLE,
  COURS_REMARQUABLES,
  dfrac,
  finaliserCorrige,
  ligneQuadrant,
  lignesAnglePremierQuadrant,
  lignesReduction,
  lignesSignes,
  lignesValeurAssociee,
  pgcd,
} from "../../ui/corrigeCercleTrigo";

/**
 * Corrigé détaillé « comme au tableau » de gen76 (valeur exacte sans calculatrice) — règle
 * `.claude/rules/feuilles-evaluations.md`. Une lettre par ÉCRAN de `ecransDe` (même séquence que
 * l'appli) : pour chaque terme, [angle ramené dans [0° ; 360°[], quadrant et signe, angle associé et
 * valeur exacte ; puis la valeur de l'expression (A = …, substitution, produits et carrés, même
 * dénominateur, numérateurs réunis, résultat réduit — `resultatLatex`, comme l'écran).
 * Écrans de pure lecture (niveau) : « quadrant et signe » de chaque terme.
 */

type E = ExerciceValeurExacte;
const LETTRES = "abcdefghijklmnopqrstuvwxyz";

export function lettreEcranValeurExacte(index: number): string {
  return LETTRES[index] ?? String(index + 1);
}

function lettreDe(e: E, type: EcranValeurExacte["type"], terme?: number): string {
  const i = ecransDe(e).findIndex((x) => x.type === type && (x.type === "final" || x.terme === terme));
  return LETTRES[i]!;
}

export function lettresLectureValeurExacte(e: E): string[] {
  return ecransDe(e)
    .map((x, i) => (x.type === "placement" ? LETTRES[i]! : ""))
    .filter((l) => l !== "");
}

// ---------------------------------------------------------------------------------------------
// Nombres à une composante : signe · c√r / d
// ---------------------------------------------------------------------------------------------

interface Monome {
  signe: 1 | -1;
  c: number;
  r: number;
  d: number;
}

function monome(v: NombreExact): Monome {
  const i = v.findIndex((f) => f.n !== 0);
  if (i < 0) return { signe: 1, c: 0, r: 1, d: 1 };
  const f = v[i]!;
  return { signe: f.n < 0 ? -1 : 1, c: Math.abs(f.n), r: RADICANDES[i]!, d: f.d };
}

function numerateur(m: Monome): string {
  if (m.r === 1) return `${m.c}`;
  return m.c === 1 ? `\\sqrt{${m.r}}` : `${m.c}\\sqrt{${m.r}}`;
}

function facteurLatex(l: string): string {
  return l.startsWith("-") ? `\\left(${l}\\right)` : l;
}

/** Un groupe (produit de un ou deux termes, chacun éventuellement au carré) écrit « numérateurs
 * multipliés sur dénominateurs multipliés » : −(√3 · √2)/(2 · 2), (√3)²/2². `null` : terme seul. */
function groupeDetaille(e: E, indices: number[]): string | null {
  const termes = indices.map((i) => e.termes[i]!);
  if (termes.length === 1 && !termes[0]!.carre) return null;
  const nums: string[] = [];
  const dens: string[] = [];
  let signe = 1;
  for (const t of termes) {
    const m = monome(valeurFonction(t));
    const n = numerateur(m);
    if (t.carre) {
      nums.push(m.r === 1 ? `${n}^2` : `(${n})^2`);
      dens.push(`${m.d}^2`);
    } else {
      signe *= m.signe;
      nums.push(n);
      dens.push(`${m.d}`);
    }
  }
  const tousUn = dens.every((d) => d === "1" || d === "1^2");
  const corps = tousUn ? nums.join("\\cdot ") : `\\dfrac{${nums.join("\\cdot ")}}{${dens.join("\\cdot ")}}`;
  return signe < 0 ? `-${corps}` : corps;
}

function assembler(e: E, morceau: (indices: number[], k: number) => string): string {
  return groupesAdditifs(e)
    .map((g, k) => {
      const m = morceau(g.indices, k);
      return k === 0 ? m : `${g.signe === 1 ? "+" : "-"}${facteurLatex(m)}`;
    })
    .join("");
}

function lignesFinales(e: E): LigneCalcul[] {
  const groupes = groupesAdditifs(e);
  const lignes: LigneCalcul[] = [ligne(`A=${expressionLatex(e)}`, "expression à calculer"), ligne(`=${dfrac(substitutionLatex(e))}`, "on remplace chaque terme par sa valeur exacte")];
  if (aDesProduitsOuCarres(e)) {
    const details = groupes.map((g) => groupeDetaille(e, g.indices));
    if (details.some((d) => d !== null)) {
      lignes.push(ligne(`=${assembler(e, (indices) => groupeDetaille(e, indices) ?? dfrac(exactLatex(valeurGroupe(e, indices))))}`, "produits et carrés : numérateurs entre eux, dénominateurs entre eux"));
    }
    lignes.push(ligne(`=${dfrac(groupesLatex(e))}`, [texte("on calcule ("), latex("\\sqrt{a}\\cdot\\sqrt{a}=a"), texte(")")]));
  }
  if (groupes.length > 1) {
    // Valeurs signées des groupes (le signe de l'opération compris).
    const vals = groupes.map((g) => {
      const v = valeurGroupe(e, g.indices);
      return g.signe === 1 ? v : oppose(v);
    });
    const mons = vals.map(monome);
    const D = mons.reduce((acc, m) => (acc / pgcd(acc, m.d)) * m.d, 1);
    if (D > 1) {
      const termes = mons.map((m, k) => {
        const n = { ...m, c: (m.c * D) / m.d };
        const s = m.signe < 0 ? "-" : k === 0 ? "" : "+";
        return { s, n: numerateur(n) };
      });
      if (mons.some((m) => m.d !== D)) lignes.push(ligne(`=${termes.map((t) => `${t.s}\\dfrac{${t.n}}{${D}}`).join("")}`, `même dénominateur ${D}`));
      lignes.push(ligne(`=\\dfrac{${termes.map((t) => `${t.s}${t.n}`).join("")}}{${D}}`, "on réunit les numérateurs"));
    }
  }
  return avecFinale(lignes, dfrac(resultatLatex(e)), "on réduit");
}

// ---------------------------------------------------------------------------------------------
// Étapes
// ---------------------------------------------------------------------------------------------

function signeTexte(s: 1 | -1): string {
  return s === 1 ? "positif" : "négatif";
}

function etapesTerme(e: E, i: number): EtapeCorrection[] {
  const t: TermeTrig = e.termes[i]!;
  const th = angleTravail(t);
  const ft = fonctionAngleLatex(t.fonction, th);
  const etapes: EtapeCorrection[] = [];
  if (necessiteReduction(t)) {
    const l = lettreDe(e, "reduction", i);
    etapes.push(
      utilise(l, [texte(`Ajouter ou retirer un nombre entier de tours de 360° ne change pas le point du cercle, donc pas la valeur de ${t.fonction} ${COURS_CERCLE}.`)]),
      calcul(l, [...lignesReduction(t.angle), ligne(`${fonctionAngleLatex(t.fonction, t.angle)}=${ft}`, "même point du cercle")]),
      resultat(l, [texte("Angle entre 0° et 360° : "), latex(angleLatex(angleReduit(t.angle)))]),
    );
  }
  const lp = lettreDe(e, "placement", i);
  const ligneSigne = lignesSignes(th)[["sin", "cos", "tan"].indexOf(t.fonction)]!;
  etapes.push(
    utilise(lp, [texte(`Quadrant de l'angle, puis signe : sin positif dans les quadrants I et II, cos dans I et IV, tan dans I et III ${COURS_CERCLE}.`)]),
    calcul(lp, [ligneQuadrant(th), ligneSigne]),
    resultat(lp, [texte(`${libelleQuadrant(quadrantDe(t))} ; `), latex(ft), texte(` est ${signeTexte(signeDe(t))}.`)]),
  );
  const lv = lettreDe(e, "valeur", i);
  const a = angleAssocie(t);
  etapes.push(
    utilise(lv, [
      texte(`Angle associé du premier quadrant ${COURS_ASSOCIES}, puis valeur remarquable ${COURS_REMARQUABLES} : `),
      latex(`${fonctionAngleLatex(t.fonction, a)}=${dfrac(exactLatex(valeurRemarquable(t.fonction, a)))}`),
      texte(" ; le signe vient du quadrant."),
    ]),
    calcul(lv, [...(quadrantDe(t) === "I" ? [] : lignesAnglePremierQuadrant(th)), ...lignesValeurAssociee(t.fonction, th)]),
    resultat(lv, [texte("Angle associé : "), latex(angleLatex(a)), texte(" ; "), latex(`${ft}=${dfrac(exactLatex(valeurFonction(t)))}`)]),
  );
  return etapes;
}

function piegeCible(e: E): EtapeCorrection {
  const carreNegatif = e.termes.find((t) => t.carre && valeurApprochee(valeurFonction(t)) < 0);
  if (carreNegatif) {
    const v = valeurFonction(carreNegatif);
    const v2 = dfrac(exactLatex(produit(v, v)));
    return piege(lettreDe(e, "final"), [texte("Un carré est toujours positif : "), latex(`\\left(${dfrac(exactLatex(v))}\\right)^2=${v2}`), texte(", et non "), latex(`-${v2}`), texte(".")]);
  }
  const i = e.termes.findIndex((t) => signeDe(t) === -1);
  if (i >= 0) {
    const t = e.termes[i]!;
    const ft = fonctionAngleLatex(t.fonction, angleTravail(t));
    return piege(lettreDe(e, "valeur", i), [latex(ft), texte(` est négatif (quadrant ${quadrantDe(t)}) : écrire `), latex(`${ft}=${dfrac(exactLatex(oppose(valeurFonction(t))))}`), texte(" est une erreur de signe ; l'angle associé donne la valeur, le quadrant donne le signe.")]);
  }
  const j = e.termes.findIndex((t) => t.fonction !== "tan" && angleAssocie(t) !== 45);
  if (j >= 0) {
    const t = e.termes[j]!;
    const a = angleAssocie(t);
    const autre = t.fonction === "sin" ? "cos" : "sin";
    return piege(lettreDe(e, "valeur", j), [
      texte("Ne pas confondre "),
      latex(`${fonctionAngleLatex(t.fonction, a)}=${dfrac(exactLatex(valeurRemarquable(t.fonction, a)))}`),
      texte(" et "),
      latex(`${fonctionAngleLatex(autre, a)}=${dfrac(exactLatex(valeurRemarquable(autre, a)))}`),
      texte("."),
    ]);
  }
  return e.operateurs.includes("*")
    ? piege(lettreDe(e, "final"), [texte("Le produit se calcule avant la somme ou la différence.")])
    : piege(lettreDe(e, "valeur", 0), [texte("L'angle associé du premier quadrant donne la valeur remarquable ; le signe vient toujours du quadrant de l'angle de départ.")]);
}

export function correctionDetailleeValeurExacte(e: E): EtapeCorrection[] {
  const lf = lettreDe(e, "final");
  const etapes: EtapeCorrection[] = [
    ...e.termes.flatMap((_, i) => etapesTerme(e, i)),
    utilise(lf, [texte(aDesProduitsOuCarres(e) ? "On remplace chaque terme par sa valeur exacte ; produits et carrés d'abord, puis sommes et différences sur un même dénominateur." : "On remplace chaque terme par sa valeur exacte, puis on réduit au même dénominateur.")]),
    calcul(lf, lignesFinales(e)),
    resultat(lf, [latex(`${expressionLatex(e)}=${dfrac(resultatLatex(e))}`)]),
  ];
  const p = piegeCible(e);
  // Le piège s'affiche dans SON étape : inséré après le dernier élément de sa lettre.
  const k = etapes.map((x) => x.sousQuestion).lastIndexOf(p.sousQuestion);
  etapes.splice(k + 1, 0, p);
  return finaliserCorrige(etapes);
}

