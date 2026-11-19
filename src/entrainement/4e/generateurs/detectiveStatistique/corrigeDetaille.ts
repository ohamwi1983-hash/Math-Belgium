import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, ligne, piege as lignePiege, resultat, texte, utilise } from "../../../export/corrigeTableau";
import type { DonneesDetectiveStatistique, TableauStat } from "../../core/detectiveStatistique.types";
import {
  calculCumules,
  calculDispersion,
  calculGroupes,
  calculMoyenne,
  calculPosition,
  cumules,
  descriptionCorrecte,
  effectifTotal,
  indiceLigneFausse,
  moyennePonderee,
  nombreLatex,
  nombreTexte,
  sommeProduits,
} from "../../moteur/modeleDetectiveStatistique";
import { aidesEcran, constat, descriptionFragments, piege, reponseFragments } from "../../ui/formatDetectiveStatistique";
import { COURS_DISPERSION, COURS_MOYENNE, COURS_POSITION, egalOuEnviron, fragmentsAide, lignesSomme, produits, formulesInsecables } from "../../ui/corrigeStatistique2";

/**
 * Corrigé détaillé « comme au tableau » de gen112 (détective d'erreurs : statistique) — règle
 * `.claude/rules/feuilles-evaluations.md`. Trois étapes = trois écrans : a) la ligne fausse (on refait
 * le calcul de cette ligne et on le compare à la copie), b) l'erreur commise (le constat chiffré, puis
 * la description de l'écran), c) la correction : la résolution reprise à partir de la ligne fausse, un
 * bloc « Ligne k » par ligne de la copie, une transformation par ligne. Valeurs du modèle
 * (`moteur/modeleDetectiveStatistique.ts`, sans erreur : `err = false` ; copie : `err = true`) ;
 * partagé par l'adaptateur papier et l'appli.
 */

type E = DonneesDetectiveStatistique;
const n2 = (x: number) => nombreLatex(x, 2);

function lignesEffectif(T: TableauStat, nom = "n"): LigneCalcul[] {
  return lignesSomme(nom, T.effectifs.map(String), T.effectifs, "somme des effectifs");
}

function lignesMoyenne(T: TableauStat, nom = "\\bar{x}"): LigneCalcul[] {
  const p = produits(T.valeurs, T.effectifs);
  const n = effectifTotal(T);
  const s = sommeProduits(T);
  return [...lignesSomme("\\Sigma x_i n_i", p.termes, p.valeurs, "chaque valeur × son effectif"), ligne(`${nom}=\\dfrac{${nombreLatex(s, 4)}}{${n}}`, "÷ effectif total"), ligne(egalOuEnviron(s / n, 2))];
}

function lignesCumules(T: TableauStat): LigneCalcul[] {
  const C = cumules(T);
  return T.valeurs.map((x, i) => ligne(`N_{\\leq ${nombreLatex(x)}}=${i === 0 ? "" : `${C[i - 1]}+`}${T.effectifs[i]}${i === 0 ? "" : `=${C[i]}`}`, i === 0 ? "effectif cumulé de la première valeur" : "on ajoute l'effectif de la ligne"));
}

function lignesPourcentage(effectif: number, n: number): LigneCalcul[] {
  const p = (effectif / n) * 100;
  return [ligne(`\\dfrac{${effectif}}{${n}}\\times 100\\,\\%${egalOuEnviron(p, 2)}\\,\\%`, "part de l'effectif total")];
}

function lignesSeuil(fraction: string, n: number, k: 1 | 2 | 3): LigneCalcul[] {
  const num = k === 3 ? `3\\times ${n}` : String(n);
  const den = k === 2 ? 2 : 4;
  return [ligne(`${fraction}=\\dfrac{${num}}{${den}}`, "seuil"), ligne(`=${nombreLatex((k * n) / 4)}`)];
}

