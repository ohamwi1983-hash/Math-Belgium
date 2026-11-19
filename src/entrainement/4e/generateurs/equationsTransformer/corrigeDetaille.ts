import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { EcranEquationsTransformer, EquationBase, ExerciceEquationsTransformer, MembreAffine } from "../../core/equationsTransformer.types";
import { candidats, ecransDe } from "../../moteur/modeleEquationsTransformer";
import {
  angleLatex,
  baseLatex,
  carreLatex,
  chaineCarreLatex,
  chaineIsolementLatex,
  enonceLatex,
  ensembleLatex,
  fonctionLatex,
  kAbsLatex,
  kLatex,
  referenceAffichee,
  regleSolutions,
  reponseAttendueFragments,
} from "../../ui/formatEquationsTransformer";
import { racineSimplifiee } from "../../ui/corrigeChapitre3";
import {
  avecFinale,
  COURS_EQUATIONS,
  COURS_REMARQUABLES,
  deg,
  dfrac,
  finaliserCorrige,
  fonctionLatex as fonctionAngle,
  ligneValeurAbsolue,
  lignesCandidats,
  prefixesCandidats,
  quadrantsCandidats,
} from "../../ui/corrigeCercleTrigo";

/**
 * Corrigé détaillé « comme au tableau » de gen78 (équations trigonométriques à transformer) — règle
 * `.claude/rules/feuilles-evaluations.md`. Une lettre par ÉCRAN de `ecransDe` (même séquence que
 * l'appli) : équation(s) de base (isoler, carré → ± racine, produit nul), puis pour chaque base
 * l'angle de référence (table ou calculatrice, ou |k| > 1) et les solutions (règle des deux
 * candidats ; valeurs approchées calculées depuis α₀ NON arrondi), enfin la réunion. Réponses de
 * chaque écran : `reponseAttendueFragments` (même fonction que l'appli). Aucun écran de lecture.
 */

type E = ExerciceEquationsTransformer;
const LETTRES = "abcdefghijklmnopqrstuvwxyz";

export function lettreEcranEquationsTransformer(index: number): string {
  return LETTRES[index] ?? String(index + 1);
}

function lettreDe(e: E, predicat: (x: EcranEquationsTransformer) => boolean): string {
  return LETTRES[ecransDe(e).findIndex(predicat)] ?? "a";
}

const NOM: Record<string, string> = { sin: "\\sin", cos: "\\cos", tan: "\\tan" };

/** Justification du passage du terme constant dans l'autre membre. */
function justificationConstante(m: MembreAffine): FragmentConsigne[] {
  if (m.bRacineCoef !== 0) {
    const c = Math.abs(m.bRacineCoef);
    const rac = c === 1 ? `\\sqrt{${m.bRacine}}` : `${c}\\sqrt{${m.bRacine}}`;
    return [texte(m.bRacineCoef > 0 ? "on retranche " : "on ajoute "), latex(rac), texte(" aux deux membres")];
  }
  return [texte(`${m.bEntier > 0 ? "on retranche" : "on ajoute"} ${Math.abs(m.bEntier)} aux deux membres`)];
}

/** Chaîne « … ⟺ … » de l'écran éclatée : une équation par ligne, puis la division éventuelle. */
function lignesIsolement(chaine: string, m: MembreAffine, finale: string): LigneCalcul[] {
  const eqs = chaine.split(" \\iff ").map((x) => dfrac(x.replace(/\s*=\s*/, "=")));
  const lignes: LigneCalcul[] = [ligne(eqs[0]!, "équation de départ")];
  let i = 1;
  const aConstante = m.bEntier !== 0 || m.bRacineCoef !== 0;
  if (aConstante && eqs[i]) lignes.push(ligne(eqs[i++]!, justificationConstante(m)));
  if (m.a !== 1 && eqs[i]) {
    const avant = eqs[i - 1]!;
    const d = avant.slice(avant.indexOf("=") + 1);
    const gauche = eqs[i]!.slice(0, eqs[i]!.indexOf("="));
    const quotient = `${gauche}=\\dfrac{${d}}{${m.a}}`;
    lignes.push(ligne(quotient, `on divise les deux membres par ${String(m.a).replace("-", "−")}`));
    const fin = avecFinale([ligne(quotient)], finale);
    if (fin.length > 1) lignes.push(ligne(`=${finale}`, "on simplifie"));
  }
  return lignes;
}

