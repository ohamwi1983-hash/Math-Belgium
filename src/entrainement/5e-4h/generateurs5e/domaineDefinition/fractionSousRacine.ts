import type { EnsembleReelGuide, ExerciceFractionSousRacine, GrilleQuotientDomf, MorceauEnsemble, SlotCE, SousVarianteFractionSousRacine } from "../../core5e/domaineDefinition.types";
import type { ValeurCellule } from "../../core/signesProduit.types";
import type { ValeurCelluleQuotient } from "../../core/inequationRationnelle.types";
import { choisirParmi, deuxEntiersDistincts, entierAleatoire, entierNonNulAleatoire } from "./aleatoire";
import { formatPolynomeLatex, polynomeLineaire, polynomeQuadratiqueDepuisRacines, signeCellule } from "./polynome";
import { ensembleReel } from "./resolutionSigne";

const SOUS_VARIANTES: SousVarianteFractionSousRacine[] = ["N1D1", "N2D1", "N1D2", "N2D2"];

/** Combine le signe du numérateur et celui du dénominateur en une cellule de quotient (4 états) —
 * jamais le signe du numérateur seul (bug trouvé par le test croisé de `fractionSousRacine.test.ts` :
 * une première version recopiait à tort `ligneNumerateur[j]` telle quelle). */
function combinerSignesQuotient(n: ValeurCellule, d: ValeurCellule): ValeurCelluleQuotient {
  if (d === "0") return "∄";
  if (n === "0") return "0";
  return n === d ? "+" : "-";
}

function degresDepuisSousVariante(sv: SousVarianteFractionSousRacine): { degN: 1 | 2; degD: 1 | 2 } {
  return { degN: sv.startsWith("N2") ? 2 : 1, degD: sv.endsWith("D2") ? 2 : 1 };
}

interface FacteurFractionSousRacine {
  coeffs: number[];
  latex: string;
  racinesReelles: number[];
}

/** Construit N(x) ou D(x) — degré 1 (une racine réelle, jamais confondue avec `eviter`, les
 * racines déjà prises par l'autre facteur — "sans facteur commun", point 6), degré 2 avec 2 racines
 * réelles distinctes (idem), ou degré 2 SANS racine réelle (`sansRacineReelle`, forme x²+c, c>0 —
 * TOUJOURS strictement positif, jamais négatif, pour que "N/D≥0 ⟺ N≥0" ne s'inverse jamais quand
 * seul D est sans racine réelle, et pour que le 3e chemin vers "Aucune CE" — N et D tous deux sans
 * racine réelle — reste un ratio positif/positif, toujours ≥0, sans avoir à accorder les signes). */
function construireFacteur(degre: 1 | 2, eviter: number[], sansRacineReelle: boolean): FacteurFractionSousRacine {
  if (degre === 1) {
    const a = entierNonNulAleatoire(1, 3);
    let r = entierAleatoire(-6, 6);
    while (eviter.includes(r)) r = entierAleatoire(-6, 6);
    const coeffs = polynomeLineaire(a, -a * r);
    return { coeffs, latex: formatPolynomeLatex(coeffs), racinesReelles: [r] };
  }
  if (sansRacineReelle) {
    const c = entierAleatoire(1, 9);
    const coeffs = [c, 0, 1];
    return { coeffs, latex: formatPolynomeLatex(coeffs), racinesReelles: [] };
  }
  let r1 = 0;
  let r2 = 0;
  do {
    [r1, r2] = deuxEntiersDistincts(-6, 6);
  } while (eviter.includes(r1) || eviter.includes(r2));
  const a = entierNonNulAleatoire(1, 2);
  const coeffs = polynomeQuadratiqueDepuisRacines(a, r1, r2);
  return { coeffs, latex: formatPolynomeLatex(coeffs), racinesReelles: [r1, r2].sort((x, y) => x - y) };
}

/** Colonnes d'échantillonnage alternées zone/racine, généralisées à un nombre de racines
 * QUELCONQUE (0 à 4, contrairement à l'ancienne version fixée à exactement 2) : un point par zone
 * (à gauche de la 1ère racine, entre 2 racines consécutives, à droite de la dernière), une colonne
 * par racine elle-même. */
function colonnesEchantillon(racines: number[]): number[] {
  const nZones = racines.length + 1;
  const pointsZones: number[] = [];
  for (let i = 0; i < nZones; i++) {
    if (racines.length === 0) pointsZones.push(0);
    else if (i === 0) pointsZones.push(racines[0] - 1);
    else if (i === nZones - 1) pointsZones.push(racines[racines.length - 1] + 1);
    else pointsZones.push((racines[i - 1] + racines[i]) / 2);
  }
  const colonnes: number[] = [];
  for (let i = 0; i < racines.length; i++) {
    colonnes.push(pointsZones[i], racines[i]);
  }
  colonnes.push(pointsZones[pointsZones.length - 1]);
  return colonnes;
}

/** Domf depuis la grille de signes du quotient (généralisation de l'ancienne `domfDepuisGrilleDeuxRacines`
 * à un nombre de racines quelconque) — chaque zone "+" contribue un morceau, dont les bornes héritent
 * de l'inclusion du point voisin ("0" = racine du numérateur, incluse ; "∄" = racine du dénominateur,
 * jamais incluse ; borne infinie, jamais incluse). */
