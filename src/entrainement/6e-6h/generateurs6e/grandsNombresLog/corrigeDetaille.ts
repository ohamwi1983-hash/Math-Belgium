import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, lignesDepuisChaine, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import { AGE_UNIVERS_ANNEES, DUREES, basesCommunes, donneesTaille, ecritureScientifique, logPuissance, logsComparer, logsDuree, premierEstPlusGrand } from "../../core6e/grandsNombresLog";
import type { ExerciceChiffres, ExerciceComparer, ExerciceGrandsNombres, ExercicePremierChiffre, ExerciceTempsDuree, ExerciceTempsTaille } from "../../core6e/grandsNombresLog";
import { comparaisonLatex, logPuissanceLatex, nbLatex, nbTexte, puissanceLatex, reponseFragments, scientifiqueLatex } from "../../ui6e/formatGrandsNombresLog";
import { COURS_PROPRIETES } from "../../ui6e/corrigeLogarithmes2";

/**
 * Corrigé détaillé « comme au tableau » de `6gen92` (grands nombres et logarithme décimal) — règle
 * `.claude/rules/feuilles-evaluations.md`. Une étape par écran (`phasesPourExercice`) : logarithme
 * d'une puissance (log(aⁿ) = n log a), partie entière et encadrement par deux puissances de 10,
 * mantisse 10^f, comparaison de logarithmes (log croissante) ou écriture avec un même exposant,
 * durée par soustraction de logarithmes, borne de n par log(2) > 0. Valeurs : `core6e/grandsNombresLog.ts`
 * (source unique de l'écran et de la vérification) ; réponses : `reponseFragments`.
 */

type E = ExerciceGrandsNombres;
const t = texte;
const f = latex;

const LOG_PUISSANCE: FragmentConsigne[] = [f("\\log\\left(a^{n}\\right)=n\\log(a)"), t(` ${COURS_PROPRIETES}`)];

function lignesLog(a: number, n: number): LigneCalcul[] {
  return [ligne(`\\log(${puissanceLatex(a, n)})=${nbLatex(n, 0)}\\log(${a})`, "log(aⁿ) = n log a"), ligne(`\\approx ${nbLatex(logPuissance(a, n))}`, `log(${a}) non arrondi avant de multiplier`)];
}

function etapeLog(e: { a: number; n: number }, sq: string): EtapeCorrection[] {
  return [
    utilise(sq, [t("Le nombre "), f(puissanceLatex(e.a, e.n)), t(" est trop grand pour la calculatrice ; la propriété de la puissance donne directement son logarithme décimal : "), ...LOG_PUISSANCE, t(".")]),
    calcul(sq, lignesLog(e.a, e.n)),
    resultat(sq, [f(logPuissanceLatex(e.a, e.n))]),
  ];
}

function corrigeChiffres(e: ExerciceChiffres): EtapeCorrection[] {
  const P = puissanceLatex(e.a, e.n);
  const L = logPuissance(e.a, e.n);
  const s = ecritureScientifique(L);
  return [
    ...etapeLog(e, "a"),
    utilise("b", [t("La partie entière d'un nombre est le plus grand entier qui lui est inférieur ou égal : on encadre "), f(`\\log(${P})`), t(" entre deux entiers consécutifs.")]),
    calcul("b", [ligne(`\\log(${P})\\approx ${nbLatex(L)}`, "étape 1"), ligne(`${s.E}\\leq ${nbLatex(L)}<${s.E + 1}`, "entre deux entiers consécutifs")]),
    resultat("b", reponseFragments(e, "partieEntiere")),
    utilise("c", [t("Un entier "), f("N"), t(" compte "), f("k"), t(" chiffres lorsque "), f("10^{k-1}\\leq N<10^{k}"), t(", c'est-à-dire "), f("k-1\\leq\\log(N)<k"), t(` ${COURS_PROPRIETES}.`)]),
    calcul("c", [
      ligne(`${s.E}\\leq\\log(${P})<${s.E + 1}`, "étape 2"),
      ligne(`10^{${s.E}}\\leq ${P}<10^{${s.E + 1}}`, "on applique 10ˣ, strictement croissante"),
      ligne(`k-1=${s.E}`, "k chiffres ⟺ 10ᵏ⁻¹ ≤ N < 10ᵏ"),
      ligne(`k=${s.E + 1}`),
    ]),
    resultat("c", [
      ...reponseFragments(e, "nombreChiffres"),
      ...(e.mersenne ? [t(" Comme "), f(P), t(" n'est pas une puissance de 10 (il se termine par 2, 4, 6 ou 8), "), f(`${P}-1`), t(` compte aussi ${nbTexte(s.E + 1, 0)} chiffres.`)] : []),
    ]),
    verification("c", [t("Sur un petit exemple : "), f("\\log(100)=2"), t(" et 100 compte 2 + 1 = 3 chiffres.")]),
    piege("c", [t("Oublier le « + 1 » : "), f("100=10^{2}"), t(" compte trois chiffres, alors que "), f("\\log(100)=2"), t(`. Autre piège : arrondir log(${e.a}) avant de le multiplier par ${nbTexte(e.n, 0)}, l'erreur d'arrondi est alors multipliée par ${nbTexte(e.n, 0)}.`)]),
  ];
}

