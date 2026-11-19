import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, lignesDepuisChaine, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import { coefficientFormuleGeom, coefficientsFormuleArith, donneesSomme, facteursMultiples, termeGeom } from "../../core5e/sommesTermes.types";
import type { ExerciceArithExtension, ExerciceSommesTermes, RaisonQ } from "../../core5e/sommesTermes.types";
import { phasesPourExercice } from "../../moteur5e/typesSommesTermes";
import type { PhaseSommesTermes } from "../../moteur5e/typesSommesTermes";
import { aideNiveau1, jeton, nbTexte, nb, qLatex, qPuissance, reponseFragments, reponseRecap } from "../../ui5e/formatSommesTermes";
import { COURS_ARITHMETIQUES, COURS_GEOMETRIQUES, lignesSommeArithmetique, listeFormules, sansRepetition } from "../../ui5e/corrigeSuites2";

/**
 * Corrigé détaillé « comme au tableau » de `5gen45` (sommes de termes consécutifs) — règle
 * `.claude/rules/feuilles-evaluations.md`. Une étape par écran (lettres a, b, c), selon la
 * variante : nombre de termes (n − p + 1, équation uₙ = dernier terme, multiples k₁…k₂, puissance
 * de q reconnue), termes extrêmes ou premier terme (terme général substitué), raison, terme
 * général, plus petit et plus grand multiples, puis la somme (formule, substitution, chaque
 * opération sur sa ligne) avec une vérification par une autre écriture.
 * Écritures produites par les fonctions de l'écran (`formatSommesTermes.ts`) ; partagé par
 * l'adaptateur papier et l'appli.
 */

const t = texte;
const f = latex;
type E = ExerciceSommesTermes;

const LETTRES = "abc";

function estGeom(e: E): e is Extract<E, { variante: "geom-indices" | "geom-extension" }> {
  return e.variante === "geom-indices" || e.variante === "geom-extension";
}

/** qᵏ exact (fraction si q est fractionnaire). */
function puissanceQ(q: RaisonQ, k: number): string {
  const num = q.num ** k;
  const den = q.den ** k;
  if (den === 1) return nb(num);
  return `${num < 0 ? "-" : ""}\\dfrac{${nb(Math.abs(num))}}{${nb(den)}}`;
}

/** Les trois premiers termes de la somme (variantes « extension »). */
function premiersTermesSomme(e: E): number[] {
  const d = donneesSomme(e);
  if (estGeom(e)) return [1, 2, 3].map((k) => termeGeom(d.premier, e.q, k));
  const r = e.variante === "arith-extension" || e.variante === "arith-indices" ? e.r : 0;
  return [0, 1, 2].map((i) => d.premier + i * r);
}

// ============================================================================
// Nombre de termes.
// ============================================================================

