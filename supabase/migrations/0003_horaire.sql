-- =================================================================================================
-- Math-Belgium — horaire de la semaine du carnet de matière vue (phase 2, suite)
-- =================================================================================================
--
-- À exécuter APRÈS 0001_comptes.sql et 0002_carnet.sql, dans l'éditeur SQL du projet Supabase
-- (SQL Editor → New query → coller TOUT ce fichier → Run). Idempotent : le relancer ne casse rien
-- et ne perd aucune donnée (tables `if not exists`, colonne `add column if not exists`,
-- contraintes ajoutées seulement si absentes, fonctions `create or replace`, politiques et
-- déclencheurs supprimés puis recréés). Aucune clé secrète, aucun jeton : rien à remplacer.
--
-- Résultat attendu : « Success. No rows returned ». La page /carnet passe d'« Horaire pas encore
-- activé » à la section « Mon horaire » (recharger la page ; Supabase peut mettre quelques
-- secondes à voir les nouvelles tables). Tant que ce fichier n'est pas exécuté, le carnet marche
-- comme avant, sans horaire.
--
-- Contenu :
--   horaires_ecoles  la grille horaire d'UNE école du professeur (une ligne par école) : début des
--              cours, durée d'une heure, nombre d'heures, pauses (« après H2 : récréation 20 min »),
--              heures du mercredi, heures corrigées à la main. Les heures des pauses et la fin des
--              cours ne sont PAS stockées : le site les calcule (aucun réglage contradictoire).
--   horaire_cases    l'horaire de la semaine : (école, jour 1–5, heure 1–15) → une classe. Case
--              vide = pas de ligne.
--   seances    nouvelle colonne `numero_heure_fin` (heure double « H1–H2 » = UNE séance) ;
--              les séances existantes restent valides (colonne nulle).
--   RLS        partout : chaque professeur ne voit / modifie que SES lignes, compte actif
--              (même `est_actif()` que 0001) ; `anon` n'a aucun droit ; l'admin ne voit rien.
--   cohérence  clés étrangères COMPOSÉES, comme 0002 : une grille ne peut viser qu'une école à soi ;
--              une case qu'une école à soi ET une classe à soi QUI APPARTIENT À CETTE ÉCOLE
--              (clé (classe_id, ecole_id, proprietaire) → classes (id, ecole_id, proprietaire)).
--   suppression  supprimer une école supprime sa grille et ses cases ; supprimer une classe
--              supprime ses cases ; changer une classe d'école retire ses cases de l'ancien horaire
--              (déclencheur) ; `supprimer_mon_compte()` (0001) efface toujours tout (cascade).
--
-- Plus tard (PAS fait, décision de l'utilisateur) : semaine A / B. La colonne
-- `horaire_cases.semaine` existe déjà ('A', 'B' ou NULL = chaque semaine ; toujours NULL pour
-- l'instant) et l'index d'unicité en tient compte : il suffira d'une migration 0004 NON destructive
-- (référence de la semaine A dans `carnet_reglages`, règle « une case NULL exclut A et B au même
-- endroit ») et du site.
-- =================================================================================================

-- -------------------------------------------------------------------------------------------------
-- Fonctions de validation des colonnes jsonb (pures, sans accès aux tables)
-- -------------------------------------------------------------------------------------------------

-- Pauses : tableau d'au plus 6 objets { "apres": 1 … nombre_heures − 1, "duree": 5 … 180,
-- "type": "recreation" | "midi" | "autre" }, exactement ces trois clés, au plus une par position,
-- au plus un midi.
create or replace function public.pauses_horaire_valides(j jsonb, nombre int)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select jsonb_typeof(j) = 'array'
     and jsonb_array_length(j) <= 6
     and not exists (
       select 1 from jsonb_array_elements(j) e
        where case
                when jsonb_typeof(e) <> 'object' then true
                when (select count(*) from jsonb_object_keys(e)) <> 3 then true
                when jsonb_typeof(e -> 'apres') <> 'number' or jsonb_typeof(e -> 'duree') <> 'number' or jsonb_typeof(e -> 'type') <> 'string' then true
                when (e ->> 'apres') !~ '^[0-9]{1,2}$' or (e ->> 'duree') !~ '^[0-9]{1,3}$' then true
                when (e ->> 'apres')::int not between 1 and nombre - 1 then true
                when (e ->> 'duree')::int not between 5 and 180 then true
                when (e ->> 'type') not in ('recreation', 'midi', 'autre') then true
                else false
              end
     )
     and (select count(distinct e ->> 'apres') from jsonb_array_elements(j) e) = jsonb_array_length(j)
     and (select count(*) from jsonb_array_elements(j) e where e ->> 'type' = 'midi') <= 1;
$$;

-- Heures corrigées à la main : tableau d'au plus 15 objets { "heure": 1 … nombre_heures,
-- "debut": "HH:MM", "fin": "HH:MM" } (fin après début), exactement ces trois clés, une par heure.
create or replace function public.exceptions_horaire_valides(j jsonb, nombre int)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select jsonb_typeof(j) = 'array'
     and jsonb_array_length(j) <= 15
     and not exists (
       select 1 from jsonb_array_elements(j) e
        where case
                when jsonb_typeof(e) <> 'object' then true
                when (select count(*) from jsonb_object_keys(e)) <> 3 then true
                when jsonb_typeof(e -> 'heure') <> 'number' or jsonb_typeof(e -> 'debut') <> 'string' or jsonb_typeof(e -> 'fin') <> 'string' then true
                when (e ->> 'heure') !~ '^[0-9]{1,2}$' then true
                when (e ->> 'heure')::int not between 1 and nombre then true
                when (e ->> 'debut') !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' or (e ->> 'fin') !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' then true
                when (e ->> 'fin') <= (e ->> 'debut') then true
                else false
              end
     )
     and (select count(distinct e ->> 'heure') from jsonb_array_elements(j) e) = jsonb_array_length(j);
