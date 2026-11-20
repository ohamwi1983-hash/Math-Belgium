/**
 * Couche B (6e) — lisibilité d'une saisie des générateurs du 6e ch. 2 (6gen6–6gen12, audit lot B) :
 * une saisie ILLISIBLE (erreur de SYNTAXE du parseur partagé `expressionExponentielle.ts`) n'est
 * jamais transmise au moteur, elle ne coûte aucune tentative. Un problème de DOMAINE (ln d'un
 * négatif, division par 0) n'est pas une erreur de lecture : la saisie est lisible, la vérification
 * la juge. Seule normalisation : celle du parseur (« − », « – », « — » lus comme « - »).
 */
import { evaluerExpressionExponentielle } from "./expressionExponentielle";
import { separerEquationTexte } from "./equivalenceExponentielle";

/** Vrai si le texte s'analyse comme une expression des variables données (aucune = un nombre).
 * Le parseur ne lève QUE sur une erreur de syntaxe (ou un identifiant inconnu, ex. y au lieu de
 * x) : la valeur choisie pour les variables est sans effet sur ce verdict. */
export function lisibleExpression(texte: string, variables: string[] = []): boolean {
  if (texte.trim() === "") return false;
  const valeurs: Record<string, number> = {};
  for (const nom of variables) valeurs[nom] = 0.37;
  try {
    evaluerExpressionExponentielle(texte, valeurs);
    return true;
  } catch {
    return false;
  }
}

/** Un nombre (fraction, e, ln, racine…) : aucune variable libre. */
export function lisibleNombre(texte: string): boolean {
  return lisibleExpression(texte, []);
}

/** Une liste de nombres (cases séparées) : chaque case lisible. Liste vide = « aucune ». */
export function lisibleListe(textes: string[]): boolean {
  return textes.every((t) => lisibleNombre(t));
}

/** Équation d'une droite « y = … » (expression en x) ou « x = … » (nombre), comme les lit
 * `verifierEquationAsymptote` (6gen11). */
export function lisibleDroite(texte: string): boolean {
  const i = texte.indexOf("=");
  if (i === -1) return false;
  const gauche = texte.slice(0, i).trim().toLowerCase();
  const droite = texte.slice(i + 1);
  if (gauche === "y") return lisibleExpression(droite, ["x"]);
  if (gauche === "x") return lisibleNombre(droite);
  return false;
}

/** Une équation ou inéquation « A ◇ B » dont les deux membres s'analysent dans la variable. */
export function lisibleRelation(texte: string, variable: string): boolean {
  const s = separerEquationTexte(texte);
  if (!s) return false;
  return lisibleExpression(s.gauche, [variable]) && lisibleExpression(s.droite, [variable]);
}
