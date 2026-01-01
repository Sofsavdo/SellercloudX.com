-- Add AnyDesk fields to partners table
ALTER TABLE partners ADD COLUMN anydesk_id TEXT;
ALTER TABLE partners ADD COLUMN anydesk_password TEXT;