/** √k simplifiée (k = carré d'une valeur de base) : une transformation par ligne. */
function lignesRacineCarre(nom: string, e: E, b: EquationBase, signe: 1 | -1): LigneCalcul[] {
  if (e.forme.type !== "carre") return [];
  const s = signe === 1 ? "" : "-";
  const k = dfrac(carreLatex(e));
  const lignes: LigneCalcul[] = [ligne(`${nom}=${s}\\sqrt{${k}}`, signe === 1 ? "racine positive" : "racine négative")];
  const { carreNum: n, carreDen: d, carreDecimal } = e.forme;
  if (!carreDecimal && d > 1) {
    const rn = racineSimplifiee(n);
    const rd = racineSimplifiee(d);
    const num = rn.m === 1 ? `${rn.k}` : rn.k === 1 ? `\\sqrt{${rn.m}}` : `${rn.k}\\sqrt{${rn.m}}`;
    if (rd.m === 1) lignes.push(ligne(`=${s}\\dfrac{${num}}{${rd.k}}`, "racine d'un quotient"));
    else lignes.push(ligne(`=${s}\\dfrac{${num}}{\\sqrt{${d}}}`, "racine d'un quotient"), ligne(`=${s}\\dfrac{${num === "1" ? "" : num}\\sqrt{${d}}}{${d}}`, [texte("on multiplie haut et bas par "), latex(`\\sqrt{${d}}`)]));
  }
  return avecFinale(lignes, dfrac(kLatex(b.k)));
}