function lignesNombre(e: E): LigneCalcul[] {
  const d = donneesSomme(e);
  switch (e.variante) {
    case "arith-indices":
    case "geom-indices":
      return [ligne("N=n-p+1", [t("de "), f(`u_{${e.p}}`), t(" à "), f(`u_{${e.n}}`), t(" : un terme de plus que d'écarts entre les rangs")]), ligne(`=${e.n}-${e.p}+1`, [t("avec "), f(`n=${e.n}`), t(" et "), f(`p=${e.p}`)]), ligne(`=${d.nombre}`)];
    case "arith-extension": {
      if (e.sousCas === "multiples") {
        const [k1, k2] = facteursMultiples(e);
        return [
          ligne(`${nb(d.premier)}=${e.r}\\times ${k1}`, [t("plus petit multiple : "), f(`k_1=${k1}`)]),
          ligne(`${nb(d.dernier)}=${e.r}\\times ${k2}`, [t("plus grand multiple : "), f(`k_2=${k2}`)]),
          ligne("N=k_2-k_1+1", [t("autant de termes que d'entiers de "), f("k_1"), t(" à "), f("k_2")]),
          ligne(`=${k2}-${k1}+1`),
          ligne(`=${d.nombre}`),
        ];
      }
      if (e.sousCas === "naturels") return lignesEquationRang(e, "le dernier terme est le terme de rang N");
      return [
        ligne("u_N=u_1+(N-1)\\,r", "le dernier terme est le terme de rang N"),
        ligne(`${nb(d.dernier)}=${nb(d.premier)}+(N-1)\\times ${jeton(e.r)}`, [t("avec "), f(`u_1=${nb(d.premier)}`), t(" et "), f(`r=${nb(e.r)}`)]),
        ligne(`(N-1)\\times ${jeton(e.r)}=${nb(d.dernier)}-${jeton(d.premier)}`, `on retire ${nbTexte(d.premier)} des deux membres`),
        ligne(`=${nb(d.dernier - d.premier)}`),
        ligne(`N-1=\\dfrac{${nb(d.dernier - d.premier)}}{${nb(e.r)}}`, `on divise par ${nbTexte(e.r)}`),
        ligne(`=${d.nombre - 1}`),
        ligne(`N=${d.nombre}`, "on ajoute 1"),
      ];
    }
    case "geom-extension": {
      const q = e.q;
      const lignes: LigneCalcul[] = [
        ligne(`u_N=u_1\\times q^{N-1}`, "le dernier terme est le terme de rang N"),
        ligne(`${nb(d.dernier)}=${jeton(d.premier)}\\times ${qPuissance(q, "N-1")}`, [t("avec "), f(`u_1=${nb(d.premier)}`), t(" et "), f(`q=${qLatex(q)}`)]),
      ];
      if (d.premier !== 1) lignes.push(ligne(`${qPuissance(q, "N-1")}=\\dfrac{${nb(d.dernier)}}{${nb(d.premier)}}`, `on divise par ${nbTexte(d.premier)}`));
      lignes.push(ligne(`${d.premier === 1 ? `${qPuissance(q, "N-1")}` : ""}=${puissanceQ(q, d.nombre - 1)}`, d.premier === 1 ? "on lit le dernier terme" : undefined));
      lignes.push(ligne(`=${qPuissance(q, d.nombre - 1)}`, "on reconnaît une puissance de q"));
      lignes.push(ligne(`N-1=${d.nombre - 1}`, "on identifie les exposants"));
      lignes.push(ligne(`N=${d.nombre}`, "on ajoute 1"));
      return sansRepetition(lignes);
    }
  }
}

/** Impairs / pairs : on résout u_N = dernier terme (terme général trouvé à l'étape a). */
function lignesEquationRang(e: ExerciceArithExtension, justification: string): LigneCalcul[] {
  const d = donneesSomme(e);
  const a = e.r;
  const b = e.premier - e.r;
  const affN = b === 0 ? `${a}N` : `${a}N${b > 0 ? "+" : "-"}${Math.abs(b)}`;
  const lignes: LigneCalcul[] = [ligne(`${affN}=${nb(d.dernier)}`, justification)];
  if (b !== 0) lignes.push(ligne(`${a}N=${nb(d.dernier)}${b > 0 ? "-" : "+"}${Math.abs(b)}`, b > 0 ? `on retire ${b} des deux membres` : `on ajoute ${-b} aux deux membres`), ligne(`=${nb(d.dernier - b)}`));
  lignes.push(ligne(`N=\\dfrac{${nb(d.dernier - b)}}{${a}}`, `on divise par ${a}`), ligne(`=${d.nombre}`));
  return lignes;
}

// ============================================================================
// Termes, raison, terme général, multiples.
// ============================================================================

