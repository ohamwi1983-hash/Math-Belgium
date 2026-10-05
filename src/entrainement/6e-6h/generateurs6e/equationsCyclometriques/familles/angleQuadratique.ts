import type { Arcfonction } from "../../../core6e/cyclometrique.types";
import type { CandidatSolution, ExerciceAngleQuadratique } from "../../../core6e/equationsCyclometriques.types";
import { BANQUES_ARC } from "../../cyclometrique/banqueAngles";
import { CE_REEL, versGuide } from "../domaines";

const ARCFONCTIONS: Arcfonction[] = ["arcsin", "arccos", "arctan"];
/** `|a|` toujours un carré parfait ⟹ `R=1/√|a|` toujours une fraction simple. */
const CANDIDATS_A_ABS = [1, 4, 9] as const;
const CANDIDATS_H = [-3, -2, -1, 1, 2, 3] as const;
type Cas = "aucune" | "une" | "deux";
const CAS: Cas[] = ["aucune", "une", "deux"];

function tirerParmi<T>(candidats: readonly T[]): T {
  return candidats[Math.floor(Math.random() * candidats.length)];
}

/**
 * Variante 3 — arcfonction(ax²+bx+c) = angle particulier (radian). Construction en forme sommet
 * `q(x) = a(x-h)²` (donc `b=-2ah`, `c=ah²` — `c≠0` garanti par `h≠0`) : le domaine où `q(x)∈[-1;1]`
 * (CE pour arcsin/arccos) est ALORS exactement `[h-R;h+R]`, `R=1/√|a|` — un intervalle FERMÉ à bornes
 * propres tant que `|a|` est un carré parfait (`{1,4,9}` ⟹ `R∈{1,½,⅓}`).
 *
 * `angle` toujours pris dans une entrée ENTIÈRE de la banque (`T∈{-1,0,1}`, les 3 arcfonctions en
 * possèdent une pour chaque valeur) : `T=0` ⟹ racine double au sommet (1 solution, x=h, TOUJOURS
 * dans la CE car c'est son centre) ; `T=sign(a)` ⟹ les 2 solutions sont EXACTEMENT les bornes de la
 * CE (`x=h±R`, incluses car la CE est fermée — 2 solutions, toutes deux acceptées) ; `T=-sign(a)`
 * ⟹ `(x-h)²` devrait être négatif, aucune solution réelle. **Fait mathématique général** (comme la
 * variante 1) : puisque l'équation non cyclométrique est exactement `q(x)=T` avec `T∈[-1;1]` (image
 * de sin/cos), toute solution réelle vérifie AUTOMATIQUEMENT la CE — aucune solution parasite n'est
 * possible pour cette variante non plus (elle n'apparaît que pour la variante 4, où la mise au
 * carré introduit un vrai risque).
 */
export function construireAngleQuadratique(): ExerciceAngleQuadratique {
  const arcfonction = tirerParmi(ARCFONCTIONS);
  const entreesEntieres = BANQUES_ARC[arcfonction].filter((e) => Number.isInteger(e.valeur.numerique));

  const signeA = tirerParmi([1, -1] as const);
  const a = signeA * tirerParmi(CANDIDATS_A_ABS);
  const h = tirerParmi(CANDIDATS_H);
  const b = -2 * a * h;
  const c = a * h * h;
  const R = 1 / Math.sqrt(Math.abs(a));

  const cas = tirerParmi(CAS);
  const cibleT = cas === "une" ? 0 : cas === "deux" ? signeA : -signeA;
  const entree = entreesEntieres.find((e) => e.valeur.numerique === cibleT);
  if (!entree) throw new Error(`construireAngleQuadratique : aucune entrée entière T=${cibleT} pour ${arcfonction}`);

  let candidats: CandidatSolution[];
  if (cas === "une") candidats = [{ x: h, accepteAttendu: true }];
  else if (cas === "deux")
    candidats = [
      { x: h - R, accepteAttendu: true },
      { x: h + R, accepteAttendu: true },
    ].sort((p, q) => p.x - q.x);
  else candidats = [];

  const ce = arcfonction === "arctan" ? CE_REEL : versGuide({ inf: h - R, sup: h + R, infInclus: true, supInclus: true });

  return { variante: "angleQuadratique", arcfonction, arg: { a, b, c }, angle: entree.angle, ce, candidats };
}
