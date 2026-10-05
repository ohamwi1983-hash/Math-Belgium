import { useState } from "react";
import type { ExerciceContexteEconomiqueBonus, IterationDichotomie } from "../core5e/contexteEconomique.types";
import type { ReponseIterationDichotomie } from "../moteur5e/verificationContexteEconomique";
import { consigneEcran, consigneGenerale, formatNombreLatex, formatTermesDonneesLatex, questionFinale, texteAideNiveau1, texteAideNiveau2 } from "../ui5e/formatContexteEconomique";
import type { EcranContexteEconomique } from "../moteur5e/typesContexteEconomique";
import { Katex } from "../components/Katex";
import { QuestionFinale } from "../components/QuestionFinale";
import { BoutonAide } from "./BoutonAide";
import { EtatActuelContexteEconomique } from "./EtatActuelContexteEconomique";
import { CalculatriceScientifique } from "./CalculatriceScientifique";
import type { StatutVerification } from "../moteur/statutVerification";

interface Props {
  exercice: ExerciceContexteEconomiqueBonus;
  ecran: Extract<EcranContexteEconomique, "iteration0" | "iteration1" | "iteration2" | "iteration3">;
  /** Intervalle COURANT (gauche;droite) de CETTE itération — vérité terrain pré-calculée par le
   * générateur, JAMAIS recalculée depuis la réponse de l'élève à l'itération précédente (même
   * convention "bloc état actuel" qu'ailleurs sur la plateforme). */
  intervalleCourant: Pick<IterationDichotomie, "gauche" | "droite">;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseIterationDichotomie) => void;
  diagnostiquerMilieu: (texte: string) => StatutVerification;
}

/** Écran d'itération de dichotomie (bonus) — RÉPÉTÉ 4 fois (`iteration0`..`iteration3`), un seul
 * composant générique paramétré par l'intervalle courant. 3 sous-réponses combinées en une seule
 * validation : milieu (champ numérique EXACT, pas de tolérance décimale nécessaire — dénominateur
 * toujours une puissance de 2), signe de P(milieu) (2 boutons), sous-intervalle à conserver (2
 * boutons, libellés par les bornes RÉELLES — savoir LEQUEL garder reste le travail de l'élève,
 * ces libellés ne font que décrire les 2 candidats). */
export function EtapeIterationDichotomie({
  exercice,
  ecran,
  intervalleCourant,
  tentativesUtilisees,
  tentativesMax,
  niveauAide,
  niveauAideMax,
  onActiverAide,
  onValider,
  diagnostiquerMilieu,
}: Props) {
  const [milieu, setMilieu] = useState("");
  const [signe, setSigne] = useState<1 | -1 | null>(null);
  const [garder, setGarder] = useState<"gauche" | "droite" | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = milieu.trim() !== "" && signe !== null && garder !== null;
  const apresEchec = tentativesUtilisees > 0;
  const statutMilieu = apresEchec ? diagnostiquerMilieu(milieu) : null;

  const { gauche, droite } = intervalleCourant;
  const milieuNumerique = (gauche + droite) / 2;

  function valider() {
    if (!complet) return;
    onValider({ milieu, signe: signe as 1 | -1, garder: garder as "gauche" | "droite" });
  }

  return (
    <div>
      <p className="prompt-text">{consigneGenerale(exercice)}</p>
      <div className="equation-box equation-box-donnees">
        {formatTermesDonneesLatex(exercice).map((frag, i) => (
          <Katex key={i} expression={frag} />
        ))}
      </div>
      <QuestionFinale question={questionFinale(exercice)} />
      <EtatActuelContexteEconomique exercice={exercice} ecran={ecran} />
      <div className="etat-actuel-box etat-actuel-box-termes">
        <Katex expression={`\\text{intervalle courant : } [${formatNombreLatex(gauche)}\\,;\\,${formatNombreLatex(droite)}]`} />
      </div>
      <p className="prompt-text">{consigneEcran(exercice, ecran)}</p>

      <div className="field field-inline">
        <label className="field-label field-label-minuscule">
          <Katex expression="\text{milieu}=" />
        </label>
        <input
          type="text"
          className={`text-input${statutMilieu && statutMilieu !== "correct" ? " is-erronee" : ""}`}
          value={milieu}
          onChange={(e) => setMilieu(e.target.value)}
          placeholder="ex : 1.5"
        />
      </div>

      <p className="field-label field-label-minuscule">Signe de P(milieu)</p>
      <div className="options-grid-compact">
        {([1, -1] as const).map((v) => (
          <button key={v} type="button" className={`btn${signe === v ? " toggle-active" : ""}`} onClick={() => setSigne(v)}>
            {v === 1 ? "+" : "−"}
          </button>
        ))}
      </div>

      <p className="field-label field-label-minuscule">Sous-intervalle à conserver</p>
      <div className="options-grid-compact">
        <button type="button" className={`btn${garder === "gauche" ? " toggle-active" : ""}`} onClick={() => setGarder("gauche")}>
          [{formatNombreLatex(gauche)} ; {formatNombreLatex(milieuNumerique)}]
        </button>
        <button type="button" className={`btn${garder === "droite" ? " toggle-active" : ""}`} onClick={() => setGarder("droite")}>
          [{formatNombreLatex(milieuNumerique)} ; {formatNombreLatex(droite)}]
        </button>
      </div>

      <CalculatriceScientifique />
      <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
      <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
        Valider
      </button>
      {montrerErreurs && (
        <p className="alert-error" role="alert">
          Incorrect — tentative {tentativesUtilisees}/{tentativesMax}, réessaie.
        </p>
      )}
      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p>{texteAideNiveau1(ecran)}</p>
          {niveauAide >= 2 && <p>{texteAideNiveau2(exercice, ecran)}</p>}
        </div>
      )}
    </div>
  );
}
