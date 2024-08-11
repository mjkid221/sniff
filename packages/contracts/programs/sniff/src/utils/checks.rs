use anchor_lang::prelude::*;
use session_keys::{SessionError, SessionToken};

use crate::SniffErrorCode;

pub fn check_session_token(
    local_session_token: &Option<Account<SessionToken>>,
    local_payer: &Pubkey,
    authority: &Pubkey,
    target_program: &Pubkey,
) -> Result<()> {
    if let Some(session_token) = local_session_token {
        // Check if the authority in the session token matches the provided authority
        if !authority.eq(&session_token.authority) {
            return Err(SessionError::InvalidToken.into());
        }

        let seeds = &[
            SessionToken::SEED_PREFIX.as_bytes(),
            target_program.as_ref(),
            local_payer.as_ref(),
            session_token.authority.as_ref(),
        ];

        // Check if the derived address matches the session token's address
        let (pda, _) = Pubkey::find_program_address(seeds, &session_keys::id());
        if pda != session_token.key() {
            return Err(SessionError::InvalidToken.into());
        }

        // Check if the session token is still valid
        let now = Clock::get()?.unix_timestamp;
        if now >= session_token.valid_until {
            return Err(SessionError::InvalidToken.into());
        }
    } else {
        // Check if authority matches local payer
        if authority != local_payer {
            return Err(SniffErrorCode::UnauthorizedSigner.into());
        }
    }
    Ok(())
}
