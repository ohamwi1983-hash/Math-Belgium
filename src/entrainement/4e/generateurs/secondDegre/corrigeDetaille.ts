import type { Exercice } from "../../core/generateur.types";
import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { Phase } from "../../moteur/types";
import { phasesExercice } from "../../moteur/session";
import { enonceSimplifie, exerciceSimplifie, facteurCommun, necessiteSimplification } from "../../moteur/simplificationEquation";
import { formatEnonceAffichage, formatEnonceLatex, formatEquationIsoleeNonDeveloppee } from "../../ui/formatEquation";
import { formeRacineEvidente, libelleMethode, methodeParDefaut, methodesAcceptees, racineEvidente, type ChoixMethode } from "../../moteur/methodeSecondDegre";
import { mono, q, qp } from "../../ui/corrigeChapitre3";
import {
  COURS_RESOUDRE,
  deltaDe,
  ensembleSolutionsLatex,
  lignesDelta,
  lignesFactorisation,
  lignesProduitNul,
  lignesRacinesFormule,
  lignesReconnaissance,
  lignesVerificationSubstitution,
  lignesVerificationViete,
  polynomeTexte,
  rac,
  racinesExactes,
  racLatex,
  racPuissance,
  trinomeDe,
  trinomeLatex,
  utiliseDelta,
  utiliseFactorisation,
  utiliseFormule,
  utiliseProduitNul,
  utiliseReconnaissance,
  finaliserCorrige,
} from "../../ui/corrigeSecondDegre1";

/**
 * Corrigé détaillé « comme au tableau » de gen1 (« Résoudre par la méthode la plus rapide »,
 * `AppMethodeRapide.tsx`) — règle `.claude/rules/feuilles-evaluations.md`. Une étape (lettre) par
 * écran, dans l'ordre RÉEL des écrans de l'instance (`moteur/session.ts::phasesExercice`, même
 * source que la barre de progression) : simplification → isolement → développement →
 * reconnaissance → Δ ou factorisation → solutions. Après la simplification, tout se fait sur
 * l'équation réduite (`exerciceSimplifie`), comme à l'écran. Partagé par l'adaptateur papier et
 * l'appli (corrigé de l'étape ratée).
 */

type E = Exercice;

export type PhaseSecondDegre = Phase;

/** Écrans de l'instance, dans l'ordre (lettres a, b, c…). */
export function phasesSecondDegre(instance: E): Phase[] {
  return phasesExercice(instance);
}

export function lettrePhaseSecondDegre(instance: E, phase: Phase): string {
  return "abcdefghijklmnopqrstuvwxyz"[phasesSecondDegre(instance).indexOf(phase)] ?? "a";
}

function travailDe(instance: E): E {
  return necessiteSimplification(instance) ? exerciceSimplifie(instance) : instance;
}

function affichage(ex: E): string {
  return formatEnonceAffichage(ex.enonce, ex.formeAffichage, ex.parametresAffichage, ex.irrationnel);
}

function sansEspaces(s: string): string {
  return s.replace(/\s+/g, "");
}

/** Forme de surface « (x + p) » de la famille 5. */
function xPlus(p: number): string {
  return p > 0 ? `x+${p}` : `x-${-p}`;
}

/** Forme factorisée de la famille 5 (écran : `(x + p)(x + (p − m))`) ; second facteur « x » si p = m. */
function formeGeneralisee(ex: E): string {
  const { p, m } = ex.parametresAffichage!;
  return p === m ? `x(${xPlus(p)})` : `(${xPlus(p)})(${xPlus(p - m)})`;
}

/** Forme factorisée attendue à l'écran (champ 1), sans espaces. */
export function formeFactoriseeSecondDegre(ex: E): string {
  if (ex.categorie === "mise_en_evidence_generalisee") return formeGeneralisee(ex);
  return sansEspaces(ex.solution.formeFactorisee ?? "");
}