function etapesBases(e: E): EtapeCorrection[] {
  const f = e.forme;
  const ecran = { type: "bases" } as const;
  const res = resultat("a", reponseAttendueFragments(e, ecran));
  if (f.type === "affine") {
    return [
      utilise("a", [texte(`On isole `), latex(fonctionLatex(f.membre.fonction)), texte(` ${COURS_EQUATIONS} : on fait passer le terme constant dans l'autre membre, puis on divise par le coefficient.`)]),
      calcul("a", lignesIsolement(chaineIsolementLatex(f.membre, e.bases[0]!.k), f.membre, dfrac(kLatex(e.bases[0]!.k)))),
      res,
      piege("a", [texte("Isoler complètement "), latex(fonctionLatex(f.membre.fonction)), texte(" (diviser par son coefficient) avant de chercher l'angle : l'angle de référence se lit sur |k|, pas sur le second membre de départ.")]),
    ];
  }
  if (f.type === "carre") {
    const nom = fonctionLatex(f.membre.fonction);
    const carre = `${NOM[f.membre.fonction]}^2\\alpha`;
    const lignes: LigneCalcul[] = f.nue ? [ligne(`${carre}=${dfrac(carreLatex(e))}`, "équation de départ")] : lignesIsolement(chaineCarreLatex(e), f.membre, dfrac(carreLatex(e)));
    if (e.bases.length === 0) lignes.push(ligne(`${dfrac(carreLatex(e))}<0`, "un carré n'est jamais négatif : aucune solution"));
    else if (e.bases.length === 1) lignes.push(ligne(`${nom}=0`, "seul 0 a pour carré 0"));
    else lignes.push(...lignesRacineCarre(nom, e, e.bases[0]!, 1), ...lignesRacineCarre(nom, e, e.bases[1]!, -1));
    const etapes: EtapeCorrection[] = [
      utilise("a", [texte(`Un carré n'est jamais négatif ; s'il vaut k positif ou nul ${COURS_EQUATIONS} : `), latex(`${carre}=k\\iff ${nom}=\\sqrt{k}\\ \\text{ou}\\ ${nom}=-\\sqrt{k}`), texte(".")]),
      calcul("a", lignes),
      res,
    ];
    if (e.bases.length === 2) etapes.push(piege("a", [texte("Ne pas oublier la racine négative : deux équations de base, donc deux fois plus de solutions.")]));
    else if (e.bases.length === 0) etapes.push(piege("a", [texte("Inutile de chercher un angle : aucun carré n'est négatif, l'équation n'a pas de solution.")]));
    else etapes.push(piege("a", [texte("Ici le carré vaut 0 : une seule équation de base, "), latex(baseLatex(e.bases[0]!)), texte(", dont les solutions sont sur un axe.")]));
    return etapes;
  }
  const iAffine = f.nuEnPremier ? 1 : 0;
  const bAff = e.bases[iAffine]!;
  return [
    utilise("a", [texte(`Un produit est nul si et seulement si l'un de ses facteurs est nul ${COURS_EQUATIONS} : `), latex("A\\cdot B=0\\iff A=0\\ \\text{ou}\\ B=0"), texte(".")]),
    calcul("a", [
      ligne(dfrac(enonceLatex(e).replace(/\s*=\s*/, "=")), "équation de départ"),
      ligne(`${fonctionLatex(f.nu)}=0`, f.nuEnPremier ? "premier facteur nul" : "second facteur nul"),
      ...lignesIsolement(chaineIsolementLatex(f.affine, bAff.k), f.affine, dfrac(kLatex(bAff.k))).map((l, j) => (j === 0 ? { ...l, justification: f.nuEnPremier ? "ou second facteur nul" : "ou premier facteur nul" } : l)),
    ]),
    res,
    piege("a", [texte("Ne jamais diviser les deux membres par "), latex(fonctionLatex(f.nu)), texte(" : on perdrait les solutions de "), latex(`${fonctionLatex(f.nu)}=0`), texte(".")]),
  ];
}

