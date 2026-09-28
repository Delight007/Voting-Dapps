use anchor_lang::prelude::*;

use crate::error::ErrorCode;
use crate::state::Election;

#[derive(Accounts)]
pub struct CloseElection<'info> {
    #[account(
        mut,
        has_one = admin @ ErrorCode::Unauthorized
    )]
    pub election: Account<'info, Election>,

    pub admin: Signer<'info>,
}

pub fn handle_close_election(
    ctx: Context<CloseElection>,
) -> Result<()> {
    let election = &mut ctx.accounts.election;

    require!(
        election.is_active,
        ErrorCode::ElectionNotActive
    );

    election.is_active = false;

    Ok(())
}