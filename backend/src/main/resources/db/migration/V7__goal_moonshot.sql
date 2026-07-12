-- FR-14: mark a goal as a "moonshot" — an ambitious version beyond current
-- resources — with a free-text vision of the ideal result. Aspirational
-- metadata only; it never affects progress or completion rules.
ALTER TABLE goals ADD COLUMN moonshot BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE goals ADD COLUMN moonshot_vision VARCHAR(3000);
