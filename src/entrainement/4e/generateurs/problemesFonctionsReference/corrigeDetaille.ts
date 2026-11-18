import type { ExerciceProblemesFonctionsReference, SensQuestion } from "../../core/problemesFonctionsReference.types";
import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte as texteBrut, utilise, verification } from "../../../export/corrigeTableau";
import { decrireProbleme, dureeHeures, ensembleLatex, morceauLatex, nombreLatex, symboleLatex } from "../../moteur/problemesFonctionsReference";
import { aidesFonction, dureeTexte, fonctionAttendueLatex, insecables, optionsInterpretation } from "../../ui/formatProblemesFonctionsReference";
import { COURS_ALGEBRE } from "../../ui/corrigeChapitre3";

/**
 * Corrigé détaillé « comme au tableau » de gen68 (problèmes modélisés par une fonction de
 * référence) — règle `.claude/rules/feuilles-evaluations.md`. Quatre étapes = quatre écrans :
 * a) la fonction, b) son domaine dans la situation, c) l'inéquation résolue puis restreinte au
 * domaine, d) l'interprétation justifiée par un calcul. Valeurs tirées de `decrireProbleme` (moteur
 * de l'écran) ; partagé par l'adaptateur papier et l'appli.
 */

type E = ExerciceProblemesFonctionsReference;

const texte = (valeur: string): FragmentConsigne => texteBrut(insecables(valeur));
const INVERSE: Record<SensQuestion, SensQuestion> = { "<": ">", "≤": "≥", ">": "<", "≥": "≤" };

export function domaineConclusionLatex(e: E): string {
  const d = decrireProbleme(e);
  return `\\operatorname{dom} ${d.nomFonction} = ${morceauLatex(d.domaineContexte)}`;
}

export function solutionLatex(e: E): string {
  return `S = ${ensembleLatex(decrireProbleme(e).solution)}`;
}

function lignesFonction(e: E): LigneCalcul[] {
  const p = e.p;
  switch (e.famille) {
    case "trajet":
      return [ligne("t=\\dfrac{\\text{distance}}{\\text{vitesse moyenne}}", "durée d'un trajet"), ligne(`t(v)=\\dfrac{${p.d}}{v}`, `la distance vaut ${p.d} km`)];
    case "potager":
      return [ligne("A=c^2", "aire d'un carré de côté c"), ligne("c(A)=\\sqrt{A}", "c > 0 : le côté est la racine carrée de l'aire")];
    case "aquarium":
      return [ligne("V=a^3", "volume d'un cube d'arête a"), ligne("a(V)=\\sqrt[3]{V}", "l'arête est la racine cubique du volume")];
    case "thermostat":
      return [ligne(`E(T)=|T-${p.consigne}|`, `écart = distance entre T et ${p.consigne} °C`)];
    case "location":
      return [
        ligne(`\\text{coût total}=${p.forfait}+${p.prixHeure}\\,x`, "forfait, plus le prix des x heures"),
        ligne(`C(x)=\\dfrac{${p.forfait}+${p.prixHeure}\\,x}{x}`, "coût moyen = coût total divisé par x"),
        ligne(`=\\dfrac{${p.forfait}}{x}+${p.prixHeure}`, "on sépare la fraction en deux termes"),
      ];
    case "plaque":
      return [ligne("A(c)=c\\times c", "aire d'un carré de côté c"), ligne("=c^2")];
  }
}

function lignesDomaine(e: E): LigneCalcul[] {
  const d = decrireProbleme(e);
  const p = e.p;
  const alg = ligne(`${d.variable}\\in ${d.domaineAlgebriqueLatex}`, "l'expression existe pour ces valeurs (domaine algébrique)");
  switch (e.famille) {
    case "trajet":
      return [alg, ligne("v>0", "une vitesse moyenne est strictement positive"), ligne(`v\\leq ${p.vmax}`, "vitesse maximale autorisée")];
    case "potager":
      return [alg, ligne("A>0", "un potager a une aire strictement positive"), ligne(`A\\leq ${p.amax}`, "le potager tient dans la parcelle")];
    case "aquarium":
      return [alg, ligne("V>0", "un aquarium a un volume strictement positif"), ligne(`V\\leq ${p.vmax}`, "volume maximal fixé par l'énoncé")];
    case "thermostat":
      return [alg, ligne("10\\leq T\\leq 30", "plage de réglage du thermostat")];
    case "location":
      return [alg, ligne("x>0", "une durée est strictement positive ; rien ne la limite vers le haut")];
    case "plaque":
      return [alg, ligne("c>0", "une longueur est strictement positive"), ligne(`c\\leq ${p.cote}`, "on ne découpe pas plus que la plaque")];
  }
}

