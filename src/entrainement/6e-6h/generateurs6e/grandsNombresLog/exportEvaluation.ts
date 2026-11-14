import { AGE_UNIVERS_ANNEES, DUREES, basesCommunes, donneesTaille, ecritureScientifique, logPuissance, logsDuree } from "../../core6e/grandsNombresLog";
import type { ExerciceChiffres, ExerciceComparer, ExerciceGrandsNombres, ExercicePremierChiffre, ExerciceTempsDuree, ExerciceTempsTaille } from "../../core6e/grandsNombresLog";
import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, EnoncePapier, EtapeCorrection, FragmentConsigne, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { phasesPourExercice } from "../../moteur6e/typesGrandsNombresLog";
import type { PhaseGrandsNombres } from "../../moteur6e/typesGrandsNombresLog";
import { consigneEcran, consigneGenerale, logPuissanceLatex, nbLatex, nbTexte, puissanceLatex, reponseFragments, scientifiqueLatex } from "../../ui6e/formatGrandsNombresLog";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceGrandsNombres } from "./index";
import type { IdVarianteGrandsNombres } from "./index";
import { VARIANTES_CALCULATRICE_GRANDS_NOMBRES, profilGrandsNombres } from "./profilEvaluation";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceGrandsNombres>` de `6gen92` « Grands nombres et
 * logarithme décimal » — méthode de `.claude/rules/feuilles-evaluations.md`.
 *
 * - Énoncé papier : le contexte (consigne générale de l'écran) et la demande globale. Seule
 *   l'écriture scientifique garde deux VRAIES questions (a) écriture scientifique, b) premier
 *   chiffre et nombre de chiffres) ; les autres variantes ont une seule demande.
 * - Corrigé : une étape par écran (lettres a, b, c dans l'ordre des écrans), valeurs tirées des
 *   MÊMES fonctions que l'écran (`reponseFragments`, `logPuissanceLatex`), une ligne « Piège » ciblée.
 * - Aucune figure. Version aménagée : même énoncé (seule la mise en page change).
 */

const f = (valeur: string): FragmentConsigne => latex(valeur);
const t = (valeur: string): FragmentConsigne => texte(valeur);
const LETTRES = "abcdefgh";

// ============================================================================
// Énoncés.
// ============================================================================

function demandeGlobale(e: ExerciceGrandsNombres): FragmentConsigne[] {
  switch (e.variante) {
    case "chiffres":
      return e.mersenne ? [] : [t(" Détermine le nombre de chiffres de "), f(puissanceLatex(e.a, e.n)), t(".")];
    case "premier-chiffre":
      return [];
    case "comparer":
      return e.sousCas === "exact" ? [t(" Justifie.")] : [t(" Justifie à l'aide du logarithme décimal (logarithmes arrondis au millième).")];
    case "temps":
      return e.sousCas === "duree"
        ? [t(" Donne la durée en secondes, puis en années, sous la forme "), f("m\\times 10^{E}"), t(" (mantisse "), f("m"), t(" arrondie au centième).")]
        : [t(" Justifie par le calcul.")];
  }
}

function entetePapier(e: ExerciceGrandsNombres): FragmentConsigne[] {
  if (e.variante === "premier-chiffre") {
    return [t("Le nombre "), f(puissanceLatex(e.a, e.n)), t(" est trop grand pour ta calculatrice. On note "), f("\\log"), t(" le logarithme décimal ("), f("\\log=\\log_{10}"), t(").")];
  }
  return [...consigneGenerale(e), ...demandeGlobale(e)];
}

/** Titres des étapes du corrigé (« Étape n — … »), rédigés pour le papier. */
function titreEtape(e: ExerciceGrandsNombres, phase: PhaseGrandsNombres): FragmentConsigne[] {
  if (phase === "verdict") return [t("Conclus en justifiant.")];
  return consigneEcran(e, phase);
}

function construireEnonce(e: ExerciceGrandsNombres): SectionExercice {
  return { enteteFragments: [...consigneGenerale(e), ...demandeGlobale(e)], questions: phasesPourExercice(e).map((phase) => ({ consigne: titreEtape(e, phase) })) };
}

function construireCorrection(e: ExerciceGrandsNombres): BlocCorrection[] {
  return phasesPourExercice(e).map((phase, i) => ({ type: "paragraphe", fragments: [t(`${LETTRES[i]}) `), ...reponseFragments(e, phase)] }));
}

function reponseBreve(e: ExerciceGrandsNombres): FragmentConsigne[] {
  switch (e.variante) {
    case "chiffres": {
      const k = ecritureScientifique(logPuissance(e.a, e.n)).E + 1;
      const nom = e.mersenne ? `${puissanceLatex(2, e.n)}-1` : puissanceLatex(e.a, e.n);
      return [f(nom), t(` compte ${nbTexte(k, 0)} chiffres.`)];
    }
    case "premier-chiffre": {
      const L = logPuissance(e.a, e.n);
      const s = ecritureScientifique(L);
      return [t("a) "), f(`${puissanceLatex(e.a, e.n)}\\approx ${scientifiqueLatex(L)}`), t(` ; b) premier chiffre ${Math.floor(s.m)}, ${nbTexte(s.E + 1, 0)} chiffres.`)];
    }
    case "comparer":
      return [...reponseFragments(e, "verdict").slice(-2)];
    case "temps":
      if (e.sousCas === "duree") {
        const L = logsDuree(e);
        return [f(`T\\approx ${scientifiqueLatex(L.secondes)}`), t(" secondes, soit environ "), f(scientifiqueLatex(L.annees)), t(" années.")];
      }
      return [t(`Plus grande taille traitable en ${DUREES[e.duree].libelle} : `), f(`n=${donneesTaille(e).nMax}`), t(".")];
  }
}

function enoncePapier(e: ExerciceGrandsNombres): EnoncePapier {
  if (e.variante === "premier-chiffre") {
    const P = puissanceLatex(e.a, e.n);
    return {
      section: {
        enteteFragments: entetePapier(e),
        questions: [
          { consigne: [t("Donne l'écriture scientifique "), f(`${P}\\approx m\\times 10^{E}`), t(" (avec "), f("1\\leq m<10"), t(", mantisse arrondie au centième, "), f("E"), t(" entier).")] },
          { consigne: [t("Déduis-en le premier chiffre de "), f(P), t(" et le nombre de chiffres de son écriture.")] },
        ],
      },
      etapesParQuestion: [["a", "b"], ["c"]],
      reponseBreve: reponseBreve(e),
    };
  }
  return { section: { enteteFragments: entetePapier(e), questions: [] }, reponseBreve: reponseBreve(e) };
}

// ============================================================================
// Corrigé détaillé.
// ============================================================================

function methodePuissance(a: number, n: number, sq: string): EtapeCorrection {
  return {
    label: "Méthode",
    sousQuestion: sq,
    fragments: [t("Le nombre "), f(puissanceLatex(a, n)), t(" est trop grand pour la calculatrice ; la propriété de la puissance donne directement son logarithme décimal : "), f("\\log\\left(a^{n}\\right)=n\\log(a)"), t(".")],
  };
}

function lignesChiffres(e: ExerciceChiffres): EtapeCorrection[] {
  const P = puissanceLatex(e.a, e.n);
  const s = ecritureScientifique(logPuissance(e.a, e.n));
  const lignes: EtapeCorrection[] = [
    methodePuissance(e.a, e.n, "a"),
    { label: "Calcul", sousQuestion: "a", fragments: [f(logPuissanceLatex(e.a, e.n))] },
    { label: "Méthode", sousQuestion: "b", fragments: [t("Un entier "), f("N"), t(" compte "), f("k"), t(" chiffres lorsque "), f("10^{k-1}\\leq N<10^{k}"), t(", c'est-à-dire "), f("k-1\\leq\\log(N)<k"), t(" : "), f("k-1"), t(" est la partie entière de "), f("\\log(N)"), t(".")] },
    { label: "Calcul", sousQuestion: "b", fragments: reponseFragments(e, "partieEntiere") },
    { label: "Conclusion", sousQuestion: "c", fragments: reponseFragments(e, "nombreChiffres") },
  ];
  if (e.mersenne) {
    lignes.push({
      label: "Conclusion",
      sousQuestion: "c",
      fragments: [t("Comme "), f(P), t(" n'est pas une puissance de 10 (il se termine par 2, 4, 6 ou 8), "), f(`${P}-1`), t(` compte aussi ${nbTexte(s.E + 1, 0)} chiffres.`)],
    });
  }
  lignes.push({
    label: "Piège",
    sousQuestion: "c",
    fragments: [
      t("Oublier le « + 1 » : "),
      f("100=10^{2}"),
      t(" compte trois chiffres, alors que "),
      f("\\log(100)=2"),
      t(`. Autre piège : arrondir log(${e.a}) avant de le multiplier par ${nbTexte(e.n, 0)}, l'erreur d'arrondi est alors multipliée par ${nbTexte(e.n, 0)}.`),
    ],
  });
  return lignes;
}

function lignesPremierChiffre(e: ExercicePremierChiffre): EtapeCorrection[] {
  const P = puissanceLatex(e.a, e.n);
  const L = logPuissance(e.a, e.n);
  const s = ecritureScientifique(L);
  return [
    methodePuissance(e.a, e.n, "a"),
    { label: "Calcul", sousQuestion: "a", fragments: [f(logPuissanceLatex(e.a, e.n))] },
    {
      label: "Méthode",
      sousQuestion: "b",
      fragments: [t("Si "), f("\\log(N)=E+f"), t(" avec "), f("E"), t(" entier et "), f("0\\leq f<1"), t(", alors "), f("N=10^{f}\\times 10^{E}"), t(" avec "), f("1\\leq 10^{f}<10"), t(" : c'est l'écriture scientifique de "), f("N"), t(".")],
    },
    { label: "Calcul", sousQuestion: "b", fragments: [f(`\\log(${P})\\approx ${s.E}+${nbLatex(s.f)}`), t(" ; "), ...reponseFragments(e, "scientifique")] },
    {
      label: "Conclusion",
      sousQuestion: "c",
      fragments: [t("Le premier chiffre est celui des unités de la mantisse, "), f(nbLatex(s.m, 2)), t(` : c'est ${Math.floor(s.m)}. Comme `), f(`10^{${s.E}}\\leq ${P}<10^{${s.E + 1}}`), t(`, le nombre compte ${nbTexte(s.E, 0)} + 1 = ${nbTexte(s.E + 1, 0)} chiffres.`)],
    },
    {
      label: "Piège",
      sousQuestion: "b",
      fragments: [t("Prendre la partie décimale "), f(nbLatex(s.f)), t(" elle-même pour la mantisse, au lieu de "), f(`10^{${nbLatex(s.f)}}`), t(" ; ou mettre "), f("E+1"), t(" en exposant de 10 (le « + 1 » ne sert qu'à compter les chiffres).")],
    },
  ];
}

