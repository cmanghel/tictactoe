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


type GameSnap = {squares: Value[], xIsNext: boolean,}
interface GameProps {}
interface GameState { 
  history: GameSnap[]; 
}

class Game extends React.Component<GameProps, GameState> {
  constructor(props: GameProps) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
        xIsNext: true,
      }]
    };
  }

  getCurrent(): GameSnap {
    const {squares, xIsNext} = this.state.history[this.state.history.length - 1];
    return {squares: squares.slice(), xIsNext}
  }
  handleClick(i: number): void {
    let {squares, xIsNext} = this.getCurrent();
    if (calculateWinner(squares) || squares[i]) {
      return;
    };
    squares[i] = xIsNext ? 'X' : 'O';
    const history = this.state.history.slice();
    xIsNext = ! xIsNext;
    history.push({squares, xIsNext});
    this.setState({history})
  }

  render(): JSX.Element {
    const {squares, xIsNext} = this.getCurrent();
    const winner = calculateWinner(squares);
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
          <ol>{/* TODO */}</ol>
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