function corrigePremierChiffre(e: ExercicePremierChiffre): EtapeCorrection[] {
  const P = puissanceLatex(e.a, e.n);
  const L = logPuissance(e.a, e.n);
  const s = ecritureScientifique(L);
  return [
    ...etapeLog(e, "a"),
    utilise("b", [t("Si "), f("\\log(N)=E+f"), t(" avec "), f("E"), t(" entier et "), f("0\\leq f<1"), t(", alors "), f("N=10^{f}\\times 10^{E}"), t(" avec "), f("1\\leq 10^{f}<10"), t(" : c'est l'écriture scientifique de "), f("N"), t(` ${COURS_PROPRIETES}.`)]),
    calcul("b", [
      ligne(`\\log(${P})\\approx ${s.E}+${nbLatex(s.f, 4)}`, "partie entière + partie décimale (gardée au dix-millième)"),
      ligne(`${P}\\approx 10^{${s.E}+${nbLatex(s.f, 4)}}`, "N = 10 puissance log(N)"),
      ligne(`=10^{${nbLatex(s.f, 4)}}\\times 10^{${s.E}}`, "10ᵃ⁺ᵇ = 10ᵃ × 10ᵇ"),
      ligne(`10^{${nbLatex(s.f, 4)}}\\approx ${nbLatex(s.m, 2)}`, "calculatrice : la mantisse"),
    ]),
    resultat("b", reponseFragments(e, "scientifique")),
    piege("b", [t("Prendre la partie décimale "), f(nbLatex(s.f)), t(" elle-même pour la mantisse, au lieu de "), f(`10^{${nbLatex(s.f)}}`), t(" ; ou mettre "), f("E+1"), t(" en exposant de 10 (le « + 1 » ne sert qu'à compter les chiffres).")]),
    utilise("c", [t("Le premier chiffre est celui des unités de la mantisse ; un nombre compris entre "), f("10^{E}"), t(" et "), f("10^{E+1}"), t(" compte E + 1 chiffres.")]),
    calcul("c", [
      ligne(`${Math.floor(s.m)}\\leq ${nbLatex(s.m, 2)}<${Math.floor(s.m) + 1}`, "chiffre des unités de la mantisse"),
      ligne(`10^{${s.E}}\\leq ${P}<10^{${s.E + 1}}`, "mantisse entre 1 et 10"),
      ligne(`${s.E}+1=${s.E + 1}`, "nombre de chiffres"),
    ]),
    resultat("c", reponseFragments(e, "premierChiffre")),
  ];
}