function lignesComparer(e: ExerciceComparer): EtapeCorrection[] {
  const x = puissanceLatex(e.a, e.n);
  const y = puissanceLatex(e.b, e.m);
  if (e.sousCas === "exact") {
    const [A, B] = basesCommunes(e);
    const k = e.k ?? 1;
    const p = e.n / k;
    const q = e.m / k;
    return [
      {
        label: "Méthode",
        sousQuestion: "a",
        fragments: [t(`Les exposants ${nbTexte(e.n, 0)} et ${nbTexte(e.m, 0)} sont tous deux des multiples de ${k} : on écrit les deux nombres comme des puissances d'exposant ${k}, grâce à `), f("\\left(a^{p}\\right)^{k}=a^{pk}"), t(".")],
      },
      { label: "Calcul", sousQuestion: "a", fragments: reponseFragments(e, "memeExposant") },
      {
        label: "Méthode",
        sousQuestion: "b",
        fragments: [t("La fonction "), f(`x\\mapsto x^{${k}}`), t(" est strictement croissante sur "), f("\\left[0\\,;+\\infty\\right["), t(" : deux puissances de même exposant sont rangées comme leurs bases.")],
      },
      { label: "Conclusion", sousQuestion: "b", fragments: reponseFragments(e, "verdict") },
      {
        label: "Remarque",
        sousQuestion: "b",
        fragments: [
          t("Même conclusion avec les logarithmes, sans calculatrice : comparer "),
          f(`${e.n}\\log(${e.a})`),
          t(" et "),
          f(`${e.m}\\log(${e.b})`),
          t(` revient (en divisant par ${k}) à comparer `),
          f(`${p === 1 ? "" : p}\\log(${e.a})=\\log(${A})`),
          t(" et "),
          f(`${q === 1 ? "" : q}\\log(${e.b})=\\log(${B})`),
          t("."),
        ],
      },
      { label: "Piège", sousQuestion: "b", fragments: [t("Conclure d'après les exposants seuls (ou les bases seules) : ici, le nombre qui a la plus grande base a le plus petit exposant ; seule l'écriture avec un même exposant tranche.")] },
    ];
  }
  return [
    { label: "Méthode", sousQuestion: "a", fragments: [t("Les deux nombres sont trop grands pour la calculatrice : on compare leurs logarithmes décimaux, puisque log est strictement croissante ; "), f("\\log\\left(a^{n}\\right)=n\\log(a)"), t(".")] },
    { label: "Calcul", sousQuestion: "a", fragments: reponseFragments(e, "logsDeux") },
    { label: "Conclusion", sousQuestion: "b", fragments: reponseFragments(e, "verdict") },
    {
      label: "Piège",
      sousQuestion: "b",
      fragments: [t("Juger sur l'exposant seul ou sur la base seule : "), f(x), t(" et "), f(y), t(" ont des logarithmes très proches, seul leur calcul (sans arrondir log(a) avant de multiplier) permet de trancher.")],
    },
  ];
}

