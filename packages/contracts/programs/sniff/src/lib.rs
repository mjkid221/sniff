use session_keys::{session_auth_or, Session, SessionError, SessionToken};
use {
    crate::error::*, anchor_lang::prelude::*, check_session_token, context::*, events::*, state::*,
    utils::*,
};

pub mod context;
pub mod error;
pub mod events;
pub mod state;
pub mod utils;

declare_id!("5QZqUCtYrCgLkXRvjPSL5PyPg4cuHrMp58Ts2dBR7vCG");

#[program]
pub mod sniff {
    use super::*;
    #[session_auth_or(
        ctx.accounts.user_account.authority.key() == ctx.accounts.authority.key(),
        SniffErrorCode::UnauthorizedSigner
    )]
    pub fn send_message(
        ctx: Context<SendMessage>,
        body: String,
        to: Pubkey,
        salt: String,
        iv: String,
    ) -> Result<()> {
        check_session_token(
            &ctx.accounts.session_token,
            ctx.accounts.payer.key,
            ctx.accounts.authority.key,
            ctx.program_id,
        )?;
        require!(body.chars().count() < 280, SniffErrorCode::InvalidBody);
        require!(salt.chars().count() == 16, SniffErrorCode::InvalidSalt);
        require!(iv.chars().count() == 32, SniffErrorCode::InvalidIv);

        let current_timestamp = Clock::get().unwrap().unix_timestamp as u32;
        let message = &mut ctx.accounts.message;
        let id = get_uuid(&current_timestamp, &body, &message.key());

        let from = ctx.accounts.authority.key();
        message.from = from;
        message.to = to;
        message.id = id.clone();
        message.body = body; // encrypted body, a ciphertext
        message.created_at = current_timestamp;
        message.salt = salt;
        message.iv = iv;

        emit!(NewMessageEvent { from, to, id });

        Ok(())
    }

    // TODO: add power sniff

    pub fn register(ctx: Context<Register>, diffie_pubkey: String) -> Result<()> {
        require!(
            diffie_pubkey.chars().count() == 64,
            SniffErrorCode::InvalidDiffie
        );

        let user_account = &mut ctx.accounts.user_account;

        user_account.diffie_pubkey = diffie_pubkey;
        user_account.authority = *ctx.accounts.authority.key;
        user_account.bump = ctx.bumps.user_account;

        Ok(())
    }
}
