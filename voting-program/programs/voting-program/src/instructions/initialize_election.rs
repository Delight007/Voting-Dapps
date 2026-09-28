use anchor_lang::prelude::*;
use crate::error::ErrorCode;
use crate::state::Election;

#[derive(Accounts)]
pub struct InitializeElection<'info> {
    #[account(
        init,
        payer = admin,
        space = Election::SPACE
    )]
    pub election: Account<'info, Election>,

    #[account(mut)]
    pub admin: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handle_initialize_election(
    ctx: Context<InitializeElection>,
    title: String,
    description: String,
    start_time: i64,
    end_time: i64,
) -> Result<()> {

     require!(
        start_time < end_time,
        ErrorCode::InvalidElectionTime
    );

        require!(
        title.len() <= Election::MAX_TITLE_LENGTH,
        ErrorCode::StringTooLong
    );

    require!(
        description.len() <= Election::MAX_DESCRIPTION_LENGTH,
        ErrorCode::StringTooLong
    );

    let election = &mut ctx.accounts.election;

    election.title = title;
    election.description = description;
    election.admin = ctx.accounts.admin.key();
    election.is_active = true;
    election.start_time = start_time;
    election.end_time = end_time;
    election.total_candidates = 0;
    election.total_voters = 0;

    Ok(())
}