$$;

-- La journée calculée (sans les corrections à la main) doit finir avant minuit.
create or replace function public.journee_horaire_tient(debut time, duree int, nombre int, pauses jsonb)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select extract(hour from debut) * 60 + extract(minute from debut) + duree * nombre
         + coalesce((select sum(case when (e ->> 'duree') ~ '^[0-9]{1,3}$' then (e ->> 'duree')::int else 0 end)
                       from jsonb_array_elements(case when jsonb_typeof(pauses) = 'array' then pauses else '[]'::jsonb end) e), 0)
         <= 23 * 60 + 59;
$$;

-- -------------------------------------------------------------------------------------------------
-- Clé (id, ecole_id, proprietaire) sur classes : cible de la clé composée des cases
-- -------------------------------------------------------------------------------------------------

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'classes_id_ecole_proprietaire_uniq' and conrelid = 'public.classes'::regclass) then
    alter table public.classes add constraint classes_id_ecole_proprietaire_uniq unique (id, ecole_id, proprietaire);
  end if;
end;
$$;

-- -------------------------------------------------------------------------------------------------
-- Tables
-- -------------------------------------------------------------------------------------------------

create table if not exists public.horaires_ecoles (
  ecole_id        uuid not null,
  proprietaire    uuid not null default auth.uid() references public.profils (id) on delete cascade,
  debut           time not null default '08:45' check (debut between time '06:00' and time '20:00'),
  duree_heure     smallint not null default 50 check (duree_heure between 20 and 240),
  nombre_heures   smallint not null default 7 check (nombre_heures between 1 and 15),
  pauses          jsonb not null default '[{"apres": 2, "duree": 20, "type": "recreation"}, {"apres": 4, "duree": 60, "type": "midi"}]'::jsonb,
  -- NULL : les heures avant midi (toutes s'il n'y a pas de midi) ; 0 : pas de cours le mercredi.
  heures_mercredi smallint,
  exceptions      jsonb not null default '[]'::jsonb,
  cree_le         timestamptz not null default now(),
  modifie_le      timestamptz not null default now(),
  constraint horaires_ecoles_pauses_valides check (public.pauses_horaire_valides(pauses, nombre_heures) and octet_length(pauses::text) <= 2000),
  constraint horaires_ecoles_exceptions_valides check (public.exceptions_horaire_valides(exceptions, nombre_heures) and octet_length(exceptions::text) <= 3000),
  constraint horaires_ecoles_mercredi check (heures_mercredi is null or heures_mercredi between 0 and nombre_heures),
  constraint horaires_ecoles_journee_tient check (public.journee_horaire_tient(debut, duree_heure, nombre_heures, pauses)),
  -- Une grille par école. Clé (ecole_id, proprietaire) et non (ecole_id) seule : viser l'école d'un
  -- autre donne l'erreur de clé étrangère, sans révéler si cette école a déjà une grille.
  constraint horaires_ecoles_pkey primary key (ecole_id, proprietaire),
  -- L'école doit appartenir au MÊME professeur (clé composée) ; la supprimer supprime la grille.
  constraint horaires_ecoles_ecole_du_proprietaire foreign key (ecole_id, proprietaire)
    references public.ecoles (id, proprietaire) on delete cascade
);
comment on table public.horaires_ecoles is 'Horaire du carnet : grille horaire d''une école d''un professeur (début, durée d''une heure, nombre d''heures, pauses, mercredi, corrections). Heures des pauses et fin calculées par le site.';
create index if not exists horaires_ecoles_proprietaire_idx on public.horaires_ecoles (proprietaire);

