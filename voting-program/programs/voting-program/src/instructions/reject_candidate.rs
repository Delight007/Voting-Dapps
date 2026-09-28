use anchor_lang::prelude::*;

use crate::constants::CANDIDATE_SEED;
use crate::error::ErrorCode;
use crate::state::{Candidate, Election, Status};

#[derive(Accounts)]
pub struct RejectCandidate<'info> {
    #[account(
        has_one = admin @ ErrorCode::Unauthorized
    )]
    pub election: Account<'info, Election>,

    #[account(
        mut,
        seeds = [
            CANDIDATE_SEED,
            election.key().as_ref(),
            candidate.wallet.as_ref()
        ],
        bump
    )]
    pub candidate: Account<'info, Candidate>,

    pub admin: Signer<'info>,
}

pub fn handle_reject_candidate(
    ctx: Context<RejectCandidate>,
    admin_message: String,
) -> Result<()> {
    require!(
        admin_message.len() <= Candidate::MAX_ADMIN_MESSAGE_LENGTH,
        ErrorCode::StringTooLong
    );

    require!(
        !admin_message.is_empty(),
        ErrorCode::StringTooLong
    );

    let candidate = &mut ctx.accounts.candidate;
    require!(
    candidate.status == Status::Pending,
    ErrorCode::InvalidCandidateStatus
);
    candidate.status = Status::Rejected;
    candidate.admin_message = admin_message;

    Ok(())
}