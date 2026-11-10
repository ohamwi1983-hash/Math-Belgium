/**
 * Couche A (5e) — famille "Population" (5gen23). f(x)=a/(x+p)+b, affiché développé au numérateur
 * — bx+(a+bp) sur (x+p). b = limite/AH = population à terme. Comme p > 0, f(0)−b = a/p a le signe
 * de a : a > 0 ⟹ f(0) > b, la grandeur DIMINUE vers b (régression) ; a < 0 ⟹ elle AUGMENTE vers b
 * (croissance). La méthode enseignée reste de comparer f(0) à la limite b (audit 5c4b, point 17 :
 * l'ancien commentaire « jamais le signe de a seul » était faux). N'importe jamais rien de `moteur5e/`.
 */
import type { ContextePopulation, ExercicePopulation, OptionInterpretation } from "../../core5e/limitesContexte.types";
import { CONTEXTES_POPULATION } from "./contextesPopulation";
import { entierAleatoire, entierNonNul, melanger, tirerElement } from "./utils";

/** Les quatre MÊMES phrases dans les deux cas (seul le drapeau `correcte` change) : aucune ne se
 * devine à sa longueur ni aux nombres cités — il faut comparer f(0) à la limite b. Prédicats
 * invariants (aucun pronom ni adjectif accordé au genre de `ctx.grandeurArticle`). */
function optionsInterpretation(a: number, b: number, ctx: ContextePopulation): OptionInterpretation[] {
  const unite = ctx.unitePourValeur;
  const g = ctx.grandeurArticle;
  const regression = a > 0; // f(0) − b = a/p, du signe de a (p > 0)
  return melanger([
    { texte: `En régression : ${g} diminue et se rapproche de ${b} ${unite} sans jamais l'atteindre.`, correcte: regression },
    { texte: `En croissance : ${g} augmente et se rapproche de ${b} ${unite} sans jamais l'atteindre.`, correcte: !regression },
    { texte: `En régression : ${g} diminue et passe sous ${b} ${unite} au bout d'un certain temps.`, correcte: false },
    { texte: `En croissance : ${g} augmente et dépasse ${b} ${unite} au bout d'un certain temps.`, correcte: false },
  ]);
}

/**
 * Seuil de l'écran « comparer au seuil » (décision K) : tiré du MÊME côté de b que f(x), à une
 * distance de b comprise entre 0,1·δ et 1,9·δ (δ = |a/(x+p)| = écart entre f(x) et la limite) —
 * comparer b au seuil ne suffit donc jamais, il faut calculer f(x) (≈ 50 % « supérieur »). Arrondi
 * au centième et à plus de 0,02 de f(x), pour qu'un f(x) arrondi au centième ne tombe jamais sur le
 * seuil. Renvoie null si aucun seuil acceptable (tirage rejeté).
 */
function tirerSeuil(a: number, b: number, p: number, x: number): number | null {
  const delta = Math.abs(a / (x + p));
  const sens = Math.sign(a);
  const valeur = b + a / (x + p);
  for (let essai = 0; essai < 20; essai++) {
    const u = 0.1 + Math.random() * 1.8;
    const seuil = Math.round((b + sens * u * delta) * 100) / 100;
    if (seuil > 0 && Math.abs(seuil - valeur) > 0.02 && Math.abs(seuil - b) > 0.005) return seuil;
  }
  return null;
}

export function genererExercicePopulation(): ExercicePopulation {
  const contexte = tirerElement(CONTEXTES_POPULATION);
  for (let tentative = 0; tentative < 200; tentative++) {
    const a = entierNonNul(-10, 10);
    const b = entierAleatoire(1, 50);
    const p = entierAleatoire(1, 10);
    // Grandeur toujours positive : en croissance (a < 0), le minimum sur x ≥ 0 est f(0) = b + a/p.
    if (b + a / p < 0.5) continue;
    const anneeRef = entierAleatoire(1990, 2020);
    const ecart = entierAleatoire(5, 30);
    // Écart à la limite assez grand pour qu'un seuil « entre b et f(x) » ait un sens au centième.
    if (Math.abs(a / (ecart + p)) < 0.15) continue;
    const seuil = tirerSeuil(a, b, p, ecart);
    if (seuil === null) continue;
    return {
      famille: "population",
      a,
      b,
      p,
      anneeRef,
      anneeEval: anneeRef + ecart,
      seuil,
      optionsInterpretation: optionsInterpretation(a, b, contexte),
      contexte,
    };
  }
  // Repli déterministe (jamais atteint en pratique) : a = 6, b = 20, p = 2, x = 10, seuil = 20,3.
  return { famille: "population", a: 6, b: 20, p: 2, anneeRef: 2000, anneeEval: 2010, seuil: 20.3, optionsInterpretation: optionsInterpretation(6, 20, contexte), contexte };
}