function lignesDuree(e: ExerciceTempsDuree): EtapeCorrection[] {
  const L = logsDuree(e);
  const rapportUnivers = L.annees - Math.log10(AGE_UNIVERS_ANNEES);
  const conclusion: FragmentConsigne[] = [...reponseFragments(e, "dureeAnnees")];
  if (rapportUnivers >= 1) conclusion.push(t(", soit environ "), f(scientifiqueLatex(rapportUnivers)), t(" fois l'âge de l'Univers (environ "), f("1{,}38\\times 10^{10}"), t(" années)."));
  else conclusion.push(t("."));
  return [
    {
      label: "Méthode",
      sousQuestion: "a",
      fragments: [t("On travaille avec le logarithme décimal du nombre d'opérations, grâce à la propriété de la puissance : "), f("\\log\\left(a^{n}\\right)=n\\log(a)"), t(".")],
    },
    { label: "Calcul", sousQuestion: "a", fragments: [f(logPuissanceLatex(2, e.n))] },
    {
      label: "Méthode",
      sousQuestion: "b",
      fragments: [t("Durée = nombre d'opérations divisé par le nombre d'opérations par seconde ; en logarithme, la division devient une soustraction : "), f(`\\log(T)=${e.n}\\log(2)-${e.p}\\approx ${nbLatex(L.secondes)}`), t(".")],
    },
    { label: "Calcul", sousQuestion: "b", fragments: [f(`T\\approx 10^{${nbLatex(L.secondes)}}=10^{${nbLatex(ecritureScientifique(L.secondes).f)}}\\times 10^{${ecritureScientifique(L.secondes).E}}`)] },
    { label: "Conclusion", sousQuestion: "b", fragments: [...reponseFragments(e, "dureeSecondes"), t(".")] },
    { label: "Piège", sousQuestion: "b", fragments: [t("Multiplier par "), f(`10^{${e.p}}`), t(" au lieu de diviser ; la durée en secondes est le quotient du nombre d'opérations par la vitesse de l'ordinateur.")] },
    { label: "Méthode", sousQuestion: "c", fragments: [t("Une année de 365 jours compte "), f("365\\times 24\\times 3600=31\\,536\\,000"), t(" secondes.")] },
    { label: "Conclusion", sousQuestion: "c", fragments: conclusion },
    { label: "Piège", sousQuestion: "c", fragments: [t("S'arrêter à une durée en heures ou en jours, alors que l'unité demandée est l'année.")] },
  ];
}