function domfDepuisGrille(racines: number[], quotient: ValeurCelluleQuotient[]): EnsembleReelGuide {
  const morceaux: MorceauEnsemble[] = [];
  const nZones = racines.length + 1;
  for (let i = 0; i < nZones; i++) {
    if (quotient[2 * i] !== "+") continue;
    const inf = i === 0 ? null : racines[i - 1];
    const sup = i === nZones - 1 ? null : racines[i];
    const infInclus = i === 0 ? false : quotient[2 * i - 1] === "0";
    const supInclus = i === nZones - 1 ? false : quotient[2 * i + 1] === "0";
    morceaux.push({ inf, sup, infInclus, supInclus });
  }
  return { forme: "intervalles", points: [], morceaux };
}

/**
 * f(x) = √(N(x)/D(x)) — CE = une seule condition composée N(x)/D(x) ≥ 0, résolue via un tableau de
 * signes à la convention ∄ (même mécanique que le gen6 4e, "Inéquations rationnelles"). 4
 * sous-variantes (point 6) selon le degré de N et D — "N1D1" existant, "N2D1"/"N1D2"/"N2D2"
 * nouvelles. `denominateurSansRacineReelle` (D quadratique à discriminant négatif, ~40% du temps
 * quand D est degré 2) réduit N/D≥0 à N≥0 direct — piège de raccourci signalé, distinct du 3e
 * chemin vers "Aucune CE" (N ET D tous deux sans racine réelle, ~20% du temps quand les deux sont
 * degré 2 — principe unifié 1.10).
 */
export function construireFractionSousRacineAvecSousVariante(sousVariante: SousVarianteFractionSousRacine): ExerciceFractionSousRacine {
  const { degN, degD } = degresDepuisSousVariante(sousVariante);

  let denominateurSansRacineReelle = false;
  let aucuneCE = false;
  if (degD === 2 && Math.random() < 0.4) {
    denominateurSansRacineReelle = true;
    if (degN === 2 && Math.random() < 0.5) aucuneCE = true;
  }

  const d = construireFacteur(degD, [], denominateurSansRacineReelle);
  const n = construireFacteur(degN, d.racinesReelles, aucuneCE);

  const racinesTaguees = [...n.racinesReelles.map((v) => v), ...d.racinesReelles.map((v) => v)].sort((a, b) => a - b);

  const numerateurLatex = n.latex;
  const denominateurLatex = d.latex;
  const radicandeLatex = `\\dfrac{${numerateurLatex}}{${denominateurLatex}}`;
  // Version texte brut du radicande — jamais `\dfrac{...}{...}` (un `<option>` de `<select>` ne
  // peut afficher que du texte, voir `core5e/domaineDefinition.types.ts::SlotCE.texte`) : N et D
  // sont chacun déjà du texte brut valide (`formatPolynomeLatex` ne produit aucune commande LaTeX),
  // combinés ici en notation fraction ordinaire "(N)/(D)".
  const radicandeTexte = `(${numerateurLatex})/(${denominateurLatex})`;

  let grille: GrilleQuotientDomf;
  let domf: EnsembleReelGuide;
  if (aucuneCE) {
    grille = { ligneNumerateur: [], ligneDenominateur: [], ligneQuotient: [] };
    domf = ensembleReel();
  } else {
    const colonnesX = colonnesEchantillon(racinesTaguees);
    const ligneNumerateur = colonnesX.map((x) => signeCellule(n.coeffs, x));
    const ligneDenominateur = colonnesX.map((x) => signeCellule(d.coeffs, x));
    const ligneQuotient: ValeurCelluleQuotient[] = ligneNumerateur.map((v, j) => combinerSignesQuotient(v, ligneDenominateur[j]));
    grille = { ligneNumerateur, ligneDenominateur, ligneQuotient };
    domf = domfDepuisGrille(racinesTaguees, ligneQuotient);
  }

  const slotRadicande: SlotCE = {
    id: "radicande",
    role: "radicande",
    latex: radicandeLatex,
    texte: radicandeTexte,
    coeffs: [],
    symboleAttendu: "≥",
    // Combobox à 3 choix (point 6) — la condition sur ce slot reste TOUJOURS "N/D" (ce slot
    // lui-même), jamais N seul ; "D seul" n'est plus un decoy — c'est désormais le vrai 2e slot
    // ci-dessous (`slotDenominateur`), à écrire obligatoirement en ligne séparée.
    decoys: [{ id: "numerateur", latex: numerateurLatex, texte: numerateurLatex }],
  };
  // D≠0 est mathématiquement IMPLIQUÉE par la condition composée "N/D≥0" du slot "radicande"
  // (une division par 0 ne peut jamais être ≥0, elle est indéfinie) — mais reste EXIGÉE en tant que
  // ligne séparée : choix pédagogique délibéré (rendre explicite ce que "N/D≥0" laisse implicite),
  // jamais une simplification tolérée. L'élève doit toujours SCINDER en 2 lignes ("N/D≥0" ET
  // "D≠0") ; ni "N/D≥0" seul (forme fusionnée), ni "D≠0" seul, ne sont acceptés.
  const slotDenominateur: SlotCE = {
    id: "denominateur",
    role: "denominateur",
    latex: denominateurLatex,
    texte: denominateurLatex,
    coeffs: d.coeffs,
    symboleAttendu: "≠",
  };

  return {
    famille: "fractionSousRacine",
    sousVariante,
    numerateur: n.coeffs,
    numerateurLatex,
    denominateur: d.coeffs,
    denominateurLatex,
    denominateurSansRacineReelle,
    racines: racinesTaguees,
    fLatex: `f(x) = \\sqrt{${radicandeLatex}}`,
    slots: [slotRadicande, slotDenominateur],
    grille,
    domf,
    aucuneCE,
  };
}

/** Tirage UNIFORME parmi les 4 sous-variantes. */
export function genererExerciceFractionSousRacine(): ExerciceFractionSousRacine {
  return construireFractionSousRacineAvecSousVariante(choisirParmi(SOUS_VARIANTES));
}