function corrigeComparer(e: ExerciceComparer): EtapeCorrection[] {
  const x = puissanceLatex(e.a, e.n);
  const y = puissanceLatex(e.b, e.m);
  const grand = premierEstPlusGrand(e);
  if (e.sousCas === "exact") {
    const [A, B] = basesCommunes(e);
    const k = e.k ?? 1;
    const ecrire = (a: number, n: number, base: number): LigneCalcul[] => (n / k === 1 ? [ligne(`${puissanceLatex(a, n)}=${base}^{${k}}`, "déjà d'exposant " + k)] : lignesDepuisChaine(`${puissanceLatex(a, n)}=\\left(${a}^{${n / k}}\\right)^{${k}}=${base}^{${k}}`, [`(aᵖ)ᵏ = aᵖᵏ : ${nbTexte(n, 0)} = ${n / k} × ${k}`, `${a}${sup(n / k)} = ${nbTexte(base, 0)}`]));
    return [
      utilise("a", [t(`Les exposants ${nbTexte(e.n, 0)} et ${nbTexte(e.m, 0)} sont tous deux des multiples de ${k} : on écrit les deux nombres comme des puissances d'exposant ${k}, grâce à `), f("\\left(a^{p}\\right)^{k}=a^{pk}"), t(` ${COURS_PROPRIETES}.`)]),
      calcul("a", [...ecrire(e.a, e.n, A), ...ecrire(e.b, e.m, B)]),
      resultat("a", reponseFragments(e, "memeExposant")),
      utilise("b", [t("La fonction "), f(`x\\mapsto x^{${k}}`), t(" est strictement croissante sur "), f("\\left[0\\,;+\\infty\\right["), t(" : deux puissances de même exposant sont rangées comme leurs bases.")]),
      calcul("b", [ligne(`${A}${A > B ? ">" : "<"}${B}`, "on compare les bases"), ligne(`${A}^{${k}}${A > B ? ">" : "<"}${B}^{${k}}`, `puissance ${k} croissante`), ligne(comparaisonLatex(e), "étape 1")]),
      resultat("b", reponseFragments(e, "verdict")),
      piege("b", [t("Conclure d'après les exposants seuls (ou les bases seules) : ici, le nombre qui a la plus grande base a le plus petit exposant ; seule l'écriture avec un même exposant tranche.")]),
    ];
  }
  const [l1, l2] = logsComparer(e);
  return [
    utilise("a", [t("Les deux nombres sont trop grands pour la calculatrice : on compare leurs logarithmes décimaux, puisque log est strictement croissante ; "), ...LOG_PUISSANCE, t(".")]),
    calcul("a", lignesLog(e.a, e.n), [], "Premier nombre"),
    calcul("a", lignesLog(e.b, e.m), [], "Second nombre"),
    resultat("a", reponseFragments(e, "logsDeux")),
    utilise("b", [t("La fonction log est strictement croissante : les nombres sont rangés comme leurs logarithmes " + COURS_PROPRIETES + ".")]),
    calcul("b", [ligne(`${nbLatex(l1)}${grand ? ">" : "<"}${nbLatex(l2)}`, "logarithmes de l'étape 1"), ligne(`\\log(${x})${grand ? ">" : "<"}\\log(${y})`), ligne(comparaisonLatex(e), "log strictement croissante")]),
    resultat("b", reponseFragments(e, "verdict")),
    piege("b", [t("Juger sur l'exposant seul ou sur la base seule : "), f(x), t(" et "), f(y), t(` ont des logarithmes très proches, seul leur calcul (sans arrondir les logarithmes des bases avant de multiplier) permet de trancher.`)]),
  ];
}

const EXP = ["⁰", "¹", "²", "³", "⁴", "⁵", "⁶", "⁷", "⁸", "⁹"];
function sup(n: number): string {
  return String(n).split("").map((c) => EXP[Number(c)] ?? c).join("");
}

function corrigeDuree(e: ExerciceTempsDuree): EtapeCorrection[] {
  const L = logsDuree(e);
  const sS = ecritureScientifique(L.secondes);
  const P = puissanceLatex(2, e.n);
  const rapportUnivers = L.annees - Math.log10(AGE_UNIVERS_ANNEES);
  return [
    ...etapeLog({ a: 2, n: e.n }, "a"),
    utilise("b", [t("Durée = nombre d'opérations divisé par le nombre d'opérations par seconde ; en logarithme, la division devient une soustraction : "), f("\\log\\left(\\dfrac{a}{b}\\right)=\\log a-\\log b"), t(` ${COURS_PROPRIETES}.`)]),
    calcul("b", [
      ligne(`T=\\dfrac{${P}}{10^{${e.p}}}`, "opérations ÷ opérations par seconde"),
      ligne(`\\log(T)=${nbLatex(e.n, 0)}\\log(2)-${e.p}`, "log du quotient, log(10ᵖ) = p"),
      ligne(`\\approx ${nbLatex(L.secondes)}`),
      ligne(`T\\approx 10^{${nbLatex(L.secondes, 4)}}`, "T = 10 puissance log(T)"),
      ligne(`=10^{${nbLatex(sS.f, 4)}}\\times 10^{${sS.E}}`, "10ᵃ⁺ᵇ = 10ᵃ × 10ᵇ"),
      ligne(`\\approx ${scientifiqueLatex(L.secondes)}`, "calculatrice : la mantisse"),
    ]),
    resultat("b", [t("Durée : "), ...reponseFragments(e, "dureeSecondes")]),
    piege("b", [t("Multiplier par "), f(`10^{${e.p}}`), t(" au lieu de diviser ; la durée en secondes est le quotient du nombre d'opérations par la vitesse de l'ordinateur.")]),
    utilise("c", [t("Une année de 365 jours compte "), f("365\\times 24\\times 3600=31\\,536\\,000"), t(" secondes ; on divise, donc on soustrait les logarithmes.")]),
    calcul("c", [
      ligne(`T'=\\dfrac{T}{31\\,536\\,000}`, "secondes par an"),
      ligne(`\\log(T')=${nbLatex(L.secondes)}-\\log(31\\,536\\,000)`, "log du quotient"),
      ligne(`\\approx ${nbLatex(L.annees)}`),
      ligne(`T'\\approx ${scientifiqueLatex(L.annees)}`, "même méthode qu'à l'étape 2"),
    ]),
    resultat("c", [
      t("Durée en années : "),
      ...reponseFragments(e, "dureeAnnees"),
      ...(rapportUnivers >= 1 ? [t(", soit environ "), f(scientifiqueLatex(rapportUnivers)), t(" fois l'âge de l'Univers (environ "), f("1{,}38\\times 10^{10}"), t(" années).")] : [t(".")]),
    ]),
  ];
}