function lignesTaille(e: ExerciceTempsTaille): EtapeCorrection[] {
  const d = donneesTaille(e);
  const D = DUREES[e.duree];
  const avant = logPuissance(2, d.nMax);
  const apres = logPuissance(2, d.nMax + 1);
  return [
    { label: "Méthode", sousQuestion: "a", fragments: [t(`Durée en secondes : `), f(D.calculLatex), t(" ; on multiplie par le nombre d'opérations effectuées en une seconde.")] },
    { label: "Calcul", sousQuestion: "a", fragments: reponseFragments(e, "operations") },
    { label: "Méthode", sousQuestion: "b", fragments: [t("Il faut "), f("2^{n}\\leq N"), t(". La fonction log est croissante : on l'applique aux deux membres, puis on divise par "), f("\\log(2)>0"), t(" sans changer le sens.")] },
    { label: "Calcul", sousQuestion: "b", fragments: [...reponseFragments(e, "borne"), t(" avec "), f(`\\log(N)\\approx ${nbLatex(d.logN)}`), t(".")] },
    {
      label: "Conclusion",
      sousQuestion: "c",
      fragments: [t("La plus grande taille traitable est "), f(`n=${d.nMax}`), t(", car "), f(`2^{${d.nMax}}\\approx ${scientifiqueLatex(avant)}\\leq N`), t(" et "), f(`2^{${d.nMax + 1}}\\approx ${scientifiqueLatex(apres)}>N`), t(".")],
    },
    { label: "Piège", sousQuestion: "c", fragments: [t("Arrondir la borne au plus proche ou vers le haut : avec "), f(`n=${d.nMax + 1}`), t(", le nombre d'opérations dépasse N, le calcul ne se termine pas à temps.")] },
  ];
}