/** Consigne de chaque écran (titres « Étape n — … » du corrigé). */
export function consigneEtapeSecondDegre(instance: E, phase: Phase): FragmentConsigne[] {
  const travail = travailDe(instance);
  switch (phase) {
    case "simplification":
      return [texte("Simplifie l'équation au maximum (coefficients entiers, sans facteur commun).")];
    case "isolement":
      return [texte(demandeFormeGeneraleDirecte(travail) ? "Réécris l'équation sous la forme " : "Regroupe tous les termes dans un même membre."), ...(demandeFormeGeneraleDirecte(travail) ? [latex("ax^2+bx+c=0"), texte(".")] : [])];
    case "developper":
      return [texte("Développe pour obtenir la forme "), latex("ax^2+bx+c=0"), texte(".")];
    case "reconnaissance":
      return [texte("Choisis la méthode la plus rapide pour résoudre cette équation.")];
    case "champ1":
      return [texte(methodeParDefaut(travail) === "racine_evidente" ? "Factorise le membre de gauche à l'aide de la racine évidente." : travail.categorie === "cas_general" ? "Calcule le discriminant Δ." : "Factorise le membre de gauche.")];
    case "champ2":
      return [texte("Donne les solutions de l'équation.")];
  }
}

/** Réplique de `AppMethodeRapide.tsx::demandeFormeGeneraleDirecte` (consigne de l'écran d'isolement). */
function demandeFormeGeneraleDirecte(ex: E): boolean {
  const c = ex.categorie;
  if (c !== "cas_general" && c !== "produit_remarquable") return false;
  return ex.formeAffichage !== "produit_egale_constante";
}

/** Justification d'un terme ramené dans le membre de gauche (« on soustrait 5x aux deux membres »). */
function deplacer(coef: number, partie: string): string {
  const t = polynomeTexte(mono(Math.abs(coef), partie));
  return coef > 0 ? `on soustrait ${t} aux deux membres` : `on ajoute ${t} aux deux membres`;
}

// ---------------------------------------------------------------------------------------------
// Étapes
// ---------------------------------------------------------------------------------------------

function etapeSimplification(instance: E, l: string): EtapeCorrection[] {
  const g = facteurCommun(instance.enonce);
  const reduit = { ...instance, enonce: enonceSimplifie(instance.enonce) };
  const { a, b, c } = instance.enonce;
  return [
    utilise(l, [texte("Diviser les deux membres d'une équation par un même nombre non nul ne change pas ses solutions : on divise par le plus grand diviseur commun des coefficients.")]),
    calcul(l, [
      ligne(`\\operatorname{PGCD}(${[a, b, c].filter((v) => v !== 0).map((v) => Math.abs(v)).join("\\,;\\,")})=${g}`, "plus grand diviseur commun des coefficients"),
      ligne(sansEspaces(affichage(instance))),
      ligne(sansEspaces(affichage(reduit)), `on divise les deux membres par ${g}`),
    ]),
    resultat(l, [texte("Équation simplifiée : "), latex(affichage(reduit))]),
  ];
}

function etapeIsolement(travail: E, l: string): EtapeCorrection[] {
  const { b, c } = travail.enonce;
  const lignes: LigneCalcul[] = [ligne(sansEspaces(affichage(travail)))];
  const cible = sansEspaces(formatEquationIsoleeNonDeveloppee(travail));
  switch (travail.formeAffichage) {
    case "isolee_carre":
      if (b !== 0) {
        lignes.push(ligne(sansEspaces(formatEnonceAffichage(travail.enonce, "isolee_constante")), deplacer(-b, "x")));
      }
      lignes.push(ligne(cible, deplacer(-c, "")));
      break;
    case "carre_egale_expression": {
      const { p, m } = travail.parametresAffichage!;
      lignes.push(ligne(cible, [texte("on soustrait "), latex(mono(m, `(${xPlus(p)})`)), texte(" aux deux membres, sans développer")]));
      break;
    }
    default:
      lignes.push(ligne(cible, deplacer(-c, "")));
  }
  return [
    utilise(l, [texte("Ajouter ou soustraire un même terme aux deux membres donne une équation équivalente : on ramène tout dans le membre de gauche, pour obtenir une expression égale à 0.")]),
    calcul(l, lignes),
    resultat(l, [texte("Équation isolée : "), latex(formatEquationIsoleeNonDeveloppee(travail))]),
  ];
}

function etapeDeveloppement(travail: E, l: string): EtapeCorrection[] {
  return [
    utilise(l, [texte("Distributivité : "), latex("x(x+b)=x^2+bx"), texte(" ; on fait apparaître a, b et c.")]),
    calcul(l, [ligne(sansEspaces(formatEquationIsoleeNonDeveloppee(travail))), ligne(sansEspaces(formatEnonceLatex(travail.enonce)), "on distribue x")]),
    resultat(l, [texte("Équation développée : "), latex(formatEnonceLatex(travail.enonce))]),
  ];
}

