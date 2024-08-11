use anchor_lang::prelude::*;
use session_keys::{Session, SessionToken};

use crate::{Message, UserAccount};

#[derive(Accounts, Session)]
pub struct SendMessage<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        init,
        payer = payer,
        space = Message::LEN,
    )]
    pub message: Account<'info, Message>,
    #[account(seeds = [b"user-account", authority.key().as_ref()], bump)]
    pub user_account: Account<'info, UserAccount>,
    #[session(signer = payer, authority = authority.key())]
    pub session_token: Option<Account<'info, SessionToken>>,
    pub system_program: Program<'info, System>,
    #[account(mut)]
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct Register<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        init,
        payer = authority,
        space =
            8  +          // discriminator
            4  + 64 +     // public key
            32 +          // authority
            1,            // bump
       seeds = [b"user-account", authority.key().as_ref()],
       bump
    )]
    pub user_account: Account<'info, UserAccount>,
    pub system_program: Program<'info, System>,
}
