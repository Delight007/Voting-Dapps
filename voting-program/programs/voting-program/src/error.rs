use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Only the election admin can perform this action")]
    Unauthorized,

    #[msg("The election is not active")]
    ElectionNotActive,

    #[msg("The election has not started yet")]
    ElectionNotStarted,

    #[msg("The election has already ended")]
    ElectionEnded,

    #[msg("Election start time must be before end time")]
    InvalidElectionTime,

    #[msg("Candidate is not approved")]
    CandidateNotApproved,

    #[msg("Voter is not approved")]
    VoterNotApproved,

    #[msg("Voter has already voted")]
    AlreadyVoted,

    #[msg("Candidate wallet does not match the registered wallet")]
    InvalidCandidate,

    #[msg("Voter wallet does not match the registered wallet")]
    InvalidVoter,

    #[msg("Invalid candidate status")]
    InvalidCandidateStatus,

    #[msg("Invalid voter status")]
    InvalidVoterStatus,

    #[msg("String exceeds the maximum allowed length")]
    StringTooLong,

    #[msg("Vote count overflow")]
    CounterOverflow,

    #[msg("New admin cannot be the default address")]
InvalidAdmin,
}