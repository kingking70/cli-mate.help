import { useState, useEffect } from "react";

export function Game1({ width = '100%', height = '600px', className = '' }) {
    const [gameState, setGameState] = useState('welcome');
    const [playerName, setPlayerName] = useState('');
    const [nameInput, setNameInput] = useState('');
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [isChecking, setIsChecking] = useState(false);
    const [showWelcome, setShowWelcome] = useState(false);
  
    useEffect(() => {
        if (gameState === 'welcome') {
        setTimeout(() => setShowWelcome(true), 100);
        }
    }, [gameState]);

    const questions = [
        {
        question: 'What is the best source of energy?',
        choices: ['nuclear', 'solar', 'oil', 'wind'],
        correct: 'nuclear'
        },
        {
        question: 'Why is nuclear the best source of energy?',
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
        correct: 'gummy bear'
        },
        {
        question: 'What is the land use for nuclear per kWh compared to solar of 19m² and onshore wind of 99m²?',
        choices: ['3m²', '0.3m²', '30m²', '300m²'],
        correct: '0.3m²'
        }
    ];

    const handleAnswer = async (answer) => {
        setIsChecking(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        const isCorrect = answer === questions[currentQuestion].correct;
        
        if (isCorrect) {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
            setIsChecking(false);
        } else {
            setGameState('winner');
        }
        } else {
        setGameState('gameover');
        }
    };

    const startGame = () => {
        setPlayerName(nameInput || 'Player');
        setGameState('playing');
    };

    const restartGame = () => {
        setGameState('welcome');
        setPlayerName('');
        setNameInput('');
        setCurrentQuestion(0);
        setIsChecking(false);
        setShowWelcome(false);
    };

    return (
        <div 
        className={`flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 rounded-xl overflow-hidden ${className}`}
        style={{ width, height }}
        >
            <div className="w-full max-w-2xl p-4 md:p-6 lg:p-8 overflow-y-auto max-h-full">
                
                {gameState === 'welcome' && (
                <div className={`text-center transition-all duration-1000 ${showWelcome ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 lg:mb-8 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 text-transparent bg-clip-text animate-pulse">
                    Who Wants To Learn About Nuclear?
                    </h1>
                    
                    <div className="bg-blue-600 text-white p-3 md:p-4 lg:p-6 rounded-lg mb-3 md:mb-4 lg:mb-6 shadow-2xl">
                    <h2 className="text-lg md:text-xl lg:text-2xl font-bold mb-2 md:mb-3 lg:mb-4">HOW TO PLAY</h2>
                    <p className="text-sm md:text-base lg:text-lg leading-relaxed">
                        I am a process of your computer.<br/>
                        If you get any question wrong I will be{' '}
                        <span className="bg-red-600 px-2 py-1 rounded font-bold">obliterated from nuclear</span><br/>
                        So get all the questions right...
                    </p>
                    </div>

                    <input
                    type="text"
                    placeholder="What is your name?"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    onClick={(e) => e.key === 'Enter' && startGame()}
                    className="w-full p-3 md:p-4 text-base md:text-lg lg:text-xl rounded-lg mb-3 md:mb-4 bg-white/10 text-white placeholder-white/50 border-2 border-purple-400 focus:border-pink-400 focus:outline-none"
                    />

                    <button
                    onClick={startGame}
                    className="w-full p-3 md:p-4 text-base md:text-lg lg:text-xl font-bold rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white transition-all transform hover:scale-105 shadow-lg"
                    >
                    Start Game
                    </button>
                </div>
                )}

                {gameState === 'playing' && (
                <div className="text-white">
                    <div className="mb-6 md:mb-8 text-center">
                    <div className="text-xs md:text-sm text-purple-300 mb-2">Question {currentQuestion + 1} of {questions.length}</div>
                    <div className="w-full bg-white/20 rounded-full h-2 md:h-3">
                        <div 
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 md:h-3 rounded-full transition-all duration-500"
                        style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                        />
                    </div>
                    </div>

                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 md:mb-6 lg:mb-8 text-center">
                    {questions[currentQuestion].question}
                    </h2>

                    <div className="space-y-2 md:space-y-3 lg:space-y-4">
                    {questions[currentQuestion].choices.map((choice, index) => (
                        <button
                        key={index}
                        onClick={() => handleAnswer(choice)}
                        disabled={isChecking}
                        className="w-full p-2.5 md:p-3 lg:p-4 text-sm md:text-base lg:text-lg text-left rounded-lg bg-white/10 hover:bg-white/20 border-2 border-purple-400 hover:border-pink-400 transition-all transform hover:scale-102 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                        >
                        {choice}
                        </button>
                    ))}
                    </div>

                    {isChecking && (
                    <div className="mt-4 md:mt-6 text-center">
                        <div className="inline-block animate-spin rounded-full h-6 w-6 md:h-8 md:w-8 border-4 border-purple-500 border-t-pink-500"></div>
                        <p className="mt-2 text-sm md:text-base text-purple-300">Checking answer...</p>
                    </div>
                    )}

                    {!isChecking && currentQuestion === 2 && (
                    <div className="mt-4 md:mt-6 text-center text-green-400 text-sm md:text-base lg:text-lg font-semibold animate-pulse">
                        ✨ Also equivalent to 3 oil barrels and 1 ton of coal!!
                    </div>
                    )}
                </div>
                )}

                {gameState === 'winner' && (
                <div className="text-center text-white">
                    <div className="text-4xl md:text-5xl lg:text-7xl font-bold mb-4 md:mb-6 lg:mb-8 animate-bounce">
                    🎉
                    </div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 lg:mb-6 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 text-transparent bg-clip-text">
                    Congrats, {playerName}!
                    </h1>
                    <div className="bg-green-600/20 border-2 border-green-400 rounded-lg p-3 md:p-4 lg:p-8 mb-3 md:mb-4 lg:mb-6">
                    <p className="text-sm md:text-base lg:text-xl leading-relaxed">
                        You survived the quiz and learned more about nuclear!<br/><br/>
                        Nuclear isn't as the media portrays; it's cleaner and more efficient than it sounds.
                    </p>
                    </div>
                    <button
                    onClick={restartGame}
                    className="px-4 md:px-6 lg:px-8 py-2.5 md:py-3 lg:py-4 text-base md:text-lg lg:text-xl font-bold rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white transition-all transform hover:scale-105 shadow-lg"
                    >
                    Play Again
                    </button>
                </div>
                )}

                {gameState === 'gameover' && (
                <div className="text-center text-white">
                    <div className="text-4xl md:text-5xl lg:text-7xl mb-4 md:mb-6 lg:mb-8">💀💀💀</div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 lg:mb-6 text-red-500">
                    Game Over, {playerName}!
                    </h1>
                    <div className="bg-red-600/20 border-2 border-red-400 rounded-lg p-3 md:p-4 lg:p-8 mb-3 md:mb-4 lg:mb-6">
                    <p className="text-sm md:text-base lg:text-xl">
                        You got obliterated from nuclear! Better luck next time.
                    </p>
                    </div>
                    <button
                    onClick={restartGame}
                    className="px-4 md:px-6 lg:px-8 py-2.5 md:py-3 lg:py-4 text-base md:text-lg lg:text-xl font-bold rounded-lg bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white transition-all transform hover:scale-105 shadow-lg"
                    >
                    Try Again
                    </button>
                </div>
                )}
            </div>
        </div>
    );
}