function lignesTermesExtremes(e: Extract<E, { variante: "arith-indices" }>): { premier: LigneCalcul[]; dernier: LigneCalcul[] } {
  const d = donneesSomme(e);
  const pour = (k: number, valeur: number): LigneCalcul[] => {
    if (e.donnee === "u1r") {
      return sansRepetition([
        ligne(`u_{${k}}=${nb(e.u1)}+(${k}-1)\\times ${jeton(e.r)}`, [t("terme général "), f("u_n=u_1+(n-1)\\,r"), t(`, avec n = ${k}`)]),
        ligne(`=${nb(e.u1)}+${k - 1}\\times ${jeton(e.r)}`),
        ligne(`=${nb(e.u1)}${(k - 1) * e.r < 0 ? "" : "+"}${nb((k - 1) * e.r)}`, "on multiplie"),
        ligne(`=${nb(valeur)}`),
      ]);
    }
    const { a, b } = coefficientsFormuleArith(e);
    return sansRepetition([
      ligne(`u_{${k}}=${nb(a)}\\times ${k}${b === 0 ? "" : `${b > 0 ? "+" : "-"}${nb(Math.abs(b))}`}`, `on remplace n par ${k}`),
      ligne(`=${nb(a * k)}${b === 0 ? "" : `${b > 0 ? "+" : "-"}${nb(Math.abs(b))}`}`, "on multiplie"),
      ligne(`=${nb(valeur)}`),
    ]);
  };
  return { premier: pour(e.p, d.premier), dernier: pour(e.n, d.dernier) };
}

function lignesPremierTerme(e: Extract<E, { variante: "geom-indices" }>): LigneCalcul[] {
  const d = donneesSomme(e);
  const k = e.donnee === "u1q" ? e.u1 : coefficientFormuleGeom(e);
  const expo = e.donnee === "u1q" || e.exposant === "n-1" ? e.p - 1 : e.p;
  return sansRepetition([
    ligne(`u_{${e.p}}=${jeton(k)}\\times ${qPuissance(e.q, expo)}`, e.donnee === "u1q" ? [t("terme général "), f("u_n=u_1\\times q^{n-1}"), t(`, avec n = ${e.p}`)] : `on remplace n par ${e.p}`),
    ligne(`=${jeton(k)}\\times ${e.q.den === 1 && e.q.num ** expo >= 0 ? puissanceQ(e.q, expo) : `\\left(${puissanceQ(e.q, expo)}\\right)`}`, [t("on calcule la puissance")]),
    ligne(`=${nb(d.premier)}`),
  ]);
}

function lignesRaison(e: E): LigneCalcul[] {
  const [t1, t2] = premiersTermesSomme(e);
  const chaine = (reponseFragments(e, "raison")[0] as { valeur: string } | undefined)?.valeur ?? "";
  return lignesDepuisChaine(chaine, [estGeom(e) ? "quotient du deuxième terme par le premier" : "différence entre le deuxième terme et le premier", estGeom(e) ? "on simplifie" : undefined]).map((l, i) => (i === 0 && !l.justification ? { ...l, justification: `avec ${nb(t2)} et ${nb(t1)}` } : l));
}

function lignesFormuleGenerale(e: ExerciceArithExtension): LigneCalcul[] {
  return sansRepetition([
    ligne("u_n=u_1+(n-1)\\,r", "terme général d'une suite arithmétique"),
    ligne(`=${nb(e.premier)}+(n-1)\\times ${e.r}`, [t("avec "), f(`u_1=${nb(e.premier)}`), t(" et "), f(`r=${e.r}`)]),
    ligne(`=${nb(e.premier)}+${e.r}n-${e.r}`, "on distribue"),
    ligne(`=${(reponseRecap(e, "formuleGenerale")[0] ?? "").replace(/^u_n=/, "")}`, "on regroupe les nombres"),
  ]);
}

function lignesBornes(e: ExerciceArithExtension): LigneCalcul[] {
  if (!e.bornes) return [];
  const [A, B] = e.bornes;
  const d = donneesSomme(e);
  const [k1, k2] = facteursMultiples(e);
  const quotient = (x: number) => `\\dfrac{${nb(x)}}{${e.r}}${Number.isInteger((x / e.r) * 100) ? "=" : "\\approx "}${nb(x / e.r)}`;
  return [
    ligne(quotient(A), `borne inférieure divisée par ${e.r}`),
    ligne(`${e.r}\\times ${k1}=${nb(d.premier)}`, [t(`premier entier après le quotient : `), f(`k_1=${k1}`)]),
    ligne(quotient(B), `borne supérieure divisée par ${e.r}`),
    ligne(`${e.r}\\times ${k2}=${nb(d.dernier)}`, [t(`dernier entier avant le quotient : `), f(`k_2=${k2}`)]),
  ];
}

