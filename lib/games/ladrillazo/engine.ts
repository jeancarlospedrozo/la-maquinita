// Motor de Ladrillazo: lógica portada de references/arkanoid/src/game.js, sin React y sin efectos
// al importar. Se crea con createLadrillazoEngine() dentro de un efecto y se libera con destroy().
// Contrato: specs/002-arkanoid-integration/contracts/engine.md

import type {
  EngineEvents,
  EngineHandle,
  EnginePhase,
  EngineStats,
} from "./index";
import {
  BALL_SIZE,
  BLOCK_COLUMNS,
  BLOCK_HEIGHT,
  BLOCK_POINTS,
  BLOCK_ROWS,
  BLOCK_WIDTH,
  BLOCKS_X,
  BLOCKS_Y,
  type BlockColor,
  FIELD_HEIGHT,
  FIELD_WIDTH,
  LAUNCH_ANGLE,
  LEVELS,
  MAX_BOUNCE_ANGLE,
  MAX_DELTA,
  MAX_LIVES,
  PADDLE,
  PADDLE_SPEED,
} from "./levels";
import {
  drawFrame,
  drawSprite,
  EXPLOSION_DURATION,
  EXPLOSION_FRAMES,
  loadSpritesheet,
  type Spritesheet,
} from "./sprites";

type Rect = { x: number; y: number; w: number; h: number };
type Block = Rect & { color: BlockColor; alive: boolean };
type Ball = { x: number; y: number; size: number; vx: number; vy: number };
type Explosion = { x: number; y: number; color: BlockColor; elapsed: number };

const LEFT_KEYS = ["ArrowLeft", "KeyA"];
const RIGHT_KEYS = ["ArrowRight", "KeyD"];
const PREVENT_KEYS = ["ArrowLeft", "ArrowRight", "Space"];
/** Un toque solo lanza si el dedo se movió menos que esto (px del campo)… */
const TAP_MAX_MOVE = 10;
/** …y estuvo apoyado menos que esto (ms). */
const TAP_MAX_MS = 300;

