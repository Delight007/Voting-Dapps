use anchor_lang::prelude::*;

use crate::error::ErrorCode;
use crate::state::Election;

#[derive(Accounts)]
pub struct UpdateElectionPeriod<'info> {
    #[account(
        mut,
        has_one = admin @ ErrorCode::Unauthorized
    )]
    pub election: Account<'info, Election>,

    pub admin: Signer<'info>,
}

pub fn handle_update_election_period(
    ctx: Context<UpdateElectionPeriod>,
    start_time: i64,
    end_time: i64,
) -> Result<()> {
    require!(
        start_time < end_time,
        ErrorCode::InvalidElectionTime
    );

    let election = &mut ctx.accounts.election;

    require!(
        election.is_active,
        ErrorCode::ElectionNotActive
    );

    election.start_time = start_time;
    election.end_time = end_time;

    Ok(())
}