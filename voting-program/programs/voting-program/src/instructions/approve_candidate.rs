use anchor_lang::prelude::*;

use crate::error::ErrorCode;
use crate::state::{Candidate, Election, Status};

#[derive(Accounts)]
pub struct ApproveCandidate<'info> {
    #[account(
        has_one = admin @ ErrorCode::Unauthorized
    )]
    pub election: Account<'info, Election>,

    #[account(
        mut,
        seeds = [
            crate::constants::CANDIDATE_SEED,
            election.key().as_ref(),
            candidate.wallet.as_ref()
        ],
        bump
    )]
    pub candidate: Account<'info, Candidate>,

    pub admin: Signer<'info>,
}

pub fn handle_approve_candidate(
    ctx: Context<ApproveCandidate>,
    admin_message: String,
) -> Result<()> {
    require!(
        admin_message.len() <= Candidate::MAX_ADMIN_MESSAGE_LENGTH,
        ErrorCode::StringTooLong
    );

    let candidate = &mut ctx.accounts.candidate;
    require!(
    candidate.status == Status::Pending,
    ErrorCode::InvalidCandidateStatus
);

    candidate.status = Status::Approved;
    candidate.admin_message = admin_message;

    Ok(())
}