import type { ExerciceModelisationSinusoide } from "../core5e/modelisationSinusoide.types";
import {
  consigneGeneralePartie1,
  consigneGeneralePartie2,
  formatTermesDonneesConstructionLatex,
  formatTermesDonneesSeuilLatex,
} from "../ui5e/formatModelisationSinusoide";
import { Katex } from "../components/Katex";

/** En-tête complet de 5gen13 : consigne + bloc de données de CONSTRUCTION du modèle (Phase 1,
 * toujours présents), PUIS — dès que la Phase 2 existe — bloc de données de la CONDITION À
 * RÉSOUDRE (f(t)=k / t∈[fenêtre]), dans le MÊME style visuel que le bloc 1 (`prompt5gen13B1B2B3.md`
 * — la bordure/le fond violet `.equation-box-seuil` a été retiré, les 2 blocs sont désormais
 * visuellement identiques). Remplace les occurrences inline dupliquées à l'identique sur les 8
 * écrans de ce générateur — chaque écran ne rend plus que `<BlocDonneesModelisation>`, jamais son
 * propre `<p className="prompt-text">{consigneGenerale(...)}</p>` séparé.
 *
 * La 2e CONSIGNE ("Ensuite...") est en revanche absente pour la technique "donnee" — CE bloc reste
 * rendu (`prompt5gen13ftDonnee3variantes.md` : "il n'y a donc qu'une seule consigne globale ET UN
 * SEUL BLOC DE DONNÉES" ne s'applique qu'à la CONSIGNE, pas à ce 2e bloc de données lui-même, déjà
 * présent avant la restructuration B2/B3 sous l'ancien nom `.equation-box-seuil`). Bug corrigé ici :
 * une 1re version couplait à tort le rendu du bloc 2 à `partie2 !== null`, ce qui le FAISAIT
 * DISPARAÎTRE ENTIÈREMENT pour "donnee" (régression, jamais remarquée faute de test dédié). */
export function BlocDonneesModelisation({ exercice }: { exercice: ExerciceModelisationSinusoide }) {
  const construction = formatTermesDonneesConstructionLatex(exercice);
  const seuil = formatTermesDonneesSeuilLatex(exercice);
  const partie1 = consigneGeneralePartie1(exercice);
  const partie2 = consigneGeneralePartie2(exercice);
  return (
    <>
      <p className="prompt-text">{partie1}</p>
      <div className="equation-box equation-box-donnees">
        {construction.map((frag, i) => (
          <Katex key={i} expression={frag} />
        ))}
      </div>
      {seuil.length > 0 && (
        <>
          {partie2 !== null && <p className="prompt-text">{partie2}</p>}
          <div className="equation-box equation-box-donnees">
            {seuil.map((frag, i) => (
              <Katex key={i} expression={frag} />
            ))}
          </div>
        </>
      )}
    </>
  );
}