create table if not exists public.horaire_cases (
  id           uuid primary key default gen_random_uuid(),
  proprietaire uuid not null default auth.uid() references public.profils (id) on delete cascade,
  ecole_id     uuid not null,
  -- 1 = lundi … 5 = vendredi.
  jour         smallint not null check (jour between 1 and 5),
  heure        smallint not null check (heure between 1 and 15),
  classe_id    uuid not null,
  -- Semaine A / B : prévu pour plus tard. NULL = chaque semaine (seule valeur utilisée aujourd'hui).
  semaine      text check (semaine is null or semaine in ('A', 'B')),
  cree_le      timestamptz not null default now(),
  modifie_le   timestamptz not null default now(),
  constraint horaire_cases_ecole_du_proprietaire foreign key (ecole_id, proprietaire)
    references public.ecoles (id, proprietaire) on delete cascade,
  -- La classe doit appartenir au MÊME professeur ET à CETTE école ; la supprimer supprime ses cases.
  constraint horaire_cases_classe_de_l_ecole foreign key (classe_id, ecole_id, proprietaire)
    references public.classes (id, ecole_id, proprietaire) on delete cascade
);
comment on table public.horaire_cases is 'Horaire du carnet : (école, jour, heure) → classe du professeur. Aucune donnée d''élève.';
-- Une seule classe par (école, jour, heure[, semaine]).
create unique index if not exists horaire_cases_unique on public.horaire_cases (proprietaire, ecole_id, jour, heure, coalesce(semaine, '*'));
create index if not exists horaire_cases_classe_idx on public.horaire_cases (classe_id, ecole_id, proprietaire);

-- Séances : dernière heure d'une heure double (« H1–H2 ») ; NULL pour une heure simple et pour
-- toutes les séances notées avant 0003.
alter table public.seances add column if not exists numero_heure_fin smallint;
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'seances_numero_heure_fin_valide' and conrelid = 'public.seances'::regclass) then
    alter table public.seances add constraint seances_numero_heure_fin_valide
      check (numero_heure_fin is null or (numero_heure is not null and numero_heure_fin between 2 and 15 and numero_heure_fin > numero_heure));
  end if;
end;
$$;

drop trigger if exists horaires_ecoles_modifie_le on public.horaires_ecoles;
create trigger horaires_ecoles_modifie_le before update on public.horaires_ecoles
  for each row execute function public.toucher_modifie_le();
drop trigger if exists horaire_cases_modifie_le on public.horaire_cases;
create trigger horaire_cases_modifie_le before update on public.horaire_cases
  for each row execute function public.toucher_modifie_le();

-- Une classe qui change d'école quitte l'horaire de l'ancienne (sinon la clé composée bloquerait
-- la modification). Droits de l'appelant (SECURITY INVOKER) : le RLS s'applique, il ne touche que
-- ses propres cases.
create or replace function public.horaire_classe_change_ecole()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.ecole_id is distinct from old.ecole_id then
    delete from public.horaire_cases c where c.classe_id = old.id and c.ecole_id = old.ecole_id;
  end if;
  return new;
end;
$$;

drop trigger if exists classes_change_ecole_horaire on public.classes;
create trigger classes_change_ecole_horaire before update of ecole_id on public.classes
  for each row execute function public.horaire_classe_change_ecole();

-- -------------------------------------------------------------------------------------------------
-- Droits de base : rien pour `anon` ; `authenticated` peut agir, le RLS filtre les lignes.
-- -------------------------------------------------------------------------------------------------

revoke all on public.horaires_ecoles, public.horaire_cases from anon;
revoke all on public.horaires_ecoles, public.horaire_cases from authenticated;
grant select, insert, update, delete on public.horaires_ecoles, public.horaire_cases to authenticated;

revoke all on function public.pauses_horaire_valides(jsonb, int) from public, anon;
revoke all on function public.exceptions_horaire_valides(jsonb, int) from public, anon;
revoke all on function public.journee_horaire_tient(time, int, int, jsonb) from public, anon;
revoke all on function public.horaire_classe_change_ecole() from public, anon;
grant execute on function public.pauses_horaire_valides(jsonb, int) to authenticated;
grant execute on function public.exceptions_horaire_valides(jsonb, int) to authenticated;
grant execute on function public.journee_horaire_tient(time, int, int, jsonb) to authenticated;
grant execute on function public.horaire_classe_change_ecole() to authenticated;

-- -------------------------------------------------------------------------------------------------
-- Row Level Security : uniquement ses lignes, compte actif (comme `classes` et `seances`).
-- -------------------------------------------------------------------------------------------------

alter table public.horaires_ecoles enable row level security;
alter table public.horaire_cases enable row level security;

drop policy if exists horaires_ecoles_proprietaire on public.horaires_ecoles;
create policy horaires_ecoles_proprietaire on public.horaires_ecoles for all to authenticated
  using (proprietaire = (select auth.uid()) and (select public.est_actif()))
  with check (proprietaire = (select auth.uid()) and (select public.est_actif()));

drop policy if exists horaire_cases_proprietaire on public.horaire_cases;
create policy horaire_cases_proprietaire on public.horaire_cases for all to authenticated
  using (proprietaire = (select auth.uid()) and (select public.est_actif()))
  with check (proprietaire = (select auth.uid()) and (select public.est_actif()));

-- Supabase recharge son cache de schéma à chaque DDL ; on le demande quand même (sans effet ailleurs).
notify pgrst, 'reload schema';
