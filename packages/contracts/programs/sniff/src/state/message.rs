use anchor_lang::prelude::*;

#[account]
pub struct Message {
    pub from: Pubkey,
    pub to: Pubkey,
    pub id: String,
    pub subject: String,
    /* encrypted text */
    pub body: String,
    pub created_at: u32,
    /* public information about encryption and decryption */
    pub iv: String,
    pub salt: String,
}

impl Message {
    pub const LEN: usize = 8 + 32 + 32 + 34 + 512 + 4 + 20 + 36;
}