// ============================================================================
// Somme.
// ============================================================================

function lignesSomme(e: E): LigneCalcul[] {
  const d = donneesSomme(e);
  const [a, b] = e.variante === "arith-indices" || e.variante === "geom-indices" ? [`u_{${e.p}}`, `u_{${e.n}}`] : ["u_1", "u_N"];
  if (!estGeom(e)) return lignesSommeArithmetique("S", d.nombre, d.premier, d.dernier, nb, a, b);
  const q = e.q;
  const unMoinsQ = q.den === 1 ? jeton(q.num) : `\\left(${qLatex(q)}\\right)`;
  const lignes: LigneCalcul[] = [
    ligne(`S=${a}\\times\\dfrac{1-q^{N}}{1-q}`, [t("devant la fraction, le premier terme de la somme ; "), f(`N=${d.nombre}`)]),
    ligne(`=${jeton(d.premier)}\\times\\dfrac{1-${qPuissance(q, d.nombre)}}{1-${unMoinsQ}}`),
  ];
  const num = q.num ** d.nombre;
  const den = q.den ** d.nombre;
  if (q.den === 1) {
    lignes.push(ligne(`=${jeton(d.premier)}\\times\\dfrac{1-${num < 0 ? `(${nb(num)})` : nb(num)}}{${nb(1 - q.num)}}`, [t("on calcule la puissance : "), f(`${qPuissance(q, d.nombre)}=${nb(num)}`)]));
    const quotient = (1 - num) / (1 - q.num);
    lignes.push(ligne(`=${jeton(d.premier)}\\times\\dfrac{${nb(1 - num)}}{${nb(1 - q.num)}}`, "on calcule le numérateur"));
    lignes.push(ligne(`=${jeton(d.premier)}\\times ${jeton(quotient)}`, "on divise"));
  } else {
    // q = ±1/2 : 1 − qᴺ = (den − num)/den et 1 − q = (q.den − q.num)/q.den.
    lignes.push(ligne(`=${jeton(d.premier)}\\times\\dfrac{1-${num < 0 ? `\\left(-\\dfrac{${nb(-num)}}{${nb(den)}}\\right)` : `\\dfrac{${nb(num)}}{${nb(den)}}`}}{\\dfrac{${q.den - q.num}}{${q.den}}}`, [t("on calcule la puissance et "), f(`1-${unMoinsQ}`)]));
    lignes.push(ligne(`=${jeton(d.premier)}\\times\\dfrac{${nb(den - num)}}{${nb(den)}}\\times\\dfrac{${q.den}}{${q.den - q.num}}`, "on réduit au même dénominateur ; diviser par une fraction, c'est multiplier par son inverse"));
    const N = d.premier * (den - num) * q.den;
    const D = den * (q.den - q.num);
    lignes.push(ligne(`=\\dfrac{${nb(N)}}{${nb(D)}}`, "on multiplie"));
  }
  lignes.push(ligne(`=${nb(d.somme)}`, q.den === 1 ? "on multiplie" : "on simplifie"));
  return sansRepetition(lignes);
}

