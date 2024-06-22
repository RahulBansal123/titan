#[starknet::contract]
mod TitanAccount {
    use titan::account::interface::{ITitanAccount};
    use ecdsa::check_ecdsa_signature;
    use hash::HashStateTrait;
    use pedersen::PedersenTrait;
    use starknet::{
        ClassHash, get_block_timestamp, get_caller_address, get_contract_address, VALIDATED,
        replace_class_syscall, account::Call, SyscallResultTrait, get_tx_info, get_execution_info
    };

    const NAME: felt252 = 'TitanAccount';
    const ERC165_IERC165_INTERFACE_ID: felt252 =
        0x3f918d17e5ee77373b56385708f855659a07f75997f365cf87748628532a055;
    const ERC165_ACCOUNT_INTERFACE_ID: felt252 =
        0x2ceccef7f994940b3962a6c67e0ba4fcd37df7d131417c604f91e03caecc1cd;


    #[storage]
    struct Storage {
        _signer: felt252
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        AccountCreated: AccountCreated,
        TransactionExecuted: TransactionExecuted,
        OwnerChanged: OwnerChanged
    }

    /// @notice Emitted exactly once when the account is initialized
    /// @param account The account address
    /// @param owner The owner address
    #[derive(Drop, starknet::Event)]
    struct AccountCreated {
        #[key]
        owner: felt252,
    }

    /// @notice Emitted when the account executes a transaction
    /// @param hash The transaction hash
    /// @param response The data returned by the methods called
    #[derive(Drop, starknet::Event)]
    struct TransactionExecuted {
        #[key]
        hash: felt252,
        response: Span<Span<felt252>>
    }

    /// @notice The account owner was changed
    /// @param new_owner new owner address
    #[derive(Drop, starknet::Event)]
    struct OwnerChanged {
        new_owner: felt252
    }

    #[constructor]
    fn constructor(ref self: ContractState, owner: felt252) {
        assert(owner != 0, 'titan/null-owner');
        self._signer.write(owner);
        self.emit(AccountCreated { owner });
    }

    #[external(v0)]
    impl Account of IAccount<ContractState> {
        fn __validate__(ref self: ContractState, calls: Array<Call>) -> felt252 {
            assert(get_caller_address().is_zero(), 'titan/non-null-caller');
            let tx_info = get_tx_info().unbox();
            self
                .assert_valid_calls_and_signature(
                    calls.span(), tx_info.transaction_hash, tx_info.signature
                );
            VALIDATED
        }

        fn __execute__(ref self: ContractState, calls: Array<Call>) -> Array<Span<felt252>> {
            assert(get_caller_address().is_zero(), 'titan/non-null-caller');
            let tx_info = get_tx_info().unbox();
            let retdata = execute_multicall(calls.span());
            self
                .emit(
                    TransactionExecuted { hash: tx_info.transaction_hash, response: retdata.span() }
                );
            retdata
        }

        fn is_valid_signature(
            self: @ContractState, hash: felt252, signature: Array<felt252>
        ) -> felt252 {
            if self.is_valid_span_signature(hash, signature.span()) {
                VALIDATED
            } else {
                0
            }
        }
    }

    #[external(v0)]
    impl TitanAccountImpl of ITitanAccount<ContractState> {
        fn change_owner(
            ref self: ContractState, new_owner: felt252, signature_r: felt252, signature_s: felt252
        ) {
            assert(new_owner != 0, 'titan/null-owner');
            self.assert_valid_new_owner(new_owner, signature_r, signature_s);

            self._signer.write(new_owner);
            self.emit(OwnerChanged { new_owner });
        }

        fn get_owner(self: @ContractState) -> felt252 {
            self._signer.read()
        }

        fn get_name(self: @ContractState) -> felt252 {
            NAME
        }
    }

    #[external(v0)]
    impl Erc165Impl of IErc165<ContractState> {
        fn supports_interface(self: @ContractState, interface_id: felt252) -> bool {
            if interface_id == ERC165_IERC165_INTERFACE_ID {
                true
            } else if interface_id == ERC165_ACCOUNT_INTERFACE_ID {
                true
            } else {
                false
            }
        }
    }

    #[generate_trait]
    impl Private of PrivateTrait {
        fn assert_valid_calls_and_signature(
            ref self: ContractState,
            calls: Span<Call>,
            execution_hash: felt252,
            signature: Span<felt252>
        ) {
            let execution_info = get_execution_info().unbox();
            let account_address = execution_info.contract_address;

            if calls.len() == 1 {
                let call = calls.at(0);
                if *call.to == account_address {
                    let selector = *call.selector;
                    assert(selector != selector!("execute_after_upgrade"), 'titan/forbidden-call');
                }
            } else {
                loop {
                    match calls.pop_front() {
                        Option::Some(call) => assert(
                            *call.to != account_address, 'titan/no-multicall-to-self'
                        ),
                        Option::None => { break; },
                    }
                }
            }

            self.assert_valid_span_signature(execution_hash, signature);
        }

        fn is_valid_span_signature(
            self: @ContractState, hash: felt252, signature: Span<felt252>
        ) -> bool {
            let is_valid = self.is_valid_owner_signature(hash, signature);
            if !is_valid {
                return false;
            }
        }

        fn assert_valid_span_signature(
            self: @ContractState, hash: felt252, signature: Span<felt252>
        ) {
            let is_valid = self.is_valid_owner_signature(hash, signature);
            assert(is_valid, 'titan/invalid-owner-sig');
        }

        fn is_valid_owner_signature(
            self: @ContractState, hash: felt252, signature: Span<felt252>
        ) -> bool {
            if signature.len() != 2 {
                return false;
            }
            let signature_r = *signature[0];
            let signature_s = *signature[1];
            check_ecdsa_signature(hash, self._signer.read(), signature_r, signature_s)
        }

        /// The signature is the result of signing the message hash with the new owner private key
        /// The message hash is the result of hashing the array:
        /// [change_owner selector, chainid, contract address, old_owner]
        /// as specified here: https://docs.starknet.io/documentation/architecture_and_concepts/Hashing/hash-functions/#array_hashing
        fn assert_valid_new_owner(
            self: @ContractState, new_owner: felt252, signature_r: felt252, signature_s: felt252
        ) {
            assert(new_owner != 0, 'titan/null-owner');
            let chain_id = get_tx_info().unbox().chain_id;
            // We now need to hash message_hash with the size of the array: (change_owner selector, chainid, contract address, old_owner)
            // https://github.com/starkware-libs/cairo-lang/blob/b614d1867c64f3fb2cf4a4879348cfcf87c3a5a7/src/starkware/cairo/common/hash_state.py#L6
            let message_hash = PedersenTrait::new(0)
                .update(selector!("change_owner"))
                .update(chain_id)
                .update(get_contract_address().into())
                .update(self._signer.read())
                .update(4)
                .finalize();
            let is_valid = check_ecdsa_signature(message_hash, new_owner, signature_r, signature_s);
            assert(is_valid, 'titan/invalid-owner-sig');
        }
    }
}
