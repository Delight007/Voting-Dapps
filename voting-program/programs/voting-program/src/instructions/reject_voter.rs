use anchor_lang::prelude::*;

use crate::constants::VOTER_SEED;
use crate::error::ErrorCode;
use crate::state::{Election, Status, Voter};

#[derive(Accounts)]
pub struct RejectVoter<'info> {
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

pub fn handle_reject_voter(
    ctx: Context<RejectVoter>,
    admin_message: String,
) -> Result<()> {
    require!(
        admin_message.len() <= Voter::MAX_ADMIN_MESSAGE_LENGTH,
        ErrorCode::StringTooLong
    );

    require!(
        !admin_message.is_empty(),
        ErrorCode::StringTooLong
    );

    let voter = &mut ctx.accounts.voter;

    voter.status = Status::Rejected;
    voter.admin_message = admin_message;

    Ok(())
}