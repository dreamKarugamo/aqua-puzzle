import React, { useState } from "react";
import Glass from "./components/Glass";
import "./App.css";

// 1. 難易度の型定義
type Difficulty = "easy" | "medium" | "hard";

interface DifficultySettings {
    GLASS_VOLUMES: readonly [number, number, number, number];
    GOAL_RANGE: { MIN: number; MAX: number };
    LABEL: string;
}

// 2. 難易度ごとの設定（中級は19, 29, 37, 47の素数をセット）
const DIFFICULTY_CONFIG: Record<Difficulty, DifficultySettings> = {
    easy: {
        GLASS_VOLUMES: [13, 17, 23, 41],
        GOAL_RANGE: { MIN: 15, MAX: 90 },
        LABEL: "初級",
    },
    medium: {
        GLASS_VOLUMES: [17, 29, 33, 43],
        GOAL_RANGE: { MIN: 20, MAX: 120 },
        LABEL: "中級",
    },
    hard: {
        GLASS_VOLUMES: [23, 41, 53, 67],
        GOAL_RANGE: { MIN: 24, MAX: 150 },
        LABEL: "上級",
    },
};

// 選択された難易度に基づいてランダムなゴールを生成する関数
const generateGoal = (difficulty: Difficulty) => {
    let goal: number;
    const config = DIFFICULTY_CONFIG[difficulty];
    const volumes: readonly number[] = config.GLASS_VOLUMES;
    const { MIN, MAX } = config.GOAL_RANGE;

    do {
        goal = Math.floor(Math.random() * (MAX - MIN)) + MIN;
    } while (volumes.includes(goal));

    return goal;
};

const App: React.FC = () => {
    // 状態管理
    const [difficulty, setDifficulty] = useState<Difficulty>("easy");
    const [isStarted, setIsStarted] = useState(false);
    const [amounts, setAmounts] = useState<number[]>([0, 0, 0, 0]);
    const [goalAmount, setGoalAmount] = useState<number>(0);
    const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [history, setHistory] = useState<number[][]>([]);

    // 現在の難易度設定へのショートカット
    const currentConfig = DIFFICULTY_CONFIG[difficulty];

    const currentTotal = amounts.reduce((sum, val) => sum + val, 0);
    const isCleared = currentTotal === goalAmount;

    // ゲームを開始する処理
    const handleStartGame = (selectedDiff: Difficulty) => {
        setDifficulty(selectedDiff);
        const initialVolumes = DIFFICULTY_CONFIG[selectedDiff].GLASS_VOLUMES;
        setAmounts(initialVolumes.map(() => 0));
        setGoalAmount(generateGoal(selectedDiff));
        setSelectedIdx(null);
        setHistory([]);
        setMessage(null);
        setIsStarted(true);
    };

    const updateAmount = (newAmounts: number[]) => {
        if (isCleared) return;
        setHistory((prev) => [...prev, amounts]);
        setAmounts(newAmounts);
    };

    const handleFill = (idx: number) => {
        const newAmounts = [...amounts];
        newAmounts[idx] = currentConfig.GLASS_VOLUMES[idx];
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
            const targetSpace = currentConfig.GLASS_VOLUMES[idx] - amounts[idx];
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
        setAmounts(currentConfig.GLASS_VOLUMES.map(() => 0));
        setSelectedIdx(null);
        setHistory([]);
        setMessage(null);
    };

    const handleNewGame = () => {
        setAmounts(currentConfig.GLASS_VOLUMES.map(() => 0));
        setSelectedIdx(null);
        setHistory([]);
        setMessage(null);
        setGoalAmount(generateGoal(difficulty));
    };

    const handleQuit = () => {
        setIsStarted(false); // タイトル画面（難易度選択）に戻す
    };

    // --- A. スタート画面（難易度選択） ---
    if (!isStarted) {
        return (
            <div id="start-container">
                <h1>AQUA PUZZLE</h1>
                <p>THE ART OF MEASUREMENT</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "15px", width: "100%", maxWidth: "300px" }}>
                    {(Object.keys(DIFFICULTY_CONFIG) as Difficulty[]).map((key) => (
                        <button
                            key={key}
                            id="button"
                            onClick={() => handleStartGame(key)}
                            style={{ fontSize: "1.2rem", width: "100%", padding: "10px 0" }}
                        >
                            {DIFFICULTY_CONFIG[key].LABEL} を開始
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    // --- B. ゲーム本編画面 ---
    return (
        <div className="main-container" style={{ display: "flex" }}>
            <div style={{ position: "absolute", top: "20px", left: "30px", opacity: 0.7, fontSize: "0.9rem", letterSpacing: "1px" }}>
                難易度: <strong>{currentConfig.LABEL}</strong>
            </div>

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
                {currentConfig.GLASS_VOLUMES.map((vol, i) => (
                    <Glass
                        key={`${difficulty}-${vol}-${i}`} // 難易度切替時にコンポーネントを正しく再描画
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
                <button className="action-button" onClick={handleQuit}>
                    タイトルへ戻る
                </button>
            </div>

            {isCleared && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2 className="modal-title">Mission Complete!</h2>
                        <p className="modal-text">
                            クラス: {currentConfig.LABEL}<br />
                            ゴール: {goalAmount}ml 達成！
                        </p>
                        <div className="modal-buttons">
                            <button
                                className="modal-button primary"
                                onClick={handleNewGame}
                            >
                                同じ難易度で次へ
                            </button>
                            <button
                                className="modal-button secondary"
                                onClick={handleQuit}
                            >
                                タイトルに戻る
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;