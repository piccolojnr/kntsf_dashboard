ALTER TABLE `NfcCard`
MODIFY `status` ENUM('active', 'inactive', 'revoked', 'lost', 'stolen', 'replaced', 'damaged') NOT NULL DEFAULT 'inactive';