/** Blocs de la résolution CORRECTE, un par ligne de la copie (la conclusion rédigée exceptée). */
function blocsResolution(e: E): { titre: string; lignes: LigneCalcul[]; intro?: string }[] {
  switch (e.variante) {
    case "moyenne": {
      const T = e.tableau;
      const k = calculMoyenne(e, false);
      const xAvant = T.valeurs[k.iAvant]!;
      return [
        { titre: "Ligne 1", lignes: lignesEffectif(T) },
        { titre: "Ligne 2", lignes: lignesMoyenne(T) },
        { titre: "Ligne 3", lignes: lignesCumules(T) },
        { titre: "Ligne 4", lignes: [ligne(`n-N_{\\leq ${nombreLatex(xAvant)}}=${k.n}-${k.cumules[k.iAvant]}`, `on retire les valeurs ≤ ${nombreTexte(xAvant)}, dernière valeur sous la moyenne`), ligne(`=${k.effectif}`)] },
        { titre: "Ligne 5", lignes: lignesPourcentage(k.effectif, k.n) },
      ];
    }
    case "position": {
      const k = calculPosition(e, false);
      const n = k.n;
      return [
        { titre: "Ligne 1", intro: `Série rangée : ${k.rangee.map((x) => nombreTexte(x)).join(" ; ")}.`, lignes: [ligne(`n=${n}`, "nombre de valeurs")] },
        { titre: "Ligne 2", lignes: [...lignesSeuil("\\dfrac{n}{2}", n, 2), ...lignesSeuil("\\dfrac{n}{4}", n, 1), ...lignesSeuil("\\dfrac{3n}{4}", n, 3)] },
        { titre: "Ligne 3", lignes: [ligne(`\\text{médiane}=${nombreLatex(k.mediane)}`, `${n / 2 + 1}e valeur : premier rang > ${n / 2}`)] },
        { titre: "Ligne 4", lignes: [ligne(`Q_1=${nombreLatex(k.q1)}`, `${n / 4 + 1}e valeur : premier rang > ${n / 4}`)] },
        { titre: "Ligne 5", lignes: [ligne(`Q_3=${nombreLatex(k.q3)}`, `${(3 * n) / 4 + 1}e valeur : premier rang > ${(3 * n) / 4}`)] },
        { titre: "Ligne 6", lignes: [ligne(`Q_3-Q_1=${nombreLatex(k.q3)}-${nombreLatex(k.q1)}`, "écart interquartile"), ligne(`=${nombreLatex(k.ecart)}`)] },
      ];
    }
    case "dispersion": {
      const T = e.tableau;
      const k = calculDispersion(e, false);
      const m = nombreLatex(k.moyenne);
      const termes = T.valeurs.map((x, i) => `(${nombreLatex(x)}-${m})^2\\times ${T.effectifs[i]}`);
      const valeurs = T.valeurs.map((x, i) => (x - k.moyenne) ** 2 * T.effectifs[i]!);
      return [
        { titre: "Ligne 1", lignes: lignesEffectif(T) },
        { titre: "Ligne 2", lignes: lignesMoyenne(T) },
        { titre: "Ligne 3", lignes: lignesSomme("\\Sigma (x_i-\\bar{x})^2\\, n_i", termes, valeurs, "carré de chaque écart × effectif") },
        { titre: "Ligne 4", lignes: [ligne(`V=\\dfrac{${nombreLatex(k.sommeCarres, 4)}}{${k.n}}`, "÷ effectif total n"), ligne(egalOuEnviron(k.variance, 2))] },
        { titre: "Ligne 5", lignes: [ligne(`\\sigma=\\sqrt{${n2(k.varianceArrondie)}}`, "racine de la variance ARRONDIE"), ligne(egalOuEnviron(Math.sqrt(k.varianceArrondie), 2))] },
      ];
    }
    case "cumules": {
      const T = e.tableau;
      const k = calculCumules(e, false);
      const q1 = T.valeurs[k.iQ1]!;
      const q3 = T.valeurs[k.iQ3]!;
      const avant = T.valeurs[k.iQ1 - 1];
      return [
        { titre: "Ligne 1", lignes: lignesCumules(T) },
        { titre: "Ligne 2", lignes: [...lignesSeuil("\\dfrac{n}{4}", k.n, 1), ligne(`Q_1=${nombreLatex(q1)}`, `premier effectif cumulé > ${nombreTexte(k.n / 4)} : ${k.cumules[k.iQ1]}`)] },
        { titre: "Ligne 3", lignes: [...lignesSeuil("\\dfrac{3n}{4}", k.n, 3), ligne(`Q_3=${nombreLatex(q3)}`, `premier effectif cumulé > ${nombreTexte((3 * k.n) / 4)} : ${k.cumules[k.iQ3]}`)] },
        {
          titre: "Ligne 4",
          lignes: [
            ligne(
              `N_{\\leq ${nombreLatex(q3)}}-${avant === undefined ? "0" : `N_{\\leq ${nombreLatex(avant)}}`}=${k.cumules[k.iQ3]}-${k.cumules[k.iRetire] ?? 0}`,
              avant === undefined ? "de la première valeur à Q₃" : `on retire les valeurs ≤ ${nombreTexte(avant)}, juste avant Q₁ (bornes comprises)`,
            ),
            ligne(`=${k.effectif}`),
          ],
        },
        { titre: "Ligne 5", lignes: lignesPourcentage(k.effectif, k.n) },
      ];
    }
    case "groupes": {
      const T = e.tableau;
      const k = calculGroupes(e, false);
      const N = k.nA + e.nB;
      const num = k.nA * k.moyenneA + e.nB * e.moyenneB;
      return [
        { titre: "Ligne 1", lignes: lignesEffectif(T, "n_A") },
        { titre: "Ligne 2", lignes: lignesMoyenne(T, "\\bar{x}_A") },
        {
          titre: "Ligne 3",
          lignes: [
            ligne(`\\bar{x}=\\dfrac{${k.nA}\\times ${n2(k.moyenneA)}+${e.nB}\\times ${n2(e.moyenneB)}}{${k.nA}+${e.nB}}`, "chaque moyenne pèse l'effectif de son groupe"),
            ligne(`=\\dfrac{${nombreLatex(num, 4)}}{${N}}`),
            ligne(egalOuEnviron(k.moyenne, 2)),
          ],
        },
      ];
    }
  }
}

