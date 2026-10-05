/**
 * Couche A — "Calcul de composantes de combinaisons linéaires" (chapitre "Calcul vectoriel").
 * Remplace en place l'ancienne version de ce générateur, voir `core/combinaisonVecteurs.types.ts`
 * pour le contraste complet. Réutilise `additionner`/`multiplier`/`vecteurDepuisPoints`
 * (`generateurs/vecteur/arithmetique.ts`, module frère).
 *
 * **Aucun tirage-puis-classification** : chaque variante construit directement la structure
 * (groupes/termes) qui la caractérise, jamais des coefficients tirés au hasard puis reclassés —
 * même principe que le reste du projet. Les 5 variantes partagent un seul moteur de réduction
 * (`calculerCoefficientsReduits`) et un seul mécanisme d'exclusion du cas dégénéré
 * (`assembler`, boucle `do...while` — TOUS les coefficients réduits nuls simultanément, généralisation
 * directe de l'exclusion de l'ancienne version à un nombre de bases variable).
 */
import type {
  ExerciceCombinaisonVecteurs,
  GenerateurExerciceCombinaisonVecteurs,
  GroupeCombinaison,
  RefVecteurBase,
  TermeVecteur,
  VarianteCombinaisonVecteurs,
  VecteurNomme,
} from "../../core/combinaisonVecteurs.types";
import type { Composantes, Point } from "../../core/vecteur.types";
import { additionner, multiplier, vecteurDepuisPoints } from "../vecteur/arithmetique";
import { randomInt } from "./aleatoire";

const NOMS_LIBRES = ["u", "v", "w"];
const RESULTAT_NOM = "t";

function melanger<T>(items: T[]): T[] {
  const copie = [...items];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = randomInt(0, i);
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }
  return copie;
}

function piocherDistincts(pool: string[], k: number): string[] {
  return melanger(pool).slice(0, k);
}

function tirerDansListe(liste: number[]): number {
  return liste[randomInt(0, liste.length - 1)];
}

/** Coefficient signé non nul, magnitude tirée dans `magnitudes`. */
function coefSigne(magnitudes: number[]): number {
  const m = tirerDansListe(magnitudes);
  return Math.random() < 0.5 ? -m : m;
}

function vecteurAleatoire(): Composantes {
  let v = { x: 0, y: 0 };
  while (v.x === 0 && v.y === 0) {
    v = { x: randomInt(-5, 5), y: randomInt(-5, 5) };
  }
  return v;
}

function pointAleatoire(exclus: Point[]): Point {
  let p: Point;
  do {
    p = { x: randomInt(-6, 6), y: randomInt(-6, 6) };
  } while (exclus.some((e) => e.x === p.x && e.y === p.y));
  return p;
}

function vecteursLibresConnus(): VecteurNomme[] {
  return NOMS_LIBRES.map((nom) => ({ nom, composantes: vecteurAleatoire() }));
}

function termeLibre(coefficient: number, nom: string): TermeVecteur {
  return { coefficient, ref: { type: "libre", nom } };
}

function termeAB(coefficient: number): TermeVecteur {
  return { coefficient, ref: { type: "pointAPoint", depart: "A", arrivee: "B" } };
}

function termeBA(coefficient: number): TermeVecteur {
  return { coefficient, ref: { type: "pointAPoint", depart: "B", arrivee: "A" } };
}

function groupeUnTerme(terme: TermeVecteur): GroupeCombinaison {
  return { coefficientExterne: 1, termes: [terme] };
}

/**
 * Identifiant canonique d'une référence de vecteur — le nom lui-même pour un vecteur libre, la
 * paire de points triée alphabétiquement pour un point-à-point (`depart="B",arrivee="A"` donne
 * `"AB"`, jamais `"BA"`) : `\vec{AB}` et `\vec{BA}` partagent donc toujours le même id, condition
 * nécessaire pour que leur REGROUPEMENT (après conversion de signe) soit possible.
 */
