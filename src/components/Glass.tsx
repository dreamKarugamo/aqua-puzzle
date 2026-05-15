import React from 'react';

interface GlassProps {
    volume: number;
    currentAmount: number;
    isSelected: boolean;
    onSelect: () => void;
    onFill: () => void;
    onEmpty: () => void;
}

const Glass: React.FC<GlassProps> = ({
    volume, currentAmount, isSelected, onSelect, onFill, onEmpty
}) => {
    const fillPercentage = (currentAmount / volume) * 100;
    return (
        <div className="glass-items">
            <div
                className={`glass-container ${isSelected ? "selected" : ""}`}
                onClick={onSelect}
            >
                <div className="water" style={{ height: `${fillPercentage}%` }}>
                    <span className="water-amount">
                        {currentAmount > 0 ? `${currentAmount}ml` : ""}
                    </span>
                </div>
            </div>
            <p><strong>{volume}ml</strong></p>
            <div className='controls'>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onFill();
                    }}>
                    満タン
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onEmpty();
                    }}>
                    捨てる
                </button>
            </div>
        </div>
    );
};

export default Glass;