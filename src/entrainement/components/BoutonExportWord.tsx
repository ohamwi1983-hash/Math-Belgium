import { useState } from "react";
import { genererFeuilleExercicesDocx, type AdaptateurFeuilleExercices, type ProgressionGeneration } from "../export/genererFeuilleExercices";
import { genererFeuilleExercicesHtml } from "../export/genererFeuilleExercicesHtml";
import { genererFeuilleExercicesPdf } from "../export/genererFeuilleExercicesPdf";
import { declencherTelechargement } from "../export/telechargerBlob";

interface Props<T> {
  adaptateur: AdaptateurFeuilleExercices<T>;
}

const MIN_EXERCICES = 1;
const MAX_EXERCICES = 30;

type FormatExport = "docx" | "pdf" | "html";

const FORMATS: { id: FormatExport; label: string; extension: string }[] = [
  { id: "docx", label: "Word", extension: "docx" },
  { id: "pdf", label: "PDF", extension: "pdf" },
  { id: "html", label: "HTML (A4)", extension: "html" },
];

/**
 * Widget générique "Générer une feuille d'exercices" — un sélecteur de format (Word/PDF/HTML), un
 * champ numérique (nombre d'exercices) et un bouton, branchés sur n'importe quel
 * `AdaptateurFeuilleExercices<T>` (voir `export/genererFeuilleExercices.ts`). Ne connaît rien du
 * générateur qui l'utilise : brancher un nouveau générateur revient à lui passer son propre
 * adaptateur, jamais à dupliquer ce composant. Les 3 formats consomment le MÊME
 * `SectionExercice`/`BlocCorrection[]` produit par l'adaptateur (`construireEnonce`/
 * `construireCorrection`) — seul le rendu final diffère (`genererFeuilleExercicesDocx`/`...Html`/
 * `...Pdf`), jamais l'adaptateur lui-même. `progression` reflète l'avancement (exercices puis
 * corrections) pendant la génération, potentiellement longue pour N élevé (rasterisation KaTeX pour
 * Word/PDF, voir katexImage.ts) — le bouton reste désactivé le temps de la génération pour éviter un
 * double clic.
 */
export function BoutonExportWord<T,>({ adaptateur }: Props<T>) {
  const [format, setFormat] = useState<FormatExport>("docx");
  const [nombre, setNombre] = useState(5);
  const [progression, setProgression] = useState<ProgressionGeneration | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const enCours = progression !== null;

  async function onGenerer() {
    setErreur(null);
    setProgression({ etape: "exercices", indexCourant: 0, total: nombre });
    try {
      const genererBlob = format === "docx" ? genererFeuilleExercicesDocx : format === "pdf" ? genererFeuilleExercicesPdf : genererFeuilleExercicesHtml;
      const blob = await genererBlob(adaptateur, nombre, setProgression);
      const extension = FORMATS.find((f) => f.id === format)?.extension ?? "docx";
      declencherTelechargement(blob, `${adaptateur.nomFichierBase}-${nombre}-exercices.${extension}`);
    } catch (erreurGeneration) {
      setErreur("La génération a échoué — réessaie, ou réduis le nombre d'exercices.");
      console.error(erreurGeneration);
    } finally {
      setProgression(null);
    }
  }

  return (
    <div className="export-word">
      <label className="export-word-label">Feuille d'exercices</label>
      <div className="export-word-formats" role="group" aria-label="Format du fichier">
        {FORMATS.map((f) => (
          <button
            key={f.id}
            type="button"
            className={f.id === format ? "btn toggle-active" : "btn"}
            disabled={enCours}
            onClick={() => setFormat(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div className="export-word-row contenu-conditionnel">
        <input
          id="export-word-nombre"
          type="number"
          className="export-word-input"
          min={MIN_EXERCICES}
          max={MAX_EXERCICES}
          value={nombre}
          disabled={enCours}
          onChange={(e) => setNombre(Math.min(MAX_EXERCICES, Math.max(MIN_EXERCICES, Number(e.target.value) || MIN_EXERCICES)))}
        />
        <button type="button" className="btn export-word-bouton" onClick={onGenerer} disabled={enCours}>
          {enCours ? "Génération…" : "Générer"}
        </button>
      </div>
      {progression && (
        <p className="export-word-statut contenu-conditionnel">
          {progression.etape === "exercices" ? "Exercices" : "Corrections"} — {progression.indexCourant} / {progression.total}
        </p>
      )}
      {erreur && <p className="export-word-erreur contenu-conditionnel">{erreur}</p>}
    </div>
  );
}