/** Vérification de la somme par une autre écriture. */
function verificationSomme(e: E): EtapeCorrection | null {
  const d = donneesSomme(e);
  if (e.variante === "arith-extension" && e.parite === "impairs") return verification("c", [t("La somme des N premiers nombres impairs vaut toujours "), f("N^2"), t(" :")], [ligne(`${d.nombre}^2=${nb(d.nombre * d.nombre)}`, "on retrouve S ✓")]);
  if (!estGeom(e)) return verification("c", [t("Autre écriture : N fois la moyenne des deux termes extrêmes :")], sansRepetition([ligne(`${d.nombre}\\times\\dfrac{${nb(d.premier)}+${jeton(d.dernier)}}{2}=${d.nombre}\\times ${jeton((d.premier + d.dernier) / 2)}`), ligne(`=${nb(d.somme)}`, "on retrouve S ✓")]));
  // Géométrique : S = (dernier × q − premier)/(q − 1).
  const q = e.q;
  const dq = (d.dernier * q.num) / q.den;
  const g = (a: number, b: number): number => (b === 0 ? Math.abs(a) : g(b, a % b));
  const k = g(d.dernier * q.num, q.den) || 1;
  const dqL = Number.isInteger(dq) ? nb(dq) : `${dq < 0 ? "-" : ""}\\dfrac{${nb(Math.abs(d.dernier * q.num) / k)}}{${nb(q.den / k)}}`;
  const qFacteur = q.den === 1 ? jeton(q.num) : `\\left(${qLatex(q)}\\right)`;
  const qMoinsUn = { num: q.num - q.den, den: q.den };
  return verification(
    "c",
    [t("Autre écriture de la même somme : "), f(`S=\\dfrac{${e.variante === "geom-indices" ? `u_{${e.n}}` : "u_N"}\\times q-${e.variante === "geom-indices" ? `u_{${e.p}}` : "u_1"}}{q-1}`), t(" (dernier terme, premier terme) :")],
    sansRepetition([
      ligne(`\\dfrac{${nb(d.dernier)}\\times ${qFacteur}-${jeton(d.premier)}}{${q.den === 1 ? nb(q.num) : qLatex(q)}-1}=\\dfrac{${dqL}-${jeton(d.premier)}}{${qMoinsUn.den === 1 ? nb(qMoinsUn.num) : `${qMoinsUn.num < 0 ? "-" : ""}\\dfrac{${Math.abs(qMoinsUn.num)}}{${qMoinsUn.den}}`}}`),
      ligne(`=${nb(d.somme)}`, "on retrouve S ✓"),
    ]),
  );
}

// ============================================================================
// Étapes.
// ============================================================================

/** L'aide de niveau 1 de l'écran (phrase terminée par « : » et sa formule). */
function aideNiveu1Texte(e: E, phase: PhaseSommesTermes): FragmentConsigne[] {
  const aide = aideNiveau1(e, phase);
  return [t(aide.texte), ...(aide.latex ? [t(" "), f(aide.latex)] : [])];
}

function utiliseEtape(e: E, phase: PhaseSommesTermes, sq: string): EtapeCorrection {
  const cours = estGeom(e) ? COURS_GEOMETRIQUES : COURS_ARITHMETIQUES;
  return utilise(sq, [...aideNiveu1Texte(e, phase), t(` ${cours}.`)]);
}

/** La ligne « Piège », sur l'étape où l'erreur classique se commet. */
function piegeEtape(e: E): { phase: PhaseSommesTermes; fragments: FragmentConsigne[] } {
  switch (e.variante) {
    case "arith-indices":
      return { phase: "nombreTermes", fragments: [t("De "), f("u_p"), t(" à "), f("u_n"), t(", il y a "), f("n-p+1"), t(" termes, pas "), f("n-p"), t(" : un terme de plus que d'écarts entre les rangs.")] };
    case "geom-indices":
      return {
        phase: "somme",
        fragments: [t("La formule "), f("u_1\\times\\dfrac{1-q^n}{1-q}"), t(" vaut pour une somme qui commence à "), f("u_1"), t(" ; ici, le facteur devant la fraction est le premier terme de la somme, "), f(`u_{${e.p}}`), t(", et l'exposant est le nombre de termes.")],
      };
    case "arith-extension":
      if (e.sousCas === "naturels") return { phase: "nombreTermes", fragments: [t("Le dernier terme n'est pas le nombre de termes : on cherche son RANG, en résolvant "), f("u_N=\\ldots"), t(".")] };
      if (e.sousCas === "multiples") return { phase: "bornesMultiples", fragments: [t("Les bornes ne sont pas des multiples : le premier multiple est juste APRÈS la borne inférieure, le dernier juste AVANT la borne supérieure ; puis on compte "), f("k_2-k_1+1"), t(" termes.")] };
      return { phase: "nombreTermes", fragments: [t("L'écart entre le dernier et le premier terme, divisé par la raison, donne le nombre d'ÉCARTS "), f("N-1"), t(" : il faut encore ajouter 1.")] };
    case "geom-extension":
      return { phase: "nombreTermes", fragments: [t("Le quotient du dernier terme par le premier vaut "), f("q^{N-1}"), t(" : l'exposant trouvé est "), f("N-1"), t(", le nombre de termes est un de plus.")] };
  }
}