export function createLadrillazoEngine(
  canvas: HTMLCanvasElement,
  events: EngineEvents,
  options: { assetBase?: string } = {},
): EngineHandle {
  const assetBase = options.assetBase ?? "/games/ladrillazo";
  const ctx = canvas.getContext("2d");

  // --- Recursos ---
  let sheet: Spritesheet | null = null;
  let loading = false;
  const bounceSound = new Audio(`${assetBase}/ball-bounce.mp3`);
  const breakSound = new Audio(`${assetBase}/break-sound.mp3`);
  bounceSound.preload = "auto";
  breakSound.preload = "auto";

  // --- Estado de la partida ---
  let phase: EnginePhase = "idle";
  let paused = false;
  let muted = false;
  let level = 1;
  let score = 0;
  let lives = MAX_LIVES;
  let ended = false;
  const paddle: Rect = { ...PADDLE };
  const ball: Ball = { x: 392, y: 544, size: BALL_SIZE, vx: 0, vy: 0 };
  let blocks = createBlocks(1);
  let explosions: Explosion[] = [];
  let lastStats: EngineStats | null = null;

  // --- Entrada ---
  const pressedKeys = new Set<string>();
  let touchDirection: -1 | 0 | 1 = 0;
  /** Las pulsaciones de Espacio anteriores a este instante se ignoran. */
  let ignoreSpaceBefore = 0;
  let touch: { id: number; x: number; y: number; time: number } | null = null;

  let destroyed = false;
  let frame = 0;
  let lastTime: number | null = null;

  /** Fases en las que el jugador controla la partida. */
  const isActive = () =>
    !paused &&
    (phase === "serving" || phase === "playing" || phase === "levelComplete");

  function emitStats() {
    if (destroyed || ended) return;
    if (
      lastStats &&
      lastStats.score === score &&
      lastStats.lives === lives &&
      lastStats.level === level
    )
      return;
    lastStats = { score, lives, level };
    events.onStats(lastStats);
  }

  function setPhase(next: EnginePhase) {
    if (phase === next) return;
    phase = next;
    // Una misma pulsación de Espacio nunca provoca dos acciones seguidas.
    ignoreSpaceBefore = performance.now();
    if (destroyed) return;
    events.onPhase(next);
    if ((next === "won" || next === "lost") && !ended) {
      emitStats();
      ended = true;
      events.onEnd({ score, won: next === "won" });
    }
  }

  function playSound(sound: HTMLAudioElement) {
    if (muted || destroyed) return;
    sound.currentTime = 0;
    // El navegador puede bloquear el audio hasta la primera interacción: se juega sin sonido.
    sound.play().catch(() => {});
  }

  function createBlocks(n: number): Block[] {
    const { map } = LEVELS[n - 1];
    const result: Block[] = [];
    BLOCK_ROWS.forEach((color, row) => {
      for (let column = 0; column < BLOCK_COLUMNS; column++) {
        if (map[row][column] !== "X") continue;
        result.push({
          x: BLOCKS_X + column * BLOCK_WIDTH,
          y: BLOCKS_Y + row * BLOCK_HEIGHT,
          w: BLOCK_WIDTH,
          h: BLOCK_HEIGHT,
          color,
          alive: true,
        });
      }
    });
    return result;
  }

  function newSession() {
    level = 1;
    score = 0;
    lives = MAX_LIVES;
    ended = false;
    lastStats = null;
    paused = false;
    blocks = createBlocks(level);
    explosions = [];
    ball.vx = 0;
    ball.vy = 0;
    Object.assign(paddle, PADDLE);
    placeBallOnPaddle();
    ignoreSpaceBefore = performance.now();
    lastTime = null;
  }

  // --- Reglas (portadas del original) ---

  function movePaddleTo(x: number) {
    paddle.x = Math.max(0, Math.min(FIELD_WIDTH - paddle.w, x));
  }

  function placeBallOnPaddle() {
    ball.x = paddle.x + (paddle.w - ball.size) / 2;
    ball.y = paddle.y - ball.size;
  }

  function launchBall() {
    const { ballSpeed } = LEVELS[level - 1];
    ball.vx = ballSpeed * Math.sin(LAUNCH_ANGLE);
    ball.vy = -ballSpeed * Math.cos(LAUNCH_ANGLE);
    setPhase("playing");
  }

  function startNextLevel() {
    level++;
    blocks = createBlocks(level);
    explosions = [];
    setPhase("serving");
    emitStats();
  }

  function doAction() {
    if (!isActive()) return;
    if (phase === "serving") launchBall();
    else if (phase === "levelComplete") startNextLevel();
  }

  function loseLife() {
    lives--;
    ball.vx = 0;
    ball.vy = 0;
    emitStats();
    setPhase(lives > 0 ? "serving" : "lost");
  }

  function moveBall(delta: number) {
    ball.x += ball.vx * delta;
    ball.y += ball.vy * delta;

    if (ball.x < 0) {
      ball.x = 0;
      ball.vx = -ball.vx;
      playSound(bounceSound);
    } else if (ball.x + ball.size > FIELD_WIDTH) {
      ball.x = FIELD_WIDTH - ball.size;
      ball.vx = -ball.vx;
      playSound(bounceSound);
    }

    if (ball.y < 0) {
      ball.y = 0;
      ball.vy = -ball.vy;
      playSound(bounceSound);
    } else if (ball.y > FIELD_HEIGHT) {
      loseLife();
    }
  }

  function overlaps(rect: Rect) {
    return (
      ball.x < rect.x + rect.w &&
      ball.x + ball.size > rect.x &&
      ball.y < rect.y + rect.h &&
      ball.y + ball.size > rect.y
    );
  }

  function bounceOffPaddle() {
    if (ball.vy <= 0 || !overlaps(paddle)) return;

    const ballCenter = ball.x + ball.size / 2;
    const paddleCenter = paddle.x + paddle.w / 2;
    const offset = (ballCenter - paddleCenter) / (paddle.w / 2);
    const angle = Math.max(-1, Math.min(1, offset)) * MAX_BOUNCE_ANGLE;
    const { ballSpeed } = LEVELS[level - 1];

    ball.vx = ballSpeed * Math.sin(angle);
    ball.vy = -ballSpeed * Math.cos(angle);
    ball.y = paddle.y - ball.size;
    playSound(bounceSound);
  }

  function bounceOffBlock(block: Block) {
    const overlapLeft = ball.x + ball.size - block.x;
    const overlapRight = block.x + block.w - ball.x;
    const overlapTop = ball.y + ball.size - block.y;
    const overlapBottom = block.y + block.h - ball.y;

    // Sacar la pelota del bloque evita que vuelva a rebotar en su vecino de fila o columna.
    if (
      Math.min(overlapLeft, overlapRight) < Math.min(overlapTop, overlapBottom)
    ) {
      ball.x += overlapLeft < overlapRight ? -overlapLeft : overlapRight;
      ball.vx = -ball.vx;
    } else {
      ball.y += overlapTop < overlapBottom ? -overlapTop : overlapBottom;
      ball.vy = -ball.vy;
    }
  }

  function hitBlock() {
    const block = blocks.find((b) => b.alive && overlaps(b));
    if (!block) return;

    block.alive = false;
    score += BLOCK_POINTS;
    explosions.push({ x: block.x, y: block.y, color: block.color, elapsed: 0 });
    playSound(breakSound);
    bounceOffBlock(block);
    emitStats();

    if (!blocks.some((b) => b.alive)) {
      ball.vx = 0;
      ball.vy = 0;
      setPhase(level < LEVELS.length ? "levelComplete" : "won");
    }
  }

  function updateExplosions(delta: number) {
    for (const e of explosions) e.elapsed += delta * 1000;
    explosions = explosions.filter((e) => e.elapsed < EXPLOSION_DURATION);
  }

  function update(delta: number) {
    updateExplosions(delta);

    const isPressed = (key: string) => pressedKeys.has(key);
    const keys =
      Number(RIGHT_KEYS.some(isPressed)) - Number(LEFT_KEYS.some(isPressed));
    const direction = Math.max(-1, Math.min(1, keys + touchDirection));
    if (direction) movePaddleTo(paddle.x + direction * PADDLE_SPEED * delta);

    if (phase === "playing") {
      moveBall(delta);
      // loseLife() puede haber cambiado la fase.
      if ((phase as EnginePhase) === "playing") {
        bounceOffPaddle();
        hitBlock();
      }
    }
    if (phase !== "playing") placeBallOnPaddle();
  }

  // --- Dibujo: solo bloques, explosiones, paleta y pelota (ningún texto) ---

  function draw() {
    if (!ctx) return;
    ctx.clearRect(0, 0, FIELD_WIDTH, FIELD_HEIGHT);
    if (!sheet) return;
    ctx.imageSmoothingEnabled = false;

    for (const block of blocks) {
      if (block.alive)
        drawSprite(
          ctx,
          sheet,
          `block_${block.color}`,
          block.x,
          block.y,
          block.w,
          block.h,
        );
    }
    for (const e of explosions) {
      const frames = EXPLOSION_FRAMES[e.color];
      const f =
        frames[
          Math.min(
            frames.length - 1,
            Math.floor((e.elapsed / EXPLOSION_DURATION) * frames.length),
          )
        ];
      drawFrame(ctx, sheet, f, e.x, e.y, BLOCK_WIDTH, BLOCK_HEIGHT);
    }
    drawSprite(ctx, sheet, "paddle", paddle.x, paddle.y, paddle.w, paddle.h);
    drawSprite(ctx, sheet, "ball", ball.x, ball.y, ball.size, ball.size);
  }

  function loop(time: number) {
    if (destroyed) return;
    const delta =
      lastTime === null ? 0 : Math.min((time - lastTime) / 1000, MAX_DELTA);
    lastTime = time;
    if (phase !== "idle" && !paused) update(delta);
    draw();
    frame = requestAnimationFrame(loop);
  }

  function loadAssets() {
    if (sheet || loading || destroyed) return;
    loading = true;
    events.onProgress(0, 1);
    loadSpritesheet(`${assetBase}/spritesheet-breakout.png`).then(
      (loaded) => {
        loading = false;
        if (destroyed) return;
        sheet = loaded;
        events.onProgress(1, 1);
        events.onReady();
      },
      () => {
        loading = false;
        if (!destroyed) events.onError("sprites");
      },
    );
  }

  // --- Entrada: teclado, ratón y táctil ---

  /** Convierte una coordenada de pantalla al campo lógico de 800 px. */
  function toFieldX(clientX: number) {
    const rect = canvas.getBoundingClientRect();
    return ((clientX - rect.left) * FIELD_WIDTH) / rect.width;
  }

  function onKeyDown(e: KeyboardEvent) {
    if (!isActive()) return;
    if (PREVENT_KEYS.includes(e.code)) e.preventDefault();
    if (e.code === "Space") {
      if (!e.repeat && e.timeStamp > ignoreSpaceBefore) doAction();
      return;
    }
    pressedKeys.add(e.code);
  }

  function onKeyUp(e: KeyboardEvent) {
    pressedKeys.delete(e.code);
  }

  function onBlur() {
    pressedKeys.clear();
    touchDirection = 0;
    touch = null;
  }

  function onPointerDown(e: PointerEvent) {
    if (!isActive()) return;
    if (e.pointerType === "mouse") {
      if (e.button === 0) doAction();
      return;
    }
    touch = {
      id: e.pointerId,
      x: toFieldX(e.clientX),
      y: e.clientY,
      time: e.timeStamp,
    };
    movePaddleTo(touch.x - paddle.w / 2);
  }

  function onPointerMove(e: PointerEvent) {
    if (!isActive()) return;
    if (e.pointerType === "mouse") {
      movePaddleTo(toFieldX(e.clientX) - paddle.w / 2);
    } else if (touch && touch.id === e.pointerId) {
      movePaddleTo(toFieldX(e.clientX) - paddle.w / 2);
    }
  }

  function onPointerUp(e: PointerEvent) {
    if (!touch || touch.id !== e.pointerId) return;
    const rect = canvas.getBoundingClientRect();
    const scale = FIELD_WIDTH / rect.width;
    const moved = Math.hypot(
      toFieldX(e.clientX) - touch.x,
      (e.clientY - touch.y) * scale,
    );
    const tap = moved < TAP_MAX_MOVE && e.timeStamp - touch.time < TAP_MAX_MS;
    touch = null;
    if (tap) doAction();
  }

  function onPointerCancel() {
    touch = null;
  }

  canvas.style.touchAction = "none";
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  window.addEventListener("blur", onBlur);
  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointercancel", onPointerCancel);

  placeBallOnPaddle();
  loadAssets();
  frame = requestAnimationFrame(loop);

  return {
    start() {
      if (destroyed || !sheet || phase !== "idle") return;
      newSession();
      setPhase("serving");
      emitStats();
    },
    restart() {
      if (destroyed || !sheet) return;
      newSession();
      phase = "idle"; // fuerza el aviso de cambio de fase
      setPhase("serving");
      emitStats();
    },
    pause() {
      paused = true;
      onBlur();
    },
    resume() {
      paused = false;
      // El tiempo en pausa nunca se simula.
      lastTime = null;
    },
    action: doAction,
    setDirection(d) {
      touchDirection = d;
    },
    setMuted(value) {
      muted = value;
    },
    retryAssets: loadAssets,
    destroy() {
      if (destroyed) return;
      destroyed = true;
      cancelAnimationFrame(frame);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerCancel);
      bounceSound.pause();
      breakSound.pause();
    },
  };
}
