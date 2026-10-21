# Slither

Slither 0.11.6 ran on 2026-10-21 against `contracts/src/CarbonRegistry.sol` with solc 0.8.20 and the OpenZeppelin remapping.

```
cd contracts
.venv/bin/slither src/CarbonRegistry.sol \
  --solc ~/.solcx/solc-v0.8.20 \
  --solc-remaps '@openzeppelin/contracts/=node_modules/@openzeppelin/contracts/' \
  --filter-paths node_modules \
  --exclude-dependencies
```

Result: `src/CarbonRegistry.sol analyzed (14 contracts with 102 detectors), 0 result(s) found`.

There were no findings to fix. OpenZeppelin contracts were excluded from the report. Installing Slither in `contracts/.venv` downgraded `web3` from 8.0.0 to 7.16.0 because Slither 0.11.6 requires `web3<8`. After the scan, `web3` was restored to 8.0.0 so the Sepolia tests keep the version they passed on. A later Slither run needs `web3` 7 for that install.