/** « a + b + c = 2 + (−5) + 3 = 0 » (ou a − b + c). */
function ligneRacineEvidente(travail: E): LigneCalcul {
  const { a, b, c } = travail.enonce;
  const r = racineEvidente(travail.enonce);
  return r === 1
    ? ligne(`a+b+c=${q(a)}+${qp(b)}+${qp(c)}=0`, "donc x = 1 est racine : on remplace x par 1, il reste a + b + c")
    : ligne(`a-b+c=${q(a)}-${qp(b)}+${qp(c)}=0`, "donc x = −1 est racine : on remplace x par −1, il reste a − b + c");
}

function etapeReconnaissance(travail: E, l: string): EtapeCorrection[] {
  const t = trinomeDe(travail);
  const methodes = methodesAcceptees(travail);
  const intro: FragmentConsigne[] = [texte("Sur "), latex(`${trinomeLatex(travail)}=0`), texte(" :")];
  if (travail.categorie === "irreductible") {
    const { a, c } = travail.enonce;
    return [
      utilise(l, utiliseReconnaissance()),
      calcul(l, [ligne("b=0", "pas de terme en x"), ligne(`a=${q(a)}`, a > 0 ? "a > 0" : "a < 0"), ligne(`c=${q(c)}`, `c ${c > 0 ? ">" : "<"} 0 : a et c de même signe`), ligne(`x^2=-\dfrac{c}{a}=${q(-c / a)}<0`, "un carré n'est jamais négatif")], intro),
      resultat(l, [texte(`Méthode : ${libelleMethode("aucune_solution")}`)]),
    ];
  }
  if (methodes.includes("racine_evidente")) {
    const base = lignesReconnaissance(t, "cas_general");
    return [
      utilise(l, utiliseReconnaissance()),
      calcul(l, [...base.slice(0, -1), ligne("b^2\neq 4ac", "pas un carré parfait"), ligneRacineEvidente(travail)], intro),
      resultat(l, [texte(`Méthode : ${libelleMethode("racine_evidente")} ; la formule générale (Δ) est juste aussi, mais plus longue.`)]),
    ];
  }
  return [
    utilise(l, utiliseReconnaissance()),
    calcul(l, lignesReconnaissance(t, travail.categorie), intro),
    resultat(l, [texte(`Méthode : ${libelleMethode(methodes[0] ?? "cas_general")}`)]),
  ];
}

/** Écran « Factorise à l'aide de la racine évidente » (décision 1). */
function etapeRacineEvidente(travail: E, l: string): EtapeCorrection[] {
  const { a, c } = travail.enonce;
  const r = racineEvidente(travail.enonce)!;
  const x2 = r === 1 ? c / a : -c / a;
  const forme = formeRacineEvidente(travail.enonce);
  return [
    utilise(l, [
      texte("Si "),
      latex("a+b+c=0"),
      texte(", alors "),
      latex("x_1=1"),
      texte(" est racine ; si "),
      latex("a-b+c=0"),
      texte(", alors "),
      latex("x_1=-1"),
      texte(". L'autre racine vient du produit "),
      latex("x_1\\cdot x_2=\\dfrac{c}{a}"),
      texte(`, et ${"ax² + bx + c"} = `),
      latex("a(x-x_1)(x-x_2)"),
      texte(` ${COURS_RESOUDRE}.`),
    ]),
    calcul(l, [
      ligneRacineEvidente(travail),
      ligne(`x_1=${r}`),
      ligne(`x_1\cdot x_2=\dfrac{c}{a}=${q(c / a)}`, "produit des racines"),
      ligne(`x_2=${q(x2)}`, r === 1 ? "on divise par x₁ = 1" : "on divise par x₁ = −1"),
      ligne(`${trinomeLatex(travail)}=${forme}`, [texte("car "), latex(`a(x-x_1)(x-x_2)=(x${r === 1 ? "-1" : "+1"})(ax${r === 1 ? "-" : "+"}c)`)]),
    ]),
    resultat(l, [latex(`${forme}=0`)]),
  ];
}

/** Famille 5 : (x + p)² − m(x + p) = 0, facteur commun (x + p) — sans développer. */
function lignesGeneralisee(travail: E): LigneCalcul[] {
  const { p, m } = travail.parametresAffichage!;
  const F = xPlus(p);
  const composee = sansEspaces(formatEnonceAffichage(travail.enonce, "composee", travail.parametresAffichage));
  // Second membre factorisé (G10) : après l'isolement, l'équation est déjà (x + p)² − m(x + p) = 0.
  const lignes: LigneCalcul[] = [ligne(composee)];
  lignes.push(ligne(`(${F})[(${F})${-m >= 0 ? "+" : "-"}${Math.abs(m)}]=0`, [texte("mise en évidence de "), latex(`(${F})`)]));
  lignes.push(ligne(`${formeGeneralisee(travail)}=0`, "on réduit le second facteur"));
  return lignes;
}

