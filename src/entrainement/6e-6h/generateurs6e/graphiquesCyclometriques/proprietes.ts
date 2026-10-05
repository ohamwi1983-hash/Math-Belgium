import type {
  CandidatA,
  CandidatB,
  CandidatC,
  CandidatD,
  CandidatE,
  CandidatF,
  ProprietesFonctionCyclo,
} from "../../core6e/graphiquesCyclometriques.types";
import type { EnsembleReelGuide } from "../../core6e/ensembleReel.types";

/**
 * Couche A (6e) — calcule les 6 propriétés mathématiques RÉELLES de f (ordonnée à l'origine, domf,
 * imf, parité, maximum, minimum) pour chacune des 6 familles de `6gen5`, DYNAMIQUEMENT à partir des
 * coefficients tirés (aucune valeur câblée par famille). Dérivation complète (algèbre, cas
 * limites) : `docs/historique-6e.md` ("6gen5 — refonte écran unique"). Vérifié par échantillonnage
 * numérique dense, `proprietes.test.ts` — 100% de concordance exigée avant intégration UI.
 *
 * **Désaccord confirmé avec l'hypothèse de départ pour la famille F** : la spec de refonte
 * supposait "minimum atteint, maximum jamais atteint (limite π²/4, non atteinte)" par analogie
 * avec une fonction à domaine non borné. Ce n'est PAS le cas ici — le domaine de F reste borné et
 * FERMÉ (argument de l'arcfonction contraint à [-1;1], exactement comme la famille A), donc le
 * théorème des bornes atteintes garantit que maximum ET minimum sont TOUJOURS atteints. Re-dérivé
 * depuis la vraie définition plutôt que forcé à correspondre à l'hypothèse de départ (voir
 * CLAUDE.md, consigne explicite en cas de désaccord) — confirmé par `proprietes.test.ts`.
 *
 * Un extremum n'est reporté ici que par son EXISTENCE et sa VALEUR y — jamais sa position x
 * (peut ne pas être unique, ex. familles C/F paires où le maximum est atteint aux deux bornes du
 * domaine) : la position saisie par l'élève est vérifiée par cohérence interne côté
 * `moteur6e/verificationGraphiquesCyclometriques.ts` (ré-évaluation de f en ce point).
 */

const PI = Math.PI;

function intervalle(inf: number, sup: number, infInclus: boolean, supInclus: boolean): EnsembleReelGuide {
  return { forme: "intervalles", points: [], morceaux: [{ inf, sup, infInclus, supInclus }] };
}

const REEL: EnsembleReelGuide = { forme: "reel", points: [], morceaux: [] };

function privePoint(p: number): EnsembleReelGuide {
  return { forme: "prive_points", points: [p], morceaux: [] };
}

// ============================================================================
// Famille A — f(x) = c + k·arcfonction(mx+n), m>0 toujours (M_VALEURS=[1,2,3]).
// Domaine fermé borné [(-1-n)/m,(1-n)/m] ; f strictement monotone dessus (arcfonction monotone,
// k≠0) → les 2 extrema sont TOUJOURS atteints, aux 2 bornes du domaine.
// ============================================================================
export function calculerProprietesA(r: CandidatA): ProprietesFonctionCyclo {
  const xInf = (-1 - r.n) / r.m;
  const xSup = (1 - r.n) / r.m;
  const wInf = r.arcfonction === "arcsin" ? -PI / 2 : PI; // arcfonction(-1)
  const wSup = r.arcfonction === "arcsin" ? PI / 2 : 0; // arcfonction(1)
  const yAtInf = r.c + r.k * wInf;
  const yAtSup = r.c + r.k * wSup;
  const yMin = Math.min(yAtInf, yAtSup);
  const yMax = Math.max(yAtInf, yAtSup);

  const ordonneeExiste = r.n >= -1 && r.n <= 1;
  const ordonneeValeur = ordonneeExiste ? r.c + r.k * (r.arcfonction === "arcsin" ? Math.asin(r.n) : Math.acos(r.n)) : null;

  // Domaine symétrique par rapport à 0 ssi n=0 (seul cas où une parité est même envisageable) ;
  // arcsin est alors impair en argument (arcsin(-u)=-arcsin(u)), donc f impaire ssi en plus c=0 ;
  // arccos ne peut jamais être pair/impair (arccos(-u)=π-arccos(u), décalage constant π≠0 pour k≠0).
  const parite = r.arcfonction === "arcsin" && r.n === 0 && r.c === 0 ? "impaire" : "aucune";

  return {
    ordonnee: { existe: ordonneeExiste, valeur: ordonneeValeur },
    domf: intervalle(xInf, xSup, true, true),
    imf: intervalle(yMin, yMax, true, true),
    parite,
    maximum: { existe: true, valeur: yMax },
    minimum: { existe: true, valeur: yMin },
  };
}

