#!/bin/bash
# =============================================================================
# solanize — chat-solanize deploy
# Triggered by GitHub Actions on push to master.
# Run as root: sudo bash /opt/solanize/src/chat-solanize/deploy.sh
# =============================================================================
set -euo pipefail

APP_DIR="/opt/solanize"
SRC_DIR="$APP_DIR/src"
DEPLOY_USER="ubuntu"
DEPLOY_KEY="/var/www/.ssh/id_ed25519"
SERVICE_SRC="$SRC_DIR/chat-solanize"
PM2_NAME="chat-solanize"
PORT="3000"

RED='\033[0;31m'; YELLOW='\033[1;33m'; GREEN='\033[0;32m'; CYAN='\033[0;36m'; NC='\033[0m'
log()  { echo -e "${GREEN}[OK]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
err()  { echo -e "${RED}[X]${NC} $1"; exit 1; }
step() { echo -e "\n${CYAN}=== $1 ===${NC}\n"; }

[ "$EUID" -ne 0 ] && err "Run as root: sudo bash deploy.sh"

# =============================================================================
step "1/3 — Pull latest chat-solanize from git"
# =============================================================================

[ -d "$SERVICE_SRC/.git" ] || err "$SERVICE_SRC is not a git repo"

GIT_SSH_COMMAND="ssh -i $DEPLOY_KEY -o StrictHostKeyChecking=no" \
  git -c safe.directory='*' -C "$SERVICE_SRC" fetch origin

BRANCH=$(git -C "$SERVICE_SRC" rev-parse --abbrev-ref HEAD 2>/dev/null || echo "master")
git -c safe.directory='*' -C "$SERVICE_SRC" reset --hard "origin/$BRANCH"
log "chat-solanize pulled (branch: $BRANCH)"

chown -R "$DEPLOY_USER:$DEPLOY_USER" "$SERVICE_SRC"
log "Ownership restored to $DEPLOY_USER"

# =============================================================================
step "2/3 — Build chat-solanize (Next.js)"
# =============================================================================

# Load .env.production if it exists (never committed — set up manually on VPS)
ENV_FILE="$APP_DIR/config/chat-solanize.env"
if [ -f "$ENV_FILE" ]; then
  log "Loading env from $ENV_FILE"
  set -a; source "$ENV_FILE"; set +a
else
  warn "No env file found at $ENV_FILE — building with defaults"
fi

echo "  → Installing dependencies ..."
sudo -u "$DEPLOY_USER" HOME="/home/$DEPLOY_USER" \
  bash -c "cd '$SERVICE_SRC' && yarn install --frozen-lockfile 2>&1"

echo "  → Running next build ..."
sudo -u "$DEPLOY_USER" HOME="/home/$DEPLOY_USER" \
  bash -c "cd '$SERVICE_SRC' && yarn build 2>&1"

log "Next.js build complete"

# =============================================================================
step "3/3 — Restart chat-solanize"
# =============================================================================

PM2=$(which pm2)
sudo -u "$DEPLOY_USER" HOME="/home/$DEPLOY_USER" \
  $PM2 restart "$PM2_NAME" || \
  sudo -u "$DEPLOY_USER" HOME="/home/$DEPLOY_USER" \
    $PM2 start yarn \
      --name "$PM2_NAME" \
      --cwd "$SERVICE_SRC" \
      --env "PORT=$PORT" \
      -- start

sudo -u "$DEPLOY_USER" HOME="/home/$DEPLOY_USER" $PM2 save
log "$PM2_NAME restarted"

echo ""
echo -e "${GREEN}chat-solanize deploy complete.${NC}"
sudo -u "$DEPLOY_USER" HOME="/home/$DEPLOY_USER" $PM2 list
