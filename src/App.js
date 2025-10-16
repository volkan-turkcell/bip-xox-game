import { useState } from 'react';

/** BiP Renkleri:
 *  Mavi:   #03A9F4
 *  Sarı:   #FFD826
 *  Beyaz:  #FFFFFF
 *  Pembe:  #DF0080
 *  Mor:    #990DC6
 */

function Square({ value, onSquareClick }) {
  const symbolColor =
    value === 'X' ? 'text-[#DF0080]' : value === 'O' ? 'text-[#990DC6]' : 'text-[#03A9F4]';

  return (
    <button
      onClick={onSquareClick}
      className={[
        'aspect-square w-full',
        'rounded-xl bg-[#E8F6FD] border border-[#CFEFFD]',
        'flex items-center justify-center',
        'text-4xl font-extrabold',
        symbolColor,
        'active:scale-95 transition-transform',
        'hover:bg-white',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD826]/80 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
        'shadow-sm'
      ].join(' ')}
      aria-label={value ? `Hücre: ${value}` : 'Boş hücre'}
    >
      {value}
    </button>
  );
}

function Board({ xIsNext, squares, onPlay }) {
  function handleClick(i) {
    if (calculateWinner(squares) || squares[i]) return;

    const nextSquares = squares.slice();
    nextSquares[i] = xIsNext ? 'X' : 'O';
    onPlay(nextSquares);
  }

  const winner = calculateWinner(squares);

  return (
    <>
      {/* Durum Çubuğu */}
      <div
        className={[
          'mb-4 w-full',
          'flex items-center justify-center'
        ].join(' ')}
      >
        {winner ? (
          <div className="inline-flex items-center gap-2 rounded-full bg-[#03A9F4]/10 px-4 py-2 text-sm font-semibold text-[#002231]">
            <span className="inline-block size-2 rounded-full bg-[#FFD826]" />
            <span>
              Kazanan:{' '}
              <span className={winner === 'X' ? 'text-[#DF0080]' : 'text-[#990DC6]'}>{winner}</span>
            </span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 rounded-full bg-[#03A9F4]/10 px-4 py-2 text-sm font-semibold text-[#002231]">
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
        {[0, 1, 2].map((i) => (
          <Square key={i} value={squares[i]} onSquareClick={() => handleClick(i)} />
        ))}
        {[3, 4, 5].map((i) => (
          <Square key={i} value={squares[i]} onSquareClick={() => handleClick(i)} />
        ))}
        {[6, 7, 8].map((i) => (
          <Square key={i} value={squares[i]} onSquareClick={() => handleClick(i)} />
        ))}
      </div>
    </>
  );
}

export default function Game() {
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];

  function handlePlay(nextSquares) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function handleReset() {
    setHistory([Array(9).fill(null)]);
    setCurrentMove(0);
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#E8F6FD] via-white to-white p-4">
      <div className="mx-auto max-w-sm">
        {/* Başlık */}
        <header className="mb-4 flex items-center justify-between">
          <h1 className="text-lg font-extrabold tracking-tight text-[#002231]">
            BiP XOX
          </h1>
          <button
            onClick={handleReset}
            className="rounded-full bg-[#FFD826] px-3 py-1.5 text-xs font-bold text-[#002231] shadow hover:brightness-105 active:scale-95 transition"
            aria-label="Oyunu sıfırla"
          >
            Sıfırla
          </button>
        </header>

        {/* Oyun Kartı */}
        <div className="rounded-2xl border border-[#CFEFFD] bg-white p-4 shadow-[0_6px_20px_rgba(3,169,244,0.15)]">
          <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
        </div>

        {/* Footer / Not */}
        <p className="mt-3 text-center text-[11px] text-[#393C53]/70">
          X: <span className="font-semibold text-[#DF0080]">pembe</span> &nbsp;•&nbsp; O:{' '}
          <span className="font-semibold text-[#990DC6]">mor</span> &nbsp;•&nbsp; Vurgu:{' '}
          <span className="font-semibold text-[#FFD826]">sarı</span>
        </p>
      </div>
    </div>
  );
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}
