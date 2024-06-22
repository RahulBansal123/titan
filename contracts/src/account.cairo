use serde::Serde;
use starknet::ContractAddress;
use array::ArrayTrait;
use array::SpanTrait;
use option::OptionTrait;
use starknet::account::Call;


#[starknet::interface]
trait IAccount<TContractState> {
    fn __validate_deploy__(
        self: @TContractState,
        class_hash: felt252,
        contract_address_salt: felt252,
        public_key_: felt252
    ) -> felt252;
    fn __validate_declare__(self: @TContractState, class_hash: felt252) -> felt252;
    fn __validate__(self: @TContractState, calls: Array<Call>) -> felt252;
    fn __execute__(ref self: TContractState, calls: Array<Call>) -> Array<Span<felt252>>;
    fn deploy(
        self: @TContractState,
        class_hash: felt252,
        contract_address_salt: felt252,
        name_: felt252,
        symbol_: felt252,
        decimals: felt252,
        initial_supply: felt252,
        recipient: felt252
    ) -> (ContractAddress, core::array::Span::<core::felt252>);
    fn is_valid_signature(
        self: @TContractState, hash: felt252, signature: Array<felt252>
    ) -> felt252;
}

#[starknet::interface]
trait ITitanAccount<TContractState> {
    fn change_owner(
        ref self: TContractState, new_owner: felt252, signature_r: felt252, signature_s: felt252
    );
    fn get_owner(self: @TContractState) -> felt252;
    fn get_name(self: @TContractState) -> felt252;
}

#[starknet::contract(account)]
mod TitanAccount {
    use array::ArrayTrait;
    use array::SpanTrait;
    use box::BoxTrait;
    use ecdsa::check_ecdsa_signature;
    use option::OptionTrait;
    use starknet::account::Call;
    use starknet::ContractAddress;
    use zeroable::Zeroable;
    use starknet::syscalls::deploy_syscall;
    use core::result::ResultTrait;
    use starknet::class_hash::ClassHash;
    use starknet::class_hash::Felt252TryIntoClassHash;
    use traits::TryInto;

    const NAME: felt252 = 'TitanAccount';


    // Define the contract's storage variables
    #[storage]
    struct Storage {
        public_key: felt252
    }

    // Constructor function for initializing the contract
    #[constructor]
    fn constructor(ref self: ContractState, public_key_: felt252) {
        self.public_key.write(public_key_);
    }

    // Internal function to validate the transaction signature
    fn validate_transaction(self: @ContractState) -> felt252 {
        assert(starknet::get_caller_address().is_zero(), 'titan/non-null-caller');
        let tx_info = starknet::get_tx_info().unbox(); // Unbox transaction info
        let signature = tx_info.signature; // Extract signature
        assert(signature.len() == 2_u32, 'titan/invalid-sig-length'); // Check signature length

        starknet::VALIDATED // Return validation status
    }

    fn execute_multicall(mut calls: Span<Call>) -> Array<Span<felt252>> {
        let mut result = array![];
        let mut index = 0;
        while let Option::Some(call) = calls
            .pop_front() {
                match starknet::call_contract_syscall(*call.to, *call.selector, *call.calldata) {
                    Result::Ok(retdata) => {
                        result.append(retdata);
                        index += 1;
                    },
                    Result::Err(_revert_reason) => {},
                }
            };
        result
    }

    #[abi(embed_v0)]
    impl Account of super::IAccount<ContractState> {
        fn deploy(
            self: @ContractState,
            class_hash: felt252,
            contract_address_salt: felt252,
            name_: felt252,
            symbol_: felt252,
            decimals: felt252,
            initial_supply: felt252,
            recipient: felt252
        ) -> (ContractAddress, core::array::Span::<core::felt252>) {
            let mut calldata = ArrayTrait::new();
            calldata.append(name_);
            calldata.append(symbol_);
            calldata.append(decimals);
            calldata.append(initial_supply);
            calldata.append(recipient);
            let (address0, something_else) = deploy_syscall(
                class_hash.try_into().unwrap(), contract_address_salt, calldata.span(), false
            )
                .unwrap();
            (address0, something_else)
        }

        fn is_valid_signature(
            self: @ContractState, hash: felt252, signature: Array<felt252>
        ) -> felt252 {
            if signature.len() != 2 {
                return 0;
            }
            let signature_r = *signature[0];
            let signature_s = *signature[1];
            let is_valid = ecdsa::check_ecdsa_signature(
                hash, self.public_key.read(), signature_r, signature_s
            );

            if is_valid {
                starknet::VALIDATED
            } else {
                0
            }
        }

        // Validate contract deployment
        fn __validate_deploy__(
            self: @ContractState,
            class_hash: felt252,
            contract_address_salt: felt252,
            public_key_: felt252
        ) -> felt252 {
            validate_transaction(self)
        }

        // Validate contract declaration
        fn __validate_declare__(self: @ContractState, class_hash: felt252) -> felt252 {
            validate_transaction(self)
        }

        // Validate contract execution
        fn __validate__(self: @ContractState, calls: Array<Call>) -> felt252 {
            validate_transaction(self)
        }

        // Execute a contract call
        fn __execute__(ref self: ContractState, calls: Array<Call>) -> Array<Span<felt252>> {
            assert(starknet::get_caller_address().is_zero(), 'titan/invalid-caller');

            let tx_info = starknet::get_tx_info().unbox(); // Unbox transaction info
            assert(tx_info.version != 0, 'titan/invalid-tx-version');

            let retdata = execute_multicall(calls.span());
            retdata
        }
    }

    #[abi(embed_v0)]
    impl TitanAccountImpl of super::ITitanAccount<ContractState> {
        fn change_owner(
            ref self: ContractState, new_owner: felt252, signature_r: felt252, signature_s: felt252
        ) {
            assert(new_owner != 0, 'titan/null-owner');

            self.public_key.write(new_owner);
        }

        fn get_owner(self: @ContractState) -> felt252 {
            self.public_key.read()
        }

        fn get_name(self: @ContractState) -> felt252 {
            NAME
        }
    }
}
