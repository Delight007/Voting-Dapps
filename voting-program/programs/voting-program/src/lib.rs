pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("DWBmTLQ8gcWeJGQJLunUWTKbAjrBiTeunDKyZ3hCCbFQ");

#[program]
pub mod voting_program {
    use super::*;

    pub fn initialize_election(
        ctx: Context<InitializeElection>,
        title: String,
        description: String,
        start_time: i64,
        end_time: i64,
    ) -> Result<()> {
        crate::instructions::initialize_election::handle_initialize_election(
            ctx,
            title,
            description,
            start_time,
            end_time,
        )
    }


    pub fn register_candidate(
    ctx: Context<RegisterCandidate>,
    name: String,
    about: String,
    avatar_url: String,
) -> Result<()> {
    crate::instructions::register_candidate::handle_register_candidate(
        ctx,
        name,
        about,
        avatar_url,
    )
}

pub fn approve_candidate(
    ctx: Context<ApproveCandidate>,
    admin_message: String,
) -> Result<()> {
    crate::instructions::approve_candidate::handle_approve_candidate(
        ctx,
        admin_message,
    )
}

pub fn reject_candidate(
    ctx: Context<RejectCandidate>,
    admin_message: String,
) -> Result<()> {
    crate::instructions::reject_candidate::handle_reject_candidate(
        ctx,
        admin_message,
    )
}

pub fn register_voter(
    ctx: Context<RegisterVoter>,
    name: String,
    bio: String,
    avatar_url: String,
) -> Result<()> {
    crate::instructions::register_voter::handle_register_voter(
        ctx,
        name,
        bio,
        avatar_url,
    )
}

pub fn approve_voter(
    ctx: Context<ApproveVoter>,
    admin_message: String,
) -> Result<()> {
    crate::instructions::approve_voter::handle_approve_voter(
        ctx,
        admin_message,
    )
}


pub fn reject_voter(
    ctx: Context<RejectVoter>,
    admin_message: String,
) -> Result<()> {
    crate::instructions::reject_voter::handle_reject_voter(
        ctx,
        admin_message,
    )

}

pub fn cast_vote(
    ctx: Context<CastVote>,
) -> Result<()> {
    crate::instructions::cast_vote::handle_cast_vote(ctx)

}

pub fn close_election(
    ctx: Context<CloseElection>,
) -> Result<()> {
    crate::instructions::close_election::handle_close_election(ctx)
}


pub fn update_election_period(
    ctx: Context<UpdateElectionPeriod>,
    start_time: i64,
    end_time: i64,
) -> Result<()> {
    crate::instructions::update_election_period::handle_update_election_period(
        ctx,
        start_time,
        end_time,
    )
}

pub fn transfer_admin(
    ctx: Context<TransferAdmin>,
    new_admin: Pubkey,
) -> Result<()> {
    crate::instructions::transfer_admin::handle_transfer_admin(
        ctx,
        new_admin,
    )
}

pub fn update_voter_profile(
    ctx: Context<UpdateVoterProfile>,
    name: String,
    bio: String,
    avatar_url: String,
) -> Result<()> {
    crate::instructions::update_voter_profile::handle_update_voter_profile(
        ctx,
        name,
        bio,
        avatar_url,
    )
}

pub fn update_candidate_profile(
    ctx: Context<UpdateCandidateProfile>,
    name: String,
    about: String,
    avatar_url: String,
) -> Result<()> {
    crate::instructions::update_candidate_profile::handle_update_candidate_profile(
        ctx,
        name,
        about,
        avatar_url,
    )
}
}