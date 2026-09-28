use anchor_lang::prelude::*;

#[account]
pub struct Election {
    pub title: String,
    pub description: String,
    pub admin: Pubkey,
    pub is_active: bool,
    pub start_time: i64,
    pub end_time: i64,
    pub total_candidates: u64,
    pub total_voters: u64,
}

impl Election {
    pub const MAX_TITLE_LENGTH: usize = 100;
    pub const MAX_DESCRIPTION_LENGTH: usize = 500;

    pub const SPACE: usize =
        8 + // discriminator
        4 + Self::MAX_TITLE_LENGTH +
        4 + Self::MAX_DESCRIPTION_LENGTH +
        32 + // admin pubkey
        1 + // is_active
        8 + // start_time
        8 + // end_time
        8 + // total_candidates
        8;  // total_voters
}