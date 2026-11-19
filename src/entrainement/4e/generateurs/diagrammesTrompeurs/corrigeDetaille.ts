import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege as lignePiege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceBatons, ExerciceCirculaire, ExerciceDiagrammesTrompeurs, ExerciceTrompeurBarres, ExerciceTrompeurCirculaire } from "../../core/diagrammesTrompeurs.types";
import {
  angleSecteur,
  coefficientLongueurs,
  contexteBatons,
  derniere,
  effectifGroupe,
  evolutionAffichee,
  evolutionReelle,
  hauteurDessinee,
  indicesGroupe,
  net,
  pourcentageGroupe,
  pourcentageSecteur,
  premiere,
  sommeParts,
  totalBatons,
  totalReponses,
} from "../../moteur/modeleDiagrammesTrompeurs";
import { figureBatonsSvg, figureCirculaireSvg } from "../../ui/figureDiagrammesTrompeurs";
import { ecransExercice, explicationManipulation, LIBELLES_MANIPULATIONS, piege, reponseEcran, type EcranChamps } from "../../ui/formatDiagrammesTrompeurs";
import { nombreAffiche as nb, nombreLatex as nl } from "../../ui/formatNombreDiagrammes";
import { COURS_FREQUENCES, lignesSomme, formulesInsecables } from "../../ui/corrigeStatistique2";

/**
 * Corrigé détaillé « comme au tableau » de gen111 (diagrammes et graphiques trompeurs) — règle
 * `.claude/rules/feuilles-evaluations.md`, conventions « Lectures graphiques et décisions ». Une étape
 * par écran (`ecransExercice`) : fréquences, angles, effectifs (une ligne de calcul par catégorie,
 * contrôle « total = 100 % / 360° / n ») ; lectures sur le diagramme (une ligne par valeur lue, la
 * justification dit où) ; manipulation repérée par les hauteurs dessinées et les vraies valeurs ;
 * évolution réelle. Figures du corrigé (diagramme construit, bâtons annotés). Partagé par
 * l'adaptateur papier et l'appli (`AppDiagrammesTrompeurs.tsx`).
 */

type E = ExerciceDiagrammesTrompeurs;
const LETTRES = ["a", "b", "c"];
const PC = "\\,\\%";
const MOTS_CONDITION: Record<ExerciceBatons["condition"], string> = { "au-moins": "au moins", "au-plus": "au plus", "plus-de": "plus de", "moins-de": "moins de" };

function guillemets(nom: string): string {
  return `« ${nom} »`;
}

/** Réponse de l'écran (une ligne par champ), en une suite de fragments. */
function reponse(e: E, k: number): FragmentConsigne[] {
  return reponseEcran(e, k).flatMap((f, i) => (i === 0 ? f : [texte(" ; "), ...f]));
}

/** « Ce qu'on utilise » d'un écran à champs : sa première aide (phrase + formule), la même qu'à l'écran. */
function methode(e: E, k: number): FragmentConsigne[] {
  const ec = ecransExercice(e)[k] as EcranChamps;
  const aide = ec.aides[0]!.flatMap((f, i) => (i > 0 && f.type === "latex" ? [texte(" "), f] : [f]));
  const dernier = aide[aide.length - 1];
  if (dernier?.type === "texte") aide[aide.length - 1] = texte(dernier.valeur.replace(/[.:]\s*$/, ""));
  return [...aide, texte(` ${COURS_FREQUENCES}.`)];
}

function lignesTotal(nom: string, valeurs: number[], suffixe: string, justification: string): LigneCalcul[] {
  return lignesSomme(nom, valeurs.map((v) => `${nl(v)}${suffixe}`), valeurs, justification, suffixe);
}

// ---------------------------------------------------------------------------------------------
// Diagramme circulaire
// ---------------------------------------------------------------------------------------------