function corrigeTaille(e: ExerciceTempsTaille): EtapeCorrection[] {
  const d = donneesTaille(e);
  const D = DUREES[e.duree];
  const sN = ecritureScientifique(d.logN);
  const avant = logPuissance(2, d.nMax);
  const apres = logPuissance(2, d.nMax + 1);
  const eqBorne = [`2^{n}\\leq N`, `n\\log(2)\\leq\\log(N)`, `n\\leq\\dfrac{\\log(N)}{\\log(2)}`];
  return [
    utilise("a", [t(`Durée en secondes : `), f(D.calculLatex), t(" ; on multiplie par le nombre d'opérations effectuées en une seconde.")]),
    calcul("a", [ligne(`N=10^{${e.p}}\\times ${nbLatex(D.secondes, 0)}`, "opérations par seconde × secondes"), ligne(`=${nbLatex(sN.m, 4)}\\times 10^{${sN.E}}`, "écriture scientifique")]),
    resultat("a", reponseFragments(e, "operations")),
    utilise("b", [t("Il faut "), f("2^{n}\\leq N"), t(". La fonction log est croissante : on l'applique aux deux membres, puis on divise par "), f("\\log(2)>0"), t(` sans changer le sens ${COURS_PROPRIETES}.`)]),
    calcul("b", [
      ligne(eqBorne[0]!, "le calcul doit se terminer à temps"),
      ligne(eqBorne[1]!, "log croissante et log(2ⁿ) = n log 2"),
      ligne(eqBorne[2]!, "on divise par log(2) > 0"),
      ligne(`\\log(N)\\approx ${nbLatex(d.logN)}`, "calculatrice"),
      ligne(`\\dfrac{\\log(N)}{\\log(2)}\\approx ${nbLatex(d.borne, 2)}`),
    ]),
    resultat("b", reponseFragments(e, "borne")),
    utilise("c", [t("n est un nombre entier : on garde le plus grand entier inférieur ou égal à la borne.")]),
    calcul("c", [ligne(`n\\leq ${nbLatex(d.borne, 2)}`, "étape 2"), ligne(`n=${d.nMax}`, "plus grand entier qui convient")]),
    resultat("c", reponseFragments(e, "plusGrandN")),
    verification("c", [f(`2^{${d.nMax}}\\approx ${scientifiqueLatex(avant)}\\leq N`), t(" et "), f(`2^{${d.nMax + 1}}\\approx ${scientifiqueLatex(apres)}>N`), t(".")]),
    piege("c", [t("Arrondir la borne au plus proche ou vers le haut : avec "), f(`n=${d.nMax + 1}`), t(", le nombre d'opérations dépasse N, le calcul ne se termine pas à temps.")]),
  ];
}

export function correctionDetailleeGrandsNombres(e: E): EtapeCorrection[] {
  switch (e.variante) {
    case "chiffres":
      return corrigeChiffres(e);
    case "premier-chiffre":
      return corrigePremierChiffre(e);
    case "comparer":
      return corrigeComparer(e);
    case "temps":
      return e.sousCas === "duree" ? corrigeDuree(e) : corrigeTaille(e);
  }
}
