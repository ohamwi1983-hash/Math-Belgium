import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise } from "../../../export/corrigeTableau";
import { anneeDonnee, anneeDuRang, premierTerme, reponseFinale, somme, terme } from "../../core5e/modeliserSuite";
import type { ExerciceModeliserSeuil, ExerciceModeliserSuite } from "../../core5e/modeliserSuite";
import { phasesPourExercice } from "../../moteur5e/typesModeliserSuite";
import type { PhaseModeliserSuite } from "../../moteur5e/typesModeliserSuite";
import { avecUnite, methodeCorrige, nbL, nbT, reponseFragments, reponseRecap, valeur } from "../../ui5e/formatModeliserSuite";
import { COURS_ARITHMETIQUES, COURS_GEOMETRIQUES, COURS_PROBLEMES, listeFormules, sansRepetition } from "../../ui5e/corrigeSuites2";

/**
 * Corrigé détaillé « comme au tableau » de `5gen47` (modéliser une situation par une suite) — règle
 * `.claude/rules/feuilles-evaluations.md`. Cinq étapes = cinq écrans : a) la nature (relation entre
 * deux années consécutives écrite en calcul), b) u₁ (lu, ou l'évolution appliquée une fois à la
 * valeur de l'année précédente), c) la raison, d) le rang, le nombre de termes ou le tableau,
 * e) le terme, la somme (formule, substitution, chaque opération sur sa ligne) ou la première
 * année. Écritures produites par les fonctions de l'écran (`formatModeliserSuite.ts`).
 */

const t = texte;
const f = latex;
type E = ExerciceModeliserSuite;
const LETTRES = "abcde";

/** « = 1 260 » ou « \approx 1 644,9 ». */
function egal(e: E, x: number): string {
  const v = valeur(e, x);
  return `${v.approchee ? "\\approx" : "="} ${v.latex}`;
}

function jeton(x: number): string {
  return x < 0 ? `(${nbL(x)})` : nbL(x);
}

function plusL(x: number): string {
  return x < 0 ? `-${nbL(-x)}` : `+${nbL(x)}`;
}

/** Une puissance s'écrit-elle exactement avec au plus 4 décimales ? */
function decimaleCourte(x: number): boolean {
  return Math.abs(x * 1e4 - Math.round(x * 1e4)) < 1e-6;
}

function cours(e: E): string {
  return e.nature === "arithmetique" ? COURS_ARITHMETIQUES : COURS_GEOMETRIQUES;
}

// ============================================================================
// Nature, premier terme, raison.
// ============================================================================

function lignesNature(e: E): LigneCalcul[] {
  const c = e.contexte;
  switch (e.formulation) {
    case "montant":
      return [ligne(`u_{n+1}=u_n${plusL(e.r)}`, `chaque année, on ${e.r < 0 ? "retire" : "ajoute"} ${avecUnite(e, Math.abs(e.r))} : toujours la même quantité`)];
    case "pourcentInitial":
      return [ligne(`u_{n+1}=u_n+\\dfrac{${e.pct}}{100}\\times ${nbL(e.valeurDonnee)}`, `${e.pct} % de la somme de départ : toujours le même montant`)];
    case "pourcent": {
      const s = e.sens === "hausse" ? "+" : "-";
      return [
        ligne(`u_{n+1}=u_n${s}\\dfrac{${e.pct}}{100}\\times u_n`, `${e.pct} % de la valeur de l'année précédente, qui change chaque année`),
        ligne(`=u_n\\times\\left(1${s}\\dfrac{${e.pct}}{100}\\right)`, [t("on met "), f("u_n"), t(" en évidence : on multiplie toujours par le même nombre")]),
      ];
    }
    case "double":
      return [ligne("u_{n+1}=2\\times u_n", `${c.pronom.replace(/^./, (x) => x.toUpperCase())} double : on multiplie toujours par 2`)];
    case "moitie":
      return [ligne("u_{n+1}=\\dfrac{u_n}{2}", "diminuer de moitié, c'est multiplier toujours par le même nombre")];
  }
}

