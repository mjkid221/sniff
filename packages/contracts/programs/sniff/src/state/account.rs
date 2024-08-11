use anchor_lang::prelude::*;

#[account]
pub struct UserAccount {
    /* pubkey from diffie helman exchange */
    pub diffie_pubkey: String,
    pub authority: Pubkey,
    pub bump: u8,
}