export function idCanoniqueRef(ref: RefVecteurBase): string {
  if (ref.type === "libre") return ref.nom;
  return [ref.depart, ref.arrivee].sort().join("");
}

/** `+1` si la référence est déjà dans le sens canonique (`depart` alphabétiquement avant
 * `arrivee`, ou vecteur libre), `-1` sinon (`\vec{BA} = -\vec{AB}`, la conversion à appliquer). */
export function signeConversionRef(ref: RefVecteurBase): number {
  if (ref.type === "libre") return 1;
  return ref.depart < ref.arrivee ? 1 : -1;
}

/**
 * Moteur de réduction partagé par les 5 variantes — calculé une fois pour toutes à la génération,
 * jamais recalculé différemment à la vérification (`moteur/verificationCombinaisonVecteurs.ts`) ni
 * à la présentation (`ui/formatCombinaisonVecteurs.ts`, qui importe cette même fonction). Distribue
 * chaque coefficient externe sur les termes de son groupe, applique le signe du groupe
 * (`operateurs`) et la conversion canonique (`signeConversionRef`), puis accumule par id canonique.
 */
export function calculerCoefficientsReduits(
  groupes: GroupeCombinaison[],
  operateurs: ("+" | "-")[],
  baseCanonique: string[],
): Record<string, number> {
  const acc: Record<string, number> = {};
  for (const id of baseCanonique) acc[id] = 0;

  groupes.forEach((groupe, i) => {
    const signeGroupe = i === 0 ? 1 : operateurs[i - 1] === "-" ? -1 : 1;
    for (const terme of groupe.termes) {
      const id = idCanoniqueRef(terme.ref);
      acc[id] += signeGroupe * groupe.coefficientExterne * terme.coefficient * signeConversionRef(terme.ref);
    }
  });
  return acc;
}

function composantesDe(id: string, vecteursLibres: VecteurNomme[], points: { A: Point; B: Point } | null): Composantes {
  if (points && id === idCanoniqueRef({ type: "pointAPoint", depart: "A", arrivee: "B" })) {
    return vecteurDepuisPoints(points.A, points.B);
  }
  const vecteur = vecteursLibres.find((v) => v.nom === id);
  if (!vecteur) throw new Error(`composantesDe : id inconnu "${id}"`);
  return vecteur.composantes;
}

function calculerReponse(
  coefficientsReduits: Record<string, number>,
  baseCanonique: string[],
  vecteursLibres: VecteurNomme[],
  points: { A: Point; B: Point } | null,
): Composantes {
  let acc: Composantes = { x: 0, y: 0 };
  for (const id of baseCanonique) {
    acc = additionner(acc, multiplier(coefficientsReduits[id], composantesDe(id, vecteursLibres, points)));
  }
  return acc;
}

interface Partiel {
  vecteursLibres: VecteurNomme[];
  points: { A: Point; B: Point } | null;
  groupes: GroupeCombinaison[];
  operateurs: ("+" | "-")[];
  baseCanonique: string[];
}

/** Exclut le cas dégénéré où TOUS les coefficients réduits s'annulent simultanément (expression
 * vide après réduction) — généralisation directe de l'exclusion de l'ancienne version à un nombre
 * de bases variable. Un seul coefficient nul (un vecteur défini mais jamais utilisé, ou qui
 * s'annule par construction) reste un cas pédagogiquement valide et volontairement conservé. */
function assembler(variante: VarianteCombinaisonVecteurs, fabriquerPartiel: () => Partiel): ExerciceCombinaisonVecteurs {
  let partiel: Partiel;
  let coefficientsReduits: Record<string, number>;
  do {
    partiel = fabriquerPartiel();
    coefficientsReduits = calculerCoefficientsReduits(partiel.groupes, partiel.operateurs, partiel.baseCanonique);
  } while (Object.values(coefficientsReduits).every((v) => v === 0));

  const reponse = calculerReponse(coefficientsReduits, partiel.baseCanonique, partiel.vecteursLibres, partiel.points);
  return { variante, resultatNom: RESULTAT_NOM, ...partiel, coefficientsReduits, reponse };
}