function lignesPremierTerme(e: E): LigneCalcul[] {
  const u1 = premierTerme(e);
  if (e.depart === "rang1") return [ligne(`u_1=${nbL(u1)}`, `valeur de ${e.annee1}, l'année de rang 1`)];
  const u0 = nbL(e.valeurDonnee);
  const a0 = anneeDonnee(e);
  switch (e.formulation) {
    case "montant":
      return [ligne(`u_1=${u0}${plusL(e.r)}`, `valeur de ${a0}, plus l'évolution d'une année`), ligne(egal(e, u1))];
    case "pourcentInitial":
      return sansRepetition([ligne(`u_1=${u0}+\\dfrac{${e.pct}}{100}\\times ${u0}`, `valeur de ${a0}, plus les intérêts d'une année`), ligne(`=${u0}+${nbL(e.r)}`), ligne(egal(e, u1))]);
    case "pourcent": {
      const s = e.sens === "hausse" ? "+" : "-";
      return [
        ligne(`u_1=${u0}${s}\\dfrac{${e.pct}}{100}\\times ${u0}`, `valeur de ${a0}, ${e.sens === "hausse" ? "plus" : "moins"} ${e.pct} % de celle-ci`),
        ligne(`=${u0}\\times ${nbL(e.q)}`, [t("on met "), f(u0), t(" en évidence")]),
        ligne(egal(e, u1)),
      ];
    }
    case "double":
      return [ligne(`u_1=2\\times ${u0}`, `valeur de ${a0}, doublée une fois`), ligne(egal(e, u1))];
    case "moitie":
      return [ligne(`u_1=\\dfrac{${u0}}{2}`, `valeur de ${a0}, divisée une fois par 2`), ligne(egal(e, u1))];
  }
}

function lignesRaison(e: E): LigneCalcul[] {
  if (e.nature === "arithmetique") {
    if (e.formulation === "pourcentInitial" && e.pct !== null) return [ligne(`r=\\dfrac{${e.pct}}{100}\\times ${nbL(e.valeurDonnee)}`, `${e.pct} % de la somme de départ`), ligne(`=${nbL(e.r)}`)];
    return [ligne(`r=${nbL(e.r)}`, e.r < 0 ? "quantité retirée chaque année : raison négative" : "quantité ajoutée chaque année")];
  }
  switch (e.formulation) {
    case "double":
      return [ligne("q=2", "on multiplie par 2 chaque année")];
    case "moitie":
      return [ligne("q=\\dfrac{1}{2}", "on divise par 2 chaque année"), ligne("=0{,}5")];
    default: {
      const s = e.sens === "hausse" ? "+" : "-";
      return [ligne(`q=1${s}\\dfrac{${e.pct}}{100}`, `${e.sens === "hausse" ? "on garde toute la valeur et on ajoute" : "on garde toute la valeur et on retire"} ${e.pct} %`), ligne(`=1${s}${nbL((e.pct ?? 0) / 100)}`), ligne(`=${nbL(e.q)}`)];
    }
  }
}

// ============================================================================
// Termes et sommes.
// ============================================================================

/** u_k par la formule générale, une opération par ligne. */
function lignesTerme(e: E, k: number, avecFormule = true): LigneCalcul[] {
  const u1 = premierTerme(e);
  const lignes: LigneCalcul[] = [];
  if (e.nature === "arithmetique") {
    if (avecFormule) lignes.push(ligne("u_n=u_1+(n-1)\\,r", "terme général d'une suite arithmétique"));
    lignes.push(ligne(`u_{${k}}=${nbL(u1)}+${k - 1}\\times ${jeton(e.r)}`, [t("avec "), f(`n=${k}`), t(", "), f(`u_1=${nbL(u1)}`), t(" et "), f(`r=${nbL(e.r)}`)]));
    lignes.push(ligne(`=${nbL(u1)}${plusL((k - 1) * e.r)}`, "on multiplie"));
  } else {
    if (avecFormule) lignes.push(ligne("u_n=u_1\\times q^{n-1}", "terme général d'une suite géométrique"));
    lignes.push(ligne(`u_{${k}}=${nbL(u1)}\\times ${nbL(e.q)}^{${k - 1}}`, [t("avec "), f(`n=${k}`), t(", "), f(`u_1=${nbL(u1)}`), t(" et "), f(`q=${nbL(e.q)}`)]));
    const p = e.q ** (k - 1);
    if (e.mode === "exact" && decimaleCourte(p)) lignes.push(ligne(`=${nbL(u1)}\\times ${nbL(p)}`, [t("on calcule la puissance : "), f(`${nbL(e.q)}^{${k - 1}}=${nbL(p)}`)]));
  }
  lignes.push(ligne(egal(e, terme(e, k)), e.mode === "calcul" ? `à la calculatrice, arrondi ${e.contexte.decimales === 0 ? "à l'unité" : e.contexte.decimales === 1 ? "au dixième" : "au centième"}` : undefined));
  return sansRepetition(lignes);
}

