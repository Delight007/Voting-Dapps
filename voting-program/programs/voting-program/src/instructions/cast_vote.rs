use anchor_lang::prelude::*;

use crate::constants::{CANDIDATE_SEED, VOTER_SEED};
use crate::error::ErrorCode;
use crate::state::{Candidate, Election, Status, Voter};

#[derive(Accounts)]
pub struct CastVote<'info> {
    pub election: Account<'info, Election>,

    #[account(
        mut,
        seeds = [
            VOTER_SEED,
            election.key().as_ref(),
            voter_wallet.key().as_ref()
        ],
        bump
    )]
    pub voter: Account<'info, Voter>,

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

    pub voter_wallet: Signer<'info>,

    pub clock: Sysvar<'info, Clock>,
}

pub fn handle_cast_vote(
    ctx: Context<CastVote>,
) -> Result<()> {
    let election = &ctx.accounts.election;
    let voter = &mut ctx.accounts.voter;
    let candidate = &mut ctx.accounts.candidate;

    require!(
        election.is_active,
        ErrorCode::ElectionNotActive
    );

    let current_time = ctx.accounts.clock.unix_timestamp;

    require!(
        current_time >= election.start_time,
        ErrorCode::ElectionNotStarted
    );

    require!(
        current_time <= election.end_time,
        ErrorCode::ElectionEnded
    );

    require!(
        voter.status == Status::Approved,
        ErrorCode::VoterNotApproved
    );

    require!(
        candidate.status == Status::Approved,
        ErrorCode::CandidateNotApproved
    );

    require!(
        !voter.has_voted,
        ErrorCode::AlreadyVoted
    );

    candidate.vote_count = candidate
        .vote_count
        .checked_add(1)
        .ok_or(ErrorCode::CounterOverflow)?;

    voter.has_voted = true;

    Ok(())
}