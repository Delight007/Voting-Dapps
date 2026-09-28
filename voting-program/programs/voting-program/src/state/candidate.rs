use anchor_lang::prelude::*;

/// Approval status controlled by the admin
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum Status {
    Pending,
    Approved,
    Rejected,
}

#[account]
pub struct Candidate {
    /// Candidate wallet address
    pub wallet: Pubkey,

    /// Display name
    pub name: String,

    /// Candidate manifesto / about section
    pub about: String,

    /// Number of votes received
    pub vote_count: u64,

    /// Admin approval status
    pub status: Status,

    /// Message from admin (approval or rejection reason)
    pub admin_message: String,

    /// Avatar image URL (Cloudinary/IPFS)
    pub avatar_url: String,
}

impl Candidate {
    pub const MAX_NAME_LENGTH: usize = 50;
    pub const MAX_ABOUT_LENGTH: usize = 500;
    pub const MAX_ADMIN_MESSAGE_LENGTH: usize = 300;
    pub const MAX_AVATAR_URL_LENGTH: usize = 200;

    pub const SPACE: usize =
        8 + // discriminator
        32 + // wallet
        4 + Self::MAX_NAME_LENGTH +
        4 + Self::MAX_ABOUT_LENGTH +
        8 + // vote_count
        1 + // status enum
        4 + Self::MAX_ADMIN_MESSAGE_LENGTH +
        4 + Self::MAX_AVATAR_URL_LENGTH;
}