function lignesQuestion(e: E): LigneCalcul[] {
  const d = decrireProbleme(e);
  const p = e.p;
  const s = `${symboleLatex(e.sens)} `;
  const inv = `${symboleLatex(INVERSE[e.sens])} `;
  const auDessus = e.sens === ">" || e.sens === "≥";
  const lignes: LigneCalcul[] = [ligne(d.inequationLatex, "traduction de la question")];
  switch (e.famille) {
    case "trajet": {
      const t = nombreLatex(dureeHeures(e));
      const borne = Math.round(p.d! / dureeHeures(e));
      lignes.push(ligne(`${p.d}${s}${t}\\,v`, "on multiplie les deux membres par v > 0"));
      lignes.push(ligne(`${t}\\,v${inv}${p.d}`, "on lit l'inégalité dans l'autre sens"));
      lignes.push(ligne(`v${inv}\\dfrac{${p.d}}{${t}}`, `on divise par ${nombreLatex(dureeHeures(e)).replace("{,}", ",")} > 0`));
      lignes.push(ligne(`v${inv}${borne}`));
      break;
    }
    case "location": {
      const ecart = p.seuil! - p.prixHeure!;
      lignes.push(ligne(`\\dfrac{${p.forfait}}{x}${s}${ecart}`, `on soustrait ${p.prixHeure}`));
      lignes.push(ligne(`${p.forfait}${s}${ecart}\\,x`, "on multiplie par x > 0"));
      lignes.push(ligne(`${ecart}\\,x${inv}${p.forfait}`, "on lit l'inégalité dans l'autre sens"));
      lignes.push(ligne(`x${inv}\\dfrac{${p.forfait}}{${ecart}}`, `on divise par ${ecart}`));
      lignes.push(ligne(`x${inv}${nombreLatex(p.forfait! / ecart)}`));
      break;
    }
    case "potager":
      lignes.push(ligne(`A${s}${p.k}^2`, "les deux membres sont positifs : on les élève au carré"));
      lignes.push(ligne(`A${s}${p.k! * p.k!}`));
      break;
    case "aquarium":
      lignes.push(ligne(`V${s}${p.k}^3`, "la fonction cube est croissante : on élève au cube"));
      lignes.push(ligne(`V${s}${p.k! ** 3}`));
      break;
    case "thermostat": {
      const c = p.consigne!;
      const k = p.k!;
      if (!auDessus) {
        lignes.push(ligne(`-${k}${s}T-${c}${s}${k}`, `distance à ${c} au plus ${k} : T − ${c} entre −${k} et ${k}`));
        lignes.push(ligne(`${c - k}${s}T${s}${c + k}`, `on ajoute ${c}`));
      } else {
        lignes.push(ligne(`T-${c}${inv}-${k}`, `T est à plus de ${k} de ${c}, à gauche…`));
        lignes.push(ligne(`T-${c}${s}${k}`, "… ou à droite"));
        lignes.push(ligne(`T${inv}${c - k}`, `on ajoute ${c} (premier cas)`));
        lignes.push(ligne(`T${s}${c + k}`, `on ajoute ${c} (second cas)`));
      }
      break;
    }
    case "plaque": {
      const k = p.k!;
      lignes.push(ligne(`|c|${s}${k}`, "on prend la racine carrée : √(c²) = |c|"));
      if (!auDessus) lignes.push(ligne(`-${k}${s}c${s}${k}`, `distance de c à 0 au plus ${k}`));
      else {
        lignes.push(ligne(`c${inv}-${k}`, "premier cas"));
        lignes.push(ligne(`c${s}${k}`, "second cas"));
      }
      break;
    }
  }
  lignes.push(ligne(solutionLatex(e), [texte("on ne garde que les valeurs du domaine "), latex(morceauLatex(d.domaineContexte))]));
  return lignes;
}

