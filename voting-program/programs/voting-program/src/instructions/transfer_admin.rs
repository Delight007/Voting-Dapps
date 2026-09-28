use anchor_lang::prelude::*;

use crate::error::ErrorCode;
use crate::state::Election;

#[derive(Accounts)]
pub struct TransferAdmin<'info> {
    #[account(
        mut,
        has_one = admin @ ErrorCode::Unauthorized
    )]
    pub election: Account<'info, Election>,

    pub admin: Signer<'info>,
}

pub fn handle_transfer_admin(
    ctx: Context<TransferAdmin>,
    new_admin: Pubkey,
) -> Result<()> {
    require!(
        new_admin != Pubkey::default(),
        ErrorCode::InvalidAdmin
    );

    let election = &mut ctx.accounts.election;
    election.admin = new_admin;

    Ok(())
}