// ---------------------------------------------------------------------------------------------
// a) La ligne fausse : on refait le calcul de cette ligne
// ---------------------------------------------------------------------------------------------

function lignesControle(e: E): LigneCalcul[] {
  const i = indiceLigneFausse(e) + 1;
  const copie = `valeur de la copie à la ligne ${i}`;
  switch (descriptionCorrecte(e)) {
    case "moyenneNonPonderee": {
      if (e.variante === "position") return [];
      const T = e.tableau;
      const juste = moyennePonderee(T);
      const faux = e.variante === "groupes" ? calculGroupes(e, true).moyenneA : e.variante === "dispersion" ? calculDispersion(e, true).moyenne : calculMoyenne(e as never, true).moyenne;
      return [ligne(`\\dfrac{\\Sigma x_i n_i}{n}=\\dfrac{${nombreLatex(sommeProduits(T), 4)}}{${effectifTotal(T)}}`, "moyenne recalculée avec les effectifs"), ligne(egalOuEnviron(juste, 2)), ligne(`${n2(juste)}\\neq ${n2(faux)}`, copie)];
    }
    case "cumulMalLu": {
      if (e.variante === "moyenne") {
        const k = calculMoyenne(e, false);
        const f = calculMoyenne(e, true);
        return [ligne(`${k.n}-${k.cumules[k.iAvant]}=${k.effectif}`, `on retire le cumulé de ${nombreTexte(e.tableau.valeurs[k.iAvant]!)}, dernière valeur sous la moyenne`), ligne(`${k.effectif}\\neq ${f.effectif}`, copie)];
      }
      if (e.variante === "cumules") {
        const k = calculCumules(e, false);
        const f = calculCumules(e, true);
        return [ligne(`${k.cumules[k.iQ3]}-${k.cumules[k.iRetire] ?? 0}=${k.effectif}`, "on retire le cumulé de la valeur qui précède Q₁"), ligne(`${k.effectif}\\neq ${f.effectif}`, copie)];
      }
      return [];
    }
    case "medianeNonTriee": {
      if (e.variante !== "position") return [];
      const s = e.serie;
      const j = s.findIndex((x, k) => k + 1 < s.length && x > s[k + 1]!);
      return [ligne(`${nombreLatex(s[j]!)}>${nombreLatex(s[j + 1]!)}`, `${j + 1}e et ${j + 2}e valeurs de la ligne 1 : pas dans l'ordre croissant`)];
    }
    case "q1MalPlace": {
      if (e.variante === "position") {
        const n = e.serie.length;
        return [...lignesSeuil("\\dfrac{n}{4}", n, 1), ligne(`\\text{rang retenu}=${n / 4}`, "égal au seuil : il ne le dépasse pas strictement")];
      }
      if (e.variante === "cumules") {
        const k = calculCumules(e, false);
        const f = calculCumules(e, true);
        return [...lignesSeuil("\\dfrac{n}{4}", k.n, 1), ligne(`N_{\\leq ${nombreLatex(e.tableau.valeurs[f.iQ1]!)}}=${f.cumules[f.iQ1]}`, "cumulé retenu par la copie : égal au seuil, pas strictement supérieur")];
      }
      return [];
    }
    case "sansRacine": {
      if (e.variante !== "dispersion") return [];
      const k = calculDispersion(e, false);
      return [ligne(`\\sqrt{${n2(k.varianceArrondie)}}${egalOuEnviron(Math.sqrt(k.varianceArrondie), 2)}`, "écart-type : racine de la variance"), ligne(`${n2(k.ecartType)}\\neq ${n2(k.varianceArrondie)}`, copie)];
    }
    case "varianceSansN": {
      if (e.variante !== "dispersion") return [];
      const k = calculDispersion(e, false);
      return [ligne(`\\dfrac{${nombreLatex(k.sommeCarres, 4)}}{${k.n}}${egalOuEnviron(k.variance, 2)}`, "variance : somme divisée par n"), ligne(`${n2(k.varianceArrondie)}\\neq ${nombreLatex(k.sommeCarres, 4)}`, copie)];
    }
    case "moyenneDesMoyennes": {
      if (e.variante !== "groupes") return [];
      const k = calculGroupes(e, false);
      const f = calculGroupes(e, true);
      return [ligne(`\\dfrac{${k.nA}\\times ${n2(k.moyenneA)}+${e.nB}\\times ${n2(e.moyenneB)}}{${k.nA + e.nB}}${egalOuEnviron(k.moyenne, 2)}`, "moyenne pondérée par les effectifs"), ligne(`${n2(k.moyenne)}\\neq ${n2(f.moyenne)}`, copie)];
    }
    default:
      return [];
  }
}