function etapesCirculaire(e: ExerciceCirculaire): EtapeCorrection[] {
  const s = e.secteurs;
  const freq = s.map((_, i) => pourcentageSecteur(e, i));
  const angles = s.map((_, i) => angleSecteur(e, i));
  const res: EtapeCorrection[] = [];
  if (e.sousType === "direct") {
    res.push(
      utilise("a", methode(e, 0)),
      calcul("a", s.flatMap((x, i) => [ligne(`f_${i + 1}=\\dfrac{${nl(x.effectif)}}{${nl(e.n)}}\\times 100${PC}`, `${guillemets(x.nom)} : ${nb(x.effectif)} sur ${nb(e.n)}`), ligne(`=${nl(freq[i]!)}${PC}`)])),
      resultat("a", reponse(e, 0)),
      verification("a", [texte("Les fréquences totalisent 100 % :")], lignesTotal("\\Sigma f_i", freq, PC, "toutes les catégories")),
      utilise("b", methode(e, 1)),
      { ...calcul("b", s.flatMap((x, i) => [ligne(`\\alpha_${i + 1}=${nl(net(freq[i]! / 100))}\\times 360^{\\circ}`, `${guillemets(x.nom)} : ${nb(freq[i]!)} % du disque`), ligne(`=${nl(angles[i]!)}^{\\circ}`)])), figureHtml: figureCirculaireSvg(e, "corrige") },
      resultat("b", reponse(e, 1)),
      verification("b", [texte("Les angles totalisent 360° (le disque entier) :")], lignesTotal("\\Sigma \\alpha_i", angles, "^{\\circ}", "tous les secteurs")),
    );
    return res;
  }
  if (e.sousType === "inverse") {
    res.push(
      utilise("a", methode(e, 0)),
      calcul("a", s.flatMap((x, i) => [ligne(`f_${i + 1}=\\dfrac{${nl(angles[i]!)}}{360}\\times 100${PC}`, `${guillemets(x.nom)} : angle ${nb(angles[i]!)}° lu sur le diagramme`), ligne(`=${nl(freq[i]!)}${PC}`)])),
      resultat("a", reponse(e, 0)),
      verification("a", [texte("Les fréquences totalisent 100 % :")], lignesTotal("\\Sigma f_i", freq, PC, "toutes les catégories")),
    );
  } else {
    const k = e.inconnu!;
    const connus = s.map((_, i) => i).filter((i) => i !== k);
    const somme = net(connus.reduce((t, i) => t + freq[i]!, 0));
    res.push(
      utilise("a", methode(e, 0)),
      calcul("a", [
        ligne(`f_{${k + 1}}=100${PC}-(${connus.map((i) => `${nl(freq[i]!)}${PC}`).join("+")})`, `part ${guillemets(s[k]!.nom)} : les parts totalisent 100 %`),
        ligne(`=100${PC}-${nl(somme)}${PC}`),
        ligne(`=${nl(freq[k]!)}${PC}`),
      ]),
      resultat("a", reponse(e, 0)),
    );
  }
  res.push(
    utilise("b", methode(e, 1)),
    calcul("b", s.flatMap((x, i) => [ligne(`n_${i + 1}=${nl(net(freq[i]! / 100))}\\times ${nl(e.n)}`, `${guillemets(x.nom)} : ${nb(freq[i]!)} % de ${nb(e.n)}`), ligne(`=${nl(x.effectif)}`)])),
    resultat("b", reponse(e, 1)),
    verification("b", [texte(`Les effectifs totalisent ${nb(e.n)} :`)], lignesTotal("\\Sigma n_i", s.map((x) => x.effectif), "", "toutes les catégories")),
  );
  return res;
}

// ---------------------------------------------------------------------------------------------
// Diagramme en bâtons
// ---------------------------------------------------------------------------------------------

