import { enSinus, puissances } from "../../core6e/linearisationEuler";
import type { ExerciceLinearisation } from "../../core6e/linearisationEuler";
import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, lignesDepuisChaine, piege, resultat, texte, utilise } from "../../../export/corrigeTableau";
import {
  KLatex,
  appariementLatex,
  borneLatex,
  denominateurLatex,
  denominateurSimplifie,
  developpementLatex,
  differenceBornesLatex,
  eulerLatex,
  expoLatex,
  identiteLatex,
  lineaireLatex,
  lineaireTermesLatex,
  nomLatex,
  primitiveLatex,
  produitConjuguesLatex,
  produitLatex,
  regroupementLatex,
  valeurIntegraleLatex,
} from "../../ui6e/formatLinearisationEuler";

/**
 * Corrigé détaillé « comme au tableau » de `6gen93` (linéariser avec les formules d'Euler) — règle
 * `.claude/rules/feuilles-evaluations.md` (« Corrigé détaillé — comme au tableau »). Chaînes et
 * valeurs de l'écran (`ui6e/formatLinearisationEuler.ts`), une transformation par ligne.
 */

const COURS = "(cours, § 5)";
const REGROUPEMENT = "e^{ikx}+e^{-ikx}=2\\cos(kx)\\qquad e^{ikx}-e^{-ikx}=2i\\sin(kx)";

/**
 * Étape « binôme » : une transformation par ligne. Produit mixte (cos^p·sin^q) : on regroupe un
 * facteur somme et un facteur différence, puis l'identité remarquable (a+b)(a−b) = a² − b², puis le
 * développement, puis les exposants. Puissance seule : binôme de Newton écrit terme à terme, puis
 * les exposants.
 */
function lignesDeveloppement(e: ExerciceLinearisation): LigneCalcul[] {
  const { p, q, n } = puissances(e);
  const A = expoLatex(e.a);
  const B = expoLatex(-e.a);
  const P = produitLatex(e);
  const fin = developpementLatex(e);
  const exposants = [texte("les exposants s'additionnent, "), latex(produitConjuguesLatex(e.a))];
  if (p > 0 && q > 0) {
    const X = expoLatex(2 * e.a);
    const Y = expoLatex(-2 * e.a);
    const somme = `\\left(${A}+${B}\\right)`;
    const difference = `\\left(${A}-${B}\\right)`;
    const m = Math.min(p, q);
    const reste = p > q ? somme : q > p ? difference : "";
    const lignes: LigneCalcul[] = [
      ligne(`P=${P}`),
      ligne(`=\\left[${somme}${difference}\\right]${m === 2 ? "^{2}" : reste}`, "on regroupe un facteur somme et un facteur différence"),
      ligne(`=\\left(${X}-${Y}\\right)${m === 2 ? "^{2}" : reste}`, [latex("(a+b)(a-b)=a^2-b^2"), texte(", "), latex(`\\left(${A}\\right)^{2}=${X}`)]),
    ];
    if (m === 2) {
      lignes.push(ligne(`=\\left(${X}\\right)^{2}-2\\,${X}\\cdot ${Y}+\\left(${Y}\\right)^{2}`, [latex("(a-b)^2=a^2-2ab+b^2")]));
      lignes.push(ligne(`=${fin}`, [texte("les exposants s'additionnent, "), latex(`${X}\\cdot ${Y}=1`)]));
      return lignes;
    }
    const s = p > q ? "+" : "-";
    const s2 = p > q ? "-" : "+";
    lignes.push(ligne(`=${X}\\cdot ${A}${s}${X}\\cdot ${B}-${Y}\\cdot ${A}${s2}${Y}\\cdot ${B}`, "on distribue"));
    lignes.push(ligne(`=${fin}`, "les exposants s'additionnent"));
    return lignes;
  }
  // Binôme de Newton terme à terme (signes alternés pour une différence).
  const binom = (k: number) => {
    let c = 1;
    for (let j = 1; j <= k; j++) c = (c * (n - j + 1)) / j;
    return c;
  };
  const puiss = (base: string, k: number) => (k === 0 ? "" : k === 1 ? base : `\\left(${base}\\right)^{${k}}`);
  const termes: string[] = [];
  for (let j = 0; j <= n; j++) {
    const c = binom(j);
    const negatif = q > 0 && j % 2 === 1;
    const facteurs = [puiss(A, n - j), puiss(B, j)].filter((x) => x !== "").join("");
    termes.push(`${j === 0 ? "" : negatif ? "-" : "+"}${c === 1 ? "" : c}${facteurs}`);
  }
  const coefficients = Array.from({ length: n + 1 }, (_, j) => binom(j)).join(", ");
  return [ligne(`P=${P}`), ligne(`=${termes.join("")}`, `binôme de Newton : coefficients ${coefficients}${q > 0 ? ", signes alternés" : ""}`), ligne(`=${fin}`, exposants)];
}

