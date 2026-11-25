import type { ExerciceEsperanceC, IssueJeuC, StatutJeuC } from "../../core6e/variablesDiscretesEsperance.types";
import { rationnel } from "../../moteur6e/saisieCombinatoire";
import type { Rationnel } from "../../moteur6e/saisieCombinatoire";
import { genererPoids, tirerEntier, tirerParmi } from "./aleatoire";

/**
 * 6gen49, famille C : jeu avec mise. Audit, G18 : la mise est toujours POSITIVE (avant : « m = −1,20 »
 * dans 41 % des « imposer ») ; la conclusion favorable / défavorable / équitable est enfin demandée
 * (écran de choix, une tentative), son verdict tiré AVANT les nombres (un tiers chacun) ; contextes
 * à effectifs (roue, urne, cartes) : les probabilités viennent du texte.
 */

const STATUTS: StatutJeuC[] = ["favorable", "defavorable", "equitable"];

/** « 1 rouge », « 3 rouges ». */
function nb(n: number, mot: string): string {
  return `${n} ${mot}${n > 1 ? "s" : ""}`;
}

interface Contexte {
  objets: string[];
  phrase: (total: number, issues: IssueJeuC[]) => string;
}

const CONTEXTES: Contexte[] = [
  {
    objets: ["un secteur rouge", "un secteur bleu", "un secteur vert"],
    phrase: (total, issues) => `Une roue est partagée en ${total} secteurs égaux : ${nb(issues[0].effectif, "rouge")}, ${nb(issues[1].effectif, "bleu")} et ${nb(issues[2].effectif, "vert")}.`,
  },
  {
    objets: ["une boule dorée", "une boule argentée", "une boule blanche"],
    phrase: (total, issues) => `Une urne contient ${total} boules : ${nb(issues[0].effectif, "dorée")}, ${nb(issues[1].effectif, "argentée")} et ${nb(issues[2].effectif, "blanche")}. On en tire une au hasard.`,
  },
  {
    objets: ["une carte « jackpot »", "une carte « bonus »", "une carte « perdu »"],
    phrase: (total, issues) => `Un paquet contient ${total} cartes : ${nb(issues[0].effectif, "carte")} « jackpot », ${nb(issues[1].effectif, "carte")} « bonus » et ${nb(issues[2].effectif, "carte")} « perdu ». On en tire une au hasard.`,
  },
];

export function esperanceBruteC(e: Pick<ExerciceEsperanceC, "issues" | "total">): Rationnel {
  return rationnel(e.issues.reduce((s, i) => s + i.gainBrut * i.effectif, 0), e.total);
}

/** E(X) du gain net X = gain brut − mise (en centimes exacts). */
export function esperanceNetteC(e: ExerciceEsperanceC): Rationnel {
  const b = esperanceBruteC(e);
  const miseCentimes = BigInt(Math.round(e.mise * 100));
  return rationnel(b.n * 100n - miseCentimes * b.d, b.d * 100n);
}

function construire(sousType: "verifier" | "imposer"): ExerciceEsperanceC {
  const statut = tirerParmi(STATUTS);
  for (;;) {
    const total = tirerParmi([10, 20]);
    const effectifs = genererPoids(3, total);
    if (effectifs[0] > effectifs[2]) [effectifs[0], effectifs[2]] = [effectifs[2], effectifs[0]];
    const c = tirerParmi(CONTEXTES);
    const g1 = tirerEntier(5, 20);
    const g2 = tirerEntier(1, Math.max(1, Math.floor(g1 / 2)));
    const issues: IssueJeuC[] = [
      { label: c.objets[0], effectif: effectifs[0], gainBrut: g1 },
      { label: c.objets[1], effectif: effectifs[1], gainBrut: g2 },
      { label: c.objets[2], effectif: effectifs[2], gainBrut: 0 },
    ];
    const eb = esperanceBruteC({ issues, total });
    const ebNombre = Number(eb.n) / Number(eb.d);
    if (ebNombre < 0.5) continue;
    // Écart à la mise équitable : 10 à 150 centimes (mise toujours positive).
    const ecart = tirerEntier(1, 15) / 10;
    const mise = statut === "equitable" ? ebNombre : statut === "favorable" ? ebNombre - ecart : ebNombre + ecart;
    const miseArrondie = Math.round(mise * 100) / 100;
    if (miseArrondie <= 0.2 || Math.abs(miseArrondie - mise) > 1e-9) continue;
    const texte = `${c.phrase(total, issues)} Un joueur paie une mise, puis reçoit ${g1} € pour ${c.objets[0]}, ${g2} € pour ${c.objets[1]} et rien pour ${c.objets[2]}.`;
    return { famille: "C", sousType, texte, issues, total, mise: miseArrondie, statut };
  }
}

export function construireVerifier(): ExerciceEsperanceC {
  return construire("verifier");
}

export function construireImposer(): ExerciceEsperanceC {
  return construire("imposer");
}

export function construireFamilleC(): ExerciceEsperanceC {
  return Math.random() < 0.5 ? construireVerifier() : construireImposer();
}
