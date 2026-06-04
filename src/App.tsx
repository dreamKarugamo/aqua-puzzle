import React, { useState } from "react";
import Glass from "./components/Glass";
import "./App.css";

const GLASS_VOLUMES = [23, 41, 53, 67] as const;
const GOAL_RANGE = { MIN: 24, MAX: 150 };

const generateGoal = () => {
    let goal: number;
    const volumes: readonly number[] = GLASS_VOLUMES;

    do {
        goal =
            Math.floor(Math.random() * (GOAL_RANGE.MAX - GOAL_RANGE.MIN)) +
            GOAL_RANGE.MIN;
    } while (volumes.includes(goal));

    return goal;
};

const App: React.FC = () => {
    // 状態管理
    const [isStarted, setIsStarted] = useState(false);
    const [amounts, setAmounts] = useState<number[]>(
        GLASS_VOLUMES.map(() => 0),
    );
    const [goalAmount, setGoalAmount] = useState<number>(generateGoal());
    const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [history, setHistory] = useState<number[][]>([]);

    const currentTotal = amounts.reduce((sum, val) => sum + val, 0);
    const isCleared = currentTotal === goalAmount;

    const updateAmount = (newAmounts: number[]) => {
        if (isCleared) return;
        setHistory((prev) => [...prev, amounts]);
        setAmounts(newAmounts);
    };

    const handleFill = (idx: number) => {
        const newAmounts = [...amounts];
        newAmounts[idx] = GLASS_VOLUMES[idx];
        updateAmount(newAmounts);
    };

    const handleEmpty = (idx: number) => {
        const newAmounts = [...amounts];
        newAmounts[idx] = 0;
        updateAmount(newAmounts);
    };

    const handleSelect = (idx: number) => {
        if (isCleared) return;
        if (selectedIdx === null) {
            if (amounts[idx] > 0) setSelectedIdx(idx);
        } else if (selectedIdx === idx) {
            setSelectedIdx(null);
        } else {
            const sourceAmount = amounts[selectedIdx];
            const targetSpace = GLASS_VOLUMES[idx] - amounts[idx];
            const transferAmount = Math.min(sourceAmount, targetSpace);

            if (transferAmount === 0) {
                setMessage("満杯です！別のグラスを選んでください");
                setSelectedIdx(null);
                setTimeout(() => setMessage(null), 2000);
                return;
            }

            const newAmounts = [...amounts];
            newAmounts[selectedIdx] -= transferAmount;
            newAmounts[idx] += transferAmount;

            updateAmount(newAmounts);
            setSelectedIdx(null);
        }
    };

    const handleUndo = () => {
        if (history.length === 0) return;
        const prev = history[history.length - 1];
        setAmounts(prev);
        setHistory((h) => h.slice(0, -1));
    };

    const handleReset = () => {
        setAmounts(GLASS_VOLUMES.map(() => 0));
        setSelectedIdx(null);
        setHistory([]);
        setMessage(null);
    };

    const handleNewGame = () => {
        setAmounts(GLASS_VOLUMES.map(() => 0));
        setSelectedIdx(null);
        setHistory([]);
        setMessage(null);
        setGoalAmount(generateGoal());
    };

    const handleQuit = () => {
        setIsStarted(false); // タイトル画面に戻す
        setAmounts(GLASS_VOLUMES.map(() => 0));
        setSelectedIdx(null);
        setHistory([]);
        setMessage(null);
        setGoalAmount(generateGoal());
    };

    if (!isStarted) {
        return (
            <div id="start-container">
                <h1>AQUA PUZZLE</h1>
                <p>THE ART OF MEASUREMENT</p>
                <button id="button" onClick={() => setIsStarted(true)}>
                    Start Game
                </button>
            </div>
        );
    }

    return (
        <div className="main-container" style={{ display: "flex" }}>
            <h2 id="game-explain">
                {isCleared ? (
                    <span className="clear-decoration">Mission Complete!</span>
                ) : (
                    <>
                        Mission: <span id="goal-display">{goalAmount}</span>{" "}
                        mlを作れ
                    </>
                )}
            </h2>

            {message && <p className="feedback-message">{message}</p>}

            <div id="glass-wrapper">
                {GLASS_VOLUMES.map((vol, i) => (
                    <Glass
                        key={vol}
                        volume={vol}
                        currentAmount={amounts[i]}
                        isSelected={selectedIdx === i}
                        onSelect={() => handleSelect(i)}
                        onFill={() => handleFill(i)}
                        onEmpty={() => handleEmpty(i)}
                    />
                ))}
            </div>

            <div className="action-buttons">
                <button
                    className="action-button"
                    onClick={handleUndo}
                    disabled={history.length === 0}
                >
                    ↩ 一手戻す
                </button>
                <button className="action-button" onClick={handleReset}>
                    リセット
                </button>
            </div>

            {isCleared && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2 className="modal-title">Mission Complete!</h2>
                        <p className="modal-text">
                            ゴール: {goalAmount}ml 達成！
                        </p>
                        <div className="modal-buttons">
                            <button
                                className="modal-button primary"
                                onClick={handleNewGame}
                            >
                                ニューゲームをする
                            </button>
                            <button
                                className="modal-button secondary"
                                onClick={handleQuit}
                            >
                                やめる
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;