const MAGNITUDES_INTERNES = [1, 2, 3];
const MAGNITUDES_EXTERNES = [2, 3, 4];
const MAGNITUDES_PLATE = [1, 2, 3, 4, 5];

/** Variante `plate` — un seul niveau, jamais de parenthèses : `t = k1·Vx ± k2·Vy` (2 groupes à un
 * seul terme chacun, aucun coefficient externe distinct à distribuer). */
function construirePlate(): ExerciceCombinaisonVecteurs {
  return assembler("plate", () => {
    const [va, vb] = piocherDistincts(NOMS_LIBRES, 2);
    const groupes: GroupeCombinaison[] = [groupeUnTerme(termeLibre(coefSigne(MAGNITUDES_PLATE), va)), groupeUnTerme(termeLibre(tirerDansListe(MAGNITUDES_PLATE), vb))];
    const operateurs: ("+" | "-")[] = [Math.random() < 0.5 ? "+" : "-"];
    return { vecteursLibres: vecteursLibresConnus(), points: null, groupes, operateurs, baseCanonique: [...NOMS_LIBRES] };
  });
}

/** Variante `parentheses` — un seul groupe à 2 termes, coefficient externe à distribuer :
 * `t = k(a·Vx + b·Vy)`. */
function construireParentheses(): ExerciceCombinaisonVecteurs {
  return assembler("parentheses", () => {
    const [va, vb] = piocherDistincts(NOMS_LIBRES, 2);
    const groupes: GroupeCombinaison[] = [
      { coefficientExterne: tirerDansListe(MAGNITUDES_EXTERNES), termes: [termeLibre(coefSigne(MAGNITUDES_INTERNES), va), termeLibre(coefSigne(MAGNITUDES_INTERNES), vb)] },
    ];
    return { vecteursLibres: vecteursLibresConnus(), points: null, groupes, operateurs: [], baseCanonique: [...NOMS_LIBRES] };
  });
}

/** Variante `vecteur-repete` — 2 groupes, un vecteur libre (Va) partagé entre les deux :
 * `t = k1(a·Va + b·Vb) OP k2(c·Va + d·Vc)`. */
function construireVecteurRepete(): ExerciceCombinaisonVecteurs {
  return assembler("vecteur-repete", () => {
    const [va, vb, vc] = piocherDistincts(NOMS_LIBRES, 3);
    const groupes: GroupeCombinaison[] = [
      { coefficientExterne: tirerDansListe(MAGNITUDES_EXTERNES), termes: [termeLibre(coefSigne(MAGNITUDES_INTERNES), va), termeLibre(coefSigne(MAGNITUDES_INTERNES), vb)] },
      { coefficientExterne: tirerDansListe(MAGNITUDES_EXTERNES), termes: [termeLibre(coefSigne(MAGNITUDES_INTERNES), va), termeLibre(coefSigne(MAGNITUDES_INTERNES), vc)] },
    ];
    const operateurs: ("+" | "-")[] = [Math.random() < 0.5 ? "+" : "-"];
    return { vecteursLibres: vecteursLibresConnus(), points: null, groupes, operateurs, baseCanonique: [...NOMS_LIBRES] };
  });
}

/** Variante `paire-opposee` — 2 groupes, `\vec{AB}` dans l'un, `\vec{BA}` dans l'autre (jamais de
 * vecteur libre répété) : `t = k1(a·Va + p·\vec{AB}) OP k2(b·Vb + q·\vec{BA})`. */
