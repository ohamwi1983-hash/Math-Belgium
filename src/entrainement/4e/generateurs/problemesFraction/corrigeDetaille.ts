import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceProblemesFraction } from "../../core/problemesFraction.types";
import { CONTEXTES_PRIX, CONTEXTES_ROBINETS, facteurCommun, reponseFinale, trinomeObtenu, valeursInterdites } from "./index";
import { dec, duree, equationLatex, multiplicateurLatex, raisonRejet, recit, secondMembreLatex, solutionsTriees, xPlus } from "../../ui/formatProblemesFraction";
import { nombreLatex } from "../../moteur/algebreTransfertSecondDegre";
import { polynome, q, somme } from "../../ui/corrigeChapitre3";
import { COURS_CONTEXTE, COURS_DENOMINATEUR, COURS_RESOUDRE, lignesDelta, lignesRacines } from "../../ui/corrigeTransfertSecondDegre";

/**
 * Corrigé détaillé « comme au tableau » de gen119 (problèmes avec une fraction) — règle
 * `.claude/rules/feuilles-evaluations.md`. Cinq étapes = cinq écrans : a) poser l'équation (chaque
 * grandeur traduite avec x, conversion de la durée), b) CE et domaine du contexte, c) résoudre
 * (multiplication par le dénominateur commun, distribution, regroupement, Δ, racines), d) rejeter
 * (CE, puis contexte ; vérification par substitution), e) répondre (grandeur demandée). Valeurs du
 * générateur et des fonctions de l'écran (`ui/formatProblemesFraction.ts`) ; partagé par l'adaptateur
 * et l'appli.
 */

type E = ExerciceProblemesFraction;


function coef(n: number): string {
  return n === 1 ? "" : n === -1 ? "-" : String(n);
}

/** Durée de l'énoncé convertie en heures (fraction), une ligne. */
function ligneConversion(minutes: number, nom: string): LigneCalcul {
  const h = minutes / 60;
  return ligne(`${nom}=${q(h)}\\text{ h}`, minutes % 60 === 0 ? `${duree(minutes)}` : `${duree(minutes)} = ${Math.floor(minutes / 60)} h + ${minutes % 60}/60 h`);
}

function lignesModele(e: E): LigneCalcul[] {
  const eq = equationLatex(e);
  if (e.variante === "prix") {
    const c = CONTEXTES_PRIX[e.contexte]!;
    return [
      ligne(`\\text{prix d'${c.article === "une" ? "une" : "un"} ${c.singulier}}=\\dfrac{${e.total}}{x}`, "somme dépensée ÷ nombre d'objets"),
      ligne(`\\text{prix avec ${e.enPlus} de plus}=\\dfrac{${e.total}}{${xPlus(e.s)}}`, `même somme, ${e.enPlus} objet${e.enPlus > 1 ? "s" : ""} de plus`),
      ligne(eq, `le premier prix dépasse le second de ${dec(e.baisse).replace("{,}", ",")} €`),
    ];
  }
  if (e.variante === "trajet") {
    return [
      ligne(`t_{\\text{aller}}=\\dfrac{${e.distance}}{x}`, "durée = distance ÷ vitesse"),
      ligne(`t_{\\text{retour}}=\\dfrac{${e.distance}}{${xPlus(e.s)}}`, `${e.ecart} km/h de moins au retour`),
      ligneConversion(e.dureeMinutes, "t_{\\text{total}}"),
      ligne(eq, "durée de l'aller + durée du retour = durée totale"),
    ];
  }
  const c = CONTEXTES_ROBINETS[e.contexte]!;
  const u = e.unite === "h" ? "h" : "min";
  const lignes: LigneCalcul[] = [
    ligne(`f_{\\text{second}}=\\dfrac{1}{x}`, `fraction du travail faite en 1 ${u} par ${c.second}`),
    ligne(`f_{\\text{premier}}=\\dfrac{1}{${xPlus(e.s)}}`, `${c.premier} met ${e.ecart} ${u} de plus`),
  ];
  if (e.unite === "h" && e.ensembleMinutes % 60 !== 0) lignes.push(ligneConversion(e.ensembleMinutes, "T"));
  lignes.push(ligne(`f_{\\text{ensemble}}=${secondMembreLatex(e)}`, `ensemble, tout le travail en ${duree(e.ensembleMinutes)} : la fraction 1 ÷ T`));
  lignes.push(ligne(eq, "les fractions faites en 1 " + u + " s'additionnent"));
  return lignes;
}

