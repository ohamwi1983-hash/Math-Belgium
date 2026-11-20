import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceDifferences } from "../../core/differencesSecondes.types";
import { nombreLatex } from "../../moteur/algebreTransfertSecondDegre";
import { plusQ, q, qp } from "../../ui/corrigeChapitre3";
import {
  LIBELLES_VERDICT,
  coefficientsPremier,
  coefficientsSecond,
  differencesPremieres,
  differencesSecondes,
  libelleDifference,
  reponseExpression,
  reponsePremieres,
  reponseSecondes,
  tableauSvg,
  valeurEn,
  verdict,
} from "../../ui/formatDifferencesSecondes";

/**
 * Corrigé détaillé « comme au tableau » de gen124 — règle `.claude/rules/feuilles-evaluations.md`.
 * a) différences premières, UNE ligne par différence (« d₁ = f(1) − f(0) = 5 − 2 = 3 ») ;
 * b) différences secondes, une ligne chacune, tableau en escalier en figure ; c) verdict testé ligne
 * par ligne ; d) a, b, c (2a = s, c = f(0), f(1) = a + b + c résolu ligne à ligne) ou m, p, avec
 * une vérification sur la dernière valeur du tableau. Pas d'étape d pour « ni l'un ni l'autre ».
 */

type E = ExerciceDifferences;
const n = nombreLatex;
const COURS = "(cours, § 1)";

function moins(a: number, b: number): string {
  return `${n(a)}-${b < 0 ? `(${n(b)})` : n(b)}`;
}

function premierePaireInegale(t: number[]): number {
  return t.findIndex((v, i) => i > 0 && v !== t[i - 1]);
}

function lignesVerdict(e: E): LigneCalcul[] {
  const d = differencesPremieres(e);
  const s = differencesSecondes(e);
  const v = verdict(e);
  if (v === "premier") return [ligne("d_1=d_2=d_3=d_4", `les quatre différences premières valent ${String(d[0]).replace("-", "−")} : elles sont constantes`), ligne("s_1=s_2=s_3=0", "différences secondes nulles : pas de terme en x²")];
  const j = premierePaireInegale(d);
  const lignes = [ligne(`d_${j}\\neq d_${j + 1}`, "différences premières non constantes : f n'est pas du premier degré")];
  if (v === "second") {
    lignes.push(ligne("s_1=s_2=s_3", `les trois différences secondes valent ${String(s[0]).replace("-", "−")} : elles sont constantes`), ligne(`s_1=${n(s[0]!)}\\neq 0`, "et non nulles : f est du second degré"));
  } else {
    const k = premierePaireInegale(s);
    lignes.push(ligne(`s_${k}\\neq s_${k + 1}`, "différences secondes non constantes : f n'est pas du second degré"));
  }
  return lignes;
}

function lignesSecond(e: E): LigneCalcul[] {
  const s = differencesSecondes(e);
  const { a, b, c } = coefficientsSecond(e);
  const f1 = valeurEn(e, 1);
  const lignes: LigneCalcul[] = [
    ligne(`2a=${n(s[0]!)}`, "la différence seconde constante vaut 2a (pas de 1)"),
    ligne(`a=${q(a)}`, "on divise par 2"),
    ligne(`c=f(0)=${n(c)}`, "valeur sous x = 0 dans le tableau"),
    ligne(`a+b+c=f(1)`, "x = 1 dans ax² + bx + c"),
    ligne(`${q(a)}+b${plusQ(c)}=${n(f1)}`, "on remplace a, c et f(1)"),
    ligne(`b=${n(f1)}${plusQ(-a)}${plusQ(-c)}`, "on isole b"),
  ];
  lignes.push(ligne(`=${q(b)}`));
  return lignes;
}