function etapesBatons(e: ExerciceBatons): EtapeCorrection[] {
  const ctx = contexteBatons(e);
  const groupe = indicesGroupe(e);
  const n = totalBatons(e);
  return [
    utilise("a", [texte("La hauteur de chaque bâton, lue sur l'axe vertical, donne l'effectif de la valeur écrite en dessous (chaque ligne du quadrillage vaut 1).")]),
    { ...calcul("a", e.valeurs.map((v) => ligne(`n_i=${nl(v.effectif)}`, `bâton de la valeur ${nb(v.x)} : son sommet est en face de ${nb(v.effectif)}`))), figureHtml: figureBatonsSvg(e, "corrige") },
    resultat("a", reponse(e, 0)),
    utilise("b", methode(e, 1)),
    calcul("b", lignesSomme("n", e.valeurs.map((v) => nl(v.effectif)), e.valeurs.map((v) => v.effectif), "somme des effectifs lus")),
    resultat("b", reponse(e, 1)),
    utilise("c", [texte(`On additionne les effectifs des valeurs concernées, puis on divise par l'effectif total : `), latex("\\dfrac{\\text{effectif du groupe}}{n} \\times 100"), texte(` ${COURS_FREQUENCES}.`)]),
    calcul("c", [
      ...lignesSomme(
        "n_{\\text{groupe}}",
        groupe.map((i) => nl(e.valeurs[i]!.effectif)),
        groupe.map((i) => e.valeurs[i]!.effectif),
        `valeurs ${groupe.map((i) => nb(e.valeurs[i]!.x)).join(", ")} : ${MOTS_CONDITION[e.condition]} ${nb(e.seuil)}`,
      ),
      ligne(`p=\\dfrac{${nl(effectifGroupe(e))}}{${nl(n)}}\\times 100${PC}`, `part des ${ctx.individus}`),
      ligne(`=${nl(pourcentageGroupe(e))}${PC}`),
    ]),
    resultat("c", reponse(e, 2)),
    lignePiege("c", piege(e)),
  ];
}

// ---------------------------------------------------------------------------------------------
// Graphiques trompeurs
// ---------------------------------------------------------------------------------------------

function lignesManipulationBarres(e: ExerciceTrompeurBarres): LigneCalcul[] {
  const p = premiere(e);
  const d = derniere(e);
  const h1 = hauteurDessinee(e, p.valeur);
  const h2 = hauteurDessinee(e, d.valeur);
  const lignes: LigneCalcul[] = [];
  if (e.sousType === "axe-tronque") lignes.push(ligne(`\\text{bas de l'axe}=${nl(e.graduations[0]!)}`, "première graduation : l'axe ne part pas de 0"));
  if (e.sousType === "echelle-irreguliere") {
    const g = e.graduations;
    lignes.push(
      ligne(`${nl(g[1]!)}-${nl(g[0]!)}=${nl(net(g[1]! - g[0]!))}`, "valeur du premier intervalle de graduation"),
      ligne(`${nl(g[g.length - 1]!)}-${nl(g[g.length - 2]!)}=${nl(net(g[g.length - 1]! - g[g.length - 2]!))}`, "valeur du dernier : intervalles égaux à l'œil, valeurs différentes"),
    );
  }
  if (e.sousType === "pictogrammes") {
    const k = coefficientLongueurs(e);
    lignes.push(
      ligne(`k=\\dfrac{${nl(d.valeur)}}{${nl(p.valeur)}}`, `rapport des valeurs, donc des hauteurs ET des largeurs des dessins`),
      ligne(`=${nl(k)}`),
      ligne(`k^2=${nl(k)}^2`, "rapport des aires des dessins (ce que compare l'œil)"),
      ligne(`=${nl(net(k * k))}`),
    );
    return lignes;
  }
  lignes.push(
    ligne(`\\dfrac{h_{${d.annee}}}{h_{${p.annee}}}=\\dfrac{${h2}}{${h1}}`, `hauteurs dessinées, en graduations (barres de ${d.annee} et de ${p.annee})`),
    ligne(`=${nl(net(h2 / h1))}`, `le dessin suggère « +${nb(evolutionAffichee(e))} % »`),
    ligne(`\\dfrac{V_{${d.annee}}}{V_{${p.annee}}}=\\dfrac{${nl(d.valeur)}}{${nl(p.valeur)}}`, "rapport des vraies valeurs, lues sur l'axe"),
    ligne(`=${nl(net(d.valeur / p.valeur))}`),
  );
  return lignes;
}

