use anchor_lang::prelude::*;

use crate::constants::VOTER_SEED;
use crate::error::ErrorCode;
use crate::state::{Election, Status, Voter};

#[derive(Accounts)]
pub struct ApproveVoter<'info> {
    #[account(
        has_one = admin @ ErrorCode::Unauthorized
    )]
    pub election: Account<'info, Election>,

    #[account(
        mut,
        seeds = [
            VOTER_SEED,
            election.key().as_ref(),
            voter.wallet.as_ref()
        ],
        bump
    )]
    pub voter: Account<'info, Voter>,

    pub admin: Signer<'info>,
}

pub fn handle_approve_voter(
    ctx: Context<ApproveVoter>,
    admin_message: String,
) -> Result<()> {
    require!(
        admin_message.len() <= Voter::MAX_ADMIN_MESSAGE_LENGTH,
        ErrorCode::StringTooLong
    );

    let voter = &mut ctx.accounts.voter;
 require!(
    voter.status == Status::Pending,
    ErrorCode::InvalidVoterStatus
);
    voter.status = Status::Approved;
    voter.admin_message = admin_message;

    Ok(())
}