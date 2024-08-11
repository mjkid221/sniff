use anchor_lang::prelude::*;

#[event]
pub struct NewMessageEvent {
    pub from: Pubkey,
    pub to: Pubkey,
    pub id: String,
}
