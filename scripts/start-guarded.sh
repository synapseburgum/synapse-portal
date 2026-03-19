#!/usr/bin/env bash
set -euo pipefail

PORT="${PORT:-3456}"
HOST="${HOST:-0.0.0.0}"
BASE_URL="http://localhost:${PORT}"
MAX_RECOVERY_ATTEMPTS=1

SERVER_PID=""

log() {
  echo "[start-guarded] $*"
}

kill_port_processes() {
  local pids
  pids=$(ss -ltnp 2>/dev/null | awk -v port=":${PORT}" '$4 ~ port {print $NF}' | sed -n 's/.*pid=\([0-9]\+\).*/\1/p' | sort -u)

  if [[ -n "${pids}" ]]; then
    log "Stopping existing process(es) on port ${PORT}: ${pids}"
    # shellcheck disable=SC2086
    kill ${pids} 2>/dev/null || true
    sleep 1
  fi
}

start_server() {
  log "Starting portal on ${HOST}:${PORT}"
  npm run start -- -p "${PORT}" -H "${HOST}" &
  SERVER_PID=$!

  # Give Next.js a moment to boot.
  sleep 2

  if ! kill -0 "${SERVER_PID}" 2>/dev/null; then
    log "Server process exited before health check."
    return 1
  fi

  return 0
}

extract_chunks() {
  local html
  html=$(curl -fsS "${BASE_URL}/")
  echo "${html}" | grep -oE '/_next/static/chunks/[^" ]+\.js' | sort -u
}

verify_chunks() {
  local chunks
  chunks=$(extract_chunks || true)

  if [[ -z "${chunks}" ]]; then
    log "No chunk references found from /. Treating as unhealthy startup."
    return 1
  fi

  local failed=0

  while IFS= read -r chunk; do
    [[ -z "${chunk}" ]] && continue
    local code
    code=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}${chunk}")

    if [[ "${code}" != "200" ]]; then
      log "Chunk check failed (${code}): ${chunk}"
      failed=1
    fi
  done <<< "${chunks}"

  [[ "${failed}" -eq 0 ]]
}

stop_server_pid() {
  if [[ -n "${SERVER_PID}" ]] && kill -0 "${SERVER_PID}" 2>/dev/null; then
    kill "${SERVER_PID}" 2>/dev/null || true
    wait "${SERVER_PID}" 2>/dev/null || true
  fi
}

forward_signal() {
  log "Received stop signal, shutting down server..."
  stop_server_pid
  exit 0
}

trap forward_signal INT TERM

recover_build() {
  log "stale build detected + auto-recovered: rebuilding clean artifacts"
  stop_server_pid
  kill_port_processes

  rm -rf .next
  npm run build

  start_server
}

main() {
  kill_port_processes

  if ! start_server; then
    recover_build
  fi

  local attempts=0
  until verify_chunks; do
    if [[ "${attempts}" -ge "${MAX_RECOVERY_ATTEMPTS}" ]]; then
      log "Startup health check failed after recovery attempts. Exiting."
      stop_server_pid
      exit 1
    fi

    attempts=$((attempts + 1))
    log "Stale/missing chunks detected on startup (attempt ${attempts})."
    recover_build
  done

  if [[ "${attempts}" -gt 0 ]]; then
    log "stale build detected + auto-recovered"
  else
    log "Startup chunk health check passed."
  fi

  wait "${SERVER_PID}"
}

main "$@"