export function correctionDetailleeDifferences(e: E): EtapeCorrection[] {
  const d = differencesPremieres(e);
  const s = differencesSecondes(e);
  const v = verdict(e);
  const sortie: EtapeCorrection[] = [];

  // a) différences premières
  sortie.push(
    utilise("a", [texte("Avec des "), latex("x"), texte(" de 1 en 1, une différence première (un accroissement) est "), latex("f(x+1)-f(x)"), texte(` : la valeur de droite moins celle de gauche ${COURS}.`)]),
    calcul("a", d.map((x, i) => ligne(`d_${i + 1}=${libelleDifference(e, i)}=${moins(e.valeurs[i + 1]!, e.valeurs[i]!)}=${n(x)}`, i === 0 ? "valeur suivante moins valeur précédente" : undefined))),
    resultat("a", reponsePremieres(e)),
    piege("a", [texte("On soustrait toujours dans le même sens, la valeur de droite moins celle de gauche, en gardant les signes des nombres négatifs.")]),
  );

  // b) différences secondes
  sortie.push(
    utilise("b", [texte("Une différence seconde (accroissement des accroissements) est la différence de deux différences premières voisines : "), latex("s_1=d_2-d_1"), texte(`, etc. ${COURS}.`)]),
    calcul("b", s.map((x, i) => ligne(`s_${i + 1}=d_${i + 2}-d_${i + 1}=${moins(d[i + 1]!, d[i]!)}=${n(x)}`, i === 0 ? "différence première suivante moins la précédente" : undefined))),
    { ...resultat("b", reponseSecondes(e)), figureHtml: tableauSvg(e, 2) },
  );

  // c) verdict
  sortie.push(
    utilise("c", [texte(`Différences premières constantes : premier degré ; différences secondes constantes et non nulles : second degré ; sinon, ni l'un ni l'autre ${COURS}.`)]),
    calcul("c", lignesVerdict(e)),
    resultat("c", [texte(LIBELLES_VERDICT[v] + ".")]),
    piege(
      "c",
      v === "premier"
        ? [texte("Des différences secondes toutes nulles ne font pas une fonction du second degré : elles donneraient "), latex("a=0"), texte(".")]
        : v === "aucun"
          ? [texte("On ne conclut « second degré » qu'après avoir vérifié toutes les différences secondes : une seule qui diffère suffit à l'exclure.")]
          : [texte("Les différences premières ne suffisent pas : ici ce sont les différences secondes qui sont constantes.")],
    ),
  );

  // d) expression
  if (v === "second") {
    const { a, b, c } = coefficientsSecond(e);
    const x = e.xs[4]!;
    sortie.push(
      utilise("d", [texte("Avec des "), latex("x"), texte(" de 1 en 1, la différence seconde constante vaut "), latex("2a"), texte(" ; "), latex("c=f(0)"), texte(" ; "), latex("f(1)=a+b+c"), texte(` ${COURS}.`)]),
      calcul("d", lignesSecond(e)),
      resultat("d", reponseExpression(e)),
      verification("d", [texte("Avec la dernière valeur du tableau :")], [
        ligne(`f(${n(x)})=${q(a) === "1" ? "" : q(a) === "-1" ? "-" : `${q(a)}\\cdot `}${qp(x)}^2${b === 0 ? "" : `${b > 0 ? "+" : "-"}${q(Math.abs(b))}\\cdot ${qp(x)}`}${plusQ(c)}`, "on remplace x"),
        ligne(`=${n(valeurEn(e, x))}`, "c'est bien la valeur du tableau"),
      ]),
      piege("d", [texte("La différence seconde vaut "), latex("2a"), texte(", pas "), latex("a"), texte(" : on divise par 2.")]),
    );
  } else if (v === "premier") {
    const { m, p } = coefficientsPremier(e);
    const x = e.xs[4]!;
    sortie.push(
      utilise("d", [texte("Pour "), latex("f(x)=mx+p"), texte(" avec des "), latex("x"), texte(" de 1 en 1, chaque différence première vaut "), latex("m"), texte(" et "), latex("p=f(0)"), texte(` ${COURS}.`)]),
      calcul("d", [ligne(`m=d_1=${n(m)}`, "différence première constante (pas de 1)"), ligne(`p=f(0)=${n(p)}`, "valeur sous x = 0 dans le tableau")]),
      resultat("d", reponseExpression(e)),
      verification("d", [texte("Avec la dernière valeur du tableau :")], [ligne(`f(${n(x)})=${m === 1 ? "" : m === -1 ? "-" : `${n(m)}\\cdot `}${qp(x)}${plusQ(p)}`, "on remplace x"), ligne(`=${n(valeurEn(e, x))}`, "c'est bien la valeur du tableau")]),
    );
  }
  return sortie;
}
