import React, { useState, useEffect } from 'react';
import '../Game1.css';
import { Atom } from 'lucide-react';


const Game1 = () => {
    const [isMinimized, setIsMinimized] = useState(true);
    const [stage, setStage] = useState('welcome');
    const [playerName, setPlayerName] = useState('');
    const [nameInput, setNameInput] = useState('');
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [isChecking, setIsChecking] = useState(false);
    const [showWelcomeText, setShowWelcomeText] = useState(false);

    const resetGame = () => {
        setStage('welcome');
        setPlayerName('');
        setNameInput('');
        setCurrentQuestion(0);
        setIsChecking(false);
        setShowWelcomeText(false);
    };

    const handleMaximize = () => {
        setIsMinimized(false);
    };
    
    const handleMinimize = () => {
        setIsMinimized(true);
    };

    useEffect(() => {
        if (stage === 'welcome') {
        const timer = setTimeout(() => {
            setShowWelcomeText(true);
        }, 2000);
        return () => clearTimeout(timer);
        }
    }, [stage]);

    const handleAnswer = async (isCorrect) => {
        setIsChecking(true);
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        if (isCorrect) {
        setIsChecking(false);
        if (currentQuestion === 3) {
            setStage('winner');
        } else {
            setCurrentQuestion(currentQuestion + 1);
        }
        } else {
        setStage('gameover');
        }
    };

    const handleNameSubmit = () => {
        if (nameInput.trim()) {
        setPlayerName(nameInput.trim());
        setStage('questions');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && nameInput.trim()) {
        handleNameSubmit();
        }
    };

    const questions = [
        {
        question: 'what is the best source of energy?',
        choices: ['nuclear', 'solar', 'oil', 'wind'],
        correct: 'nuclear'
        },
        {
        question: 'why is nuclear the best source of energy?',
        choices: [
            "because it's clean",
            "because it's unbothered by the weather",
            "because it doesn't take up much space",
            'all of the above'
        ],
        correct: 'all of the above'
        },
        {
        question: 'What is the equivalent of 1 uranium pallet?',
        choices: ['gummy bear', '2 oil barrels', '1,000 cubic feet of methane gas', '50kg of coal'],
        correct: 'gummy bear',
        extraInfo: 'also equivalent to 3 oil barrels and 1 ton of coal!!'
        },
        {
        question: 'What is the land use for nuclear per kwh compared to solar of 19m^2 and onshore wind of 99m^2?',
        choices: ['3m^2', '0.3m^2', '30m^2', '300m^2'],
        correct: '0.3m^2'
        }
    ];

    const renderWelcome = () => (
        <div className="terminal-content">
        <div className="rainbow-text">who wants to learn more about nuclear?</div>
        {showWelcomeText && (
            <div className="welcome-info">
            <div className="how-to-play">HOW TO PLAY</div>
            <p>i am a process of your computer.</p>
            <p>if you get any question wrong i will be <span className="danger">obliterated from nuclear explosion</span></p>
            <p>so get all the questions right...</p>
            <button className="terminal-button" onClick={() => setStage('name')}>
                Press Enter to Continue
            </button>
            </div>
        )}
        </div>
    );

    const renderNameInput = () => (
        <div className="terminal-content">
        <div className="question-text">What is your name?</div>
        <input
            type="text"
            className="terminal-input"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onClick={handleKeyPress}
            placeholder="Player"
            autoFocus
        />
        <button className="terminal-button" onClick={handleNameSubmit}>Submit</button>
        </div>
    );

    const renderQuestion = () => {
        const q = questions[currentQuestion];
        return (
        <div className="terminal-content">
            {isChecking ? (
            <div className="checking">
                <div className="spinner"></div>
                <p>Checking answer...</p>
            </div>
            ) : (
            <>
                <div className="question-text">{q.question}</div>
                <div className="choices">
                {q.choices.map((choice, index) => (
                    <button
                    key={index}
                    className="choice-button"
                    onClick={() => handleAnswer(choice === q.correct)}
                    >
                    {choice}
                    </button>
                ))}
                </div>
                {currentQuestion === 2 && currentQuestion > 0 && (
                <div className="extra-info">
                    <p className="success-text">{q.extraInfo}</p>
                </div>
                )}
            </>
            )}
        </div>
        );
    };

    const renderGameOver = () => (
        <div className="terminal-content game-over">
        <div className="ascii-art">💀💀💀</div>
        <h2>Game over, you die {playerName}!</h2>
        <button className="terminal-button" onClick={resetGame}>
            Try Again
        </button>
        </div>
    );

    const renderWinner = () => (
        <div className="terminal-content winner">
        <div className="ascii-art winner-text">
            Congrats, {playerName}!
        </div>
        <p className="success-text">
            you survived the holocaust and learnt more about nuclear. nuclear isn't as the media portrays; 
            it's cleaner and more efficient than it sounds.
        </p>
        <button className="terminal-button" onClick={resetGame}>
            Play Again
        </button>
        </div>
    );

    return (
        <>
            {isMinimized ? (
                <div className="floating-icon" onClick={handleMaximize}>
                    <Atom/>
                </div>
            ) : (
                <div className="game1-container">
                    <div className="terminal-window">
                        <div className="terminal-header">
                        <div className="traffic-lights">
                            <div className="light red" onClick={handleMinimize}></div>
                            <div className="light yellow" onClick={handleMinimize}></div>
                            <div className="light green" onClick={handleMinimize}></div>
                        </div>
                        <div className="terminal-title">shell — zsh — 80×24</div>
                        </div>
                        <div className="terminal-body">
                        {stage === 'welcome' && renderWelcome()}
                        {stage === 'name' && renderNameInput()}
                        {stage === 'questions' && renderQuestion()}
                        {stage === 'gameover' && renderGameOver()}
                        {stage === 'winner' && renderWinner()}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Game1;