// ============================================================================
// Famille B — f(x) = c + k·arctan(mx+n). Domaine ℝ ; arctan strictement monotone avec 2 asymptotes
// horizontales JAMAIS atteintes → image bornée OUVERTE, aucun extremum.
// ============================================================================
export function calculerProprietesB(r: CandidatB): ProprietesFonctionCyclo {
  const l1 = r.c + r.k * (-PI / 2);
  const l2 = r.c + r.k * (PI / 2);
  const yMin = Math.min(l1, l2);
  const yMax = Math.max(l1, l2);

  const ordonneeValeur = r.c + r.k * Math.atan(r.n);

  // Domaine ℝ toujours symétrique ; arctan impair en argument (arctan(-u)=-arctan(u)) → f impaire
  // ssi n=0 (sinon l'argument lui-même casse la symétrie) et c=0.
  const parite = r.n === 0 && r.c === 0 ? "impaire" : "aucune";

  return {
    ordonnee: { existe: true, valeur: ordonneeValeur },
    domf: REEL,
    imf: intervalle(yMin, yMax, false, false),
    parite,
    maximum: { existe: false, valeur: null },
    minimum: { existe: false, valeur: null },
  };
}

// ============================================================================
// Famille C — f(x) = arcfonction(a·x²+b), arcfonction∈{arcsin,arccos,arctan}. Argument PAIR en x
// (a·x²+b) → f TOUJOURS PAIRE, quelle que soit l'arcfonction.
// ============================================================================
export function calculerProprietesC(r: CandidatC): ProprietesFonctionCyclo {
  const valAt = (u: number) => (r.arcfonction === "arctan" ? Math.atan(u) : r.arcfonction === "arcsin" ? Math.asin(u) : Math.acos(u));

  if (r.arcfonction === "arctan") {
    // Domaine ℝ (arctan définie partout). u(x)=a·x²+b atteint son extremum en x=0 (=b), tend vers
    // signe(a)·∞ aux bornes → un seul des 2 extrema de f est atteint (au sommet x=0), l'autre est
    // une asymptote jamais atteinte.
    const val0 = Math.atan(r.b);
    const domf = REEL;
    if (r.a > 0) {
      return {
        ordonnee: { existe: true, valeur: val0 },
        domf,
        imf: intervalle(val0, PI / 2, true, false),
        parite: "paire",
        maximum: { existe: false, valeur: null },
        minimum: { existe: true, valeur: val0 },
      };
    }
    return {
      ordonnee: { existe: true, valeur: val0 },
      domf,
      imf: intervalle(-PI / 2, val0, false, true),
      parite: "paire",
      maximum: { existe: true, valeur: val0 },
      minimum: { existe: false, valeur: null },
    };
  }

  // arcsin/arccos : domaine fermé borné [-xMax;xMax] construit pour que l'argument couvre
  // exactement [-1;1] (voir `familles/C.ts::deriverBorneQuadratique`) — extrema toujours atteints
  // (théorème des bornes atteintes, domaine fermé borné, f continue).
  const xMax = r.a > 0 ? Math.sqrt((1 - r.b) / r.a) : Math.sqrt((1 + r.b) / Math.abs(r.a));
  const valCentre = valAt(r.b); // en x=0
  const valBord = r.arcfonction === "arcsin" ? (r.a > 0 ? PI / 2 : -PI / 2) : r.a > 0 ? 0 : PI; // en x=±xMax
  const yMin = Math.min(valCentre, valBord);
  const yMax = Math.max(valCentre, valBord);

  return {
    ordonnee: { existe: true, valeur: valCentre },
    domf: intervalle(-xMax, xMax, true, true),
    imf: intervalle(yMin, yMax, true, true),
    parite: "paire",
    maximum: { existe: true, valeur: yMax },
    minimum: { existe: true, valeur: yMin },
  };
}

// ============================================================================
// Famille D — f(x) = c + arctan(k/(x-p)). Domaine ℝ\{p}. Sur chaque branche, k/(x-p) est
// strictement monotone et couvre exactement ℝ\{0} (jamais 0) → image = ]c-π/2;c[∪]c;c+π/2[, aucune
// borne atteinte (ni les asymptotes ±π/2, ni la valeur médiane c elle-même) : jamais d'extremum.
// ============================================================================
export function calculerProprietesD(r: CandidatD): ProprietesFonctionCyclo {
  const ordonneeExiste = r.p !== 0;
  const ordonneeValeur = ordonneeExiste ? r.c + Math.atan(r.k / (0 - r.p)) : null;

  // Domaine ℝ\{p} symétrique ssi p=0 ; si p=0, arctan(k/x) est impair en x (arctan(k/(-x))=
  // -arctan(k/x)) → f impaire ssi en plus c=0.
  const parite = r.p === 0 && r.c === 0 ? "impaire" : "aucune";

  return {
    ordonnee: { existe: ordonneeExiste, valeur: ordonneeValeur },
    domf: privePoint(r.p),
    imf: { forme: "intervalles", points: [], morceaux: [
      { inf: r.c - PI / 2, sup: r.c, infInclus: false, supInclus: false },
      { inf: r.c, sup: r.c + PI / 2, infInclus: false, supInclus: false },
    ] },
    parite,
    maximum: { existe: false, valeur: null },
    minimum: { existe: false, valeur: null },
  };
}