function etapeChamp1(travail: E, l: string): EtapeCorrection[] {
  const t = trinomeDe(travail);
  if (travail.categorie === "cas_general") {
    const b2 = t.b.c * t.b.c * t.b.k;
    const piegeDelta: FragmentConsigne[] =
      t.b.c < 0
        ? [texte("Le carré de b est toujours positif : "), latex(`${racPuissance(t.b)}^2=${q(b2)}`), texte(", jamais "), latex(q(-b2)), texte(".")]
        : [texte("Attention au signe de −4ac : "), latex(`-4\\cdot ${qp(t.a)}\\cdot ${qp(t.c)}=${q(-4 * t.a * t.c)}`), texte(".")];
    return [utilise(l, utiliseDelta()), calcul(l, lignesDelta(t)), resultat(l, [latex(`\\Delta=${q(deltaDe(t))}`)]), piege(l, piegeDelta)];
  }
  const forme = formeFactoriseeSecondDegre(travail);
  let lignes: LigneCalcul[];
  let usage: FragmentConsigne[] = utiliseFactorisation(travail.categorie);
  if (travail.categorie === "mise_en_evidence_generalisee") {
    const { p } = travail.parametresAffichage!;
    usage = [texte("Cas caché : "), latex(`(${xPlus(p)})`), texte(` apparaît dans les deux termes ; on le met en évidence, sans développer ${COURS_RESOUDRE}.`)];
    lignes = lignesGeneralisee(travail);
  } else if (travail.categorie === "mise_en_evidence" && travail.formeAffichage === "produit_egale_constante") {
    lignes = [ligne(sansEspaces(affichage(travail)), "l'équation est déjà un produit de facteurs égal à 0")];
  } else if (travail.categorie === "mise_en_evidence" && travail.formeAffichage === "isolee_carre") {
    lignes = [ligne(sansEspaces(affichage(travail))), ...lignesFactorisation(travail, {}, forme).map((li, i) => (i === 0 ? { ...li, justification: deplacer(-travail.enonce.b, "x") } : li))];
  } else {
    lignes = lignesFactorisation(travail, {}, forme);
  }
  return [utilise(l, usage), calcul(l, lignes), resultat(l, [latex(`${forme}=0`)])];
}

function piegeSolutions(travail: E): FragmentConsigne[] {
  const racines = racinesExactes(travail);
  switch (travail.categorie) {
    case "mise_en_evidence":
      return [texte("Ne pas diviser les deux membres par x : on perdrait la solution "), latex("x=0"), texte(".")];
    case "binome_conjugue":
      return [texte("Une différence de deux carrés nulle donne deux solutions opposées, "), latex(racLatex(racines[0]!)), texte(" et "), latex(racLatex(racines[1]!)), texte(", pas seulement la positive.")];
    case "produit_remarquable":
      return [texte("Un carré nul donne une seule solution (racine double), pas deux.")];
    case "mise_en_evidence_generalisee": {
      const { p } = travail.parametresAffichage!;
      return [texte("Ne pas diviser les deux membres par "), latex(`(${xPlus(p)})`), texte(" : on perdrait la solution "), latex(`x=${q(-p)}`), texte(".")];
    }
    default: {
      const t = trinomeDe(travail);
      return [texte("Dans la formule, c'est "), latex("-b"), texte(" : ici "), latex(`-b=${racLatex(rac(-t.b.c, t.b.k))}`), texte(", pas "), latex(racLatex(t.b)), texte(".")];
    }
  }
}

