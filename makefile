# Colors
NOCOLOR=\033[0m
RED=\033[0;31m
GREEN=\033[0;32m
ORANGE=\033[0;33m
BLUE=\033[0;34m
CYAN=\033[0;36m

.PHONY: i-cert
i-cert:
	@printf "$(CYAN)Create the certificate for local https $(NOCOLOR) \n"
	cd ./cert && mkcert create-ca && mkcert create-cert