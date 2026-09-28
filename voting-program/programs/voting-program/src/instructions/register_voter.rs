use anchor_lang::prelude::*;

use crate::constants::VOTER_SEED;
use crate::error::ErrorCode;
use crate::state::{Election, Status, Voter};

#[derive(Accounts)]
pub struct RegisterVoter<'info> {
    #[account(mut)]
    pub election: Account<'info, Election>,

    #[account(
        init,
        payer = voter_wallet,
        space = Voter::SPACE,
        seeds = [
            VOTER_SEED,
            election.key().as_ref(),
            voter_wallet.key().as_ref()
        ],
        bump
    )]
    pub voter: Account<'info, Voter>,

    #[account(mut)]
    pub voter_wallet: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handle_register_voter(
    ctx: Context<RegisterVoter>,
    name: String,
    bio: String,
    avatar_url: String,
) -> Result<()> {
    require!(
        name.len() <= Voter::MAX_NAME_LENGTH,
        ErrorCode::StringTooLong
    );

    require!(
        bio.len() <= Voter::MAX_BIO_LENGTH,
        ErrorCode::StringTooLong
    );

    require!(
        avatar_url.len() <= Voter::MAX_AVATAR_URL_LENGTH,
        ErrorCode::StringTooLong
    );

    let voter = &mut ctx.accounts.voter;

    require!(
    voter.status == Status::Pending,
    ErrorCode::InvalidVoterStatus
);
    let election = &mut ctx.accounts.election;

    voter.wallet = ctx.accounts.voter_wallet.key();
    voter.name = name;
    voter.bio = bio;
    voter.has_voted = false;
    voter.status = Status::Pending;
    voter.admin_message = String::new();
    voter.avatar_url = avatar_url;

    election.total_voters += 1;

    Ok(())
}