function resultatEtape(e: E, phase: PhaseSommesTermes, sq: string): EtapeCorrection {
  const d = donneesSomme(e);
  switch (phase) {
    case "bornesMultiples":
      return resultat(sq, [t("Plus petit multiple : "), f(nb(d.premier)), t(" ; plus grand multiple : "), f(nb(d.dernier)), t(".")]);
    case "somme":
      return resultat(sq, [t(`Somme des ${d.nombre} termes : `), f(`S=${nb(d.somme)}`)]);
    default:
      return resultat(sq, listeFormules(reponseRecap(e, phase)));
  }
}

function lignesPhase(e: E, phase: PhaseSommesTermes, sq: string): EtapeCorrection[] {
  switch (phase) {
    case "nombreTermes":
      return [calcul(sq, lignesNombre(e))];
    case "termesExtremes": {
      if (e.variante !== "arith-indices") return [];
      const { premier, dernier } = lignesTermesExtremes(e);
      return [calcul(sq, premier, [t("Premier terme de la somme :")]), calcul(sq, dernier, [t("Dernier terme de la somme :")])];
    }
    case "premierTerme":
      return e.variante === "geom-indices" ? [calcul(sq, lignesPremierTerme(e))] : [];
    case "raison":
      return [calcul(sq, lignesRaison(e))];
    case "formuleGenerale":
      return e.variante === "arith-extension" ? [calcul(sq, lignesFormuleGenerale(e))] : [];
    case "bornesMultiples":
      return e.variante === "arith-extension" ? [calcul(sq, lignesBornes(e))] : [];
    case "somme":
      return [calcul(sq, lignesSomme(e))];
  }
}

function verificationRaison(e: E): EtapeCorrection | null {
  const [t1, t2, t3] = premiersTermesSomme(e);
  if (e.variante === "geom-extension") return verification("b", [t("Le troisième terme de la somme suit la même règle :")], [ligne(`${jeton(t2)}\\times ${e.q.den === 1 && e.q.num > 0 ? nb(e.q.num) : `\\left(${qLatex(e.q)}\\right)`}=${nb(t3)}`, "troisième terme ✓")]);
  if (e.variante === "arith-extension") return verification("b", [t("Le troisième terme de la somme suit la même règle :")], [ligne(`${nb(t2)}+${jeton(e.r)}=${nb(t3)}`, "troisième terme ✓")]);
  void t1;
  return null;
}

export function correctionDetailleeSommesTermes(e: E): EtapeCorrection[] {
  const p = piegeEtape(e);
  return phasesPourExercice(e).flatMap((phase, i): EtapeCorrection[] => {
    const sq = LETTRES[i];
    const etapes: EtapeCorrection[] = [utiliseEtape(e, phase, sq), ...lignesPhase(e, phase, sq), resultatEtape(e, phase, sq)];
    if (phase === "raison") {
      const v = verificationRaison(e);
      if (v) etapes.push({ ...v, sousQuestion: sq });
    }
    if (phase === "somme") {
      const v = verificationSomme(e);
      if (v) etapes.push({ ...v, sousQuestion: sq });
    }
    if (p.phase === phase) etapes.push(piege(sq, p.fragments));
    return etapes;
  });
}