function piegeModele(e: E) {
  if (e.variante === "prix") return piege("a", [texte("Le prix le plus grand est celui avec le moins d'objets : "), latex(`\\dfrac{${e.total}}{x}-\\dfrac{${e.total}}{${xPlus(e.s)}}`), texte(", pas l'inverse (sinon la différence serait négative).")]);
  if (e.variante === "trajet") {
    if (e.dureeMinutes % 60 === 0) return piege("a", [texte("La durée de chaque trajet, c'est sa distance divisée par sa propre vitesse : on ne divise pas la distance totale par la moyenne des deux vitesses.")]);
    return piege("a", [texte(`La durée totale doit être en heures, et en fraction : ${duree(e.dureeMinutes)} ne s'écrit pas « `), latex(`${Math.floor(e.dureeMinutes / 60)}{,}${String(e.dureeMinutes % 60).padStart(2, "0")}`), texte(" ». Et la vitesse moyenne n'est pas la moyenne des deux vitesses.")]);
  }
  return piege("a", [texte("On n'additionne pas les durées (ensemble, ils vont plus vite que chacun seul) : on additionne les fractions du travail faites en une unité de temps.")]);
}

function etapeModele(e: E): EtapeCorrection[] {
  return [
    utilise("a", [texte(`x désigne ${recit(e).inconnue} : on traduit chaque phrase de l'énoncé avec x ${COURS_CONTEXTE}.`)]),
    calcul("a", lignesModele(e)),
    resultat("a", [latex(equationLatex(e))]),
    piegeModele(e),
  ];
}

function etapeCE(e: E): EtapeCorrection[] {
  const [i0, i1] = valeursInterdites(e);
  const domaine =
    e.variante === "prix"
      ? ligne("x>0", "x est un nombre d'objets : un entier positif")
      : e.variante === "trajet"
        ? ligne(`x>${e.ecart}`, [texte("la vitesse au retour, "), latex(`x-${e.ecart}`), texte(", doit être positive")])
        : ligne("x>0", "x est une durée");
  return [
    utilise("b", [texte(`Un dénominateur ne peut pas être nul ${COURS_DENOMINATEUR} ; le contexte limite aussi les valeurs possibles de x.`)]),
    calcul("b", [ligne(`x\\neq ${nombreLatex(i0!)}`, "premier dénominateur"), ligne(`${xPlus(e.s)}\\neq 0\\iff x\\neq ${nombreLatex(i1!)}`, "second dénominateur"), domaine]),
    resultat("b", [texte("CE : "), latex(`x\\neq ${nombreLatex(i0!)}`), texte(" et "), latex(`x\\neq ${nombreLatex(i1!)}`)]),
  ];
}

function lignesResolution(e: E): LigneCalcul[] {
  const qN = e.q * e.N;
  const gauche = `${coef(qN)}(${xPlus(e.s)})${e.sigma > 0 ? "+" : "-"}${coef(qN)}x`;
  const droite = `${coef(e.p)}x(${xPlus(e.s)})`;
  const gaucheDev = somme([
    [qN * (1 + e.sigma), "x"],
    [qN * e.s, ""],
  ]);
  const droiteDev = somme([
    [e.p, "x^2"],
    [e.p * e.s, "x"],
  ]);
  const brut: [number, number, number] = [e.p, e.p * e.s - qN * (1 + e.sigma), -qN * e.s];
  const g = facteurCommun(e);
  const lignes: LigneCalcul[] = [
    ligne(`${gauche}=${droite}`, [texte("on multiplie les deux membres par "), latex(multiplicateurLatex(e)), texte(", non nul par la CE")]),
    ligne(`${gaucheDev}=${droiteDev}`, "on distribue"),
    ligne(`${polynome(brut)}=0`, "on ramène tout dans le membre de droite"),
  ];
  const p = trinomeObtenu(e);
  if (g !== 1) lignes.push(ligne(`${polynome(p)}=0`, `on divise les deux membres par ${g}`));
  lignes.push(...lignesDelta(p), ...lignesRacines(p));
  return lignes;
}

function etapeResolution(e: E): EtapeCorrection[] {
  const [x1, x2] = solutionsTriees(e);
  return [
    utilise("c", [texte(`On multiplie par le dénominateur commun, non nul grâce à la CE ${COURS_DENOMINATEUR}, puis on résout l'équation du second degré avec le discriminant ${COURS_RESOUDRE}.`)]),
    calcul("c", lignesResolution(e)),
    resultat("c", [latex(`x_1=${nombreLatex(x1)}`), texte(" et "), latex(`x_2=${nombreLatex(x2)}`)]),
    piege("c", [texte("Chaque terme est multiplié par le dénominateur commun, le second membre aussi ; et dans la formule, c'est "), latex("-b"), texte(", pas "), latex("b"), texte(".")]),
  ];
}

