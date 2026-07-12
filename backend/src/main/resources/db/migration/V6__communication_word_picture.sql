-- FR-17.2: an optional short scenario that makes an abstract request feel
-- concrete and relatable, composed into the generated message body.
ALTER TABLE communication_messages ADD COLUMN word_picture VARCHAR(2000);
