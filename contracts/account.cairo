#[starknet::contract]
mod SimpleAccount {
    use ecdsa::check_ecdsa_signature;
    use starknet::{ClassHash, get_block_timestamp, get_caller_address, get_contract_address, VALIDATED, account::Call, SyscallResultTrait, get_tx_info};

    const NAME: felt252 = 'SimpleAccount';
    const VERSION_MAJOR: u8 = 1;
    const VERSION_MINOR: u8 = 0;
    const VERSION_PATCH: u8 = 0;

    #[storage]
    struct Storage {
        _owner: felt252, // Current account owner
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        AccountCreated: AccountCreated,
        TransactionExecuted: TransactionExecuted,
        OwnerChanged: OwnerChanged,
    }

    #[derive(Drop, starknet::Event)]
    struct AccountCreated {
        #[key]
        owner: felt252,
    }

    #[derive(Drop, starknet::Event)]
    struct TransactionExecuted {
        #[key]
        hash: felt252,
        response: Span<Span<felt252>>,
    }

    #[derive(Drop, starknet::Event)]
    struct OwnerChanged {
        new_owner: felt252,
    }

    #[constructor]
    fn constructor(ref self: ContractState, owner: felt252) {
        assert(owner != 0, 'simple/null-owner');
        self._owner.write(owner);
        self.emit(AccountCreated { owner });
    }

    #[external(v0)]
    impl Account of IAccount<ContractState> {
        fn __validate__(ref self: ContractState, calls: Array<Call>) -> felt252 {
            assert_caller_is_null();
            let tx_info = get_tx_info().unbox();
            self.assert_valid_calls_and_signature(calls.span(), tx_info.transaction_hash, tx_info.signature);
            VALIDATED
        }

        fn __execute__(ref self: ContractState, calls: Array<Call>) -> Array<Span<felt252>> {
            assert_caller_is_null();
            let retdata = execute_multicall(calls.span());
            let tx_info = get_tx_info().unbox();
            self.emit(TransactionExecuted { hash: tx_info.transaction_hash, response: retdata.span() });
            retdata
        }

        fn is_valid_signature(self: @ContractState, hash: felt252, signature: Array<felt252>) -> felt252 {
            if self.is_valid_span_signature(hash, signature.span()) {
                VALIDATED
            } else {
                0
            }
        }
    }

    #[external(v0)]
    impl SimpleAccountImpl of ISimpleAccount<ContractState> {
        fn change_owner(ref self: ContractState, new_owner: felt252, signature_r: felt252, signature_s: felt252) {
            assert(new_owner != 0, 'simple/null-owner');
            self.assert_valid_new_owner(new_owner, signature_r, signature_s);
            self._owner.write(new_owner);
            self.emit(OwnerChanged { new_owner });
        }

        fn get_owner(self: @ContractState) -> felt252 {
            self._owner.read()
        }

        fn get_version(self: @ContractState) -> (u8, u8, u8) {
            (VERSION_MAJOR, VERSION_MINOR, VERSION_PATCH)
        }

        fn get_name(self: @ContractState) -> felt252 {
            NAME
        }
    }

    #[generate_trait]
    impl Private of PrivateTrait {
        fn assert_valid_calls_and_signature(
            ref self: ContractState,
            calls: Span<Call>,
            execution_hash: felt252,
            signature: Span<felt252>,
        ) {
            let execution_info = get_execution_info().unbox();
            let account_address = execution_info.contract_address;

            // Ensure no self-calls
            assert_no_self_call(calls, account_address);

            // Validate signature
            self.assert_valid_span_signature(execution_hash, signature);
        }

        fn is_valid_span_signature(self: @ContractState, hash: felt252, signatures: Span<felt252>) -> bool {
            if signatures.len() != 2 {
                return false;
            }
            let signature_r = *signatures[0];
            let signature_s = *signatures[1];
            check_ecdsa_signature(hash, self._owner.read(), signature_r, signature_s)
        }

        fn assert_valid_span_signature(self: @ContractState, hash: felt252, signatures: Span<felt252>) {
            assert(self.is_valid_span_signature(hash, signatures), 'simple/invalid-signature');
        }

        fn assert_valid_new_owner(
            self: @ContractState, new_owner: felt252, signature_r: felt252, signature_s: felt252
        ) {
            let chain_id = get_tx_info().unbox().chain_id;
            let message_hash = PedersenTrait::new(0)
                .update(selector!("change_owner"))
                .update(chain_id)
                .update(get_contract_address().into())
                .update(self._owner.read())
                .update(4)
                .finalize();
            let is_valid = check_ecdsa_signature(message_hash, new_owner, signature_r, signature_s);
            assert(is_valid, 'simple/invalid-new-owner-signature');
        }
    }
}
