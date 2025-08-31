# Run tests
test:
	@echo "Running tests..."
	@npx hardhat test
	@echo "Tests completed!"

# Compile smart contracts
compile:
	@echo "Compiling smart contracts..."
	@npx hardhat compile
	@echo "Compilation completed!"

# Deploy smart contracts
deploy:
	@echo "Deploying smart contracts..."
	@npx hardhat ignition deploy ignition/modules/ClaudioLegalAgreement.ts --network base
	@echo "Deployment completed!"

verify-quick:
	@echo "Verifying smart contract..."
	@npx hardhat verify --network base 0x363203d21835547daebe7f8fc074a20c958b0965 0x9126dFc267577aa963B36cD138004414ba90E35C
	@echo "Verification completed!"

# Clean

.PHONY: test compile