function construirePaireOpposee(): ExerciceCombinaisonVecteurs {
  return assembler("paire-opposee", () => {
    const [va, vb] = piocherDistincts(NOMS_LIBRES, 2);
    const A = pointAleatoire([]);
    const B = pointAleatoire([A]);
    const groupes: GroupeCombinaison[] = [
      { coefficientExterne: tirerDansListe(MAGNITUDES_EXTERNES), termes: [termeLibre(coefSigne(MAGNITUDES_INTERNES), va), termeAB(coefSigne(MAGNITUDES_INTERNES))] },
      { coefficientExterne: tirerDansListe(MAGNITUDES_EXTERNES), termes: [termeLibre(coefSigne(MAGNITUDES_INTERNES), vb), termeBA(coefSigne(MAGNITUDES_INTERNES))] },
    ];
    const operateurs: ("+" | "-")[] = [Math.random() < 0.5 ? "+" : "-"];
    return { vecteursLibres: vecteursLibresConnus(), points: { A, B }, groupes, operateurs, baseCanonique: [...NOMS_LIBRES, "AB"] };
  });
}

/** Variante `complete` — combine les 3 difficultés à la fois, structure identique à l'exemple de
 * référence du prompt de création (`t = 3(5u-3\vec{AB}+2w) - 4(u+2\vec{BA})`) : groupe 1 à 3 termes
 * (Va, `\vec{AB}`, Vc), groupe 2 à 2 termes (Va répété, `\vec{BA}`) — Vb (3e nom du pool) n'apparaît
 * jamais, son coefficient réduit final vaut donc 0 par construction. */
function construireComplete(): ExerciceCombinaisonVecteurs {
  return assembler("complete", () => {
    const [va, vc] = piocherDistincts(NOMS_LIBRES, 2);
    const A = pointAleatoire([]);
    const B = pointAleatoire([A]);
    const groupes: GroupeCombinaison[] = [
      {
        coefficientExterne: tirerDansListe(MAGNITUDES_EXTERNES),
        termes: [termeLibre(coefSigne(MAGNITUDES_PLATE), va), termeAB(coefSigne(MAGNITUDES_INTERNES)), termeLibre(coefSigne(MAGNITUDES_INTERNES), vc)],
      },
      { coefficientExterne: tirerDansListe(MAGNITUDES_EXTERNES), termes: [termeLibre(coefSigne(MAGNITUDES_INTERNES), va), termeBA(coefSigne(MAGNITUDES_INTERNES))] },
    ];
    const operateurs: ("+" | "-")[] = [Math.random() < 0.5 ? "+" : "-"];
    return { vecteursLibres: vecteursLibresConnus(), points: { A, B }, groupes, operateurs, baseCanonique: [...NOMS_LIBRES, "AB"] };
  });
}

export const CATALOGUE_VARIANTES: { id: VarianteCombinaisonVecteurs; label: string }[] = [
  { id: "plate", label: "Sans parenthèses" },
  { id: "parentheses", label: "Parenthèses avec coefficient distribué" },
  { id: "vecteur-repete", label: "Vecteur répété entre plusieurs termes" },
  { id: "paire-opposee", label: "Paire de points en sens opposé (AB/BA)" },
  { id: "complete", label: "Complexité maximale" },
];

/** Convention CLAUDE.md ("Catalogue de variantes") — force la variante demandée. */
export function construireAvecVarianteId(varianteId: VarianteCombinaisonVecteurs): ExerciceCombinaisonVecteurs {
  switch (varianteId) {
    case "plate":
      return construirePlate();
    case "parentheses":
      return construireParentheses();
    case "vecteur-repete":
      return construireVecteurRepete();
    case "paire-opposee":
      return construirePaireOpposee();
    case "complete":
      return construireComplete();
  }
}

export const genererExerciceCombinaisonVecteurs: GenerateurExerciceCombinaisonVecteurs = () => {
  const varianteId = CATALOGUE_VARIANTES[randomInt(0, CATALOGUE_VARIANTES.length - 1)].id;
  return construireAvecVarianteId(varianteId);
};