function etapesBase(e: E, i: number): EtapeCorrection[] {
  const b = e.bases[i]!;
  const f = b.fonction;
  const lRef = lettreDe(e, (x) => x.type === "reference" && x.base === i);
  const k = dfrac(kLatex(b.k));
  const abs = dfrac(kAbsLatex(b.k));
  const etapes: EtapeCorrection[] = [];
  const resRef = resultat(lRef, reponseAttendueFragments(e, { type: "reference", base: i }));
  if (b.reference === null) {
    const lignes: LigneCalcul[] = [];
    const va = ligneValeurAbsolue(k, abs);
    if (va) lignes.push(va);
    lignes.push(ligne(`${abs}>1`, `${f} α est toujours compris entre −1 et 1`));
    etapes.push(
      utilise(lRef, [texte(`Pour tout angle α ${COURS_EQUATIONS} : `), latex(`-1\\leq ${fonctionLatex(f)}\\leq 1`), texte(".")]),
      calcul(lRef, lignes),
      resRef,
      piege(lRef, [texte("Une fois "), latex(fonctionLatex(f)), texte(" isolé, vérifier que |k| ≤ 1 avant de chercher un angle.")]),
    );
    return etapes;
  }
  const ref = referenceAffichee(b);
  const lignesRef: LigneCalcul[] = [];
  const va = ligneValeurAbsolue(k, abs);
  if (va) lignesRef.push(va);
  if (b.k.decimal) {
    lignesRef.push(ligne(`\\alpha_0=${NOM[f]}^{-1}(${abs})`, "calculatrice, en mode degrés"), ligne(`\\approx ${angleLatex(ref)}`, "au dixième de degré"));
  } else {
    lignesRef.push(ligne(`${fonctionAngle(f, ref)}=${abs}`, [texte("valeur remarquable : "), latex(`\\alpha_0=${deg(ref)}`)]));
  }
  etapes.push(
    utilise(lRef, b.k.decimal ? [texte(`|k| n'est pas une valeur remarquable : l'angle de référence α₀ du premier quadrant se lit à la calculatrice, en mode degrés ${COURS_EQUATIONS}.`)] : [texte(`Angle de référence α₀ : l'angle du premier quadrant dont le ${f === "tan" ? "tangente" : f === "sin" ? "sinus" : "cosinus"} vaut |k|, lu dans la table des valeurs remarquables ${COURS_REMARQUABLES}.`)]),
    calcul(lRef, lignesRef),
    resRef,
  );

  // Solutions.
  const lSol = lettreDe(e, (x) => x.type === "solutions" && x.base === i);
  const positif = b.k.signe >= 0;
  let lignesSol: LigneCalcul[];
  if (!b.k.decimal) {
    lignesSol = lignesCandidats(f, ref, positif);
  } else {
    const pref = prefixesCandidats(f, positif);
    const quad = quadrantsCandidats(f, positif);
    const cand = candidats(f, b.reference, positif);
    lignesSol = pref.flatMap((p, j) => {
      const v = Math.round(cand[j]! * 10) / 10;
      return p === ""
        ? [ligne(`\\alpha_${j + 1}=\\alpha_0`, `${quad[j]}`), ligne(`\\approx ${angleLatex(v)}`)]
        : [ligne(`\\alpha_${j + 1}=${p}\\alpha_0`, `${quad[j]}`), ligne(`\\approx ${angleLatex(v)}`, [texte("avec α₀ non arrondi")])];
    });
  }
  etapes.push(
    utilise(lSol, [...regleSolutions(b), texte(` ${COURS_EQUATIONS}.`)]),
    calcul(lSol, lignesSol),
    resultat(lSol, reponseAttendueFragments(e, { type: "solutions", base: i })),
    verification(
      lSol,
      [texte(b.solutions.length > 1 ? "Chaque solution redonne bien k :" : "La solution redonne bien k :")],
      b.solutions.map((s) => ligne(`${fonctionAngle(f, s, 1)}${b.k.decimal ? "\\approx " : "="}${k}`)),
    ),
  );
  if (b.k.decimal) etapes.push(piege(lSol, [texte(`La touche ${f}⁻¹ de la calculatrice ne donne qu'un angle : la seconde solution se trouve par symétrie sur le cercle.`)]));
  return etapes;
}

export function correctionDetailleeEquationsTransformer(e: E): EtapeCorrection[] {
  const etapes: EtapeCorrection[] = [...etapesBases(e), ...e.bases.flatMap((_, i) => etapesBase(e, i))];
  if (e.bases.length >= 2) {
    const l = lettreDe(e, (x) => x.type === "ensemble");
    const lignes: LigneCalcul[] = e.bases.map((b, i) => ligne(ensembleLatex(b.solutions).replace(/^S\s*=\s*/, `S_${i + 1}=`), [texte("solutions de "), latex(baseLatex(b))]));
    lignes.push(ligne(`S=${e.bases.map((_, i) => `S_${i + 1}`).join("\\cup ")}`, "réunion, sans écrire deux fois la même solution"));
    // Quatre solutions : la ligne ne tiendrait pas dans la colonne ; l'ensemble est le résultat encadré.
    if (e.solutions.length <= 3) lignes.push(ligne(`=${ensembleLatex(e.solutions).replace(/^S\s*=\s*/, "")}`));
    etapes.push(utilise(l, [texte("Les solutions de l'équation de départ sont celles de ses équations de base, réunies.")]), calcul(l, lignes), resultat(l, reponseAttendueFragments(e, { type: "ensemble" })));
  }
  return finaliserCorrige(etapes);
}
