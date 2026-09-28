use anchor_lang::prelude::*;

use crate::constants::VOTER_SEED;
use crate::error::ErrorCode;
use crate::state::{Election, Voter};

#[derive(Accounts)]
pub struct UpdateVoterProfile<'info> {
    pub election: Account<'info, Election>,

    #[account(
        mut,
        seeds = [
            VOTER_SEED,
            election.key().as_ref(),
            voter_wallet.key().as_ref()
        ],
        bump,
        constraint = voter.wallet == voter_wallet.key() @ ErrorCode::InvalidVoter
    )]
    pub voter: Account<'info, Voter>,

    pub voter_wallet: Signer<'info>,
}

pub fn handle_update_voter_profile(
    ctx: Context<UpdateVoterProfile>,
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

    voter.name = name;
    voter.bio = bio;
    voter.avatar_url = avatar_url;

    Ok(())
}