function lignesSomme(e: E, n: number): LigneCalcul[] {
  const u1 = premierTerme(e);
  if (e.nature === "arithmetique") {
    const un = terme(e, n);
    const s = u1 + un;
    return sansRepetition([
      ligne(`S_{${n}}=\\dfrac{N\\times(u_1+u_N)}{2}`, "N fois la moyenne du premier et du dernier terme"),
      ligne(`=\\dfrac{${n}\\times(${nbL(u1)}+${jeton(un)})}{2}`, [t("avec "), f(`N=${n}`), t(" et "), f(`u_{${n}}=${nbL(un)}`)]),
      ligne(`=\\dfrac{${n}\\times ${jeton(s)}}{2}`, "on additionne les deux termes extrêmes"),
      ligne(`=\\dfrac{${nbL(n * s)}}{2}`, "on multiplie"),
      ligne(egal(e, somme(e, n)), "on divise par 2"),
    ]);
  }
  const q = nbL(e.q);
  const lignes: LigneCalcul[] = [
    ligne(`S_{${n}}=u_1\\times\\dfrac{1-q^{N}}{1-q}`, [t("somme des N premiers termes, "), f(`N=${n}`)]),
    ligne(`=${nbL(u1)}\\times\\dfrac{1-${q}^{${n}}}{1-${q}}`, [t("avec "), f(`u_1=${nbL(u1)}`), t(" et "), f(`q=${q}`)]),
  ];
  const p = e.q ** n;
  if (e.mode === "exact" && decimaleCourte(p)) {
    lignes.push(ligne(`=${nbL(u1)}\\times\\dfrac{1-${nbL(p)}}{${nbL(1 - e.q)}}`, [t("on calcule la puissance : "), f(`${q}^{${n}}=${nbL(p)}`)]));
    lignes.push(ligne(`=${nbL(u1)}\\times\\dfrac{${nbL(1 - p)}}{${nbL(1 - e.q)}}`, "on calcule le numérateur"));
  }
  lignes.push(ligne(egal(e, somme(e, n)), e.mode === "calcul" ? `à la calculatrice, arrondi ${e.contexte.decimales === 0 ? "à l'unité" : e.contexte.decimales === 1 ? "au dixième" : "au centième"}` : "on calcule"));
  return sansRepetition(lignes);
}

function lignesAnnee(e: ExerciceModeliserSeuil): LigneCalcul[] {
  const k = e.rangSeuil;
  const s = valeur(e, e.seuil).latex;
  const hausse = e.sens === "hausse";
  return [
    ligne(`u_{${k - 1}}${egal(e, terme(e, k - 1))}${hausse ? "\\leq" : "\\geq"} ${s}`, `${anneeDuRang(e, k - 1)} : le seuil n'est pas encore franchi`),
    ligne(`u_{${k}}${egal(e, terme(e, k))}${hausse ? ">" : "<"} ${s}`, `${anneeDuRang(e, k)} : seuil franchi pour la première fois`),
    ligne(`${e.annee1}+${k}-1=${anneeDuRang(e, k)}`, [t("année du rang "), f(`n=${k}`)]),
  ];
}