function correctionDetaillee(e: ExerciceGrandsNombres): EtapeCorrection[] {
  switch (e.variante) {
    case "chiffres":
      return lignesChiffres(e);
    case "premier-chiffre":
      return lignesPremierChiffre(e);
    case "comparer":
      return lignesComparer(e);
    case "temps":
      return e.sousCas === "duree" ? lignesDuree(e) : lignesTaille(e);
  }
}

function difficulte(e: ExerciceGrandsNombres): 1 | 2 | 3 {
  if (e.variante === "temps") return 3;
  if (e.variante === "comparer" && e.sousCas === "exact") return 3;
  return 2;
}

// ============================================================================
// Barème (poids, somme 4).
// ============================================================================

const ERREUR_LN = { description: [t("Logarithme népérien utilisé à la place du logarithme décimal")], cout: "−0,5" };
const ERREUR_ARRONDI = { description: [t("log(a) arrondi avant d'être multiplié par n (résultat faux)")], cout: "−0,5" };

function bareme(e: ExerciceGrandsNombres): BaremeExercice {
  const r = (phase: PhaseGrandsNombres) => reponseFragments(e, phase);
  switch (e.variante) {
    case "chiffres":
      return {
        reponseFinale: reponseBreve(e),
        criteres: [
          { sousQuestion: "a", critere: [t("Propriété de la puissance : "), ...r("logPuissance")], points: 1.5 },
          { sousQuestion: "b", critere: [t("Encadrement entre deux entiers consécutifs : "), ...r("partieEntiere")], points: 1 },
          { sousQuestion: "c", critere: [t("Nombre de chiffres justifié : "), ...r("nombreChiffres")], points: 1.5 },
        ],
        erreursFrequentes: [{ description: [t("« + 1 » oublié (partie entière donnée comme nombre de chiffres)")], cout: "−1" }, ERREUR_LN, ERREUR_ARRONDI],
        reponsesAcceptees: [[t("Logarithme exact (par exemple n·log(a)) ou arrondi au millième")]],
      };
    case "premier-chiffre":
      return {
        reponseFinale: reponseBreve(e),
        criteres: [
          { sousQuestion: "a", critere: r("logPuissance"), points: 1 },
          { sousQuestion: "b", critere: [t("Partie entière et partie décimale séparées, mantisse "), f("10^{f}"), t(" : "), ...r("scientifique")], points: 1.5 },
          { sousQuestion: "c", critere: r("premierChiffre"), points: 1.5 },
        ],
        erreursFrequentes: [
          { description: [t("Partie décimale f prise pour la mantisse (au lieu de "), f("10^{f}"), t(")")], cout: "−1" },
          { description: [t("Nombre de chiffres égal à E (« + 1 » oublié)")], cout: "−0,5" },
          ERREUR_ARRONDI,
        ],
        reponsesAcceptees: [[t("Mantisse à 0,02 près (arrondis intermédiaires au millième)")]],
      };
    case "comparer":
      if (e.sousCas === "exact") {
        const [A, B] = basesCommunes(e);
        return {
          reponseFinale: reponseBreve(e),
          criteres: [
            { sousQuestion: "a", critere: [t("Exposant commun repéré, bases "), f(`${A}`), t(" et "), f(`${B}`), t(" : "), ...r("memeExposant")], points: 2 },
            { sousQuestion: "b", critere: [t("Conclusion justifiée (même exposant, bases comparées) : "), ...r("verdict").slice(-2)], points: 2 },
          ],
          erreursFrequentes: [
            { description: [t("Conclusion tirée des exposants seuls ou des bases seules")], cout: "0 pt sur la conclusion" },
            { description: [t("Erreur sur une puissance de puissance (exposants additionnés au lieu d'être multipliés)")], cout: "−1" },
          ],
          reponsesAcceptees: [[t("Comparaison par les logarithmes sans calculatrice (") , f("\\log(A)"), t(" et "), f("\\log(B)"), t(")")]],
        };
      }
      return {
        reponseFinale: reponseBreve(e),
        criteres: [
          { sousQuestion: "a", critere: [f(logPuissanceLatex(e.a, e.n))], points: 1 },
          { sousQuestion: "a", critere: [f(logPuissanceLatex(e.b, e.m))], points: 1 },
          { sousQuestion: "b", critere: [t("Conclusion justifiée par la croissance de log : "), ...r("verdict").slice(-2)], points: 2 },
        ],
        erreursFrequentes: [ERREUR_ARRONDI, ERREUR_LN, { description: [t("Conclusion sans invoquer la croissance de log")], cout: "−0,5" }],
        reponsesAcceptees: [[t("Logarithmes exacts ou arrondis au millième ; comparaison de "), f("\\ln"), t(" également correcte si elle est cohérente")]],
      };
    case "temps":
      if (e.sousCas === "duree") {
        return {
          reponseFinale: reponseBreve(e),
          criteres: [
            { sousQuestion: "a", critere: r("logOperations"), points: 1 },
            { sousQuestion: "b", critere: [t("Durée en secondes : "), ...r("dureeSecondes")], points: 1.5 },
            { sousQuestion: "c", critere: [t("Conversion en années : "), ...r("dureeAnnees")], points: 1.5 },
          ],
          erreursFrequentes: [
            { description: [t("Multiplication par le nombre d'opérations par seconde au lieu d'une division")], cout: "−1" },
            { description: [t("Conversion incomplète (heures ou jours au lieu d'années)")], cout: "−0,5" },
            { description: [t("Mantisse hors de [1 ; 10[ ou exposant faux")], cout: "−0,5" },
          ],
          reponsesAcceptees: [[t("Mantisses à quelques centièmes près (arrondis intermédiaires)")]],
        };
      }
      return {
        reponseFinale: reponseBreve(e),
        criteres: [
          { sousQuestion: "a", critere: [t("Nombre d'opérations disponibles : "), ...r("operations")], points: 1 },
          { sousQuestion: "b", critere: [t("Inéquation résolue avec log : "), ...r("borne")], points: 2 },
          { sousQuestion: "c", critere: r("plusGrandN"), points: 1 },
        ],
        erreursFrequentes: [
          { description: [t("Borne arrondie vers le haut (n trop grand)")], cout: "−0,5" },
          { description: [t("Durée non convertie en secondes")], cout: "−1" },
          { description: [t("Division par log(2) oubliée (log(N) pris pour n)")], cout: "−1" },
        ],
        reponsesAcceptees: [[t("Logarithme népérien des deux côtés : même borne")]],
      };
  }
}

export const adaptateurEvaluationGrandsNombres: AdaptateurFeuilleExercices<ExerciceGrandsNombres> = {
  titreDocument: "Grands nombres et logarithme décimal — Évaluation",
  nomFichierBase: "grands-nombres-logarithme",
  genererInstance: genererExerciceGrandsNombres,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as IdVarianteGrandsNombres),
  construireEnonce,
  construireCorrection,
  difficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  dureeMinutes: 8,
  profilInstance: profilGrandsNombres,
  calculatriceIndispensable: VARIANTES_CALCULATRICE_GRANDS_NOMBRES,
};