function etapeRejet(e: E): EtapeCorrection[] {
  const [i0, i1] = valeursInterdites(e);
  const ceTexte = `différente de ${nombreLatex(i0!).replace("-", "−")} et de ${nombreLatex(i1!).replace("-", "−")} : respecte la CE`;
  const lignes: LigneCalcul[] =
    e.variante === "trajet"
      ? [
          ligne(`x=${nombreLatex(e.autre)}`, [texte(`${ceTexte.replace(/\\dfrac\{(\d+)\}\{(\d+)\}/g, "$1/$2")}`)]),
          ligne(`x-${e.ecart}=${nombreLatex(e.autre)}-${e.ecart}`, "vitesse au retour"),
          ligne(`=${nombreLatex(e.autre - e.ecart)}<0`, "négative : rejetée"),
          ligne(`x=${nombreLatex(e.solution)}>${e.ecart}`, "respecte la CE et le contexte : gardée"),
        ]
      : [ligne(`x=${nombreLatex(e.autre)}<0`, `respecte la CE, mais ${raisonRejet(e)} : rejetée`), ligne(`x=${nombreLatex(e.solution)}>0`, "respecte la CE et le contexte : gardée")];
  const n = e.variante === "robinets" ? 1 : e.N;
  const t1 = n / e.solution;
  const t2 = n / (e.solution + e.s);
  const depart = `\\dfrac{${n}}{${nombreLatex(e.solution)}}${e.sigma > 0 ? "+" : "-"}\\dfrac{${n}}{${nombreLatex(e.solution + e.s)}}`;
  const milieu = `${q(t1)}${e.sigma > 0 ? "+" : "-"}${q(t2)}`;
  const verif =
    depart.replace(/\\dfrac/g, "") === milieu.replace(/\\dfrac/g, "")
      ? [ligne(`${depart}=${q(t1 + e.sigma * t2)}`, "on remplace x dans l'équation : c'est bien le second membre")]
      : [ligne(`${depart}=${milieu}`, "on remplace x dans l'équation"), ligne(`=${q(t1 + e.sigma * t2)}`, "c'est bien le second membre")];
  return [
    utilise("d", [texte(`Une solution du problème doit respecter la CE et avoir un sens dans le contexte ${COURS_CONTEXTE}.`)]),
    calcul("d", lignes),
    resultat("d", [latex(`x=${nombreLatex(e.solution)}`)]),
    verification("d", [], verif),
  ];
}

function etapeReponse(e: E): EtapeCorrection[] {
  const r = recit(e);
  const rep = reponseFinale(e);
  let lignes: LigneCalcul[];
  if (e.forme === "directe") lignes = [ligne(`x=${nombreLatex(e.solution)}`, `x désigne ${r.inconnue}`)];
  else if (e.variante === "prix") lignes = [ligne(`\\text{prix}=\\dfrac{${e.total}}{${e.solution}}`, "somme dépensée ÷ nombre d'objets"), ligne(`=${dec(rep)}`, "en euros")];
  else if (e.variante === "trajet") lignes = [ligne(`x-${e.ecart}=${e.solution}-${e.ecart}`, "vitesse au retour"), ligne(`=${nombreLatex(rep)}`, "en km/h")];
  else lignes = [ligne(`x+${e.ecart}=${e.solution}+${e.ecart}`, `${e.ecart} ${e.unite} de plus`), ligne(`=${nombreLatex(rep)}`, `en ${e.unite === "h" ? "heures" : "minutes"}`)];
  return [
    utilise("e", [texte(e.forme === "directe" ? "La question porte sur x lui-même." : "La question ne porte pas sur x : on déduit la grandeur demandée de la valeur de x.")]),
    calcul("e", lignes),
    resultat("e", [texte(r.phraseReponse)]),
    ...(e.forme === "deduite" ? [piege("e", [texte("Ne réponds pas par la valeur de x : relis la question.")])] : []),
  ];
}

export function correctionDetailleeProblemesFraction(e: E): EtapeCorrection[] {
  return [...etapeModele(e), ...etapeCE(e), ...etapeResolution(e), ...etapeRejet(e), ...etapeReponse(e)];
}
