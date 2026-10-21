# CarbonRegistry on Sepolia

Deployed 2026-10-21 from `contracts/scripts/deploy.py`. Machine-readable copy: `packages/contract-abi/deployment.json`.

| Field | Value |
|---|---|
| Contract | `0xFC1F37fB7449619917Dd78431bB827A18E11C480` |
| Network | Sepolia |
| Chain id | 11155111 |
| Token | Carbon Credit (`CC`), 18 decimals |
| Deployment transaction | `0x6d089ca8982a1f687ee078367862767bc3ea98ae2b961c596f04a49a15da5e5e` |
| Issuer grant transaction | `0x7cb28593b9a9dc4051c294424cf686e3315ed37fc37d29a3c3bda7615982c53e` |
| Admin (`DEFAULT_ADMIN_ROLE`) | `0xe7b5680c7eA21F9fFa2989D7E459608f22b716Fa` |
| Issuer (`ISSUER_ROLE`) | `0xe7b5680c7eA21F9fFa2989D7E459608f22b716Fa` |

`ISSUER_ADDRESS` was empty, so the issuer is the deployer. Etherscan verification did not run: `ETHERSCAN_API_KEY` is empty.

Explorer: https://sepolia.etherscan.io/address/0xFC1F37fB7449619917Dd78431bB827A18E11C480

Gas below is from five register receipts and five retire receipts on a separate test deployment, `0x2a28C1C86704F7f7Ae1724564f3E70417C5ee330`, written by `contracts/tests/test_registry.py` to `bench/results/gas.json`.

| Call | Mean gas | Min | Max |
|---|---:|---:|---:|
| register | 1095680 | 1056512 | 1252352 |
| retire | 47721 | 47721 | 47721 |
