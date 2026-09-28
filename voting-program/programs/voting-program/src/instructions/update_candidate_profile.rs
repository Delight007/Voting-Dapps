use anchor_lang::prelude::*;

use crate::constants::CANDIDATE_SEED;
use crate::error::ErrorCode;
use crate::state::{Candidate, Election, Status};

#[derive(Accounts)]
pub struct UpdateCandidateProfile<'info> {
    pub election: Account<'info, Election>,

    #[account(
        mut,
        seeds = [
            CANDIDATE_SEED,
            election.key().as_ref(),
            candidate_wallet.key().as_ref()
        ],
        bump,
        constraint = candidate.wallet == candidate_wallet.key() @ ErrorCode::InvalidCandidate
    )]
    pub candidate: Account<'info, Candidate>,

    pub candidate_wallet: Signer<'info>,
}

pub fn handle_update_candidate_profile(
    ctx: Context<UpdateCandidateProfile>,
    name: String,
    about: String,
    avatar_url: String,
) -> Result<()> {
    require!(
        name.len() <= Candidate::MAX_NAME_LENGTH,
        ErrorCode::StringTooLong
    );

    require!(
        about.len() <= Candidate::MAX_ABOUT_LENGTH,
        ErrorCode::StringTooLong
    );

    require!(
        avatar_url.len() <= Candidate::MAX_AVATAR_URL_LENGTH,
        ErrorCode::StringTooLong
    );

    let candidate = &mut ctx.accounts.candidate;

    candidate.name = name;
    candidate.about = about;
    candidate.avatar_url = avatar_url;

    // Changed campaign information must be reviewed again.
    candidate.status = Status::Pending;
    candidate.admin_message = String::new();

    Ok(())
}