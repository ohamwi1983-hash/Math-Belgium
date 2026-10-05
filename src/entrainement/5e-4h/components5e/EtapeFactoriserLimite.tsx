import { useState } from "react";
import type { ExerciceLimite } from "../core5e/limites.types";
import type { ReponseFactoriser } from "../moteur5e/sessionLimites";
import { consigneGenerale, consignePhase, formatBlocDonneesLatex, texteAideNiveau1, texteAideNiveau2 } from "../ui5e/formatLimites";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import { BoutonAide } from "./BoutonAide";
import { EtatActuelLimite } from "./EtatActuelLimite";
import { formatMessageErreur } from "../ui/messageErreur";
import type { StatutVerification } from "../moteur/statutVerification";

interface Props {
  exercice: ExerciceLimite;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseFactoriser) => void;
  /** Statut à 3 valeurs (numérateur, dénominateur) calculé côté PRÉSENTATION uniquement — optionnel,
   * un appelant qui ne le fournit pas garde le message générique historique. */
  diagnostiquer?: (reponse: ReponseFactoriser) => { numerateur: StatutVerification; denominateur: StatutVerification };
}

/** Écran "factoriser" (famille "formeIndeterminee" uniquement) — UN champ libre par expression
 * (numérateur, dénominateur), vérifié par ÉQUIVALENCE ALGÉBRIQUE (développement/comparaison, pas
 * correspondance syntaxique stricte — même composant de vérification que côté 4e), jamais
 * add-as-needed (mécanique abandonnée). `ReponseFactoriser.numerateur/denominateur` restent des
 * `string[]` côté moteur (`diagnostiquerFacteurs` inchangée) — ce composant leur passe simplement un
 * tableau à 1 élément. */
export function EtapeFactoriserLimite({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer }: Props) {
  const [numerateur, setNumerateur] = useState("");
  const [denominateur, setDenominateur] = useState("");
  const [dernierStatut, setDernierStatut] = useState<StatutVerification | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = numerateur.trim() !== "" && denominateur.trim() !== "";
  const apresEchec = tentativesUtilisees > 0;
  const statuts = apresEchec && diagnostiquer && complet ? diagnostiquer({ numerateur: [numerateur], denominateur: [denominateur] }) : null;
  const aide2 = texteAideNiveau2(exercice, "factoriser");

  function valider() {
    if (!complet) return;
    const reponse: ReponseFactoriser = { numerateur: [numerateur], denominateur: [denominateur] };
    if (diagnostiquer) {
      const s = diagnostiquer(reponse);
      setDernierStatut(s.numerateur !== "correct" ? s.numerateur : s.denominateur);
    }
    onValider(reponse);
  }

  return (
    <div>
      <p className="prompt-text">{consigneGenerale()}</p>
      <div className="equation-box equation-box-donnees">
        <Katex expression={formatBlocDonneesLatex(exercice)} block />
      </div>
      <EtatActuelLimite exercice={exercice} phase="factoriser" />
      <p className="prompt-text">{consignePhase(exercice, "factoriser")}</p>

      <ApercuExpressionLatex texte={numerateur} />
      <div className="field field-inline">
        <label className="field-label field-label-minuscule">Numérateur factorisé</label>
        <input
          type="text"
          className={`text-input${statuts && statuts.numerateur !== "correct" ? " is-erronee" : ""}`}
          value={numerateur}
          onChange={(e) => setNumerateur(e.target.value)}
          placeholder="ex : 2*(x-3)*(x+5)"
        />
      </div>

      <ApercuExpressionLatex texte={denominateur} />
      <div className="field field-inline">
        <label className="field-label field-label-minuscule">Dénominateur factorisé</label>
        <input
          type="text"
          className={`text-input${statuts && statuts.denominateur !== "correct" ? " is-erronee" : ""}`}
          value={denominateur}
          onChange={(e) => setDenominateur(e.target.value)}
          placeholder="ex : (x-3)*(x+5)"
        />
      </div>

      <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
      <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
        Valider
      </button>
      {montrerErreurs && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax, dernierStatut)}
        </p>
      )}
      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p>{texteAideNiveau1(exercice, "factoriser")}</p>
          {niveauAide >= 2 && <p>{aide2}</p>}
        </div>
      )}
    </div>
  );
}