function etapesTrompeurBarres(e: ExerciceTrompeurBarres): EtapeCorrection[] {
  const p = premiere(e);
  const d = derniere(e);
  const sommet = e.sousType === "pictogrammes" ? "du sommet du dessin" : "du sommet de la barre";
  const reel = evolutionReelle(e);
  return [
    utilise("a", [texte("On compare ce que montre le dessin (hauteurs, aires) aux valeurs écrites sur l'axe : un axe qui ne part pas de 0, des graduations irrégulières ou des dessins agrandis dans les deux sens exagèrent l'évolution.")]),
    calcul("a", lignesManipulationBarres(e)),
    resultat("a", [texte(`${LIBELLES_MANIPULATIONS[e.sousType]} `), ...explicationManipulation(e)]),
    utilise("b", [texte("Les vraies valeurs se lisent sur l'axe vertical, en face du sommet — pas en comptant les carreaux depuis le bas.")]),
    calcul("b", [ligne(`V_{${p.annee}}=${nl(p.valeur)}`, `en face ${sommet} de ${p.annee}`), ligne(`V_{${d.annee}}=${nl(d.valeur)}`, `en face ${sommet} de ${d.annee}`)]),
    resultat("b", reponse(e, 1)),
    utilise("c", [texte("Le pourcentage d'évolution compare l'augmentation à la valeur de départ : "), latex("\\dfrac{V_2 - V_1}{V_1} \\times 100"), texte(` ${COURS_FREQUENCES}.`)]),
    calcul("c", [
      ligne(`\\dfrac{${nl(d.valeur)}-${nl(p.valeur)}}{${nl(p.valeur)}}\\times 100${PC}=\\dfrac{${nl(net(d.valeur - p.valeur))}}{${nl(p.valeur)}}\\times 100${PC}`, `de ${p.annee} (V₁) à ${d.annee} (V₂)`),
      ligne(`=${nl(reel)}${PC}`),
      ligne(`${nl(reel)}<${nl(evolutionAffichee(e))}`, `le slogan annonce +${nb(evolutionAffichee(e))} %`),
    ]),
    resultat("c", reponse(e, 2)),
    lignePiege("c", piege(e)),
  ];
}

function etapesTotalFaux(e: ExerciceTrompeurCirculaire): EtapeCorrection[] {
  const total = sommeParts(e);
  return [
    utilise("a", [texte("Dans un diagramme circulaire, les parts découpent un tout : leurs pourcentages totalisent exactement 100 %.")]),
    calcul("a", [...lignesTotal("\\Sigma\\,\\text{parts}", e.parts.map((p) => p.pourcentage), PC, "pourcentages affichés"), ligne(`${nl(total)}${PC}>100${PC}`, "le total dépasse 100 % : des personnes sont dans plusieurs parts")]),
    resultat("a", [texte(`${LIBELLES_MANIPULATIONS["total-faux"]} `), ...explicationManipulation(e)]),
    utilise("b", methode(e, 1)),
    calcul("b", lignesTotal("S", e.parts.map((p) => p.pourcentage), PC, "on additionne les pourcentages affichés")),
    resultat("b", reponse(e, 1)),
    utilise("c", methode(e, 2)),
    calcul("c", [ligne(`N=\\dfrac{${nl(total)}}{100}\\times ${nl(e.n)}`, `chaque pourcentage est calculé sur les ${nb(e.n)} ${e.individus}`), ligne(`=${nl(totalReponses(e))}`, "réponses (une personne peut en donner plusieurs)")]),
    resultat("c", reponse(e, 2)),
    lignePiege("c", piege(e)),
  ];
}

function correctionDetailleeDiagrammesTrompeursBrut(e: E): EtapeCorrection[] {
  switch (e.sousType) {
    case "direct":
    case "inverse":
    case "circulaire": {
      const etapes = etapesCirculaire(e as ExerciceCirculaire);
      return [...etapes, lignePiege(LETTRES[ecransExercice(e).length - 1], piege(e))];
    }
    case "batons":
      return etapesBatons(e);
    case "total-faux":
      return etapesTotalFaux(e);
    default:
      return etapesTrompeurBarres(e as ExerciceTrompeurBarres);
  }
}

export function correctionDetailleeDiagrammesTrompeurs(e: E): EtapeCorrection[] {
  return formulesInsecables(correctionDetailleeDiagrammesTrompeursBrut(e));
}
