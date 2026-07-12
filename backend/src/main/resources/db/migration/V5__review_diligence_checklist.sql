-- FR-16: diligence checklist self-assessment on reviews. All five answers
-- are nullable; a review either answers every question or skips the whole
-- checklist (enforced in the service layer).
ALTER TABLE reviews ADD COLUMN diligence_clear_vision BOOLEAN;
ALTER TABLE reviews ADD COLUMN diligence_worked_plan BOOLEAN;
ALTER TABLE reviews ADD COLUMN diligence_used_leverage BOOLEAN;
ALTER TABLE reviews ADD COLUMN diligence_priority_first BOOLEAN;
ALTER TABLE reviews ADD COLUMN diligence_smarter_route BOOLEAN;
ALTER TABLE reviews ADD COLUMN diligence_note VARCHAR(2000);
