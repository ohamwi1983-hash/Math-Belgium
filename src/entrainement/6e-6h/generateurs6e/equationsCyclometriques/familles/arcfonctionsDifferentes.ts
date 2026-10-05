import type { CandidatSolution, ExerciceArcfonctionsDifferentes, SousCasArcfonctionsDifferentes } from "../../../core6e/equationsCyclometriques.types";
import type { EnsembleReelGuide } from "../../../core6e/ensembleReel.types";
import { BANQUE_CERCLE_RATIONNEL, BANQUE_PYTHAGORE } from "../banquePythagore";
import { CE_REEL, domaineArcsinArccosLineaire, domaineSigneNonNegatif, domaineStrictementPositif, intersection, versGuide } from "../domaines";

const EPS = 1e-9;
const SOUS_CAS: SousCasArcfonctionsDifferentes[] = ["asin_acos", "asin_atan", "acos_atan"];

function tirerParmi<T>(candidats: readonly T[]): T {
  return candidats[Math.floor(Math.random() * candidats.length)];
}

function tirerEntier(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function trier(candidats: CandidatSolution[]): CandidatSolution[] {
  return [...candidats].sort((p, q) => p.x - q.x);
}

/**
 * Sous-cas a) — arcsin(u)=arccos(v), u=ax+b, v=cx+d. Identité `cos(arcsin(u))=√(1-u²)` ⟹ équation
 * `v=√(1-u²)` ⟹ (mise au carré) `u²+v²=1`, DU SECOND DEGRÉ. Construction : 2 points RATIONNELS
 * DISTINCTS `(u1,v1)≠(u2,v2)` du cercle `u²+v²=1` (`BANQUE_CERCLE_RATIONNEL`), la droite passant par
 * `(x1,u1)-(x2,u2)` et `(x1,v1)-(x2,v2)` (`x1,x2` entiers distincts) coupe donc le cercle EXACTEMENT
 * en x1,x2 (équation du 2nd degré ⟹ au plus 2 racines, les 2 sont trouvées) : garantit une équation
 * soluble sans jamais de racine irrationnelle. CE = u∈[-1;1] ET v∈[-1;1] — TOUJOURS non vide ici
 * (elle contient x1 ET x2 par construction, un point du cercle ayant toujours |u|,|v|≤1) ⟹ AUCUNE
 * des 2 racines ne peut être rejetée pour une raison de CE dans ce sous-cas.
 *
 * PARASITE — condition EXACTE (piège : v>=0 seul ne suffit PAS) : arcsin(u) appartient à
 * [-pi/2;pi/2] alors que arccos(v) appartient à [0;pi] ; l'égalité arcsin(u)=arccos(v) ne peut donc
 * tenir QUE si arcsin(u)>=0 elle-même, c'est-à-dire u>=0, EN PLUS de v>=0 (nécessaire pour que
 * v=sqrt(1-u^2) ait un sens). Un point du cercle avec u<0 (même si v>=0) est un parasite :
 * arcsin(-3/5)=-0.644 alors que arccos(4/5)=+0.644, deux valeurs opposées, pas égales. Génuine ssi
 * le point est dans le premier quadrant du cercle (u>=0 ET v>=0), jamais seulement v>=0.
 *
 * `conditionParasite` (NOUVEL écran intercalaire, entre "ce" et "equation") — exactement la
 * condition ci-dessus (u>=0 ET v>=0), traduite en x : intersection de 2 demi-droites FERMÉES au
 * seuil (`domaineSigneNonNegatif`, jamais `domaineStrictementPositif` — le seuil u=0 ou v=0 est une
 * égalité VALIDE, ex. arcsin(0)=0=arccos(1)). Contrairement à `ce`, cette intersection PEUT être
 * vide (~25% des tirages, vérifié numériquement — script de vérification, voir historique) : quand
 * les 2 points du cercle sont tous les deux hors du premier quadrant, aucun x ne peut jamais
 * satisfaire u(x)>=0 ET v(x)>=0 simultanément puisque a,b,c,d sont indépendants (contrairement à
 * asin_atan/acos_atan où v est un multiple scalaire de u). Reroll (comme pour `ce===null`) dans ce
 * cas — le builder élève ne sachant représenter l'ensemble vide.
 */
function construireAsinAcos(): ExerciceArcfonctionsDifferentes {
  const TENTATIVES_MAX = 200;
  for (let t = 0; t < TENTATIVES_MAX; t++) {
    const x1 = tirerEntier(-2, 2);
    let x2 = tirerEntier(-2, 2);
    while (x2 === x1) x2 = tirerEntier(-2, 2);
    const p1 = tirerParmi(BANQUE_CERCLE_RATIONNEL);
    const p2 = tirerParmi(BANQUE_CERCLE_RATIONNEL);
    if (Math.abs(p1.u - p2.u) < EPS || Math.abs(p1.v - p2.v) < EPS) continue;

    const a = (p2.u - p1.u) / (x2 - x1);
    const b = p1.u - a * x1;
    const c = (p2.v - p1.v) / (x2 - x1);
    const d = p1.v - c * x1;

    const dom1 = domaineArcsinArccosLineaire(a, b);
    const dom2 = domaineArcsinArccosLineaire(c, d);
    const ce = intersection(dom1, dom2);
    if (ce === null) continue; // ne devrait jamais arriver (voir doc), filet de sécurité

    const conditionParasite = intersection(domaineSigneNonNegatif(a, b), domaineSigneNonNegatif(c, d));
    if (conditionParasite === null) continue; // les 2 points sont hors du 1er quadrant -> reroll

    const candidats = trier([
      { x: x1, accepteAttendu: p1.u >= -EPS && p1.v >= -EPS },
      { x: x2, accepteAttendu: p2.u >= -EPS && p2.v >= -EPS },
    ]);

    return { variante: "arcfonctionsDifferentes", sousCas: "asin_acos", arg1: { a, b }, arg2: { a: c, b: d }, ce: versGuide(ce), conditionParasite: versGuide(conditionParasite), candidats };
  }
  throw new Error("construireAsinAcos : aucune combinaison valide trouvée après retirage");
}

/**
 * Sous-cas b) — arcsin(u)=arctan(v), u=ax+b, v=cx+d (`a=1` fixé pour la simplicité des racines).
 * Identité `tan(arcsin(u))=u/√(1-u²)` ⟹ `v=u/√(1-u²)` ⟹ (mise au carré) `v²(1-u²)=u²`, QUARTIQUE en
 * x en général — rendu totalement contrôlable en imposant `v=m·u` (proportionnalité) : l'équation
 * devient `u²·[m²(1-u²)-1]=0`, factorisée en `u=0` (racine DOUBLE, x=-b, toujours au centre — TOUJOURS
 * une solution GÉNUINE, `v=0=0/1` trivialement cohérent) et `u²=(m²-1)/m²`. En choisissant `m=±secθ`
 * (`θ` d'un triplet pythagoricien, `secθ=r/q>1` rationnel), `u²=(m²-1)/m²=sin²θ` ⟹ `u=±sinθ`
 * RATIONNEL. `m=+secθ` ⟹ les 2 racines `u=±sinθ` sont GÉNUINES (signe de `v` cohérent, tan étant
 * impaire comme sin) ; `m=-secθ` ⟹ les 2 sont PARASITES (signe opposé). CE = u∈[-1;1] uniquement
 * (v=arctan(...) toujours définie) — TOUJOURS satisfaite aux 3 racines (`|u|∈{0,sinθ}⊂[-1;1]`
 * systématiquement) : le rejet dans ce sous-cas est donc PUREMENT une question de signe (parasite),
 * jamais de CE.
 *
 * `conditionParasite` (NOUVEL écran intercalaire) — condition générale "signe(u)=signe(v)"
 * (identités impaires sin/tan, codomaine de arctan ⊂ codomaine de arcsin). Ici `v(x)=c·x+d=m·a·x+
 * m·b=m·(a·x+b)=m·u(x)` EXACTEMENT (`c=m·a`, `d=m·b` par construction ci-dessous) : `v` est donc
 * TOUJOURS un multiple scalaire de `u`, jamais 2 fonctions indépendantes comme dans asin_acos.
 * Conséquence, vérifiée numériquement sur 1000s de tirages (jamais un 3e cas) : si `m>0` (genuine),
 * signe(v)=signe(u) pour TOUT x -> la condition est satisfaite sur ℝ ENTIER ; si `m<0`, signe(v)=
 * -signe(u) pour tout x != x0 -> la condition n'est satisfaite qu'au point isolé x0=-b (où u=v=0,
 * les 2 signes valant conventionnellement 0). Jamais l'ensemble vide dans ce sous-cas (x0 y est
 * toujours), donc AUCUN reroll nécessaire ici (contrairement à asin_acos).
 */
function construireAsinAtan(): ExerciceArcfonctionsDifferentes {
  const { p, q, r } = tirerParmi(BANQUE_PYTHAGORE);
  const b = tirerEntier(-3, 3);
  const genuine = Math.random() < 0.5;
  const secTheta = r / q;
  const m = genuine ? secTheta : -secTheta;
  const u0 = p / r;

  const a = 1;
  const c = m * a;
  const d = m * b;

  const x0 = -b;
  const xPlus = u0 - b;
  const xMinus = -u0 - b;

  const candidats = trier([
    { x: x0, accepteAttendu: true },
    { x: xPlus, accepteAttendu: genuine },
    { x: xMinus, accepteAttendu: genuine },
  ]);

  const ce = versGuide(domaineArcsinArccosLineaire(a, b));
  const conditionParasite: EnsembleReelGuide = genuine ? CE_REEL : versGuide({ inf: x0, sup: x0, infInclus: true, supInclus: true });
  return { variante: "arcfonctionsDifferentes", sousCas: "asin_atan", arg1: { a, b }, arg2: { a: c, b: d }, ce, conditionParasite, candidats };
}

/**
 * Sous-cas c) — arccos(u)=arctan(v), u=ax+b, v=cx+d (`a=1` fixé). Identité `tan(arccos(u))=
 * √(1-u²)/u`, nécessite `u>0` EN PLUS de la CE habituelle `u∈[-1;1]` (arccos(u) doit tomber dans
 * l'image de arctan, `(-π/2;π/2)`, ce qui exige `arccos(u)<π/2` ⟺ `u>0`) ⟹ mise au carré
 * `u²(1+v²)=1`. Avec `v=m·u`, `m²u⁴+u²-1=0` — biquadratique en `u` dont les 2 racines-en-`w=u²`
 * ont un PRODUIT `-1/m²<0` (Viète) ⟹ SIGNES OPPOSÉS ⟹ EXACTEMENT une racine positive `w₀`
 * (`u=±√w₀` RÉELS) et une négative (aucune racine réelle supplémentaire, jamais de quartique à
 * racines incontrôlées). En choisissant `u₀=cosθ=q/r` (triplet pythagoricien) et `m=±v₀/u₀`
 * (`v₀=tanθ=p/q`), `w₀=u₀²` EXACTEMENT ⟹ `u=±u₀` RATIONNEL. `x₊` (`u=+u₀>0`) vérifie TOUJOURS la
 * partie "`u>0`" de la CE — accepté seulement si le signe de `m` restitue `v=+v₀` (`m=+v₀/u₀`) ;
 * `x₋` (`u=-u₀<0`) est TOUJOURS rejeté pour violation de la CE (`u≤0`), quel que soit le signe de
 * `m` — ce sous-cas fournit donc À LA FOIS un exemple de rejet par CE (`x₋`, systématique) ET,
 * quand `m=-v₀/u₀`, un exemple de rejet par signe parasite DISTINCT (`x₊`).
 *
 * `conditionParasite` (NOUVEL écran intercalaire) — la CE de l'écran 1 encode DÉJÀ `u>0` (voir
 * `domaineStrictementPositif` ci-dessous, remonté à l'écran 1 pour ce sous-cas précisément parce
 * que arccos(u) doit y être < π/2, sans quoi arctan ne peut jamais l'atteindre). La condition
 * RESTANTE, non encore posée nulle part, ne porte donc que sur `v` : `v>=0` (le seuil v=0 est
 * INCLUS, cas valide `arccos(1)=0=arctan(0)`) — UNE SEULE inéquation suffit ici (mission confirmée
 * sur ce point), mais PAS celle initialement pressentie : v (=u ici, l'argument de arccos) >0 seul
 * NE SUFFIT PAS, contrairement à l'intuition "w>=0 en découle automatiquement une fois v>0 posé" —
 * vérifié FAUX numériquement (contre-exemple : u=0.92>0, v=-0.42, arccos(u)=0.39, arctan(v)=-0.39,
 * PAS égaux). La bonne inéquation à isoler est celle sur l'AUTRE argument (`v`, celui de arctan),
 * `domaineSigneNonNegatif(c,d)` — TOUJOURS une demi-droite (jamais vide, `c=m≠0` garanti), donc
 * AUCUN reroll nécessaire ici non plus.
 */
function construireAcosAtan(): ExerciceArcfonctionsDifferentes {
  const { p, q, r } = tirerParmi(BANQUE_PYTHAGORE);
  const b = tirerEntier(-3, 3);
  const genuine = Math.random() < 0.5;
  const u0 = q / r;
  const v0 = p / q;
  const m = genuine ? v0 / u0 : -v0 / u0;

  const a = 1;
  const c = m * a;
  const d = m * b;

  const xPlus = u0 - b;
  const xMinus = -u0 - b;

  const candidats = trier([
    { x: xPlus, accepteAttendu: genuine },
    { x: xMinus, accepteAttendu: false },
  ]);

  const domaineIntervalle = domaineArcsinArccosLineaire(a, b);
  const domainePositif = domaineStrictementPositif(a, b);
  const ce = intersection(domaineIntervalle, domainePositif);
  if (ce === null) throw new Error("construireAcosAtan : CE vide (ne devrait jamais arriver)");

  const conditionParasite = versGuide(domaineSigneNonNegatif(c, d));

  return { variante: "arcfonctionsDifferentes", sousCas: "acos_atan", arg1: { a, b }, arg2: { a: c, b: d }, ce: versGuide(ce), conditionParasite, candidats };
}

const CONSTRUCTEURS: Record<SousCasArcfonctionsDifferentes, () => ExerciceArcfonctionsDifferentes> = {
  asin_acos: construireAsinAcos,
  asin_atan: construireAsinAtan,
  acos_atan: construireAcosAtan,
};

export function construireArcfonctionsDifferentesAvecSousCas(sousCas: SousCasArcfonctionsDifferentes): ExerciceArcfonctionsDifferentes {
  return CONSTRUCTEURS[sousCas]();
}

/** Tirage ÉQUIPROBABLE parmi les 3 sous-cas (spec explicite). */
export function construireArcfonctionsDifferentes(): ExerciceArcfonctionsDifferentes {
  return construireArcfonctionsDifferentesAvecSousCas(tirerParmi(SOUS_CAS));
}