// ============================================================================
// Étapes.
// ============================================================================

/** La ligne « Piège », sur l'étape où l'erreur classique se commet. */
function piegeEtape(e: E): { phase: PhaseModeliserSuite; fragments: FragmentConsigne[] } {
  if (e.nature === "arithmetique" && e.formulation === "pourcentInitial") {
    return { phase: "nature", fragments: [t("Le symbole % ne suffit pas à conclure : les intérêts portent toujours sur la somme de départ, on ajoute donc chaque année le même montant — la suite est arithmétique, pas géométrique.")] };
  }
  if (e.nature === "geometrique" && e.formulation === "pourcent" && e.pct !== null) {
    const taux = nbL(e.pct / 100);
    return e.sens === "hausse"
      ? { phase: "raison", fragments: [t(`Une hausse de ${e.pct} % donne `), f(`q=${nbL(e.q)}`), t(" et non "), f(`q=${taux}`), t(` : on garde toute la valeur et on ajoute ${e.pct} %.`)] }
      : { phase: "raison", fragments: [t(`Une baisse de ${e.pct} % donne `), f(`q=${nbL(e.q)}`), t(" et non "), f(`q=${taux}`), t(` : ${nbT(e.pct / 100)} est la part qui disparaît, il reste ${nbT(e.q)} de la valeur.`)] };
  }
  if (e.depart === "avant") {
    return { phase: "premierTerme", fragments: [t(`La valeur donnée est celle de ${anneeDonnee(e)}, un an avant l'année de rang 1 : ce n'est pas `), f("u_1"), t(", il faut appliquer une fois l'évolution annuelle.")] };
  }
  switch (e.variante) {
    case "terme": {
      const y = anneeDuRang(e, e.rang);
      return { phase: "rang", fragments: [t(`L'année ${e.annee1} a déjà le rang 1 : `), f(`n=${y}-${e.annee1}+1`), t(", et non "), f(`${y}-${e.annee1}`), t(" (rang décalé d'une unité).")] };
    }
    case "somme":
      return { phase: "somme", fragments: [t("Le total demandé est la somme des "), f("N"), t(" termes, "), f(`S_{${e.nombre}}`), t(", et non la valeur de la dernière année, "), f(`u_{${e.nombre}}`), t(".")] };
    case "seuil":
      return { phase: "annee", fragments: [t("La question demande une ANNÉE : le rang "), f(`n=${e.rangSeuil}`), t(` correspond à l'année ${anneeDuRang(e, e.rangSeuil)}.`)] };
  }
}

/** Phrase de réponse au problème (dernière étape). */
function conclusion(e: E): FragmentConsigne[] {
  const c = e.contexte;
  const environ = (x: number) => (valeur(e, x).approchee ? "environ " : "");
  switch (e.variante) {
    case "terme": {
      const x = terme(e, e.rang);
      return [f(`u_{${e.rang}}${egal(e, x)}`), t(` : en ${anneeDuRang(e, e.rang)}, ${c.grandeur} vaudra ${environ(x)}${avecUnite(e, x)}.`)];
    }
    case "somme": {
      const x = somme(e, e.nombre);
      const total = c.total?.texte ?? "";
      return [f(`S_{${e.nombre}}${egal(e, x)}`), t(` : ${total} de ${e.annee1} à ${anneeDuRang(e, e.nombre)} vaut ${environ(x)}${avecUnite(e, x)}.`)];
    }
    case "seuil": {
      const verbe = e.sens === "hausse" ? "dépasse" : "passe sous";
      return [t(`C'est en ${reponseFinale(e)} que ${c.grandeur} ${verbe} ${avecUnite(e, e.seuil)} pour la première fois.`)];
    }
  }
}

function resultatRecap(e: E, phase: PhaseModeliserSuite): FragmentConsigne[] {
  const r = reponseRecap(e, phase);
  const unite = e.contexte.unite;
  if ("texte" in r) return [t(r.texte.charAt(0).toUpperCase() + r.texte.slice(1) + ".")];
  const avecU = phase === "premierTerme" || (phase === "raison" && e.nature === "arithmetique");
  return [...listeFormules(r.latex), ...(avecU ? [t(` ${unite}`)] : [])];
}

