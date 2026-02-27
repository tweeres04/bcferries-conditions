ssh server -T <<'EOL'
	cd bcferries-conditions && \
	git fetch && git reset --hard origin/main && \
	docker compose up --build -d
EOL