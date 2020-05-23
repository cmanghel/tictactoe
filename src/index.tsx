import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';


type Value = 'X' | 'O' | null;

interface SquareProps {
  value: Value;
  onClick: () => void;
}

function Square(props: SquareProps): JSX.Element {
  return (
    <button className="square" onClick={props.onClick}>
      {props.value}
    </button>
  );
}

interface BoardProps {
  squares: Value[];
  xIsNext: boolean;
  handleClick: (i: number) => void;
}


class Board extends React.Component<BoardProps> {
  renderSquare(i: number): JSX.Element {
    return (
      <Square 
        value={this.props.squares[i]}
        onClick={ () => this.props.handleClick(i)}
      />
    );
  }

  render(): JSX.Element {
    return (
      <div>
        <div className="board-row">
          {this.renderSquare(0)}
          {this.renderSquare(1)}
          {this.renderSquare(2)}
        </div>
        <div className="board-row">
          {this.renderSquare(3)}
          {this.renderSquare(4)}
          {this.renderSquare(5)}
        </div>
        <div className="board-row">
          {this.renderSquare(6)}
          {this.renderSquare(7)}
          {this.renderSquare(8)}
        </div>
      </div>
    );
  }
}


type GameSnap = {squares: Value[], currentMove: number}
interface GameProps {}
interface GameState { 
  hist: GameSnap[]; 
}

class Game extends React.Component<GameProps, GameState> {
  constructor(props: GameProps) {
    super(props);
    this.state = {
      hist: [{
        squares: Array(9).fill(null),
        currentMove: 0,
      }]
    };
  }

  getCurrent(): GameSnap {
    const {squares, currentMove} = this.state.hist[this.state.hist.length - 1];
    return {squares: squares.slice(), currentMove}
  }
  
  handleClick(i: number): void {
    let {squares, currentMove} = this.getCurrent();
    if (calculateWinner(squares) || squares[i]) {
      return;
    };
    const xIsNext: boolean = (this.state.hist.length % 2 === 1)
    squares[i] = xIsNext ? 'X' : 'O';
    currentMove = i;
    const hist = this.state.hist.slice();
    hist.push({squares, currentMove});
    this.setState({hist})
  }

  jumpTo(index: number) {
    const hist = this.state.hist.slice(0, index + 1);
    this.setState({hist});
  }

  getPosition(currentMove: number): number[][] {
    return [[currentMove % 3 + 1],[Math.floor(currentMove / 3) + 1]];
  }

  render(): JSX.Element {
    const {squares, currentMove} = this.getCurrent();
    const winner = calculateWinner(squares);
    const xIsNext: boolean = (this.state.hist.length % 2 === 1)
    const moves = this.state.hist.map((step, index: number) => {
      const [col, row]: number[][] = this.getPosition(step.currentMove);
      const desc = index ?
        'Go to move #' + index + ' (' + col + ', ' + row + ')':
        'Go to game start';
      return (
        <li key={index}>
          <button onClick={() => this.jumpTo(index)}>{desc}</button>
        </li>
      );
    });
    let status: string;
    if (winner) {
      status = "Winner: " + winner;
    } else {
      status = 'Next player: ' + (xIsNext ? 'X' : 'O');
    };
    return (
      <div className="game">
        <div className="game-board">
          <Board
            xIsNext={xIsNext}
            squares={squares}
            handleClick={this.handleClick.bind(this)} />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);

function calculateWinner(squares: Value[]): Value {
  const lines = 
   [[0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    };
  };
  return null;
}