function etapeSolutions(travail: E, l: string, methode: ChoixMethode | null): EtapeCorrection[] {
  const t = trinomeDe(travail);
  const racines = racinesExactes(travail);
  const res = resultat(l, [latex(ensembleSolutionsLatex(racines))]);
  if (travail.categorie === "irreductible") {
    const { a, c } = travail.enonce;
    return [
      utilise(l, [texte(`Un carré n'est jamais négatif ${COURS_RESOUDRE}.`)]),
      calcul(l, [ligne(`${trinomeLatex(travail)}=0`), ligne(`${mono(a, "x^2")}=${q(-c)}`, c > 0 ? [texte("on soustrait "), latex(q(c)), texte(" aux deux membres")] : [texte("on ajoute "), latex(q(-c)), texte(" aux deux membres")]), ligne(`x^2=${q(-c / a)}`, a === 1 ? "x² est déjà isolé" : [texte("on divise par "), latex(q(a))]), ligne(`${q(-c / a)}<0`, "aucun réel n'a un carré négatif")]),
      resultat(l, [latex("S=\\varnothing")]),
      piege(l, [texte("Ce n'est pas une différence de deux carrés : a et c sont de même signe, "), latex("x^2"), texte(" serait négatif.")]),
    ];
  }
  if (methode === "racine_evidente") {
    const forme = formeRacineEvidente(travail.enonce);
    return [
      utilise(l, utiliseProduitNul()),
      calcul(l, lignesProduitNul(forme)),
      res,
      verification(l, [texte("On remplace chaque solution dans "), latex(`${trinomeLatex(travail)}=0`), texte(" :")], racines.flatMap((r) => lignesVerificationSubstitution(t, r))),
    ];
  }
  if (travail.categorie === "cas_general") {
    const delta = deltaDe(t);
    if (delta < 0)
      return [
        utilise(l, utiliseFormule()),
        calcul(l, [ligne(`\\Delta=${q(delta)}<0`, "aucune solution réelle : la racine carrée d'un nombre négatif n'existe pas")]),
        resultat(l, [latex("S=\\varnothing")]),
        piege(l, [texte("Un discriminant négatif ne donne pas « une solution » : la parabole ne coupe jamais l'axe, "), latex("S=\\varnothing"), texte(".")]),
      ];
    const { lignes, racines: [x1, x2] } = lignesRacinesFormule(t);
    return [
      utilise(l, utiliseFormule()),
      calcul(l, lignes, [latex(`\\Delta=${q(delta)}>0`), texte(" : deux solutions distinctes.")]),
      res,
      verification(l, [texte("Somme et produit des racines "), texte(COURS_RESOUDRE), texte(" :")], lignesVerificationViete(t, x1, x2)),
      piege(l, piegeSolutions(travail)),
    ];
  }
  const verif = racines.filter((r) => r.c !== 0).flatMap((r) => lignesVerificationSubstitution(t, r));
  return [
    utilise(l, utiliseProduitNul()),
    calcul(l, lignesProduitNul(formeFactoriseeSecondDegre(travail))),
    res,
    verification(l, [texte(racines.some((r) => r.c === 0) ? "On remplace la solution non nulle dans " : racines.length > 1 ? "On remplace chaque solution dans " : "On remplace la solution dans "), latex(`${trinomeLatex(travail)}=0`), texte(" :")], verif),
    piege(l, piegeSolutions(travail)),
  ];
}

/** `methode` : la méthode retenue à l'écran (décision 1 : racine évidente ou Δ) ; absente (papier),
 * la racine évidente quand il y en a une (`methodeParDefaut`). */
export function correctionDetailleeSecondDegre(instance: E, methode?: ChoixMethode | null): EtapeCorrection[] {
  return finaliserCorrige(correctionDetailleeSecondDegreBrut(instance, methode ?? null));
}

function correctionDetailleeSecondDegreBrut(instance: E, methodeEcran: ChoixMethode | null): EtapeCorrection[] {
  const travail = travailDe(instance);
  const methode = methodeEcran ?? methodeParDefaut(travail);
  return phasesSecondDegre(instance).flatMap((phase) => {
    const l = lettrePhaseSecondDegre(instance, phase);
    switch (phase) {
      case "simplification":
        return etapeSimplification(instance, l);
      case "isolement":
        return etapeIsolement(travail, l);
      case "developper":
        return etapeDeveloppement(travail, l);
      case "reconnaissance":
        return etapeReconnaissance(travail, l);
      case "champ1":
        return methode === "racine_evidente" ? etapeRacineEvidente(travail, l) : etapeChamp1(travail, l);
      case "champ2":
        return etapeSolutions(travail, l, methode);
    }
  });
}

/** Méthode retenue par le corrigé papier (racine évidente quand il y en a une). */
export function methodeCorrigeSecondDegre(instance: E): ChoixMethode | null {
  return methodeParDefaut(travailDe(instance));
}

/** Ensemble des solutions (réponse brève, barème). */
export function solutionsSecondDegreLatex(instance: E): string {
  return ensembleSolutionsLatex(racinesExactes(travailDe(instance)));
}