/** b) Constat chiffré de l'erreur (ce que la copie a fait à la place). */
function lignesConstat(e: E): LigneCalcul[] {
  switch (descriptionCorrecte(e)) {
    case "moyenneNonPonderee": {
      if (e.variante === "position") return [];
      const T = e.tableau;
      return [ligne(`k=${T.valeurs.length}`, "diviseur de la copie : nombre de valeurs distinctes"), ...lignesEffectif(T, e.variante === "groupes" ? "n_A" : "n")];
    }
    case "cumulMalLu": {
      if (e.variante === "moyenne") {
        const k = calculMoyenne(e, false);
        return [ligne(`${nombreLatex(e.tableau.valeurs[k.iAvant + 1]!)}>${n2(k.moyenne)}`, "valeur dont la copie retire aussi les individus : elle dépasse la moyenne")];
      }
      if (e.variante === "cumules") {
        const k = calculCumules(e, false);
        return [ligne(`${k.cumules[k.iQ1]}-${k.cumules[k.iQ1 - 1] ?? 0}=${e.tableau.effectifs[k.iQ1]}`, "individus dont la valeur vaut Q₁, retirés à tort par la copie")];
      }
      return [];
    }
    case "medianeNonTriee": {
      if (e.variante !== "position") return [];
      const rangee = calculPosition(e, false).rangee;
      const j = e.serie.findIndex((x, k) => x !== rangee[k]);
      return [ligne(`${nombreLatex(e.serie[j]!)}\\neq ${nombreLatex(rangee[j]!)}`, `${j + 1}e valeur de la copie ≠ ${j + 1}e valeur de la série rangée : la copie garde l'ordre du relevé`)];
    }
    case "q1MalPlace": {
      const n = e.variante === "position" ? e.serie.length : effectifTotal((e as { tableau: TableauStat }).tableau);
      return [ligne(`${n / 4}=\\dfrac{n}{4}`, e.variante === "position" ? "rang retenu par la copie = seuil : pas « strictement supérieur »" : "cumulé retenu par la copie = seuil : pas « strictement supérieur »")];
    }
    case "sansRacine": {
      if (e.variante !== "dispersion") return [];
      const k = calculDispersion(e, false);
      return [ligne(`\\sigma_{\\text{copie}}=V=${n2(k.varianceArrondie)}`, "la copie recopie la variance (unité au carré)")];
    }
    case "varianceSansN": {
      if (e.variante !== "dispersion") return [];
      const k = calculDispersion(e, false);
      return [ligne(`V_{\\text{copie}}=${nombreLatex(k.sommeCarres, 4)}`, `la somme n'est pas divisée par n = ${k.n}`)];
    }
    case "moyenneDesMoyennes": {
      if (e.variante !== "groupes") return [];
      return [ligne(`${effectifTotal(e.tableau)}\\neq ${e.nB}`, "effectifs des groupes A et B : ils ne pèsent pas autant")];
    }
    default:
      return [];
  }
}