function verificationQuestion(e: E): LigneCalcul[] {
  const p = e.p;
  switch (e.famille) {
    case "trajet": {
      const borne = Math.round(p.d! / dureeHeures(e));
      return [ligne(`t(${borne})=\\dfrac{${p.d}}{${borne}}`), ligne(`=${nombreLatex(dureeHeures(e))}`, `soit ${dureeTexte(e)} ✓`)];
    }
    case "location": {
      const borne = p.forfait! / (p.seuil! - p.prixHeure!);
      return [ligne(`C(${nombreLatex(borne)})=\\dfrac{${p.forfait}}{${nombreLatex(borne)}}+${p.prixHeure}`), ligne(`=${p.seuil}`, "le seuil ✓")];
    }
    case "potager":
      return [ligne(`c(${p.k! * p.k!})=\\sqrt{${p.k! * p.k!}}`), ligne(`=${p.k}`, "✓")];
    case "aquarium":
      return [ligne(`a(${p.k! ** 3})=\\sqrt[3]{${p.k! ** 3}}`), ligne(`=${p.k}`, "✓")];
    case "thermostat":
      return [ligne(`E(${p.consigne! + p.k!})=|${p.consigne! + p.k!}-${p.consigne}|`), ligne(`=${p.k}`, "✓")];
    case "plaque":
      return [ligne(`A(${p.k})=${p.k}^2`), ligne(`=${p.k! * p.k!}`, "✓")];
  }
}

function lignesInterpretation(e: E): LigneCalcul[] {
  const p = e.p;
  switch (e.famille) {
    case "trajet":
      return [ligne(`t(2v)=\\dfrac{${p.d}}{2v}`, "on remplace v par 2v"), ligne(`=\\dfrac{1}{2}\\cdot\\dfrac{${p.d}}{v}`), ligne("=\\dfrac{t(v)}{2}")];
    case "potager":
      return [ligne("c(4A)=\\sqrt{4A}", "on remplace A par 4A"), ligne("=\\sqrt{4}\\cdot\\sqrt{A}", "√(ab) = √a·√b"), ligne("=2\\,c(A)")];
    case "aquarium":
      return [ligne("a(8V)=\\sqrt[3]{8V}", "on remplace V par 8V"), ligne("=\\sqrt[3]{8}\\cdot\\sqrt[3]{V}"), ligne("=2\\,a(V)")];
    case "thermostat": {
      const c = p.consigne!;
      return [ligne(`E(${c - 2})=|${c - 2}-${c}|`), ligne("=|-2|"), ligne("=2"), ligne(`E(${c + 2})=|${c + 2}-${c}|`), ligne("=|2|"), ligne("=2", "même écart ✓")];
    }
    case "location":
      return [
        ligne(`C(x)-${p.prixHeure}=\\dfrac{${p.forfait}}{x}`, "seul ce terme dépend de x"),
        ligne(`\\dfrac{${p.forfait}}{x}>0`, "car x > 0 : le coût reste au-dessus du prix horaire"),
        ligne(`C(1000)=\\dfrac{${p.forfait}}{1000}+${p.prixHeure}`, "pour une très grande durée"),
        ligne(`=${nombreLatex(p.forfait! / 1000 + p.prixHeure!)}`, "très proche du prix horaire"),
      ];
    case "plaque":
      return [ligne("A(2c)=(2c)^2", "on remplace c par 2c"), ligne("=4c^2"), ligne("=4\\,A(c)")];
  }
}

