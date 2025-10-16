import { useEffect, useMemo, useState } from 'react';

/** BiP Renkleri:
 *  Mavi:   #03A9F4
 *  Sarı:   #FFD826
 *  Beyaz:  #FFFFFF
 *  Pembe:  #DF0080
 *  Mor:    #990DC6
 */

function Square({ value, onSquareClick, disabled, isWinning }) {
  const symbolColor =
    value === 'X' ? 'text-[#DF0080]' : value === 'O' ? 'text-[#990DC6]' : 'text-[#03A9F4]';

  return (
    <button
      onClick={onSquareClick}
      disabled={disabled}
      className={[
        'aspect-square w-full rounded-xl border border-[#CFEFFD]',
        'flex items-center justify-center',
        'text-4xl font-extrabold transition-transform relative',
        isWinning
          ? 'ring-2 ring-[#FFD826] !text-[#FFD826] -ring-offset-2 ring-offset-white animate-pulse'
          : 'bg-[#E8F6FD] shadow-sm ',
        symbolColor,
        disabled ? 'opacity-60 pointer-events-none' : 'active:scale-95 hover:bg-white',
      ].join(' ')}
      aria-label={value ? `Hücre: ${value}` : 'Boş hücre'}
    >
      {value}
    </button>
  );
}

function Board({ xIsNext, squares, onPlay, disableHuman }) {
  const result = calculateWinner(squares);
  const winner = result?.winner ?? null;
  const winningLine = result?.line ?? [];

  const isDraw = !winner && squares.every((v) => v !== null);

  function handleClick(i) {
    if (winner || squares[i]) return;
    if (disableHuman) return;
    const nextSquares = squares.slice();
    nextSquares[i] = xIsNext ? 'X' : 'O';
    onPlay(nextSquares);
  }

  return (
    <>
      {/* Durum Çubuğu */}
      <div className="mb-4 w-full flex items-center justify-center">
        {winner ? (
          <div className="inline-flex items-center gap-2 rounded-full bg-[#03A9F4]/10 px-4 py-2 text-sm font-semibold text-[#002231]" role="status" aria-live="polite">
            <span className="inline-block size-2 rounded-full bg-[#FFD826]" />
            <span>
              Kazanan:{' '}
              <span className={winner === 'X' ? 'text-[#DF0080]' : 'text-[#990DC6]'}>{winner}</span>
            </span>
          </div>
        ) : isDraw ? (
          <div className="inline-flex items-center gap-2 rounded-full bg-[#03A9F4]/10 px-4 py-2 text-sm font-semibold text-[#002231]" role="status" aria-live="polite">
            <span className="inline-block size-2 rounded-full bg-[#03A9F4]" />
            <span>Berabere!</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 rounded-full bg-[#03A9F4]/10 px-4 py-2 text-sm font-semibold text-[#002231]" role="status" aria-live="polite">
            <span className="inline-block size-2 rounded-full bg-[#03A9F4]" />
            <span>
              Sıradaki oyuncu:{' '}
              <span className={xIsNext ? 'text-[#DF0080]' : 'text-[#990DC6]'}>
                {xIsNext ? 'X' : 'O'}
              </span>
            </span>
          </div>
        )}
      </div>

      {/* Tahta */}
      <div className="grid grid-cols-3 gap-2">
        {squares.map((val, i) => (
          <Square
            key={i}
            value={val}
            onSquareClick={() => handleClick(i)}
            disabled={disableHuman}
            isWinning={winningLine.includes(i)}
          />
        ))}
      </div>
    </>
  );
}

export default function Game() {
  const [gameMode, setGameMode] = useState(null);
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const [isBotThinking, setIsBotThinking] = useState(false);

  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];
  const result = useMemo(() => calculateWinner(currentSquares), [currentSquares]);
  const winner = result?.winner ?? null;

  // ⚠️ Berabere kontrolü (Game düzeyinde)
  const isDraw = useMemo(
    () => !winner && currentSquares.every((v) => v !== null),
    [winner, currentSquares]
  );

  // ✅ Oyun bitti mi? (kazanan veya berabere)
  const isGameOver = !!winner || isDraw;

  function handlePlay(nextSquares) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function handleReset(toMode = gameMode) {
    setHistory([Array(9).fill(null)]);
    setCurrentMove(0);
    setIsBotThinking(false);
    setGameMode(toMode ?? null);
  }

  // 1P modunda bot hamlesi — BERABERE ve KAZANAN durumlarında durur
  useEffect(() => {
    if (gameMode !== '1P') return;
    if (winner) return;
    if (isDraw) return;
    if (xIsNext) return;

    const emptyIndices = getEmptyIndices(currentSquares);
    if (emptyIndices.length === 0) return;

    setIsBotThinking(true);
    const delay = setTimeout(() => {
      const randomIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
      const next = currentSquares.slice();
      next[randomIndex] = 'O';
      setIsBotThinking(false);
      handlePlay(next);
    }, 1000);
    return () => clearTimeout(delay);
  }, [gameMode, xIsNext, currentSquares, winner, isDraw, handlePlay]);

  // ✅ Board’u ne zaman kilitleyelim?
  // - oyun bittiğinde (kazanan veya berabere)
  // - 1P modunda bot sırası/bot düşünürken
  const disableBoard =
    isGameOver || (gameMode === '1P' && (!xIsNext || isBotThinking));

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#E8F6FD] via-white to-white p-4">
      <div className="mx-auto max-w-sm">
        {/* Başlık */}
        <header className="mb-4 flex items-center justify-between">
          <h1 className="text-lg font-extrabold tracking-tight text-[#002231]">BiP XOX</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleReset('1P')}
              className={[
                'rounded-full px-3 py-1.5 text-xs font-bold shadow transition',
                gameMode === '1P'
                  ? 'bg-[#FFD826] text-[#002231]'
                  : 'bg-white border border-[#CFEFFD] text-[#002231] hover:bg-[#FFF7CC]',
              ].join(' ')}
            >
              1 Kişi
            </button>
            <button
              onClick={() => handleReset('2P')}
              className={[
                'rounded-full px-3 py-1.5 text-xs font-bold shadow transition',
                gameMode === '2P'
                  ? 'bg-[#FFD826] text-[#002231]'
                  : 'bg-white border border-[#CFEFFD] text-[#002231] hover:bg-[#FFF7CC]',
              ].join(' ')}
            >
              2 Kişi
            </button>
            <button
              onClick={() => handleReset()}
              className="rounded-full bg-[#FFD826] px-3 py-1.5 text-xs font-bold text-[#002231] shadow hover:brightness-105 active:scale-95 transition"
            >
              Sıfırla
            </button>
          </div>
        </header>

        {/* Mod seçilmediyse panel */}
        {gameMode === null && (
          <div className="mb-4 rounded-xl border border-[#CFEFFD] bg-white p-4 text-center shadow-sm">
            <p className="mb-3 text-sm font-medium text-[#002231]">Lütfen oyun modunu seç:</p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => handleReset('1P')}
                className="rounded-full bg-white px-4 py-2 text-xs font-bold text-[#002231] border border-[#CFEFFD] hover:bg-[#FFD826] transition"
              >
                1 Kişi
              </button>
              <button
                onClick={() => handleReset('2P')}
                className="rounded-full bg-white px-4 py-2 text-xs font-bold text-[#002231] border border-[#CFEFFD] hover:bg-[#FFD826] transition"
              >
                2 Kişi
              </button>
            </div>
          </div>
        )}

        {/* 📌 Board: yalnızca mod seçildikten sonra render edilir */}
        {gameMode !== null && (
          <div className="rounded-2xl border border-[#CFEFFD] bg-white p-4 shadow-[0_6px_20px_rgba(3,169,244,0.15)]">
            <Board
              xIsNext={xIsNext}
              squares={currentSquares}
              onPlay={handlePlay}
              disableHuman={disableBoard}
            />

            {gameMode === '1P' && isBotThinking && !winner && !isDraw && (
              <p className="mt-3 text-center text-xs text-[#393C53]/70">🤖 Bot düşünüyor…</p>
            )}
          </div>
        )}

        {/* Footer */}
        {/* <p className="mt-3 text-center text-[11px] text-[#393C53]/70">
          X: <span className="font-semibold text-[#DF0080]">pembe</span> • O:{' '}
          <span className="font-semibold text-[#990DC6]">mor</span> • Vurgu:{' '}
          <span className="font-semibold text-[#FFD826]">sarı</span>
        </p> */}
      </div>
    </div>
  );
}

function getEmptyIndices(squares) {
  return squares.map((v, i) => (v == null ? i : null)).filter((v) => v !== null);
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],[3, 4, 5],[6, 7, 8],
    [0, 3, 6],[1, 4, 7],[2, 5, 8],
    [0, 4, 8],[2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: [a, b, c] };
    }
  }
  return null;
}
