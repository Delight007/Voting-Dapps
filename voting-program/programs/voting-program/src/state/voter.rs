use anchor_lang::prelude::*;

use crate::state::candidate::Status;

#[account]
pub struct Voter {
    /// Voter wallet address
    pub wallet: Pubkey,

    /// Display name
    pub name: String,

    /// Short bio
    pub bio: String,

    /// Prevents double voting
    pub has_voted: bool,

    /// Admin approval status
    pub status: Status,

    /// Message from admin
    pub admin_message: String,

    /// Avatar image URL
    pub avatar_url: String,
}

impl Voter {
    pub const MAX_NAME_LENGTH: usize = 50;
    pub const MAX_BIO_LENGTH: usize = 500;
    pub const MAX_ADMIN_MESSAGE_LENGTH: usize = 300;
    pub const MAX_AVATAR_URL_LENGTH: usize = 200;

    pub const SPACE: usize =
        8 + // discriminator
        32 + // wallet
        4 + Self::MAX_NAME_LENGTH +
        4 + Self::MAX_BIO_LENGTH +
        1 + // has_voted
        1 + // status enum
        4 + Self::MAX_ADMIN_MESSAGE_LENGTH +
        4 + Self::MAX_AVATAR_URL_LENGTH;
}