function etape(e: E, phase: PhaseModeliserSuite, sq: string): EtapeCorrection[] {
  const m = methodeCorrige(e, phase);
  // Le renvoi au cours termine la phrase : pas de point avant lui.
  const u: FragmentConsigne[] = [t(m.latex ? m.texte : m.texte.replace(/\.$/, "")), ...(m.latex ? [t(" "), f(m.latex)] : [])];
  switch (phase) {
    case "nature":
      return [
        utilise(sq, [
          ...u,
          ...(e.nature === "arithmetique"
            ? [t(". Une suite où l'on ajoute toujours la même quantité est arithmétique : "), f("u_{n+1}=u_n+r")]
            : [t(". Une suite où l'on multiplie toujours par le même nombre est géométrique : "), f("u_{n+1}=u_n\\times q")]),
          t(` ${COURS_PROBLEMES}.`),
        ]),
        calcul(sq, lignesNature(e), [t("D'une année à la suivante :")]),
        resultat(sq, reponseFragments(e, "nature")),
      ];
    case "premierTerme":
      return [utilise(sq, [...u, t(` ${COURS_PROBLEMES}.`)]), calcul(sq, lignesPremierTerme(e)), resultat(sq, resultatRecap(e, phase))];
    case "raison":
      return [utilise(sq, [...u, t(` ${cours(e)}.`)]), calcul(sq, lignesRaison(e)), resultat(sq, resultatRecap(e, phase))];
    case "rang":
    case "nombreTermes": {
      const k = e.variante === "terme" ? e.rang : e.variante === "somme" ? e.nombre : 0;
      const nom = phase === "rang" ? "n" : "N";
      return [
        utilise(sq, [t(`Le rang d'une année est le nombre d'années écoulées depuis ${e.annee1} (rang 1), plus 1 `), t(`${COURS_PROBLEMES}.`)]),
        calcul(sq, [ligne(`${nom}=${anneeDuRang(e, k)}-${e.annee1}+1`, `l'année ${e.annee1} a le rang 1`), ligne(`=${k}`)]),
        resultat(sq, resultatRecap(e, phase)),
      ];
    }
    case "terme":
      return e.variante === "terme" ? [utilise(sq, [...u, t(` ${cours(e)}.`)]), calcul(sq, lignesTerme(e, e.rang)), resultat(sq, conclusion(e))] : [];
    case "somme":
      if (e.variante !== "somme") return [];
      return [
        utilise(sq, [...u, t(` ${cours(e)}.`)]),
        ...(e.nature === "arithmetique" ? [calcul(sq, lignesTerme(e, e.nombre), [t("Dernier terme de la somme :")])] : []),
        calcul(sq, lignesSomme(e, e.nombre), e.nature === "arithmetique" ? [t("Somme :")] : []),
        resultat(sq, conclusion(e)),
      ];
    case "tableau":
      if (e.variante !== "seuil") return [];
      return [
        utilise(sq, [...u, t(` ${cours(e)}.`)]),
        ...e.rangsTable.map((k, i) => calcul(sq, lignesTerme(e, k, i === 0), [f(`n=${k}`), t(` (année ${anneeDuRang(e, k)}) :`)])),
        resultat(sq, listeFormules(e.rangsTable.map((k) => `u_{${k}}${egal(e, terme(e, k))}`))),
      ];
    case "annee":
      return e.variante === "seuil" ? [utilise(sq, [...u, t(` ${COURS_PROBLEMES}.`)]), calcul(sq, lignesAnnee(e)), resultat(sq, conclusion(e))] : [];
  }
}

export function correctionDetailleeModeliserSuite(e: E): EtapeCorrection[] {
  const p = piegeEtape(e);
  return phasesPourExercice(e).flatMap((phase, i): EtapeCorrection[] => {
    const sq = LETTRES[i];
    return [...etape(e, phase, sq), ...(p.phase === phase ? [piege(sq, p.fragments)] : [])];
  });
}