function lignesK(e: ExerciceLinearisation): LigneCalcul[] {
  const { q } = puissances(e);
  const lignes: LigneCalcul[] = [ligne(`K=\\dfrac{1}{${denominateurLatex(e)}}`)];
  if (q >= 2) lignes.push(ligne(`=\\dfrac{1}{${denominateurSimplifie(e)}}`, [latex(`(2i)^{${q}}=2^{${q}}\\,i^{${q}}`), texte(q === 2 ? ", i² = −1" : q === 3 ? ", i³ = −i" : ", i⁴ = 1")]));
  else if (q === 1) lignes.push(ligne(`=\\dfrac{1}{${denominateurSimplifie(e)}}`, "on effectue le produit"));
  if (q % 2 === 1) lignes.push(ligne(`=\\dfrac{i}{${denominateurSimplifie(e)}\\cdot i}`, "on multiplie haut et bas par i"));
  lignes.push(ligne(`=${KLatex(e)}`, q % 2 === 1 ? "car i² = −1" : undefined));
  return lignes.filter((l, i, t) => i === 0 || l.latex !== t[i - 1].latex);
}

function piegeLinearisation(e: ExerciceLinearisation): { sq: string; fragments: FragmentConsigne[] } {
  const { q } = puissances(e);
  if (q === 0) return { sq: "c", fragments: [texte("Oublier le facteur 2 en regroupant : "), latex("e^{ikx}+e^{-ikx}=2\\cos(kx)"), texte(", pas "), latex("\\cos(kx)"), texte(" ; tous les coefficients seraient divisés par 2.")] };
  if (q % 2 === 1)
    return {
      sq: "a",
      fragments: [...(q === 1 ? [texte("Oublier le "), latex("i"), texte(" du dénominateur "), latex("2i")] : [texte("Mal calculer "), latex("(2i)^{3}=8i^{3}=-8i")]), texte(" ; rappel : "), latex("\\dfrac{1}{i}=-i"), texte(". Une erreur de signe sur une puissance de i change le signe de toute la réponse.")],
    };
  if (q === 2) return { sq: "a", fragments: [texte("Croire que "), latex("(2i)^{2}=4"), texte(" : "), latex("(2i)^{2}=4i^{2}=-4"), texte(", donc "), latex("K"), texte(" est négatif.")] };
  return { sq: "a", fragments: [texte("Se tromper de signe sur "), latex("i^{4}"), texte(" : "), latex("i^{4}=\\left(i^{2}\\right)^{2}=1"), texte(", donc "), latex("(2i)^{4}=16"), texte(" et "), latex("K"), texte(" est positif.")] };
}

function lignesLinearisation(e: ExerciceLinearisation): EtapeCorrection[] {
  const { p, q } = puissances(e);
  const sinus = enSinus(e);
  const pg = piegeLinearisation(e);
  const P = produitLatex(e);
  return [
    utilise("a", [texte(`Formules d'Euler ${COURS} : `), latex(eulerLatex(e.a)), texte(". On remplace chaque facteur, puis on rassemble les constantes dans un facteur "), latex("K"), texte(".")]),
    calcul("a", [ligne(`${nomLatex(e)}=\\dfrac{${P}}{${denominateurLatex(e)}}`, "formules d'Euler"), ligne(`=K\\,${P}`, "K = 1 / dénominateur"), ...lignesK(e)]),
    resultat("a", [latex(`f(x)=K\\,${P}`), texte(" avec "), latex(`K=${KLatex(e)}`)]),
    ...(pg.sq === "a" ? [piege("a", pg.fragments)] : []),
    p > 0 && q > 0
      ? utilise("b", [texte("Le produit d'une somme par une différence est une identité remarquable : "), latex(identiteLatex(e.a)), texte(" ; on multiplie ensuite le reste, les exposants s'additionnent ("), latex("e^{iax}e^{ibx}=e^{i(a+b)x}"), texte(").")])
      : utilise("b", [texte("Binôme de Newton (coefficients du triangle de Pascal), avec "), latex(produitConjuguesLatex(e.a)), texte(q > 0 ? " ; le terme soustrait fait alterner les signes." : "."), texte(" Les exposants s'additionnent : "), latex("e^{iax}e^{ibx}=e^{i(a+b)x}"), texte(".")]),
    calcul("b", lignesDeveloppement(e)),
    resultat("b", [latex(`P=${developpementLatex(e)}`)]),
    utilise("c", [texte("On regroupe les exponentielles d'exposants opposés : "), latex(REGROUPEMENT), texte(".")]),
    calcul("c", [ligne(`P=${appariementLatex(e)}`, "on apparie les exposants opposés"), ligne(`=${regroupementLatex(e)}`, sinus ? "on regroupe : 2i sin(kx)" : "on regroupe : 2 cos(kx)")]),
    resultat("c", [latex(`P=${regroupementLatex(e)}`)]),
    ...(pg.sq === "c" ? [piege("c", pg.fragments)] : []),
    utilise("d", [texte("On multiplie le regroupement par "), latex(`K=${KLatex(e)}`), texte(sinus ? " (avec i² = −1) et on simplifie chaque coefficient." : " et on simplifie chaque coefficient.")]),
    calcul("d", [
      ligne(`f(x)=K\\cdot P=${KLatex(e)}\\left(${regroupementLatex(e)}\\right)`, "étapes 1 et 3"),
      ligne(`=${lineaireTermesLatex(e)}`, sinus ? "on distribue, i² = −1" : "on distribue"),
      ligne(`=${lineaireLatex(e)}`, "on simplifie"),
    ].filter((l, i, t) => i === 0 || l.latex !== t[i - 1].latex)),
    resultat("d", [latex(`${nomLatex(e)}=${lineaireLatex(e)}`)]),
  ];
}