function piegeQuestion(e: E): FragmentConsigne[] {
  const p = e.p;
  switch (e.famille) {
    case "trajet":
      return [
        texte("La fonction inverse est décroissante sur "),
        latex("]0 \\,;\\, +\\infty["),
        texte(" : une durée plus courte demande une vitesse plus grande, le sens de l'inégalité s'inverse."),
        ...(p.minutes! > 0 ? [texte(` Et ${dureeTexte(e)} = `), latex(nombreLatex(dureeHeures(e))), texte(" h, pas "), latex(`${p.heures}{,}${String(p.minutes).padStart(2, "0")}`), texte(" h.")] : []),
      ];
    case "location":
      return [texte("Le coût horaire moyen diminue quand la durée augmente : en passant de la comparaison des coûts à celle des durées, le sens de l'inégalité s'inverse.")];
    case "potager":
      return [texte(`Les aires qui dépassent ${p.amax} m² (et l'aire nulle) n'ont pas de sens ici : la réponse reste dans le domaine de la situation.`)];
    case "aquarium":
      return [texte(`Les volumes nuls et ceux qui dépassent ${p.vmax} L n'ont pas de sens ici : la réponse s'arrête au domaine.`)];
    case "thermostat":
      return e.sens === ">" || e.sens === "≥"
        ? [texte("Un écart supérieur à une valeur donne deux morceaux, de part et d'autre de la consigne, chacun limité par la plage du thermostat.")]
        : [texte("Un écart inférieur à une valeur donne un seul intervalle centré sur la consigne.")];
    case "plaque":
      return [texte("Sur "), latex("\\mathbb{R}"), texte(", l'inéquation a aussi des solutions négatives : une longueur négative n'a pas de sens, la situation les élimine.")];
  }
}

const METHODE_QUESTION: Record<E["famille"], string> = {
  trajet: "On traduit la question par une inéquation sur t(v), puis on isole v ; multiplier ou diviser par un nombre strictement positif ne change pas le sens de l'inégalité.",
  location: "On traduit la question par une inéquation sur C(x), puis on isole x ; multiplier ou diviser par un nombre strictement positif ne change pas le sens de l'inégalité.",
  potager: "On traduit la question par une inéquation sur c(A) ; deux nombres positifs sont rangés comme leurs carrés.",
  aquarium: "On traduit la question par une inéquation sur a(V) ; la fonction cube est croissante, elle garde l'ordre.",
  thermostat: "On traduit la question par une inéquation sur E(T) ; |u| ≤ k signifie −k ≤ u ≤ k, et |u| ≥ k signifie u ≤ −k ou u ≥ k.",
  plaque: "On traduit la question par une inéquation sur A(c) ; √(c²) = |c|, puis |c| ≤ k signifie −k ≤ c ≤ k.",
};

/** Ajoute le renvoi au cours avant le point final du dernier fragment de texte. */
function avecRenvoi(fragments: FragmentConsigne[]): FragmentConsigne[] {
  const dernier = fragments[fragments.length - 1];
  if (dernier?.type === "texte" && dernier.valeur.endsWith(".")) return [...fragments.slice(0, -1), texte(`${dernier.valeur.slice(0, -1)} ${COURS_ALGEBRE}.`)];
  return [...fragments, texte(` ${COURS_ALGEBRE}.`)];
}

export function correctionDetailleeProblemesFonctionsReference(e: E): EtapeCorrection[] {
  const d = decrireProbleme(e);
  const [methodeFonction] = aidesFonction(e);
  const interp = optionsInterpretation(e)[0]!;
  return [
    utilise("a", avecRenvoi(methodeFonction!)),
    calcul("a", lignesFonction(e)),
    resultat("a", [latex(fonctionAttendueLatex(e))]),
    utilise("b", [texte("Le domaine algébrique (là où "), latex(d.expressionLatex), texte(" existe) ne suffit pas : on ne garde que les valeurs qui ont un sens concret dans la situation.")]),
    calcul("b", lignesDomaine(e)),
    resultat("b", [latex(domaineConclusionLatex(e))]),
    piege("b", [texte("Ne pas confondre le domaine algébrique "), latex(d.domaineAlgebriqueLatex), texte(" et le domaine imposé par la situation.")]),
    utilise("c", [texte(METHODE_QUESTION[e.famille])]),
    calcul("c", lignesQuestion(e)),
    resultat("c", [latex(solutionLatex(e))]),
    verification("c", [texte("À la borne, la grandeur vaut exactement la valeur limite de la question :")], verificationQuestion(e)),
    piege("c", piegeQuestion(e)),
    utilise("d", [texte("On compare les deux valeurs de la fonction en remplaçant la variable dans son expression.")]),
    calcul("d", lignesInterpretation(e)),
    resultat("d", [texte(interp)]),
  ];
}

