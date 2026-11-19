import type { Exercice } from "../../core/generateur.types";
import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { Phase } from "../../moteur/types";
import { phasesExercice } from "../../moteur/session";
import { enonceSimplifie, exerciceSimplifie, facteurCommun, necessiteSimplification } from "../../moteur/simplificationEquation";
import { formatEnonceAffichage, formatEnonceLatex, formatEquationIsoleeNonDeveloppee } from "../../ui/formatEquation";
import { libelleCategorie } from "../../ui/categorieLabels";
import { mono, q, qp, somme } from "../../ui/corrigeChapitre3";
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
      return [texte(travail.categorie === "cas_general" ? "Calcule le discriminant Δ." : "Factorise le membre de gauche.")];
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
      lignes.push(ligne(cible, [texte("on soustrait "), latex(somme([[m, "x"], [m * p, ""]])), texte(" aux deux membres")]));
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

function etapeReconnaissance(travail: E, l: string): EtapeCorrection[] {
  const t = trinomeDe(travail);
  return [
    utilise(l, utiliseReconnaissance()),
    calcul(l, lignesReconnaissance(t, travail.categorie), [texte("Sur "), latex(`${trinomeLatex(travail)}=0`), texte(" :")]),
    resultat(l, [texte(`Méthode : ${libelleCategorie(travail.categorie)}`)]),
  ];
}

/** Famille 5 : (x + p)² − m(x + p) = 0, facteur commun (x + p) — sans développer. */
function lignesGeneralisee(travail: E): LigneCalcul[] {
  const { p, m } = travail.parametresAffichage!;
  const F = xPlus(p);
  const composee = sansEspaces(formatEnonceAffichage(travail.enonce, "composee", travail.parametresAffichage));
  const lignes: LigneCalcul[] = [];
  if (travail.formeAffichage === "carre_egale_expression") {
    lignes.push(ligne(sansEspaces(formatEquationIsoleeNonDeveloppee(travail))));
    lignes.push(ligne(composee, [latex(`${somme([[-m, "x"], [-m * p, ""]])}=${mono(-m, `(${F})`)}`)]));
  } else {
    lignes.push(ligne(composee));
  }
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

function etapeSolutions(travail: E, l: string): EtapeCorrection[] {
  const t = trinomeDe(travail);
  const racines = racinesExactes(travail);
  const res = resultat(l, [latex(ensembleSolutionsLatex(racines))]);
  if (travail.categorie === "cas_general") {
    const delta = deltaDe(t);
    if (delta < 0) return [utilise(l, utiliseFormule()), calcul(l, [ligne(`\\Delta=${q(delta)}<0`, "aucune solution réelle")]), resultat(l, [latex("S=\\varnothing")])];
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

export function correctionDetailleeSecondDegre(instance: E): EtapeCorrection[] {
  return finaliserCorrige(correctionDetailleeSecondDegreBrut(instance));
}

function correctionDetailleeSecondDegreBrut(instance: E): EtapeCorrection[] {
  const travail = travailDe(instance);
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
        return etapeChamp1(travail, l);
      case "champ2":
        return etapeSolutions(travail, l);
    }
  });
}

/** Ensemble des solutions (réponse brève, barème). */
export function solutionsSecondDegreLatex(instance: E): string {
  return ensembleSolutionsLatex(racinesExactes(travailDe(instance)));
}