function cours(e: E): string {
  return e.variante === "dispersion" ? COURS_DISPERSION : e.variante === "position" || e.variante === "cumules" ? COURS_POSITION : COURS_MOYENNE;
}

function correctionDetailleeDetectiveStatistiqueBrut(e: E): EtapeCorrection[] {
  const i = indiceLigneFausse(e);
  const blocs = blocsResolution(e).slice(i);
  return [
    utilise("a", [texte(`On refait la résolution ligne par ligne à partir des données, avec les règles du chapitre ${cours(e)} : la première ligne qui ne redonne pas le même résultat est la ligne fausse.`)]),
    calcul("a", lignesControle(e), [texte(`Ligne ${i + 1} refaite :`)]),
    resultat("a", [texte(`La ligne ${i + 1} est fausse. `), ...constat(e)]),
    utilise("b", fragmentsAide(aidesEcran(e, 1)[0]!)),
    calcul("b", lignesConstat(e)),
    resultat("b", descriptionFragments(descriptionCorrecte(e), e)),
    lignePiege("b", piege(e)),
    utilise("c", fragmentsAide(aidesEcran(e, 2)[0]!)),
    ...blocs.map((b) => calcul("c", b.lignes, b.intro ? [texte(b.intro)] : [], b.titre)),
    resultat("c", reponseFragments(e)),
  ];
}

export function correctionDetailleeDetectiveStatistique(e: E): EtapeCorrection[] {
  return formulesInsecables(correctionDetailleeDetectiveStatistiqueBrut(e));
}
