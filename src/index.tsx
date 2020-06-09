import classnames from "classnames";
import _ from "lodash";
import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';


type Value = 'X' | 'O' | null;

interface SquareProps {
  value: Value;
  isWinner: boolean;
  onClick: () => void;
}

function Square(props: SquareProps): JSX.Element {

  const classes = classnames({square: true, winner: props.isWinner});
  
  return (
    <button className={classes} onClick={props.onClick}>
      {props.value}
    </button>
  );
}

interface BoardProps {
  squares: Value[];
  xIsNext: boolean;
  winningLine: number[];
  handleClick: (i: number) => void;
}


class Board extends React.Component<BoardProps> {
  
  renderSquare(i: number): JSX.Element {
    const winningLine = calculateWinner(this.props.squares)[1]
    return (
      <Square 
        value={this.props.squares[i]}
        onClick={ () => this.props.handleClick(i)}
        isWinner={winningLine.includes(i)}
      />
    );
  }

  render(): JSX.Element {
    const arr = _.range(0,3);
    const rows = arr.map((i: number) => {
      const squares = arr.map((j: number) => this.renderSquare(3*i+j));
      return (
        <div className="board-row">
          {squares}
        </div>
      )
    });
    return (
      <div>
        {rows}
      </div>
    );
  }
}


interface GameSnap {
  squares: Value[], 
  currentMove: number,
}


interface GameProps {
}
interface GameState { 
  history: GameSnap[]; 
  winningLine: number[];
}

class Game extends React.Component<GameProps, GameState> {
  constructor(props: GameProps) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
        currentMove: 0,
      }],
      winningLine: [],
    }
    this.handleClick = this.handleClick.bind(this);
  }

  getCurrent(): GameSnap {
    const {squares, currentMove} = this.state.history[this.state.history.length - 1];
    return {squares: squares.slice(), currentMove}
  }
  
  handleClick(i: number): void {
    let {squares, currentMove} = this.getCurrent();
    if (calculateWinner(squares)[0] || squares[i]) {
      return;
    };
    const xIsNext: boolean = (this.state.history.length % 2 === 1)
    squares[i] = xIsNext ? 'X' : 'O';
    currentMove = i;
    const winningLine: number[] = calculateWinner(squares)[0] ? calculateWinner(squares)[1] : [];
    const history = this.state.history.slice();
    history.push({squares, currentMove});
    this.setState({history, winningLine})
  }

  jumpTo(index: number) {
    const history = this.state.history.slice(0, index + 1);
    this.setState({history});
  }

  getPosition(currentMove: number): number[] {
    return [currentMove % 3 + 1, Math.floor(currentMove / 3) + 1];
  }

  render(): JSX.Element {

    const squares = this.getCurrent().squares;
    
    const winner: Value = calculateWinner(squares)[0];
    const xIsNext: boolean = (this.state.history.length % 2 === 1)
    const moves = this.state.history.map((step, index: number) => {
      const [col, row]: number[] = this.getPosition(step.currentMove);
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
    if (this.state.history.length === 10 && !winner) {
      status = "It's a draw!"
    } else if (winner) {
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
            winningLine={this.state.winningLine}
            handleClick={this.handleClick} />
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

function calculateWinner(squares: Value[]): [Value, number[]] {
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
      return [squares[a], [a, b, c]];
    };
  };
  return [null, []];
}