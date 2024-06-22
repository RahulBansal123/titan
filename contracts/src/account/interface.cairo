#[starknet::interface]
trait ITitanAccount<TContractState> {
    /// @notice Changes the owner
    /// Must be called by the account and authorised by the owner.
    /// @param new_owner New owner address
    /// @param signature_r Signature R from the new owner 
    /// @param signature_S Signature S from the new owner 
    /// Signature is required to prevent changing to an address which is not in control of the user
    /// Signature is the Signed Message of this hash:
    /// hash = pedersen(0, (change_owner selector, chainid, contract address, old_owner))
    fn change_owner(
        ref self: TContractState, new_owner: felt252, signature_r: felt252, signature_s: felt252
    );

    // Views
    fn get_owner(self: @TContractState) -> felt252;
    fn get_name(self: @TContractState) -> felt252;
}
