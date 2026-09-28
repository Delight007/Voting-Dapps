use anchor_lang::prelude::*;

use crate::state::{Candidate, Election, Status};
use crate::error::ErrorCode;
use crate::constants::CANDIDATE_SEED;

#[derive(Accounts)]
pub struct RegisterCandidate<'info> {
    #[account(
        mut,
    )]
    pub election: Account<'info, Election>,

    #[account(
        init,
        payer = candidate_wallet,
        space = Candidate::SPACE,
        seeds = [
            CANDIDATE_SEED,
            election.key().as_ref(),
            candidate_wallet.key().as_ref()
        ],
        bump
    )]
    pub candidate: Account<'info, Candidate>,

    #[account(mut)]
    pub candidate_wallet: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handle_register_candidate(
    ctx: Context<RegisterCandidate>,
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
    let election = &mut ctx.accounts.election;

    require!(
    election.is_active,
    ErrorCode::ElectionNotActive
);

    candidate.wallet = ctx.accounts.candidate_wallet.key();
    candidate.name = name;
    candidate.about = about;
    candidate.vote_count = 0;
    candidate.status = Status::Pending;
    candidate.admin_message = String::new();
    candidate.avatar_url = avatar_url;

   election.total_candidates = election
    .total_candidates
    .checked_add(1)
    .ok_or(ErrorCode::CounterOverflow)?;

    Ok(())
}