// ============================================================================
// Famille E — f(x) = √(k·arcfonction(x)+c). Domaine = intersection de [-1;1] (arcfonction) et
// radicande≥0, GARANTI par construction être un intervalle fermé [domaineInf;domaineSup] dont une
// borne annule exactement le radicande (minimum de f = 0, toujours atteint) et l'autre le
// maximise (maximum toujours atteint aussi) — les DEUX bornes du domaine étant systématiquement
// l'une des bornes propres de l'arcfonction OU le zéro du radicande, jamais une limite ouverte.
// ============================================================================
export function calculerProprietesE(r: CandidatE, domaineInf: number, domaineSup: number): ProprietesFonctionCyclo {
  const wAt = (x: number) => (r.arcfonction === "arcsin" ? Math.asin(x) : Math.acos(x));
  const radAt = (x: number) => r.k * wAt(x) + r.c;

  const radInf = radAt(domaineInf);
  const radSup = radAt(domaineSup);
  const rMax = Math.max(radInf, radSup, 0);

  const ordonneeExiste = domaineInf <= 0 && 0 <= domaineSup;
  let ordonneeValeur: number | null = null;
  if (ordonneeExiste) {
    const rad0 = radAt(0);
    ordonneeValeur = rad0 < 0 ? null : Math.sqrt(Math.max(0, rad0));
  }

  return {
    ordonnee: { existe: ordonneeExiste && ordonneeValeur !== null, valeur: ordonneeValeur },
    domf: intervalle(domaineInf, domaineSup, true, true),
    imf: intervalle(0, Math.sqrt(rMax), true, true),
    // Domaine [domaineInf;domaineSup] pratiquement jamais symétrique par rapport à 0 (borne
    // dérivée d'un seuil w0 tiré en continu, voir `familles/E.ts`) → jamais paire/impaire.
    parite: "aucune",
    maximum: { existe: true, valeur: Math.sqrt(rMax) },
    minimum: { existe: true, valeur: 0 },
  };
}

// ============================================================================
// Famille F — f(x) = (arcfonction(mx+n))² + c, m>0 toujours (M_VALEURS=[1,2,3,4]). MÊME domaine
// fermé borné que la famille A (argument∈[-1;1]). L'argument couvre EXACTEMENT [-1;1] sur ce
// domaine, et arcfonction s'y annule TOUJOURS quelque part dans [-1;1] (arcsin(0)=0, argument 0
// intérieur à [-1;1] ; arccos(1)=0, argument 1 = borne de [-1;1]) → le minimum de w²  (=0, donc
// f=c) est TOUJOURS atteint. Le maximum est la plus grande des 2 valeurs de |w| aux bornes du
// domaine (arcfonction(-1) et arcfonction(1)) — TOUJOURS ATTEINTE AUSSI (domaine fermé borné,
// théorème des bornes atteintes) : contrairement à l'hypothèse de départ de la refonte
// ("maximum jamais atteint"), voir l'en-tête de fichier.
// ============================================================================
export function calculerProprietesF(r: CandidatF): ProprietesFonctionCyclo {
  const xInf = (-1 - r.n) / r.m;
  const xSup = (1 - r.n) / r.m;
  const wInf = r.arcfonction === "arcsin" ? -PI / 2 : PI; // arcfonction(-1)
  const wSup = r.arcfonction === "arcsin" ? PI / 2 : 0; // arcfonction(1)
  const yMax = Math.max(wInf * wInf, wSup * wSup) + r.c;
  const yMin = r.c; // w=0 toujours atteint dans [-1;1] (voir en-tête)

  const ordonneeExiste = r.n >= -1 && r.n <= 1;
  const ordonneeValeur = ordonneeExiste ? (r.arcfonction === "arcsin" ? Math.asin(r.n) : Math.acos(r.n)) ** 2 + r.c : null;

  // f(x)=(arcfonction(mx+n))²+c. Pour arcsin, argument=0 en x=-n/m (toujours intérieur au domaine,
  // voir dérivation) : domaine symétrique par rapport à 0 ssi -n/m=0 ssi n=0, et f est alors PAIRE
  // (arcsin(-u)²=arcsin(u)², c constant) — jamais impaire (f≥c partout, une fonction impaire non
  // nulle ne peut être positive partout). Pour arccos, le domaine n'est jamais symétrique par
  // rapport à 0 (l'argument=1 annulant arccos est toujours une BORNE du domaine, jamais son
  // centre) → toujours "aucune".
  const parite = r.arcfonction === "arcsin" && r.n === 0 ? "paire" : "aucune";

  return {
    ordonnee: { existe: ordonneeExiste, valeur: ordonneeValeur },
    domf: intervalle(xInf, xSup, true, true),
    imf: intervalle(yMin, yMax, true, true),
    parite,
    maximum: { existe: true, valeur: yMax },
    minimum: { existe: true, valeur: yMin },
  };
}
