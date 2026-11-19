import { useState } from "react";
import type { ExerciceInequation, SigneA } from "../core/inequation.types";
import { calculerCroquisAvecRacinesVraies } from "../ui/parabolaSketch";
import type { EntreeRecapitulatif } from "../ui/recapitulatif";
import { RecapitulatifPanel } from "./RecapitulatifPanel";
import { ParabolaSketch } from "./ParabolaSketch";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { AidesNiveaux } from "./RetourSaisie";
import type { FragmentConsigne } from "../ui/formatEquationDroite";

interface Props {
  exercice: ExerciceInequation;
  tentativesUtilisees: number;
  tentativesMax: number;
  recapitulatif: EntreeRecapitulatif[];
  aides?: FragmentConsigne[][];
  onValider: (reponse: SigneA) => void;
  /** Présent une fois l'écran terminé : gèle les boutons et montre la parabole. */
  validation?: ValidationEtapeProps | null;
}

/** Racines distinctes de l'exercice courant (Δ < 0 : aucune). */
function racinesDistinctes(exercice: ExerciceInequation): number[] {
  const r = exercice.racines;
  if (!r) return [];
  return r[0] === r[1] ? [r[0]] : [r[0], r[1]];
}

/** Question et libellés des deux boutons : le signe de a ET ce qu'il dit du signe du trinôme
 * (écran fusionné, audit 4e ch. 2 G11 — « a > 0 / a < 0 » seul se réussissait à coup sûr). */
function textes(exercice: ExerciceInequation): { question: string; plus: string; moins: string } {
  const n = racinesDistinctes(exercice).length;
  if (n === 2)
    return {
      question: "Le trinôme a le signe de a à l'extérieur des racines. Quel est son signe à l'extérieur des racines ?",
      plus: "a > 0 : positif à l'extérieur des racines",
      moins: "a < 0 : négatif à l'extérieur des racines",
    };
  if (n === 1)
    return {
      question: "Le trinôme a le signe de a partout, sauf en sa racine double où il est nul. Quel est ce signe ?",
      plus: "a > 0 : positif sauf en la racine",
      moins: "a < 0 : négatif sauf en la racine",
    };
  return {
    question: "Sans racine, le trinôme garde le signe de a pour tout réel x. Quel est ce signe ?",
    plus: "a > 0 : positif pour tout x",
    moins: "a < 0 : négatif pour tout x",
  };
}

/**
 * Écran « signe de a » fusionné avec la lecture du signe du trinôme (gen2). Choix fermé : UNE
 * tentative. Figure : l'axe et les racines (vraies racines confirmées de l'exercice), avec « ? »
 * dans chaque zone tant que l'écran n'est pas validé ; après validation, la parabole (vrai signe
 * de a) et les signes « + » / « − » de chaque zone.
 */
export function EtapeSigneA({ exercice, tentativesUtilisees, tentativesMax, recapitulatif, aides, onValider, validation }: Props) {
  const [signe, setSigne] = useState<SigneA | null>(null);
  const vraiSigne: SigneA = exercice.enonce.a > 0 ? "+" : "-";
  const croquis = calculerCroquisAvecRacinesVraies(exercice, validation ? vraiSigne : "+");
  const xs = croquis.pointsRacines.map((p) => p.x).sort((x, y) => x - y);
  const bords = [0, ...xs, croquis.largeur];
  const n = racinesDistinctes(exercice).length;
  const oppose = vraiSigne === "+" ? "−" : "+";
  const signeZone = (i: number) => (n === 2 && i === 1 ? oppose : vraiSigne === "+" ? "+" : "−");
  const etiquettes = bords.slice(0, -1).map((g, i) => ({ x: (g + bords[i + 1]!) / 2, texte: validation ? signeZone(i) : "?" }));
  const t = textes(exercice);
  void tentativesMax;

  return (
    <div>
      <RecapitulatifPanel entrees={recapitulatif} />
      <p className="prompt-text">{t.question}</p>
      <div className="options-grid">
        <button type="button" disabled={!!validation} className={signe === "+" ? "btn toggle-active" : "btn"} onClick={() => setSigne("+")}>
          {t.plus}
        </button>
        <button type="button" disabled={!!validation} className={signe === "-" ? "btn toggle-active" : "btn"} onClick={() => setSigne("-")}>
          {t.moins}
        </button>
      </div>

      <div className="contenu-conditionnel">
        <ParabolaSketch croquis={croquis} masquerCourbe={!validation} etiquettes={etiquettes} afficherOrigine={false} />
      </div>

      {!validation && (
        <>
          {aides && <AidesNiveaux aides={aides} />}
          <button type="button" className="btn btn-primary" disabled={signe === null} onClick={() => signe !== null && onValider(signe)}>
            Valider
          </button>
          {tentativesUtilisees > 0 && (
            <p className="alert-error" role="alert">
              Incorrect.
            </p>
          )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