function lignesApplication(e: ExerciceLinearisation): EtapeCorrection[] {
  const iv = e.intervalle!;
  const sinus = enSinus(e);
  return [
    utilise("a", [texte(`Formules d'Euler ${COURS} : `), latex(eulerLatex(e.a)), texte(", puis regroupement : "), latex(REGROUPEMENT), texte(".")]),
    calcul("a", [
      ligne(`f(x)=${KLatex(e)}\\,${produitLatex(e)}`, "formules d'Euler, constantes rassemblées"),
      ligne(`=${KLatex(e)}\\left(${developpementLatex(e)}\\right)`, "on développe"),
      ligne(`=${KLatex(e)}\\left(${regroupementLatex(e)}\\right)`, "on regroupe les exposants opposés"),
      ligne(`=${lineaireLatex(e)}`, "on distribue et on simplifie"),
    ]),
    resultat("a", [latex(`f(x)=${lineaireLatex(e)}`)]),
    utilise("b", [texte("Primitives de référence : "), latex("\\cos(kx)\\to\\dfrac{\\sin(kx)}{k}"), texte(" et "), latex("\\sin(kx)\\to-\\dfrac{\\cos(kx)}{k}"), texte(" ; une constante "), latex("a"), texte(" donne "), latex("ax"), texte(".")]),
    calcul("b", [ligne(`F(x)=${primitiveLatex(e)}`, "terme à terme")]),
    resultat("b", [latex(`F(x)=${primitiveLatex(e)}`), texte(" (à une constante près)")]),
    sinus
      ? piege("b", [texte("Oublier le signe − : une primitive de "), latex("\\sin(kx)"), texte(" est "), latex("-\\dfrac{\\cos(kx)}{k}"), texte(".")])
      : piege("b", [texte("Oublier de diviser par "), latex("k"), texte(" : une primitive de "), latex("\\cos(kx)"), texte(" est "), latex("\\dfrac{\\sin(kx)}{k}"), texte(", pas "), latex("\\sin(kx)"), texte(".")]),
    utilise("c", [texte("Théorème fondamental : "), latex("\\int_a^b f(x)\\,dx=F(b)-F(a)"), texte(", avec les valeurs remarquables de sin et cos.")]),
    calcul("c", [
      ...lignesDepuisChaine(`I=F\\left(${borneLatex(iv.b)}\\right)-F\\left(${borneLatex(iv.a)}\\right)=${differenceBornesLatex(e)}`, ["", "on remplace x par les bornes"]),
      ligne(`=${valeurIntegraleLatex(e)}`, "valeurs remarquables"),
    ]),
    resultat("c", [latex(`I=${valeurIntegraleLatex(e)}`)]),
    ...(sinus && iv.a.num === 0 ? [piege("c", [latex("F(0)\\neq 0"), texte(" car "), latex("\\cos(0)=1"), texte(".")])] : []),
  ];
}

export function correctionDetailleeLinearisation(e: ExerciceLinearisation): EtapeCorrection[] {
  return e.variante === "application" ? lignesApplication(e) : lignesLinearisation(e);
}
