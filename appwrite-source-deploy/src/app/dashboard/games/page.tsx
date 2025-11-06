'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader, Gamepad2, Trophy, Star, Sparkles, Home, RotateCcw, CheckCircle2, XCircle, Zap, Flame } from "lucide-react";
import { useUser, useDoc, useMemoAppwrite } from '@/appwrite';
import { appwriteConfig } from '@/appwrite/config';
import { useLanguage } from '@/components/language-provider';
import { translations } from '@/lib/translations';
import { cn } from '@/lib/utils';

// Game data by grade and subject (Grade 3 only)
const gamesByGradeAndSubject: Record<number, Record<string, Array<{ id: string; name: string; description: string; icon: string }>>> = {
  3: {
    Mathematics: [
      { id: 'fraction-builder', name: 'Fraction Builder', description: 'Match fractions to visual representations', icon: '🍕' },
      { id: 'number-pattern-adventure', name: 'Number Pattern Adventure', description: 'Complete number patterns and sequences', icon: '🔢' },
      { id: 'shape-sorter', name: 'Shape Sorter', description: 'Sort shapes into categories', icon: '🔷' },
      { id: 'number-race', name: 'Number Race', description: 'Race to solve math problems quickly!', icon: '🏃' },
      { id: 'addition-adventure', name: 'Addition Adventure', description: 'Add numbers to complete challenges', icon: '➕' },
      { id: 'subtraction-splash', name: 'Subtraction Splash', description: 'Subtract to save the day!', icon: '➖' },
      { id: 'measurement-master', name: 'Measurement Master', description: 'Learn to measure length, weight, and volume', icon: '📏' },
      { id: 'time-teller', name: 'Time Teller', description: 'Read and set clocks correctly', icon: '🕐' },
    ],
    'English Home Language': [
      { id: 'word-builder-adventure', name: 'Word Builder Adventure', description: 'Build words by dragging letters', icon: '⚔️' },
      { id: 'sentence-builder-game', name: 'Sentence Builder', description: 'Build sentences by ordering words', icon: '📝' },
      { id: 'story-sequencer', name: 'Story Sequencer', description: 'Put story events in the correct order', icon: '📖' },
      { id: 'vocabulary-matcher', name: 'Vocabulary Matcher', description: 'Match words to pictures and descriptions', icon: '🎯' },
      { id: 'rhyme-time', name: 'Rhyme Time', description: 'Find words that rhyme together', icon: '🎵' },
      { id: 'spelling-bee', name: 'Spelling Bee', description: 'Spell words correctly to win!', icon: '🐝' },
      { id: 'reading-comprehension', name: 'Reading Comprehension', description: 'Read and answer questions about stories', icon: '📚' },
      { id: 'punctuation-power', name: 'Punctuation Power', description: 'Add correct punctuation marks', icon: '✍️' },
    ],
    'English First Additional Language': [
      { id: 'word-builder-adventure', name: 'Word Builder Adventure', description: 'Build words by dragging letters', icon: '⚔️' },
      { id: 'word-family-sorter', name: 'Word Family Sorter', description: 'Sort words into word families', icon: '🔤' },
      { id: 'tense-builder', name: 'Tense Builder', description: 'Choose the correct verb tense', icon: '⏰' },
      { id: 'vocabulary-hunt', name: 'Vocabulary Hunt', description: 'Find the word that matches the definition', icon: '🔍' },
      { id: 'pronunciation-practice', name: 'Pronunciation Practice', description: 'Learn to pronounce words correctly', icon: '🗣️' },
      { id: 'grammar-games', name: 'Grammar Games', description: 'Practice grammar rules through fun games', icon: '📖' },
      { id: 'conversation-corner', name: 'Conversation Corner', description: 'Practice speaking and listening', icon: '💬' },
      { id: 'word-explorer', name: 'Word Explorer', description: 'Discover new words and their meanings', icon: '🔍' },
    ],
    'Life Skills': [
      { id: 'ecosystem-builder', name: 'Ecosystem Builder', description: 'Build food chains in the correct order', icon: '🌿' },
      { id: 'recycle-sorter', name: 'Recycle Sorter', description: 'Sort items into recycling categories', icon: '♻️' },
      { id: 'life-cycle-puzzle', name: 'Life Cycle Puzzle', description: 'Arrange life cycle stages in order', icon: '🦋' },
      { id: 'weather-wizard', name: 'Weather Wizard', description: 'Learn about different weather patterns', icon: '🌈' },
      { id: 'healthy-habits', name: 'Healthy Habits', description: 'Learn good habits for daily life', icon: '💚' },
      { id: 'community-helpers', name: 'Community Helpers', description: 'Learn about people who help our community', icon: '👮' },
      { id: 'emotion-explorer', name: 'Emotion Explorer', description: 'Identify and understand different emotions', icon: '😊' },
      { id: 'safety-first', name: 'Safety First', description: 'Learn important safety rules', icon: '🛡️' },
    ],
  },
};

export default function GamesPage() {
  const { user } = useUser();
  const lang = useLanguage();
  const t = translations[lang];

  const userProfileRef = useMemoAppwrite(() => {
    if (!user) return null;
    return {
      databaseId: appwriteConfig.databaseId,
      collectionId: 'users',
      documentId: user.$id,
    };
  }, [user]);
  
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<{ gradeLevel?: number; subjects?: string[] }>(userProfileRef);
  const userGrade = userProfile?.gradeLevel || 0;
  
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  // Get available subjects for user's grade - show all available subjects
  const availableSubjects = userGrade && gamesByGradeAndSubject[userGrade]
    ? Object.keys(gamesByGradeAndSubject[userGrade])
    : [];

  // Don't auto-select - let user choose

  if (isProfileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  if (userGrade < 1 || userGrade > 3) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <Card className="max-w-2xl w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Games Available</CardTitle>
            <CardDescription>
              Interactive games are only available for Grades 1-3.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const gamesForSubject = selectedSubject && gamesByGradeAndSubject[userGrade]?.[selectedSubject] || [];

  // Subject selection screen
  if (!selectedSubject) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        <div className="w-full max-w-6xl space-y-6">
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              🎮 Interactive Games
            </h1>
            <p className="text-muted-foreground text-xl">Choose a subject to play games!</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {availableSubjects.map((subject) => {
              const games = gamesByGradeAndSubject[userGrade]?.[subject] || [];
              const subjectIcons: { [key: string]: string } = {
                'Mathematics': '🔢',
                'English Home Language': '📚',
                'English First Additional Language': '📖',
                'Life Skills': '🌍',
              };
              return (
                <Card
                  key={subject}
                  className="cursor-pointer hover:shadow-2xl hover:scale-105 transition-all duration-300 border-2 border-primary/20 bg-gradient-to-br from-card to-muted/30"
                  onClick={() => setSelectedSubject(subject)}
                >
                  <CardHeader className="text-center pb-4">
                    <div className="text-6xl mb-4">{subjectIcons[subject] || '📝'}</div>
                    <CardTitle className="text-2xl font-bold">{subject}</CardTitle>
                    <CardDescription className="text-lg mt-2 font-semibold">
                      {games.length} game{games.length !== 1 ? 's' : ''} available
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0 pb-6">
                    <div className="flex items-center justify-center text-primary font-semibold">
                      View Games →
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Game selection screen
  if (!selectedGame) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        <div className="w-full max-w-6xl space-y-6">
          <Button variant="ghost" onClick={() => setSelectedSubject(null)} className="mb-4 text-lg">
            <Home className="h-5 w-5 mr-2" />
            Back to Subjects
          </Button>
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-2">{selectedSubject}</h1>
            <p className="text-muted-foreground text-lg">Choose a game to play!</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gamesForSubject.map((game) => (
              <Card
                key={game.id}
                className="cursor-pointer hover:shadow-2xl hover:scale-105 transition-all duration-300 border-2 border-primary/10 bg-gradient-to-br from-background to-muted/50"
                onClick={() => setSelectedGame(game.id)}
              >
                <CardHeader className="text-center pb-4">
                  <div className="text-6xl mb-4 animate-bounce">{game.icon}</div>
                  <CardTitle className="text-2xl font-bold">{game.name}</CardTitle>
                  <CardDescription className="text-base mt-2">{game.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0 pb-6">
                  <div className="flex items-center justify-center text-primary font-semibold">
                    Play Now →
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Game screen
  return (
    <InteractiveGameRouter
      gameId={selectedGame}
      grade={userGrade}
      subject={selectedSubject || ''}
      onBack={() => setSelectedGame(null)}
    />
  );
}

// Router component that renders the correct game
function InteractiveGameRouter({
  gameId,
  grade,
  subject,
  onBack,
}: {
  gameId: string;
  grade: number;
  subject: string;
  onBack: () => void;
}) {
  const [gameComplete, setGameComplete] = useState(false);

  const handleFinish = () => {
    setGameComplete(true);
  };

  if (gameComplete) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <Card className="max-w-2xl w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl mb-4">Game Complete! 🎉</CardTitle>
            <CardDescription>Great job playing {gameId}!</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={onBack} className="w-full" size="lg">
              <Home className="h-4 w-4 mr-2" />
              Back to Games
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  switch (gameId) {
    case 'word-builder-adventure':
      return <InteractiveWordBuilder onBack={onBack} onFinish={handleFinish} />;
    case 'fraction-builder':
      return <FractionBuilder onBack={onBack} onFinish={handleFinish} />;
    case 'number-pattern-adventure':
      return <NumberPatternAdventure onBack={onBack} onFinish={handleFinish} />;
    case 'shape-sorter':
      return <ShapeSorter onBack={onBack} onFinish={handleFinish} />;
    case 'sentence-builder-game':
      return <SentenceBuilderGame onBack={onBack} onFinish={handleFinish} />;
    case 'story-sequencer':
      return <StorySequencer onBack={onBack} onFinish={handleFinish} />;
    case 'vocabulary-matcher':
      return <VocabularyMatcher onBack={onBack} onFinish={handleFinish} />;
    case 'word-family-sorter':
      return <WordFamilySorter onBack={onBack} onFinish={handleFinish} />;
    case 'tense-builder':
      return <TenseBuilder onBack={onBack} onFinish={handleFinish} />;
    case 'vocabulary-hunt':
      return <VocabularyHunt onBack={onBack} onFinish={handleFinish} />;
    case 'ecosystem-builder':
      return <EcosystemBuilder onBack={onBack} onFinish={handleFinish} />;
    case 'recycle-sorter':
      return <RecycleSorter onBack={onBack} onFinish={handleFinish} />;
    case 'life-cycle-puzzle':
      return <LifeCyclePuzzle onBack={onBack} onFinish={handleFinish} />;
    case 'number-race':
      return <NumberRace onBack={onBack} onFinish={handleFinish} />;
    case 'addition-adventure':
      return <AdditionAdventure onBack={onBack} onFinish={handleFinish} />;
    case 'subtraction-splash':
      return <SubtractionSplash onBack={onBack} onFinish={handleFinish} />;
    case 'measurement-master':
      return <MeasurementMaster onBack={onBack} onFinish={handleFinish} />;
    case 'time-teller':
      return <TimeTeller onBack={onBack} onFinish={handleFinish} />;
    case 'rhyme-time':
      return <RhymeTime onBack={onBack} onFinish={handleFinish} />;
    case 'spelling-bee':
      return <SpellingBee onBack={onBack} onFinish={handleFinish} />;
    case 'reading-comprehension':
      return <ReadingComprehension onBack={onBack} onFinish={handleFinish} />;
    case 'punctuation-power':
      return <PunctuationPower onBack={onBack} onFinish={handleFinish} />;
    case 'pronunciation-practice':
      return <PronunciationPractice onBack={onBack} onFinish={handleFinish} />;
    case 'grammar-games':
      return <GrammarGames onBack={onBack} onFinish={handleFinish} />;
    case 'conversation-corner':
      return <ConversationCorner onBack={onBack} onFinish={handleFinish} />;
    case 'word-explorer':
      return <WordExplorer onBack={onBack} onFinish={handleFinish} />;
    case 'weather-wizard':
      return <WeatherWizard onBack={onBack} onFinish={handleFinish} />;
    case 'healthy-habits':
      return <HealthyHabits onBack={onBack} onFinish={handleFinish} />;
    case 'community-helpers':
      return <CommunityHelpers onBack={onBack} onFinish={handleFinish} />;
    case 'emotion-explorer':
      return <EmotionExplorer onBack={onBack} onFinish={handleFinish} />;
    case 'safety-first':
      return <SafetyFirst onBack={onBack} onFinish={handleFinish} />;
    default:
      return (
        <div className="flex items-center justify-center min-h-screen px-4">
          <Card className="max-w-2xl w-full">
            <CardHeader>
              <CardTitle>Game not found</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={onBack}>Back</Button>
            </CardContent>
          </Card>
        </div>
      );
  }
}

// ==================== GAME COMPONENTS ====================

// Interactive Word Builder Game
function InteractiveWordBuilder({ onBack, onFinish }: { onBack: () => void; onFinish: () => void }) {
  const words = [
    { word: 'KNIGHT', hint: 'A brave warrior in armor', icon: '⚔️' },
    { word: 'CASTLE', hint: 'A big stone building with towers', icon: '🏰' },
    { word: 'DRAGON', hint: 'A magical flying creature', icon: '🐉' },
    { word: 'MAGIC', hint: 'Special powers and spells', icon: '✨' },
    { word: 'QUEST', hint: 'An exciting adventure journey', icon: '🗺️' },
    { word: 'TREASURE', hint: 'Valuable gold and jewels', icon: '💎' },
    { word: 'ADVENTURE', hint: 'An exciting and dangerous journey', icon: '🌟' },
    { word: 'EXPLORER', hint: 'Someone who travels to discover new places', icon: '🧭' },
    { word: 'KINGDOM', hint: 'Land ruled by a king or queen', icon: '👑' },
    { word: 'PRINCESS', hint: 'A daughter of a king or queen', icon: '👸' },
    { word: 'WIZARD', hint: 'A person with magical powers', icon: '🧙' },
    { word: 'JOURNEY', hint: 'A long trip from one place to another', icon: '🗺️' },
    { word: 'HERO', hint: 'A brave person who saves others', icon: '🦸' },
    { word: 'SWORD', hint: 'A sharp weapon for fighting', icon: '⚔️' },
    { word: 'SHIELD', hint: 'Armor to protect in battle', icon: '🛡️' },
    { word: 'FOREST', hint: 'A place with many trees', icon: '🌲' },
    { word: 'MOUNTAIN', hint: 'A very tall piece of land', icon: '⛰️' },
    { word: 'RIVER', hint: 'Flowing water through the land', icon: '🌊' },
    { word: 'BRIDGE', hint: 'A structure over water', icon: '🌉' },
    { word: 'PALACE', hint: 'A grand home for royalty', icon: '🏰' },
  ];

  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [draggedLetter, setDraggedLetter] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [wordSlots, setWordSlots] = useState<(string | null)[]>([]);
  const [availableLetters, setAvailableLetters] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  const currentWord = words[currentWordIndex];
  const isComplete = currentWordIndex >= words.length;

  useEffect(() => {
    if (currentWord) {
      const letters = currentWord.word.split('');
      const shuffled = [...letters].sort(() => Math.random() - 0.5);
      setAvailableLetters(shuffled);
      setWordSlots(new Array(letters.length).fill(null));
      setShowSuccess(false);
      setShowError(false);
    }
  }, [currentWordIndex]);

  const handleDrop = (slotIndex: number) => {
    if (!draggedLetter || draggedIndex === null) return;

    const newSlots = [...wordSlots];
    newSlots[slotIndex] = draggedLetter;
    setWordSlots(newSlots);
    
    const newAvailable = availableLetters.filter((_, i) => i !== draggedIndex);
    setAvailableLetters(newAvailable);
    setDraggedLetter(null);
    setDraggedIndex(null);

    // Check if word is complete
    const completeWord = newSlots.join('');
    if (completeWord === currentWord.word && newSlots.every(s => s !== null)) {
      setShowSuccess(true);
      setScore(score + 1);
      setTimeout(() => {
        if (currentWordIndex < words.length - 1) {
          setCurrentWordIndex(currentWordIndex + 1);
          setShowSuccess(false);
        } else {
          onFinish();
        }
      }, 2000);
    } else if (newSlots.every(s => s !== null) && completeWord !== currentWord.word) {
      // Wrong word completed
      setShowError(true);
      const newLives = lives - 1;
      setLives(newLives);
      if (newLives === 0) {
        setTimeout(() => {
          onFinish();
        }, 2000);
      } else {
        setTimeout(() => {
          setShowError(false);
          // Reset current word
          const letters = currentWord.word.split('');
          const shuffled = [...letters].sort(() => Math.random() - 0.5);
          setAvailableLetters(shuffled);
          setWordSlots(new Array(letters.length).fill(null));
        }, 1500);
      }
    }
  };

  const handleReturnLetter = (slotIndex: number) => {
    const letter = wordSlots[slotIndex];
    if (!letter) return;

    const newSlots = [...wordSlots];
    newSlots[slotIndex] = null;
    setWordSlots(newSlots);
    setAvailableLetters([...availableLetters, letter]);
  };

  if (isComplete) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] px-4">
        <Card className="max-w-2xl w-full border-2 border-primary/20 shadow-2xl">
          <CardHeader className="text-center space-y-4 pb-6">
            <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mb-4">
              <Trophy className="h-12 w-12 text-white" />
            </div>
            <CardTitle className="text-4xl font-bold">Word Master! 🎉</CardTitle>
            <div className="text-6xl font-bold text-primary">{score}/{words.length}</div>
          </CardHeader>
          <CardContent>
            <Button onClick={onBack} className="w-full text-lg py-6" size="lg">
              <Home className="h-5 w-5 mr-2" />
              Back to Games
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (lives === 0) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] px-4">
        <Card className="max-w-2xl w-full border-2 border-red-200 shadow-2xl">
          <CardHeader className="text-center space-y-4 pb-6">
            <CardTitle className="text-4xl font-bold">Game Over! 💔</CardTitle>
            <div className="text-6xl font-bold text-red-500">{score}/{words.length}</div>
          </CardHeader>
          <CardContent>
            <Button onClick={onBack} className="w-full text-lg py-6" size="lg">
              <Home className="h-5 w-5 mr-2" />
              Back to Games
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4 py-8">
      <div className="w-full max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={onBack} className="text-lg">
            <Home className="h-5 w-5 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Words</div>
              <div className="text-3xl font-bold">{score}/{words.length}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Lives</div>
              <div className="text-3xl font-bold flex gap-1">
                {[...Array(lives)].map((_, i) => (
                  <span key={i} className="text-red-500">❤️</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <Card className="border-2 shadow-2xl bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30">
          <CardHeader className="text-center pb-4">
            <div className="text-6xl mb-4">{currentWord.icon}</div>
            <CardTitle className="text-3xl md:text-4xl font-bold mb-2">Build the Word!</CardTitle>
            <CardDescription className="text-xl">{currentWord.hint}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-8 pb-8">
            <div className="flex justify-center gap-2">
              {wordSlots.map((letter, index) => (
                <div
                  key={index}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.add('ring-4', 'ring-primary', 'bg-primary/10');
                  }}
                  onDragLeave={(e) => {
                    e.currentTarget.classList.remove('ring-4', 'ring-primary', 'bg-primary/10');
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove('ring-4', 'ring-primary', 'bg-primary/10');
                    handleDrop(index);
                  }}
                  onClick={() => handleReturnLetter(index)}
                  className={cn(
                    "w-16 h-16 rounded-xl border-4 border-dashed flex items-center justify-center text-4xl font-bold transition-all cursor-pointer",
                    letter ? "bg-green-100 border-green-500 text-green-700" : "bg-gray-100 border-gray-300 text-gray-400"
                  )}
                >
                  {letter || index + 1}
                </div>
              ))}
            </div>

            {showSuccess && (
              <div className="text-center animate-in zoom-in">
                <div className="text-6xl animate-bounce mb-4">🎉✨</div>
                <div className="text-3xl font-bold text-green-600">Perfect!</div>
              </div>
            )}

            {showError && (
              <div className="text-center animate-in zoom-in">
                <div className="text-6xl animate-bounce mb-4">❌</div>
                <div className="text-3xl font-bold text-red-600">
                  {lives > 0 ? 'Wrong word! Lives left: ' + lives : 'Game Over!'}
                </div>
              </div>
            )}

            {!showSuccess && !showError && (
              <>
                <div className="text-center">
                  <p className="text-lg font-semibold mb-4">Drag letters to build the word!</p>
                </div>
                <div className="flex justify-center gap-3 flex-wrap min-h-[100px] p-6 bg-white/30 rounded-xl">
                  {availableLetters.map((letter, index) => (
                    <div
                      key={`${letter}-${index}-${currentWordIndex}`}
                      draggable
                      onDragStart={() => {
                        setDraggedLetter(letter);
                        setDraggedIndex(index);
                      }}
                      onDragEnd={() => {
                        setDraggedLetter(null);
                        setDraggedIndex(null);
                      }}
                      className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-400 to-blue-500 text-white flex items-center justify-center text-4xl font-bold cursor-grab active:cursor-grabbing shadow-lg transition-all hover:scale-110 hover:rotate-3"
                    >
                      {letter}
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
              <div 
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-4 rounded-full transition-all duration-500"
                style={{ width: `${((currentWordIndex + 1) / words.length) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Fraction Builder Game
function FractionBuilder({ onBack, onFinish }: { onBack: () => void; onFinish: () => void }) {
  const challenges = [
    { fraction: '1/2', visual: '🍕🍕', description: 'Half of a pizza', icon: '🍕' },
    { fraction: '1/3', visual: '🍰🍰🍰', description: 'One third of a cake', icon: '🍰' },
    { fraction: '1/4', visual: '🍎🍎🍎🍎', description: 'One quarter of apples', icon: '🍎' },
    { fraction: '2/4', visual: '🧁🧁🧁🧁', description: 'Two quarters (same as half)', icon: '🧁' },
    { fraction: '3/4', visual: '🍪🍪🍪🍪', description: 'Three quarters', icon: '🍪' },
    { fraction: '2/3', visual: '🥧🥧🥧', description: 'Two thirds of a pie', icon: '🥧' },
    { fraction: '1/5', visual: '🍊🍊🍊🍊🍊', description: 'One fifth', icon: '🍊' },
    { fraction: '2/5', visual: '🍓🍓🍓🍓🍓', description: 'Two fifths', icon: '🍓' },
    { fraction: '3/5', visual: '🍌🍌🍌🍌🍌', description: 'Three fifths', icon: '🍌' },
    { fraction: '4/5', visual: '🍉🍉🍉🍉🍉', description: 'Four fifths', icon: '🍉' },
    { fraction: '1/6', visual: '🍇🍇🍇🍇🍇🍇', description: 'One sixth', icon: '🍇' },
    { fraction: '5/6', visual: '🥝🥝🥝🥝🥝🥝', description: 'Five sixths', icon: '🥝' },
    { fraction: '1/8', visual: '🍩🍩🍩🍩🍩🍩🍩🍩', description: 'One eighth', icon: '🍩' },
    { fraction: '3/8', visual: '🧇🧇🧇🧇🧇🧇🧇🧇', description: 'Three eighths', icon: '🧇' },
    { fraction: '5/8', visual: '🥐🥐🥐🥐🥐🥐🥐🥐', description: 'Five eighths', icon: '🥐' },
    { fraction: '7/8', visual: '🥖🥖🥖🥖🥖🥖🥖🥖', description: 'Seven eighths', icon: '🥖' },
    { fraction: '2/6', visual: '🥑🥑🥑🥑🥑🥑', description: 'Two sixths', icon: '🥑' },
    { fraction: '4/6', visual: '🍒🍒🍒🍒🍒🍒', description: 'Four sixths', icon: '🍒' },
    { fraction: '3/3', visual: '🍇🍇🍇', description: 'Three thirds (whole)', icon: '🍇' },
    { fraction: '4/4', visual: '🍉🍉🍉🍉', description: 'Four quarters (whole)', icon: '🍉' },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [draggedFraction, setDraggedFraction] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  const currentChallenge = challenges[currentIndex];
  const isComplete = currentIndex >= challenges.length;
  
  // Memoize options so they don't reshuffle on every render
  const options = useMemo(() => {
    const challenge = challenges[currentIndex];
    if (!challenge) return [];
    const shuffled = [
      challenge.fraction,
      ...challenges.filter((_, i) => i !== currentIndex).slice(0, 3).map(c => c.fraction)
    ].sort(() => Math.random() - 0.5);
    return shuffled;
  }, [currentIndex]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedFraction) return;
    
    if (draggedFraction === currentChallenge.fraction) {
      setShowSuccess(true);
      setScore(score + 1);
      setTimeout(() => {
        if (currentIndex < challenges.length - 1) {
          setCurrentIndex(currentIndex + 1);
          setShowSuccess(false);
          setSelectedSlot(null);
        } else {
          onFinish();
        }
      }, 1500);
    } else {
      setShowError(true);
      const newLives = lives - 1;
      setLives(newLives);
      if (newLives === 0) {
        setTimeout(() => {
          onFinish();
        }, 2000);
      } else {
        setTimeout(() => {
          setShowError(false);
          setSelectedSlot(null);
        }, 1500);
      }
    }
    setDraggedFraction(null);
    setDraggedIndex(null);
    setSelectedSlot(null);
  };

  if (isComplete) {
    const percentage = Math.round((score / challenges.length) * 100);
    return (
      <div className="flex items-center justify-center min-h-[80vh] px-4">
        <Card className="max-w-2xl w-full border-2 border-primary/20 shadow-2xl">
          <CardHeader className="text-center space-y-4 pb-6">
            <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mb-4">
              <Trophy className="h-12 w-12 text-white" />
            </div>
            <CardTitle className="text-4xl font-bold">Fractions Master! 🎉</CardTitle>
            <CardDescription className="text-xl">You matched {score} fractions!</CardDescription>
            <div className="text-6xl font-bold text-primary">{score}/{challenges.length}</div>
          </CardHeader>
          <CardContent>
            <Button onClick={onBack} className="w-full text-lg py-6" size="lg">
              <Home className="h-5 w-5 mr-2" />
              Back to Games
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (lives === 0) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] px-4">
        <Card className="max-w-2xl w-full border-2 border-red-200 shadow-2xl">
          <CardHeader className="text-center space-y-4 pb-6">
            <CardTitle className="text-4xl font-bold">Game Over! 💔</CardTitle>
            <div className="text-6xl font-bold text-red-500">{score}/{challenges.length}</div>
          </CardHeader>
          <CardContent>
            <Button onClick={onBack} className="w-full text-lg py-6" size="lg">
              <Home className="h-5 w-5 mr-2" />
              Back to Games
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4 py-8">
      <div className="w-full max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={onBack} className="text-lg">
            <Home className="h-5 w-5 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Matched</div>
              <div className="text-3xl font-bold">{score}/{challenges.length}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Lives</div>
              <div className="text-3xl font-bold flex gap-1">
                {[...Array(lives)].map((_, i) => (
                  <span key={i} className="text-red-500">❤️</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <Card className="border-2 shadow-2xl bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-950/30 dark:to-yellow-950/30">
          <CardHeader className="text-center pb-4">
            <div className="text-6xl mb-4">{currentChallenge.icon}</div>
            <CardTitle className="text-3xl md:text-4xl font-bold mb-2">Match the Fraction!</CardTitle>
            <CardDescription className="text-xl">{currentChallenge.description}</CardDescription>
            <div className="text-5xl mt-4 font-bold">{currentChallenge.visual}</div>
          </CardHeader>

          <CardContent className="space-y-8 pb-8">
            <div className="flex justify-center gap-4">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (draggedFraction) {
                    setSelectedSlot('target');
                  }
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  if (e.currentTarget === e.target && !showSuccess && !showError) {
                    setSelectedSlot(null);
                  }
                }}
                onDrop={handleDrop}
                className={cn(
                  "w-48 h-48 rounded-xl border-4 border-dashed flex items-center justify-center text-6xl font-bold transition-all",
                  selectedSlot === 'target' && draggedFraction ? "border-primary ring-4 ring-primary bg-primary/10" : "border-gray-300 bg-white/50"
                )}
              >
                {draggedFraction && selectedSlot === 'target' ? (
                  <span className="animate-in zoom-in text-6xl font-bold">{draggedFraction}</span>
                ) : !draggedFraction && !showSuccess && !showError ? (
                  <span className="text-gray-400 text-lg">Drop fraction here</span>
                ) : null}
              </div>
            </div>

            {showSuccess && (
              <div className="text-center animate-in zoom-in">
                <div className="text-6xl animate-bounce mb-4">🎉✨</div>
                <div className="text-3xl font-bold text-green-600">Correct!</div>
              </div>
            )}

            {showError && (
              <div className="text-center animate-in zoom-in">
                <div className="text-6xl animate-bounce mb-4">❌</div>
                <div className="text-3xl font-bold text-red-600">
                  {lives > 0 ? 'Wrong! Lives left: ' + lives : 'Game Over!'}
                </div>
              </div>
            )}

            {!showSuccess && !showError && (
              <>
                <div className="text-center">
                  <p className="text-lg font-semibold mb-4">Drag the correct fraction to match!</p>
                </div>
                <div className="flex justify-center gap-4 flex-wrap">
                  {options.map((fraction, index) => (
                    <div
                      key={`${fraction}-${currentIndex}`}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.effectAllowed = 'move';
                        setDraggedFraction(fraction);
                        setDraggedIndex(index);
                      }}
                      onDragEnd={(e) => {
                        e.preventDefault();
                        if (!showSuccess && !showError) {
                          setDraggedFraction(null);
                          setDraggedIndex(null);
                          setSelectedSlot(null);
                        }
                      }}
                      className={cn(
                        "w-24 h-24 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 text-white flex items-center justify-center text-3xl font-bold cursor-grab shadow-lg transition-all hover:scale-110 hover:rotate-3",
                        draggedFraction === fraction && "opacity-50"
                      )}
                    >
                      {fraction}
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
              <div 
                className="bg-gradient-to-r from-orange-500 to-yellow-500 h-4 rounded-full transition-all duration-500"
                style={{ width: `${((currentIndex + 1) / challenges.length) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Number Pattern Adventure Game
function NumberPatternAdventure({ onBack, onFinish }: { onBack: () => void; onFinish: () => void }) {
  const patterns = [
    { sequence: [2, 4, 6, 8], missing: 10, description: 'Even numbers', icon: '🔢' },
    { sequence: [5, 10, 15, 20], missing: 25, description: 'Counting by 5s', icon: '⭐' },
    { sequence: [10, 9, 8, 7], missing: 6, description: 'Counting backwards', icon: '🔺' },
    { sequence: [3, 6, 9, 12], missing: 15, description: 'Counting by 3s', icon: '✨' },
    { sequence: [1, 4, 7, 10], missing: 13, description: 'Add 3 each time', icon: '🌟' },
    { sequence: [20, 18, 16, 14], missing: 12, description: 'Subtract 2 each time', icon: '💫' },
    { sequence: [1, 3, 5, 7], missing: 9, description: 'Odd numbers', icon: '🔷' },
    { sequence: [4, 8, 12, 16], missing: 20, description: 'Counting by 4s', icon: '🎯' },
    { sequence: [50, 45, 40, 35], missing: 30, description: 'Subtract 5 each time', icon: '📊' },
    { sequence: [2, 5, 8, 11], missing: 14, description: 'Add 3 each time', icon: '🧮' },
    { sequence: [6, 12, 18, 24], missing: 30, description: 'Counting by 6s', icon: '🔢' },
    { sequence: [100, 95, 90, 85], missing: 80, description: 'Subtract 5 each time', icon: '📉' },
    { sequence: [7, 14, 21, 28], missing: 35, description: 'Counting by 7s', icon: '⭐' },
    { sequence: [11, 22, 33, 44], missing: 55, description: 'Counting by 11s', icon: '🔢' },
    { sequence: [25, 20, 15, 10], missing: 5, description: 'Subtract 5 each time', icon: '📊' },
    { sequence: [2, 6, 10, 14], missing: 18, description: 'Add 4 each time', icon: '➕' },
    { sequence: [30, 25, 20, 15], missing: 10, description: 'Subtract 5 each time', icon: '➖' },
    { sequence: [8, 16, 24, 32], missing: 40, description: 'Counting by 8s', icon: '🎯' },
    { sequence: [9, 18, 27, 36], missing: 45, description: 'Counting by 9s', icon: '✨' },
    { sequence: [12, 24, 36, 48], missing: 60, description: 'Counting by 12s', icon: '🔢' },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  const currentPattern = patterns[currentIndex];
  const isComplete = currentIndex >= patterns.length;

  // Memoize options so they don't reshuffle on every render
  const options = useMemo(() => {
    const pattern = patterns[currentIndex];
    if (!pattern) return [];
    const correct = pattern.missing;
    const wrongAnswers: number[] = [];
    
    const diff = pattern.sequence.length > 1
      ? pattern.sequence[1] - pattern.sequence[0]
      : 1;
    
    wrongAnswers.push(correct + diff);
    wrongAnswers.push(correct - diff);
    wrongAnswers.push(correct + diff * 2);
    wrongAnswers.push(correct - diff * 2);
    wrongAnswers.push(correct + 1);
    wrongAnswers.push(correct - 1);
    wrongAnswers.push(correct + 3);
    wrongAnswers.push(correct - 3);
    
    const unique = [...new Set(wrongAnswers)]
      .filter(n => n > 0 && n !== correct)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    
    return [correct, ...unique].sort(() => Math.random() - 0.5);
  }, [currentIndex]);

  const handleAnswer = (answer: number) => {
    setSelectedAnswer(answer);
    if (answer === currentPattern.missing) {
      setShowSuccess(true);
      setScore(score + 1);
      setTimeout(() => {
        if (currentIndex < patterns.length - 1) {
          setCurrentIndex(currentIndex + 1);
          setShowSuccess(false);
          setSelectedAnswer(null);
        } else {
          onFinish();
        }
      }, 1500);
    } else {
      setShowError(true);
      const newLives = lives - 1;
      setLives(newLives);
      if (newLives === 0) {
        setTimeout(() => {
          onFinish();
        }, 2000);
      } else {
        setTimeout(() => {
          setShowError(false);
          setSelectedAnswer(null);
        }, 1500);
      }
    }
  };

  if (isComplete) {
    const percentage = Math.round((score / patterns.length) * 100);
    return (
      <div className="flex items-center justify-center min-h-[80vh] px-4">
        <Card className="max-w-2xl w-full border-2 border-primary/20 shadow-2xl">
          <CardHeader className="text-center space-y-4 pb-6">
            <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mb-4">
              <Trophy className="h-12 w-12 text-white" />
            </div>
            <CardTitle className="text-4xl font-bold">Pattern Master! 🎉</CardTitle>
            <div className="text-6xl font-bold text-primary">{score}/{patterns.length}</div>
          </CardHeader>
          <CardContent>
            <Button onClick={onBack} className="w-full text-lg py-6" size="lg">
              <Home className="h-5 w-5 mr-2" />
              Back to Games
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (lives === 0) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] px-4">
        <Card className="max-w-2xl w-full border-2 border-red-200 shadow-2xl">
          <CardHeader className="text-center space-y-4 pb-6">
            <CardTitle className="text-4xl font-bold">Game Over! 💔</CardTitle>
            <div className="text-6xl font-bold text-red-500">{score}/{patterns.length}</div>
          </CardHeader>
          <CardContent>
            <Button onClick={onBack} className="w-full text-lg py-6" size="lg">
              <Home className="h-5 w-5 mr-2" />
              Back to Games
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const displaySequence = [...currentPattern.sequence, '?'];

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4 py-8">
      <div className="w-full max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={onBack} className="text-lg">
            <Home className="h-5 w-5 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Score</div>
              <div className="text-3xl font-bold">{score}/{patterns.length}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Lives</div>
              <div className="text-3xl font-bold flex gap-1">
                {[...Array(lives)].map((_, i) => (
                  <span key={i} className="text-red-500">❤️</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <Card className="border-2 shadow-2xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30">
          <CardHeader className="text-center pb-4">
            <div className="text-6xl mb-4">{currentPattern.icon}</div>
            <CardTitle className="text-3xl md:text-4xl font-bold mb-2">Complete the Pattern!</CardTitle>
            <CardDescription className="text-xl">{currentPattern.description}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-8 pb-8">
            <div className="flex justify-center gap-4 text-6xl font-bold">
              {displaySequence.map((item, idx) => (
                <div key={idx} className={cn(
                  "w-20 h-20 rounded-xl flex items-center justify-center",
                  item === '?' ? "bg-yellow-200 border-4 border-dashed border-yellow-400" : "bg-blue-200 border-2 border-blue-400"
                )}>
                  {item}
                </div>
              ))}
            </div>

            {showSuccess && (
              <div className="text-center animate-in zoom-in">
                <div className="text-6xl animate-bounce mb-4">🎉✨</div>
                <div className="text-3xl font-bold text-green-600">Excellent!</div>
              </div>
            )}

            {showError && (
              <div className="text-center animate-in zoom-in">
                <div className="text-6xl animate-bounce mb-4">❌</div>
                <div className="text-3xl font-bold text-red-600">
                  {lives > 0 ? 'Wrong! Lives left: ' + lives : 'Game Over!'}
                </div>
              </div>
            )}

            {!showSuccess && !showError && (
              <>
                <div className="text-center">
                  <p className="text-lg font-semibold mb-4">Click the number that comes next!</p>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  {options.map((option, idx) => (
                    <button
                      key={`${option}-${currentIndex}`}
                      onClick={() => handleAnswer(option)}
                      disabled={showSuccess || showError}
                      className={cn(
                        "w-full h-24 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 text-white text-4xl font-bold shadow-lg transition-all hover:scale-110 hover:shadow-2xl",
                        (showSuccess || showError) && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </>
            )}

            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-4 rounded-full transition-all duration-500"
                style={{ width: `${((currentIndex + 1) / patterns.length) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Shape Sorter Game (Mathematics)
function ShapeSorter({ onBack, onFinish }: { onBack: () => void; onFinish: () => void }) {
  const categories = [
    { name: 'Triangles', shapes: ['🔺', '🔺', '🔺'], description: '3 sides', icon: '🔺' },
    { name: 'Squares', shapes: ['⬜', '⬜', '⬜'], description: '4 equal sides', icon: '⬜' },
    { name: 'Circles', shapes: ['⭕', '⭕', '⭕'], description: 'Round shapes', icon: '⭕' },
    { name: 'Rectangles', shapes: ['▭', '▭', '▭'], description: '4 sides, opposite equal', icon: '▭' },
  ];

  // Create enough shapes for 20+ rounds (5 rounds per category = 20)
  const allShapes = useMemo(() => {
    const shapes: { shape: string; category: string }[] = [];
    for (let round = 0; round < 5; round++) {
      categories.forEach(cat => {
        shapes.push(...cat.shapes.map(s => ({ shape: s, category: cat.name })));
      });
    }
    return shapes.sort(() => Math.random() - 0.5);
  }, []);

  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [sortedShapes, setSortedShapes] = useState<{ [key: string]: string[] }>({
    'Triangles': [],
    'Squares': [],
    'Circles': [],
    'Rectangles': [],
  });
  const [availableShapes, setAvailableShapes] = useState<typeof allShapes>([]);
  const [draggedShape, setDraggedShape] = useState<{ shape: string; category: string; index: number } | null>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  const currentCategory = categories[currentCategoryIndex];
  const totalRounds = categories.length * 5;
  const isComplete = currentCategoryIndex >= categories.length;

  useEffect(() => {
    if (!isComplete) {
      const categoryName = categories[currentCategoryIndex]?.name;
      if (categoryName) {
        const shapesForRound = allShapes
          .filter(s => s.category === categoryName || Math.random() > 0.5)
          .slice(0, 8);
        setAvailableShapes(shapesForRound);
        setSortedShapes({ 'Triangles': [], 'Squares': [], 'Circles': [], 'Rectangles': [] });
        setShowSuccess(false);
        setShowError(false);
      }
    }
  }, [currentCategoryIndex, isComplete]);

  const handleDrop = (categoryName: string) => {
    if (!draggedShape) return;

    const newSorted = [...sortedShapes[categoryName], draggedShape.shape];
    setSortedShapes({ ...sortedShapes, [categoryName]: newSorted });
    setAvailableShapes(availableShapes.filter((_, i) => i !== draggedShape.index));
    setDraggedShape(null);

    // Check if round complete (all shapes of current category sorted)
    const correctShapes = availableShapes.filter(s => s.category === currentCategory.name).length;
    if (newSorted.length === correctShapes && newSorted.every(s => s === currentCategory.shapes[0])) {
      setShowSuccess(true);
      setScore(score + 1);
      setTimeout(() => {
        if (currentCategoryIndex < categories.length - 1) {
          setCurrentCategoryIndex(currentCategoryIndex + 1);
          setShowSuccess(false);
        } else {
          onFinish();
        }
      }, 2000);
    } else if (newSorted.length > 0 && !currentCategory.shapes.includes(draggedShape.shape)) {
      setShowError(true);
      const newLives = lives - 1;
      setLives(newLives);
      if (newLives === 0) {
        setTimeout(() => {
          onFinish();
        }, 2000);
      } else {
        setTimeout(() => {
          setShowError(false);
          const shapesForRound = allShapes
            .filter(s => s.category === currentCategory.name || Math.random() > 0.5)
            .slice(0, 8);
          setAvailableShapes(shapesForRound);
          setSortedShapes({ 'Triangles': [], 'Squares': [], 'Circles': [], 'Rectangles': [] });
        }, 1500);
      }
    }
  };

  if (isComplete) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] px-4">
        <Card className="max-w-2xl w-full border-2 border-primary/20 shadow-2xl">
          <CardHeader className="text-center space-y-4 pb-6">
            <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mb-4">
              <Trophy className="h-12 w-12 text-white" />
            </div>
            <CardTitle className="text-4xl font-bold">Shape Master! 🎉</CardTitle>
            <div className="text-6xl font-bold text-primary">{score}/{categories.length}</div>
          </CardHeader>
          <CardContent>
            <Button onClick={onBack} className="w-full text-lg py-6" size="lg">
              <Home className="h-5 w-5 mr-2" />
              Back to Games
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (lives === 0) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] px-4">
        <Card className="max-w-2xl w-full border-2 border-red-200 shadow-2xl">
          <CardHeader className="text-center space-y-4 pb-6">
            <CardTitle className="text-4xl font-bold">Game Over! 💔</CardTitle>
            <div className="text-6xl font-bold text-red-500">{score}/{categories.length}</div>
          </CardHeader>
          <CardContent>
            <Button onClick={onBack} className="w-full text-lg py-6" size="lg">
              <Home className="h-5 w-5 mr-2" />
              Back to Games
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4 py-8">
      <div className="w-full max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={onBack} className="text-lg">
            <Home className="h-5 w-5 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Categories</div>
              <div className="text-3xl font-bold">{score}/{categories.length}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Lives</div>
              <div className="text-3xl font-bold flex gap-1">
                {[...Array(lives)].map((_, i) => (
                  <span key={i} className="text-red-500">❤️</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <Card className="border-2 shadow-2xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30">
          <CardHeader className="text-center pb-4">
            <div className="text-6xl mb-4">{currentCategory.icon}</div>
            <CardTitle className="text-3xl md:text-4xl font-bold mb-2">Sort the {currentCategory.name}!</CardTitle>
            <CardDescription className="text-xl">{currentCategory.description}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-8 pb-8">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.classList.add('ring-4', 'ring-primary', 'bg-primary/10');
              }}
              onDragLeave={(e) => {
                e.currentTarget.classList.remove('ring-4', 'ring-primary', 'bg-primary/10');
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove('ring-4', 'ring-primary', 'bg-primary/10');
                handleDrop(currentCategory.name);
              }}
              className="min-h-32 rounded-xl border-4 border-dashed border-primary p-6 bg-primary/5"
            >
              <div className="font-bold text-xl mb-3">{currentCategory.name}:</div>
              <div className="flex gap-3 flex-wrap">
                {sortedShapes[currentCategory.name].map((shape, i) => (
                  <div key={i} className="text-4xl">{shape}</div>
                ))}
              </div>
            </div>

            {showSuccess && (
              <div className="text-center animate-in zoom-in">
                <div className="text-6xl animate-bounce mb-4">🎉✨</div>
                <div className="text-3xl font-bold text-green-600">Perfect! All {currentCategory.name} sorted!</div>
              </div>
            )}

            {showError && (
              <div className="text-center animate-in zoom-in">
                <div className="text-6xl animate-bounce mb-4">❌</div>
                <div className="text-3xl font-bold text-red-600">
                  {lives > 0 ? 'Wrong shape! Lives left: ' + lives : 'Game Over!'}
                </div>
              </div>
            )}

            {!showSuccess && !showError && (
              <>
                <div className="text-center">
                  <p className="text-lg font-semibold mb-4">Drag {currentCategory.name.toLowerCase()} here!</p>
                </div>
                <div className="flex justify-center gap-3 flex-wrap">
                  {availableShapes.map((item, index) => (
                    <div
                      key={`${item.shape}-${index}-${currentCategoryIndex}`}
                      draggable
                      onDragStart={() => {
                        setDraggedShape({ shape: item.shape, category: item.category, index });
                      }}
                      onDragEnd={() => {
                        setDraggedShape(null);
                      }}
                      className="text-5xl cursor-grab active:cursor-grabbing hover:scale-110 transition-transform"
                    >
                      {item.shape}
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
              <div 
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-4 rounded-full transition-all duration-500"
                style={{ width: `${((currentCategoryIndex + 1) / categories.length) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Sentence Builder Game (English Home Language)
function SentenceBuilderGame({ onBack, onFinish }: { onBack: () => void; onFinish: () => void }) {
  const sentences = [
    { words: ['The', 'cat', 'sat', 'on', 'the', 'mat'], hint: 'Build a sentence about a cat', icon: '🐱' },
    { words: ['She', 'loves', 'to', 'read', 'books'], hint: 'Build a sentence about reading', icon: '📚' },
    { words: ['We', 'went', 'to', 'the', 'park'], hint: 'Build a sentence about going somewhere', icon: '🏞️' },
    { words: ['I', 'like', 'playing', 'with', 'friends'], hint: 'Build a sentence about playing', icon: '🎮' },
    { words: ['The', 'sun', 'shines', 'brightly', 'today'], hint: 'Build a sentence about weather', icon: '☀️' },
    { words: ['My', 'teacher', 'is', 'very', 'kind'], hint: 'Build a sentence about a teacher', icon: '👩‍🏫' },
    { words: ['Birds', 'fly', 'in', 'the', 'sky'], hint: 'Build a sentence about birds', icon: '🐦' },
    { words: ['I', 'eat', 'breakfast', 'every', 'morning'], hint: 'Build a sentence about breakfast', icon: '🥞' },
    { words: ['The', 'dog', 'chased', 'the', 'ball'], hint: 'Build a sentence about a dog', icon: '🐶' },
    { words: ['Students', 'learn', 'new', 'things', 'at', 'school'], hint: 'Build a sentence about learning', icon: '🏫' },
    { words: ['The', 'book', 'was', 'very', 'interesting'], hint: 'Build a sentence about a book', icon: '📖' },
    { words: ['I', 'saw', 'a', 'beautiful', 'rainbow'], hint: 'Build a sentence about a rainbow', icon: '🌈' },
    { words: ['Mom', 'cooked', 'delicious', 'dinner', 'tonight'], hint: 'Build a sentence about dinner', icon: '🍽️' },
    { words: ['The', 'flowers', 'are', 'blooming', 'in', 'spring'], hint: 'Build a sentence about flowers', icon: '🌸' },
    { words: ['We', 'play', 'soccer', 'on', 'Saturdays'], hint: 'Build a sentence about playing sports', icon: '⚽' },
    { words: ['The', 'library', 'has', 'many', 'good', 'books'], hint: 'Build a sentence about a library', icon: '📚' },
    { words: ['I', 'helped', 'my', 'mom', 'with', 'chores'], hint: 'Build a sentence about helping', icon: '🧹' },
    { words: ['The', 'ocean', 'is', 'big', 'and', 'blue'], hint: 'Build a sentence about the ocean', icon: '🌊' },
    { words: ['My', 'friend', 'likes', 'to', 'draw', 'pictures'], hint: 'Build a sentence about drawing', icon: '🎨' },
    { words: ['The', 'moon', 'shines', 'at', 'night'], hint: 'Build a sentence about the moon', icon: '🌙' },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [sentenceSlots, setSentenceSlots] = useState<(string | null)[]>([]);
  const [availableWords, setAvailableWords] = useState<string[]>([]);
  const [draggedWord, setDraggedWord] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  const currentSentence = sentences[currentIndex];
  const isComplete = currentIndex >= sentences.length;

  useEffect(() => {
    const sentence = sentences[currentIndex];
    if (sentence) {
      const shuffled = [...sentence.words].sort(() => Math.random() - 0.5);
      setAvailableWords(shuffled);
      setSentenceSlots(new Array(sentence.words.length).fill(null));
      setShowSuccess(false);
      setShowError(false);
    }
  }, [currentIndex]);

  const handleDrop = (slotIndex: number) => {
    if (!draggedWord || draggedIndex === null) return;

    const newSlots = [...sentenceSlots];
    newSlots[slotIndex] = draggedWord;
    setSentenceSlots(newSlots);
    
    const newAvailable = availableWords.filter((_, i) => i !== draggedIndex);
    setAvailableWords(newAvailable);
    setDraggedWord(null);
    setDraggedIndex(null);

    if (newSlots.every((w, i) => w === currentSentence.words[i])) {
      setShowSuccess(true);
      setScore(score + 1);
      setTimeout(() => {
        if (currentIndex < sentences.length - 1) {
          setCurrentIndex(currentIndex + 1);
          setShowSuccess(false);
        } else {
          onFinish();
        }
      }, 2000);
    } else if (newSlots.every(w => w !== null) && !newSlots.every((w, i) => w === currentSentence.words[i])) {
      setShowError(true);
      const newLives = lives - 1;
      setLives(newLives);
      if (newLives === 0) {
        setTimeout(() => {
          onFinish();
        }, 2000);
      } else {
        setTimeout(() => {
          setShowError(false);
          const shuffled = [...currentSentence.words].sort(() => Math.random() - 0.5);
          setAvailableWords(shuffled);
          setSentenceSlots(new Array(currentSentence.words.length).fill(null));
        }, 1500);
      }
    }
  };

  const handleReturnWord = (slotIndex: number) => {
    const word = sentenceSlots[slotIndex];
    if (!word) return;

    const newSlots = [...sentenceSlots];
    newSlots[slotIndex] = null;
    setSentenceSlots(newSlots);
    setAvailableWords([...availableWords, word]);
  };

  if (isComplete) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] px-4">
        <Card className="max-w-2xl w-full border-2 border-primary/20 shadow-2xl">
          <CardHeader className="text-center space-y-4 pb-6">
            <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mb-4">
              <Trophy className="h-12 w-12 text-white" />
            </div>
            <CardTitle className="text-4xl font-bold">Sentence Master! 🎉</CardTitle>
            <div className="text-6xl font-bold text-primary">{score}/{sentences.length}</div>
          </CardHeader>
          <CardContent>
            <Button onClick={onBack} className="w-full text-lg py-6" size="lg">
              <Home className="h-5 w-5 mr-2" />
              Back to Games
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (lives === 0) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] px-4">
        <Card className="max-w-2xl w-full border-2 border-red-200 shadow-2xl">
          <CardHeader className="text-center space-y-4 pb-6">
            <CardTitle className="text-4xl font-bold">Game Over! 💔</CardTitle>
            <div className="text-6xl font-bold text-red-500">{score}/{sentences.length}</div>
          </CardHeader>
          <CardContent>
            <Button onClick={onBack} className="w-full text-lg py-6" size="lg">
              <Home className="h-5 w-5 mr-2" />
              Back to Games
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4 py-8">
      <div className="w-full max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={onBack} className="text-lg">
            <Home className="h-5 w-5 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Sentences</div>
              <div className="text-3xl font-bold">{score}/{sentences.length}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Lives</div>
              <div className="text-3xl font-bold flex gap-1">
                {[...Array(lives)].map((_, i) => (
                  <span key={i} className="text-red-500">❤️</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <Card className="border-2 shadow-2xl bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-950/30 dark:to-purple-950/30">
          <CardHeader className="text-center pb-4">
            <div className="text-6xl mb-4">{currentSentence.icon}</div>
            <CardTitle className="text-3xl md:text-4xl font-bold mb-2">Build the Sentence!</CardTitle>
            <CardDescription className="text-xl">{currentSentence.hint}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-8 pb-8">
            <div className="flex justify-center gap-2 flex-wrap">
              {sentenceSlots.map((word, index) => (
                <div
                  key={index}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.add('ring-4', 'ring-primary', 'bg-primary/10');
                  }}
                  onDragLeave={(e) => {
                    e.currentTarget.classList.remove('ring-4', 'ring-primary', 'bg-primary/10');
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove('ring-4', 'ring-primary', 'bg-primary/10');
                    handleDrop(index);
                  }}
                  onClick={() => handleReturnWord(index)}
                  className={cn(
                    "w-24 h-16 rounded-xl border-4 border-dashed flex items-center justify-center text-xl font-bold transition-all cursor-pointer",
                    word ? "bg-green-100 border-green-500 text-green-700" : "bg-gray-100 border-gray-300 text-gray-400"
                  )}
                >
                  {word || <span className="text-gray-400">{index + 1}</span>}
                </div>
              ))}
            </div>

            {showSuccess && (
              <div className="text-center animate-in zoom-in">
                <div className="text-6xl animate-bounce mb-4">🎉✨</div>
                <div className="text-3xl font-bold text-green-600">Perfect Sentence!</div>
              </div>
            )}

            {showError && (
              <div className="text-center animate-in zoom-in">
                <div className="text-6xl animate-bounce mb-4">❌</div>
                <div className="text-3xl font-bold text-red-600">
                  {lives > 0 ? 'Wrong order! Lives left: ' + lives : 'Game Over!'}
                </div>
              </div>
            )}

            {!showSuccess && !showError && (
              <>
                <div className="text-center">
                  <p className="text-lg font-semibold mb-4">Drag words to build the sentence!</p>
                </div>
                <div className="flex justify-center gap-3 flex-wrap min-h-[100px] p-6 bg-white/30 rounded-xl">
                  {availableWords.map((word, index) => (
                    <div
                      key={`${word}-${index}-${currentIndex}`}
                      draggable
                      onDragStart={() => {
                        setDraggedWord(word);
                        setDraggedIndex(index);
                      }}
                      onDragEnd={() => {
                        setDraggedWord(null);
                        setDraggedIndex(null);
                      }}
                      className="px-6 py-3 rounded-xl bg-gradient-to-br from-pink-400 to-purple-500 text-white text-xl font-bold cursor-grab active:cursor-grabbing shadow-lg transition-all hover:scale-110 hover:rotate-3"
                    >
                      {word}
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
              <div 
                className="bg-gradient-to-r from-pink-500 to-purple-500 h-4 rounded-full transition-all duration-500"
                style={{ width: `${((currentIndex + 1) / sentences.length) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Story Sequencer Game (English Home Language)
function StorySequencer({ onBack, onFinish }: { onBack: () => void; onFinish: () => void }) {
  const stories = [
    {
      events: [
        { text: 'The girl woke up', icon: '🌅' },
        { text: 'She brushed her teeth', icon: '🪥' },
        { text: 'She ate breakfast', icon: '🥣' },
        { text: 'She went to school', icon: '🏫' },
      ],
      title: 'Morning Routine',
    },
    {
      events: [
        { text: 'The seed was planted', icon: '🌱' },
        { text: 'The sun and rain helped it grow', icon: '🌦️' },
        { text: 'A beautiful flower bloomed', icon: '🌸' },
        { text: 'Bees came to collect nectar', icon: '🐝' },
      ],
      title: 'Plant Growth',
    },
    {
      events: [
        { text: 'The baker mixed the ingredients', icon: '👨‍🍳' },
        { text: 'The dough was put in the oven', icon: '🔥' },
        { text: 'The bread baked until golden', icon: '🍞' },
        { text: 'Everyone enjoyed fresh bread', icon: '😋' },
      ],
      title: 'Baking Story',
    },
    {
      events: [
        { text: 'The caterpillar ate leaves', icon: '🐛' },
        { text: 'It made a chrysalis', icon: '🫧' },
        { text: 'It transformed inside', icon: '✨' },
        { text: 'A butterfly emerged', icon: '🦋' },
      ],
      title: 'Butterfly Life',
    },
    {
      events: [
        { text: 'The explorer found a map', icon: '🗺️' },
        { text: 'They followed the directions', icon: '🧭' },
        { text: 'They solved the puzzle', icon: '🧩' },
        { text: 'They found the hidden treasure', icon: '💎' },
      ],
      title: 'Explorer Story',
    },
    {
      events: [
        { text: 'The farmer planted seeds', icon: '🌾' },
        { text: 'The seeds grew into plants', icon: '🌱' },
        { text: 'The plants produced vegetables', icon: '🥕' },
        { text: 'The farmer harvested the crops', icon: '🚜' },
      ],
      title: 'Farm Story',
    },
    {
      events: [
        { text: 'The student opened the book', icon: '📖' },
        { text: 'They read the story carefully', icon: '👓' },
        { text: 'They understood the lesson', icon: '💡' },
        { text: 'They did well on the test', icon: '✅' },
      ],
      title: 'Learning Story',
    },
    {
      events: [
        { text: 'The chef prepared ingredients', icon: '👨‍🍳' },
        { text: 'They mixed everything together', icon: '🥣' },
        { text: 'They cooked it in the oven', icon: '🔥' },
        { text: 'Everyone enjoyed the meal', icon: '😋' },
      ],
      title: 'Cooking Story',
    },
    {
      events: [
        { text: 'The artist picked up a brush', icon: '🖌️' },
        { text: 'They painted on the canvas', icon: '🎨' },
        { text: 'They added beautiful colors', icon: '🌈' },
        { text: 'They created a masterpiece', icon: '🖼️' },
      ],
      title: 'Art Story',
    },
    {
      events: [
        { text: 'The bird built a nest', icon: '🐦' },
        { text: 'It laid eggs in the nest', icon: '🥚' },
        { text: 'The eggs hatched into chicks', icon: '🐤' },
        { text: 'The mother fed the babies', icon: '🪱' },
      ],
      title: 'Bird Story',
    },
    {
      events: [
        { text: 'The doctor examined the patient', icon: '👨‍⚕️' },
        { text: 'They found what was wrong', icon: '🔍' },
        { text: 'They gave medicine to help', icon: '💊' },
        { text: 'The patient felt much better', icon: '😊' },
      ],
      title: 'Doctor Story',
    },
    {
      events: [
        { text: 'The builder laid the foundation', icon: '🏗️' },
        { text: 'They built the walls', icon: '🧱' },
        { text: 'They added the roof', icon: '🏠' },
        { text: 'The house was complete', icon: '✅' },
      ],
      title: 'Building Story',
    },
    {
      events: [
        { text: 'The team practiced together', icon: '🏃' },
        { text: 'They worked very hard', icon: '💪' },
        { text: 'They played in the game', icon: '⚽' },
        { text: 'They won the championship', icon: '🏆' },
      ],
      title: 'Sports Story',
    },
    {
      events: [
        { text: 'The scientist studied the plant', icon: '🔬' },
        { text: 'They made observations', icon: '👀' },
        { text: 'They wrote down notes', icon: '📝' },
        { text: 'They discovered something new', icon: '💡' },
      ],
      title: 'Science Story',
    },
    {
      events: [
        { text: 'The musician tuned the guitar', icon: '🎸' },
        { text: 'They practiced the song', icon: '🎵' },
        { text: 'They performed on stage', icon: '🎤' },
        { text: 'The audience cheered loudly', icon: '👏' },
      ],
      title: 'Music Story',
    },
    {
      events: [
        { text: 'The boat set sail', icon: '⛵' },
        { text: 'It sailed across the ocean', icon: '🌊' },
        { text: 'Dolphins swam alongside', icon: '🐬' },
        { text: 'They reached a beautiful island', icon: '🏝️' },
      ],
      title: 'Ocean Journey',
    },
    {
      events: [
        { text: 'The gardener dug the soil', icon: '🌿' },
        { text: 'They planted flower seeds', icon: '🌼' },
        { text: 'They watered them daily', icon: '💧' },
        { text: 'A beautiful garden bloomed', icon: '🌺' },
      ],
      title: 'Garden Story',
    },
    {
      events: [
        { text: 'The librarian organized books', icon: '📚' },
        { text: 'A child came to borrow one', icon: '👶' },
        { text: 'They read it together', icon: '📖' },
        { text: 'The child returned it happily', icon: '😊' },
      ],
      title: 'Library Story',
    },
    {
      events: [
        { text: 'The firefighter heard the alarm', icon: '🚨' },
        { text: 'They put on their gear', icon: '👨‍🚒' },
        { text: 'They drove to the fire', icon: '🚒' },
        { text: 'They saved everyone safely', icon: '✅' },
      ],
      title: 'Hero Story',
    },
    {
      events: [
        { text: 'The astronaut put on a spacesuit', icon: '👨‍🚀' },
        { text: 'They entered the rocket', icon: '🚀' },
        { text: 'They launched into space', icon: '🌌' },
        { text: 'They explored the moon', icon: '🌙' },
      ],
      title: 'Space Adventure',
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [orderedEvents, setOrderedEvents] = useState<(typeof stories[0]['events'][0] | null)[]>([]);
  const [availableEvents, setAvailableEvents] = useState<typeof stories[0]['events']>([]);
  const [draggedEvent, setDraggedEvent] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  const currentStory = stories[currentIndex];
  const isComplete = currentIndex >= stories.length;

  useEffect(() => {
    const story = stories[currentIndex];
    if (story) {
      const shuffled = [...story.events].sort(() => Math.random() - 0.5);
      setAvailableEvents(shuffled);
      setOrderedEvents(new Array(story.events.length).fill(null));
      setShowSuccess(false);
      setShowError(false);
    }
  }, [currentIndex]);

  const handleDrop = (slotIndex: number) => {
    if (draggedEvent === null) return;

    const event = availableEvents[draggedEvent];
    const newOrdered = [...orderedEvents];
    newOrdered[slotIndex] = event;
    setOrderedEvents(newOrdered);
    
    const newAvailable = availableEvents.filter((_, i) => i !== draggedEvent);
    setAvailableEvents(newAvailable);
    setDraggedEvent(null);

    const isCorrect = newOrdered.every((e, i) => e?.text === currentStory.events[i].text);
    if (isCorrect && newOrdered.every(e => e !== null)) {
      setShowSuccess(true);
      setScore(score + 1);
      setTimeout(() => {
        if (currentIndex < stories.length - 1) {
          setCurrentIndex(currentIndex + 1);
          setShowSuccess(false);
        } else {
          onFinish();
        }
      }, 2000);
    } else if (newOrdered.every(e => e !== null) && !isCorrect) {
      setShowError(true);
      const newLives = lives - 1;
      setLives(newLives);
      if (newLives === 0) {
        setTimeout(() => {
          onFinish();
        }, 2000);
      } else {
        setTimeout(() => {
          setShowError(false);
          const shuffled = [...currentStory.events].sort(() => Math.random() - 0.5);
          setAvailableEvents(shuffled);
          setOrderedEvents(new Array(currentStory.events.length).fill(null));
        }, 1500);
      }
    }
  };

  const handleReturnEvent = (slotIndex: number) => {
    const event = orderedEvents[slotIndex];
    if (!event) return;

    const newOrdered = [...orderedEvents];
    newOrdered[slotIndex] = null;
    setOrderedEvents(newOrdered);
    setAvailableEvents([...availableEvents, event]);
  };

  if (isComplete) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] px-4">
        <Card className="max-w-2xl w-full border-2 border-primary/20 shadow-2xl">
          <CardHeader className="text-center space-y-4 pb-6">
            <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mb-4">
              <Trophy className="h-12 w-12 text-white" />
            </div>
            <CardTitle className="text-4xl font-bold">Story Master! 🎉</CardTitle>
            <div className="text-6xl font-bold text-primary">{score}/{stories.length}</div>
          </CardHeader>
          <CardContent>
            <Button onClick={onBack} className="w-full text-lg py-6" size="lg">
              <Home className="h-5 w-5 mr-2" />
              Back to Games
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (lives === 0) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] px-4">
        <Card className="max-w-2xl w-full border-2 border-red-200 shadow-2xl">
          <CardHeader className="text-center space-y-4 pb-6">
            <CardTitle className="text-4xl font-bold">Game Over! 💔</CardTitle>
            <div className="text-6xl font-bold text-red-500">{score}/{stories.length}</div>
          </CardHeader>
          <CardContent>
            <Button onClick={onBack} className="w-full text-lg py-6" size="lg">
              <Home className="h-5 w-5 mr-2" />
              Back to Games
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen max-h-screen px-4 py-4 overflow-y-auto">
      <div className="w-full max-w-5xl space-y-4">
        <div className="flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur-sm z-10 py-2">
          <Button variant="ghost" onClick={onBack} className="text-lg">
            <Home className="h-5 w-5 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Stories</div>
              <div className="text-2xl font-bold">{score}/{stories.length}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Lives</div>
              <div className="text-2xl font-bold flex gap-1">
                {[...Array(lives)].map((_, i) => (
                  <span key={i} className="text-red-500">❤️</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <Card className="border-2 shadow-2xl bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl md:text-2xl font-bold mb-1">Put the Story in Order!</CardTitle>
            <CardDescription className="text-base">{currentStory.title}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pb-4 max-h-[calc(100vh-200px)] overflow-y-auto">
            <div className="flex flex-col gap-2">
              {orderedEvents.map((event, index) => (
                <div
                  key={index}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.add('ring-2', 'ring-primary', 'bg-primary/10');
                  }}
                  onDragLeave={(e) => {
                    e.currentTarget.classList.remove('ring-2', 'ring-primary', 'bg-primary/10');
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove('ring-2', 'ring-primary', 'bg-primary/10');
                    handleDrop(index);
                  }}
                  onClick={() => handleReturnEvent(index)}
                  className={cn(
                    "min-h-12 rounded-lg border-2 border-dashed p-2 flex items-center gap-2 cursor-pointer transition-all",
                    event ? "bg-green-100 border-green-500" : "bg-gray-50 border-gray-300"
                  )}
                >
                  <span className="text-sm font-bold text-gray-400 w-5">{index + 1}</span>
                  {event ? (
                    <>
                      <span className="text-2xl mr-2">{event.icon}</span>
                      <span className="text-sm font-medium">{event.text}</span>
                    </>
                  ) : (
                    <span className="text-xs text-gray-400">Drop event here</span>
                  )}
                </div>
              ))}
            </div>

            {showSuccess && (
              <div className="text-center animate-in zoom-in py-1">
                <div className="text-4xl animate-bounce mb-1">🎉✨</div>
                <div className="text-xl font-bold text-green-600">Perfect Story Sequence!</div>
              </div>
            )}

            {showError && (
              <div className="text-center animate-in zoom-in py-1">
                <div className="text-4xl animate-bounce mb-1">❌</div>
                <div className="text-xl font-bold text-red-600">
                  {lives > 0 ? 'Wrong order! Lives left: ' + lives : 'Game Over!'}
                </div>
              </div>
            )}

            {!showSuccess && !showError && availableEvents.length > 0 && (
              <>
                <div className="text-center py-1">
                  <p className="text-sm font-semibold mb-2">Drag events to put the story in order!</p>
                </div>
                <div className="flex flex-col gap-2">
                  {availableEvents.map((event, index) => (
                    <div
                      key={`${event.text}-${index}-${currentIndex}`}
                      draggable
                      onDragStart={() => setDraggedEvent(index)}
                      onDragEnd={() => setDraggedEvent(null)}
                      className="p-2 rounded-lg bg-gradient-to-br from-indigo-400 to-blue-500 text-white flex items-center gap-2 cursor-grab active:cursor-grabbing shadow-lg transition-all hover:scale-105"
                    >
                      <span className="text-2xl mr-2">{event.icon}</span>
                      <span className="text-sm">{event.text}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 sticky bottom-0">
              <div 
                className="bg-gradient-to-r from-indigo-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${((currentIndex + 1) / stories.length) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Vocabulary Matcher Game (English Home Language)
function VocabularyMatcher({ onBack, onFinish }: { onBack: () => void; onFinish: () => void }) {
  const matches = [
    { word: 'BRAVE', picture: '🦁', description: 'Not afraid', icon: '⚔️' },
    { word: 'HAPPY', picture: '😊', description: 'Feeling joyful', icon: '🌟' },
    { word: 'FAST', picture: '🏃', description: 'Moving quickly', icon: '💨' },
    { word: 'BIG', picture: '🐘', description: 'Large in size', icon: '📏' },
    { word: 'SMART', picture: '🧠', description: 'Very intelligent', icon: '🎓' },
    { word: 'COLD', picture: '❄️', description: 'Low temperature', icon: '🧊' },
    { word: 'LOUD', picture: '🔊', description: 'Making lots of noise', icon: '📢' },
    { word: 'QUIET', picture: '🤫', description: 'Making little noise', icon: '🔇' },
    { word: 'BRIGHT', picture: '💡', description: 'Giving off light', icon: '✨' },
    { word: 'TALL', picture: '🌳', description: 'High in height', icon: '📐' },
    { word: 'STRONG', picture: '💪', description: 'Having great power', icon: '🏋️' },
    { word: 'KIND', picture: '❤️', description: 'Being friendly', icon: '🤗' },
    { word: 'SMALL', picture: '🐭', description: 'Little in size', icon: '📏' },
    { word: 'SLOW', picture: '🐢', description: 'Moving not quickly', icon: '⏰' },
    { word: 'HOT', picture: '🔥', description: 'High temperature', icon: '🌡️' },
    { word: 'SAD', picture: '😢', description: 'Feeling unhappy', icon: '💧' },
    { word: 'SICK', picture: '🤒', description: 'Not feeling well', icon: '💊' },
    { word: 'HEALTHY', picture: '🏃', description: 'Feeling good and strong', icon: '💚' },
    { word: 'SLEEPY', picture: '😴', description: 'Wanting to sleep', icon: '🌙' },
    { word: 'ANGRY', picture: '😠', description: 'Feeling mad', icon: '⚡' },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  const currentMatch = matches[currentIndex];
  const isComplete = currentIndex >= matches.length;

  const wordOptions = useMemo(() => {
    const match = matches[currentIndex];
    if (!match) return [];
    return [
      match.word,
      ...matches.filter((_, i) => i !== currentIndex).slice(0, 3).map(m => m.word)
    ].sort(() => Math.random() - 0.5);
  }, [currentIndex]);

  const handleWordSelect = (word: string) => {
    setSelectedWord(word);
    if (word === currentMatch.word) {
      setShowSuccess(true);
      setScore(score + 1);
      setTimeout(() => {
        if (currentIndex < matches.length - 1) {
          setCurrentIndex(currentIndex + 1);
          setShowSuccess(false);
          setSelectedWord(null);
        } else {
          onFinish();
        }
      }, 1500);
    } else {
      setShowError(true);
      const newLives = lives - 1;
      setLives(newLives);
      if (newLives === 0) {
        setTimeout(() => {
          onFinish();
        }, 2000);
      } else {
        setTimeout(() => {
          setShowError(false);
          setSelectedWord(null);
        }, 1500);
      }
    }
  };

  if (isComplete) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] px-4">
        <Card className="max-w-2xl w-full border-2 border-primary/20 shadow-2xl">
          <CardHeader className="text-center space-y-4 pb-6">
            <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mb-4">
              <Trophy className="h-12 w-12 text-white" />
            </div>
            <CardTitle className="text-4xl font-bold">Vocabulary Master! 🎉</CardTitle>
            <div className="text-6xl font-bold text-primary">{score}/{matches.length}</div>
          </CardHeader>
          <CardContent>
            <Button onClick={onBack} className="w-full text-lg py-6" size="lg">
              <Home className="h-5 w-5 mr-2" />
              Back to Games
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (lives === 0) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] px-4">
        <Card className="max-w-2xl w-full border-2 border-red-200 shadow-2xl">
          <CardHeader className="text-center space-y-4 pb-6">
            <CardTitle className="text-4xl font-bold">Game Over! 💔</CardTitle>
            <div className="text-6xl font-bold text-red-500">{score}/{matches.length}</div>
          </CardHeader>
          <CardContent>
            <Button onClick={onBack} className="w-full text-lg py-6" size="lg">
              <Home className="h-5 w-5 mr-2" />
              Back to Games
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4 py-8">
      <div className="w-full max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={onBack} className="text-lg">
            <Home className="h-5 w-5 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Matched</div>
              <div className="text-3xl font-bold">{score}/{matches.length}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Lives</div>
              <div className="text-3xl font-bold flex gap-1">
                {[...Array(lives)].map((_, i) => (
                  <span key={i} className="text-red-500">❤️</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <Card className="border-2 shadow-2xl bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30">
          <CardHeader className="text-center pb-4">
            <div className="text-6xl mb-4">{currentMatch.picture}</div>
            <CardTitle className="text-3xl md:text-4xl font-bold mb-2">Match the Word!</CardTitle>
            <CardDescription className="text-xl">{currentMatch.description}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-8 pb-8">
            <div className="flex justify-center">
              <div className="text-9xl">{currentMatch.picture}</div>
            </div>

            {showSuccess && (
              <div className="text-center animate-in zoom-in">
                <div className="text-6xl animate-bounce mb-4">🎉✨</div>
                <div className="text-3xl font-bold text-green-600">Perfect Match!</div>
              </div>
            )}

            {showError && (
              <div className="text-center animate-in zoom-in">
                <div className="text-6xl animate-bounce mb-4">❌</div>
                <div className="text-3xl font-bold text-red-600">
                  {lives > 0 ? 'Wrong! Lives left: ' + lives : 'Game Over!'}
                </div>
              </div>
            )}

            {!showSuccess && !showError && (
              <>
                <div className="text-center">
                  <p className="text-lg font-semibold mb-4">Click the word that matches the picture!</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {wordOptions.map((word, idx) => (
                    <button
                      key={`${word}-${idx}-${currentIndex}`}
                      onClick={() => handleWordSelect(word)}
                      disabled={selectedWord !== null}
                      className={cn(
                        "px-8 py-6 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 text-white text-2xl font-bold shadow-lg transition-all hover:scale-110 hover:shadow-2xl",
                        selectedWord === word && "ring-4 ring-yellow-300",
                        selectedWord !== null && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {word}
                    </button>
                  ))}
                </div>
              </>
            )}

            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
              <div 
                className="bg-gradient-to-r from-teal-500 to-cyan-500 h-4 rounded-full transition-all duration-500"
                style={{ width: `${((currentIndex + 1) / matches.length) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Word Family Sorter Game (English First Additional Language)
function WordFamilySorter({ onBack, onFinish }: { onBack: () => void; onFinish: () => void }) {
  const wordFamilies = [
    { family: '-at', words: ['cat', 'hat', 'bat', 'rat'], icon: '🐱' },
    { family: '-an', words: ['can', 'man', 'pan', 'van'], icon: '👨' },
    { family: '-ap', words: ['cap', 'map', 'nap', 'tap'], icon: '🧢' },
    { family: '-ed', words: ['bed', 'red', 'fed', 'led'], icon: '🛏️' },
    { family: '-en', words: ['pen', 'ten', 'hen', 'men'], icon: '✏️' },
    { family: '-et', words: ['pet', 'net', 'wet', 'get'], icon: '🐾' },
    { family: '-ig', words: ['pig', 'big', 'dig', 'wig'], icon: '🐷' },
    { family: '-in', words: ['pin', 'bin', 'win', 'tin'], icon: '📌' },
    { family: '-ip', words: ['lip', 'tip', 'sip', 'dip'], icon: '👄' },
    { family: '-it', words: ['sit', 'bit', 'hit', 'fit'], icon: '🪑' },
    { family: '-og', words: ['dog', 'log', 'fog', 'hog'], icon: '🐶' },
    { family: '-op', words: ['top', 'hop', 'pop', 'cop'], icon: '🔝' },
    { family: '-ot', words: ['hot', 'pot', 'dot', 'lot'], icon: '🔥' },
    { family: '-ug', words: ['bug', 'rug', 'mug', 'hug'], icon: '🐛' },
    { family: '-un', words: ['sun', 'fun', 'run', 'bun'], icon: '☀️' },
    { family: '-ut', words: ['cut', 'nut', 'hut', 'but'], icon: '✂️' },
    { family: '-ack', words: ['back', 'pack', 'sack', 'rack'], icon: '🎒' },
    { family: '-ell', words: ['bell', 'well', 'tell', 'sell'], icon: '🔔' },
    { family: '-ick', words: ['sick', 'pick', 'kick', 'tick'], icon: '🤒' },
    { family: '-ock', words: ['sock', 'rock', 'lock', 'dock'], icon: '🧦' },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [sortedWords, setSortedWords] = useState<{ [key: string]: string[] }>({});
  const [availableWords, setAvailableWords] = useState<string[]>([]);
  const [draggedWord, setDraggedWord] = useState<{ word: string; family: string; index: number } | null>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  const currentFamily = wordFamilies[currentIndex];
  const isComplete = currentIndex >= wordFamilies.length;

  useEffect(() => {
    const family = wordFamilies[currentIndex];
    if (family) {
      const allWords = family.words.concat(
        wordFamilies.filter((_, i) => i !== currentIndex)
          .flatMap(f => f.words)
          .filter((_, idx) => idx < 4)
      );
      setAvailableWords([...allWords].sort(() => Math.random() - 0.5));
      setSortedWords({ [family.family]: [] });
      setShowSuccess(false);
      setShowError(false);
    }
  }, [currentIndex]);

  const handleDrop = (familyName: string) => {
    if (!draggedWord) return;

    const newSorted = [...sortedWords[familyName] || [], draggedWord.word];
    setSortedWords({ ...sortedWords, [familyName]: newSorted });
    setAvailableWords(availableWords.filter((_, i) => i !== draggedWord.index));
    setDraggedWord(null);

    const correctWords = wordFamilies[currentIndex].words;
    if (newSorted.length === correctWords.length && 
        correctWords.every(w => newSorted.includes(w)) &&
        newSorted.every(w => correctWords.includes(w))) {
      setShowSuccess(true);
      setScore(score + 1);
      setTimeout(() => {
        if (currentIndex < wordFamilies.length - 1) {
          setCurrentIndex(currentIndex + 1);
          setShowSuccess(false);
        } else {
          onFinish();
        }
      }, 2000);
    } else if (newSorted.length > 0 && !correctWords.includes(draggedWord.word)) {
      setShowError(true);
      const newLives = lives - 1;
      setLives(newLives);
      if (newLives === 0) {
        setTimeout(() => {
          onFinish();
        }, 2000);
      } else {
        setTimeout(() => {
          setShowError(false);
          const allWords = currentFamily.words.concat(
            wordFamilies.filter((_, i) => i !== currentIndex)
              .flatMap(f => f.words)
              .filter((_, idx) => idx < 4)
          );
          setAvailableWords([...allWords].sort(() => Math.random() - 0.5));
          setSortedWords({ [currentFamily.family]: [] });
        }, 1500);
      }
    }
  };

  if (isComplete) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] px-4">
        <Card className="max-w-2xl w-full border-2 border-primary/20 shadow-2xl">
          <CardHeader className="text-center space-y-4 pb-6">
            <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mb-4">
              <Trophy className="h-12 w-12 text-white" />
            </div>
            <CardTitle className="text-4xl font-bold">Word Family Master! 🎉</CardTitle>
            <div className="text-6xl font-bold text-primary">{score}/{wordFamilies.length}</div>
          </CardHeader>
          <CardContent>
            <Button onClick={onBack} className="w-full text-lg py-6" size="lg">
              <Home className="h-5 w-5 mr-2" />
              Back to Games
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (lives === 0) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] px-4">
        <Card className="max-w-2xl w-full border-2 border-red-200 shadow-2xl">
          <CardHeader className="text-center space-y-4 pb-6">
            <CardTitle className="text-4xl font-bold">Game Over! 💔</CardTitle>
            <div className="text-6xl font-bold text-red-500">{score}/{wordFamilies.length}</div>
          </CardHeader>
          <CardContent>
            <Button onClick={onBack} className="w-full text-lg py-6" size="lg">
              <Home className="h-5 w-5 mr-2" />
              Back to Games
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4 py-8">
      <div className="w-full max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={onBack} className="text-lg">
            <Home className="h-5 w-5 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Families</div>
              <div className="text-3xl font-bold">{score}/{wordFamilies.length}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Lives</div>
              <div className="text-3xl font-bold flex gap-1">
                {[...Array(lives)].map((_, i) => (
                  <span key={i} className="text-red-500">❤️</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <Card className="border-2 shadow-2xl bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30">
          <CardHeader className="text-center pb-4">
            <div className="text-6xl mb-4">{currentFamily.icon}</div>
            <CardTitle className="text-3xl md:text-4xl font-bold mb-2">Sort {currentFamily.family} Words!</CardTitle>
            <CardDescription className="text-xl">Find all words that belong to the {currentFamily.family} family</CardDescription>
          </CardHeader>

          <CardContent className="space-y-8 pb-8">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.classList.add('ring-4', 'ring-primary', 'bg-primary/10');
              }}
              onDragLeave={(e) => {
                e.currentTarget.classList.remove('ring-4', 'ring-primary', 'bg-primary/10');
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove('ring-4', 'ring-primary', 'bg-primary/10');
                handleDrop(currentFamily.family);
              }}
              className="min-h-32 rounded-xl border-4 border-dashed border-primary p-6 bg-primary/5"
            >
              <div className="font-bold text-xl mb-3">{currentFamily.family} family:</div>
              <div className="flex gap-3 flex-wrap">
                {(sortedWords[currentFamily.family] || []).map((word, i) => (
                  <div key={i} className="px-4 py-2 bg-blue-200 rounded-lg text-lg font-bold">{word}</div>
                ))}
              </div>
            </div>

            {showSuccess && (
              <div className="text-center animate-in zoom-in">
                <div className="text-6xl animate-bounce mb-4">🎉✨</div>
                <div className="text-3xl font-bold text-green-600">Perfect! All {currentFamily.family} words sorted!</div>
              </div>
            )}

            {showError && (
              <div className="text-center animate-in zoom-in">
                <div className="text-6xl animate-bounce mb-4">❌</div>
                <div className="text-3xl font-bold text-red-600">
                  {lives > 0 ? 'Wrong word! Lives left: ' + lives : 'Game Over!'}
                </div>
              </div>
            )}

            {!showSuccess && !showError && (
              <>
                <div className="text-center">
                  <p className="text-lg font-semibold mb-4">Drag {currentFamily.family} family words here!</p>
                </div>
                <div className="flex justify-center gap-3 flex-wrap">
                  {availableWords.map((word, index) => (
                    <div
                      key={`${word}-${index}-${currentIndex}`}
                      draggable
                      onDragStart={() => {
                        const belongsTo = wordFamilies.find(f => f.words.includes(word));
                        setDraggedWord({ word, family: belongsTo?.family || '', index });
                      }}
                      onDragEnd={() => {
                        setDraggedWord(null);
                      }}
                      className="px-6 py-3 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 text-white text-xl font-bold cursor-grab active:cursor-grabbing shadow-lg transition-all hover:scale-110 hover:rotate-3"
                    >
                      {word}
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
              <div 
                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-4 rounded-full transition-all duration-500"
                style={{ width: `${((currentIndex + 1) / wordFamilies.length) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Tense Builder Game (English First Additional Language)
function TenseBuilder({ onBack, onFinish }: { onBack: () => void; onFinish: () => void }) {
  const challenges = [
    { sentence: 'I ___ to school every day.', correct: 'go', past: 'went', present: 'go', future: 'will go', icon: '🏫' },
    { sentence: 'She ___ her homework yesterday.', correct: 'did', past: 'did', present: 'does', future: 'will do', icon: '📚' },
    { sentence: 'They ___ playing soccer now.', correct: 'are', past: 'were', present: 'are', future: 'will be', icon: '⚽' },
    { sentence: 'He ___ a book last night.', correct: 'read', past: 'read', present: 'reads', future: 'will read', icon: '📖' },
    { sentence: 'We ___ to the park tomorrow.', correct: 'will go', past: 'went', present: 'go', future: 'will go', icon: '🏞️' },
    { sentence: 'The cat ___ on the mat.', correct: 'sits', past: 'sat', present: 'sits', future: 'will sit', icon: '🐱' },
    { sentence: 'I ___ breakfast this morning.', correct: 'ate', past: 'ate', present: 'eat', future: 'will eat', icon: '🥞' },
    { sentence: 'She ___ help when needed.', correct: 'gives', past: 'gave', present: 'gives', future: 'will give', icon: '🤝' },
    { sentence: 'They ___ to music right now.', correct: 'are listening', past: 'listened', present: 'are listening', future: 'will listen', icon: '🎵' },
    { sentence: 'We ___ a movie tonight.', correct: 'will watch', past: 'watched', present: 'watch', future: 'will watch', icon: '🎬' },
    { sentence: 'The bird ___ in the sky.', correct: 'flies', past: 'flew', present: 'flies', future: 'will fly', icon: '🐦' },
    { sentence: 'I ___ my room yesterday.', correct: 'cleaned', past: 'cleaned', present: 'clean', future: 'will clean', icon: '🧹' },
    { sentence: 'She ___ to visit her grandma.', correct: 'wants', past: 'wanted', present: 'wants', future: 'will want', icon: '👵' },
    { sentence: 'They ___ football every Saturday.', correct: 'play', past: 'played', present: 'play', future: 'will play', icon: '⚽' },
    { sentence: 'He ___ a letter tomorrow.', correct: 'will write', past: 'wrote', present: 'writes', future: 'will write', icon: '✍️' },
    { sentence: 'I ___ very happy today.', correct: 'am', past: 'was', present: 'am', future: 'will be', icon: '😊' },
    { sentence: 'The sun ___ brightly.', correct: 'shines', past: 'shone', present: 'shines', future: 'will shine', icon: '☀️' },
    { sentence: 'We ___ the cake together.', correct: 'baked', past: 'baked', present: 'bake', future: 'will bake', icon: '🍰' },
    { sentence: 'She ___ English at school.', correct: 'learns', past: 'learned', present: 'learns', future: 'will learn', icon: '📝' },
    { sentence: 'They ___ swimming next week.', correct: 'will go', past: 'went', present: 'go', future: 'will go', icon: '🏊' },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedVerb, setSelectedVerb] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  const currentChallenge = challenges[currentIndex];
  const isComplete = currentIndex >= challenges.length;

  // Get all unique verb forms for this challenge
  const allForms = useMemo(() => {
    const challenge = challenges[currentIndex];
    if (!challenge) return [];
    return [
      challenge.past,
      challenge.present,
      challenge.future,
    ].filter((v, i, arr) => arr.indexOf(v) === i);
  }, [currentIndex]);
  
  // Get wrong answers from other challenges
  const options = useMemo(() => {
    const challenge = challenges[currentIndex];
    if (!challenge) return [];
    const wrongAnswers = challenges
      .filter((_, i) => i !== currentIndex)
      .flatMap(c => [c.past, c.present, c.future])
      .filter((v, i, arr) => arr.indexOf(v) === i)
      .filter(v => !allForms.includes(v));
    
    return [
      challenge.correct,
      ...wrongAnswers.slice(0, 3),
    ]
      .filter((v, i, arr) => arr.indexOf(v) === i)
      .slice(0, 4)
      .sort(() => Math.random() - 0.5);
  }, [currentIndex, allForms]);

  const handleAnswer = (verb: string) => {
    setSelectedVerb(verb);
    if (verb === currentChallenge.correct) {
      setShowSuccess(true);
      setScore(score + 1);
      setTimeout(() => {
        if (currentIndex < challenges.length - 1) {
          setCurrentIndex(currentIndex + 1);
          setShowSuccess(false);
          setSelectedVerb(null);
        } else {
          onFinish();
        }
      }, 1500);
    } else {
      setShowError(true);
      const newLives = lives - 1;
      setLives(newLives);
      if (newLives === 0) {
        setTimeout(() => {
          onFinish();
        }, 2000);
      } else {
        setTimeout(() => {
          setShowError(false);
          setSelectedVerb(null);
        }, 1500);
      }
    }
  };

  if (isComplete) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] px-4">
        <Card className="max-w-2xl w-full border-2 border-primary/20 shadow-2xl">
          <CardHeader className="text-center space-y-4 pb-6">
            <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mb-4">
              <Trophy className="h-12 w-12 text-white" />
            </div>
            <CardTitle className="text-4xl font-bold">Tense Master! 🎉</CardTitle>
            <div className="text-6xl font-bold text-primary">{score}/{challenges.length}</div>
          </CardHeader>
          <CardContent>
            <Button onClick={onBack} className="w-full text-lg py-6" size="lg">
              <Home className="h-5 w-5 mr-2" />
              Back to Games
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (lives === 0) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] px-4">
        <Card className="max-w-2xl w-full border-2 border-red-200 shadow-2xl">
          <CardHeader className="text-center space-y-4 pb-6">
            <CardTitle className="text-4xl font-bold">Game Over! 💔</CardTitle>
            <div className="text-6xl font-bold text-red-500">{score}/{challenges.length}</div>
          </CardHeader>
          <CardContent>
            <Button onClick={onBack} className="w-full text-lg py-6" size="lg">
              <Home className="h-5 w-5 mr-2" />
              Back to Games
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4 py-8">
      <div className="w-full max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={onBack} className="text-lg">
            <Home className="h-5 w-5 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Correct</div>
              <div className="text-3xl font-bold">{score}/{challenges.length}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Lives</div>
              <div className="text-3xl font-bold flex gap-1">
                {[...Array(lives)].map((_, i) => (
                  <span key={i} className="text-red-500">❤️</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <Card className="border-2 shadow-2xl bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30">
          <CardHeader className="text-center pb-4">
            <div className="text-6xl mb-4">{currentChallenge.icon}</div>
            <CardTitle className="text-3xl md:text-4xl font-bold mb-2">Choose the Correct Tense!</CardTitle>
            <CardDescription className="text-xl">Fill in the blank with the right verb form</CardDescription>
          </CardHeader>

          <CardContent className="space-y-8 pb-8">
            <div className="text-center text-3xl font-bold py-6 bg-white/50 rounded-xl">
              {currentChallenge.sentence.replace('___', '______')}
            </div>

            {showSuccess && (
              <div className="text-center animate-in zoom-in">
                <div className="text-6xl animate-bounce mb-4">🎉✨</div>
                <div className="text-3xl font-bold text-green-600">Perfect Tense!</div>
              </div>
            )}

            {showError && (
              <div className="text-center animate-in zoom-in">
                <div className="text-6xl animate-bounce mb-4">❌</div>
                <div className="text-3xl font-bold text-red-600">
                  {lives > 0 ? 'Wrong tense! Lives left: ' + lives : 'Game Over!'}
                </div>
              </div>
            )}

            {!showSuccess && !showError && (
              <>
                <div className="text-center">
                  <p className="text-lg font-semibold mb-4">Click the correct verb form!</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {options.map((option, idx) => (
                    <button
                      key={`${option}-${idx}-${currentIndex}`}
                      onClick={() => handleAnswer(option)}
                      disabled={selectedVerb !== null}
                      className={cn(
                        "px-8 py-6 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 text-white text-2xl font-bold shadow-lg transition-all hover:scale-110 hover:shadow-2xl",
                        selectedVerb === option && "ring-4 ring-yellow-300",
                        selectedVerb !== null && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </>
            )}

            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
              <div 
                className="bg-gradient-to-r from-amber-500 to-yellow-500 h-4 rounded-full transition-all duration-500"
                style={{ width: `${((currentIndex + 1) / challenges.length) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Vocabulary Hunt Game (English First Additional Language)
function VocabularyHunt({ onBack, onFinish }: { onBack: () => void; onFinish: () => void }) {
  const vocabulary = [
    { word: 'BRAVE', definition: 'Not afraid of danger', icon: '🦁' },
    { word: 'HAPPY', definition: 'Feeling joy or pleasure', icon: '😊' },
    { word: 'FAST', definition: 'Moving or able to move quickly', icon: '🏃' },
    { word: 'BIG', definition: 'Large in size', icon: '🐘' },
    { word: 'SMART', definition: 'Having or showing intelligence', icon: '🧠' },
    { word: 'COLD', definition: 'Low temperature', icon: '❄️' },
    { word: 'LOUD', definition: 'Making a lot of noise', icon: '🔊' },
    { word: 'QUIET', definition: 'Making little or no noise', icon: '🤫' },
    { word: 'BRIGHT', definition: 'Giving out or reflecting light', icon: '💡' },
    { word: 'TALL', definition: 'High in height', icon: '🌳' },
    { word: 'STRONG', definition: 'Having great power', icon: '💪' },
    { word: 'KIND', definition: 'Friendly and helpful', icon: '❤️' },
    { word: 'SMALL', definition: 'Little in size', icon: '🐭' },
    { word: 'SLOW', definition: 'Moving at low speed', icon: '🐢' },
    { word: 'HOT', definition: 'High temperature', icon: '🔥' },
    { word: 'SAD', definition: 'Feeling unhappy', icon: '😢' },
    { word: 'SICK', definition: 'Not feeling well', icon: '🤒' },
    { word: 'HEALTHY', definition: 'In good health', icon: '💚' },
    { word: 'SLEEPY', definition: 'Needing or ready for sleep', icon: '😴' },
    { word: 'ANGRY', definition: 'Feeling mad or upset', icon: '😠' },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  const currentVocab = vocabulary[currentIndex];
  const isComplete = currentIndex >= vocabulary.length;

  const wordOptions = useMemo(() => {
    const vocab = vocabulary[currentIndex];
    if (!vocab) return [];
    return [
      vocab.word,
      ...vocabulary.filter((_, i) => i !== currentIndex).slice(0, 3).map(v => v.word)
    ].sort(() => Math.random() - 0.5);
  }, [currentIndex]);

  const handleWordSelect = (word: string) => {
    setSelectedWord(word);
    if (word === currentVocab.word) {
      setShowSuccess(true);
      setScore(score + 1);
      setTimeout(() => {
        if (currentIndex < vocabulary.length - 1) {
          setCurrentIndex(currentIndex + 1);
          setShowSuccess(false);
          setSelectedWord(null);
        } else {
          onFinish();
        }
      }, 1500);
    } else {
      setShowError(true);
      const newLives = lives - 1;
      setLives(newLives);
      if (newLives === 0) {
        setTimeout(() => {
          onFinish();
        }, 2000);
      } else {
        setTimeout(() => {
          setShowError(false);
          setSelectedWord(null);
        }, 1500);
      }
    }
  };

  if (isComplete) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] px-4">
        <Card className="max-w-2xl w-full border-2 border-primary/20 shadow-2xl">
          <CardHeader className="text-center space-y-4 pb-6">
            <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mb-4">
              <Trophy className="h-12 w-12 text-white" />
            </div>
            <CardTitle className="text-4xl font-bold">Vocabulary Master! 🎉</CardTitle>
            <div className="text-6xl font-bold text-primary">{score}/{vocabulary.length}</div>
          </CardHeader>
          <CardContent>
            <Button onClick={onBack} className="w-full text-lg py-6" size="lg">
              <Home className="h-5 w-5 mr-2" />
              Back to Games
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (lives === 0) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] px-4">
        <Card className="max-w-2xl w-full border-2 border-red-200 shadow-2xl">
          <CardHeader className="text-center space-y-4 pb-6">
            <CardTitle className="text-4xl font-bold">Game Over! 💔</CardTitle>
            <div className="text-6xl font-bold text-red-500">{score}/{vocabulary.length}</div>
          </CardHeader>
          <CardContent>
            <Button onClick={onBack} className="w-full text-lg py-6" size="lg">
              <Home className="h-5 w-5 mr-2" />
              Back to Games
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4 py-8">
      <div className="w-full max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={onBack} className="text-lg">
            <Home className="h-5 w-5 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Found</div>
              <div className="text-3xl font-bold">{score}/{vocabulary.length}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Lives</div>
              <div className="text-3xl font-bold flex gap-1">
                {[...Array(lives)].map((_, i) => (
                  <span key={i} className="text-red-500">❤️</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <Card className="border-2 shadow-2xl bg-gradient-to-br from-lime-50 to-green-50 dark:from-lime-950/30 dark:to-green-950/30">
          <CardHeader className="text-center pb-4">
            <div className="text-6xl mb-4">{currentVocab.icon}</div>
            <CardTitle className="text-3xl md:text-4xl font-bold mb-2">Hunt for the Word!</CardTitle>
            <CardDescription className="text-xl font-semibold text-lg">{currentVocab.definition}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-8 pb-8">
            <div className="text-center text-2xl text-muted-foreground">
              Find the word that matches this definition
            </div>

            {showSuccess && (
              <div className="text-center animate-in zoom-in">
                <div className="text-6xl animate-bounce mb-4">🎉✨</div>
                <div className="text-3xl font-bold text-green-600">You found it!</div>
              </div>
            )}

            {showError && (
              <div className="text-center animate-in zoom-in">
                <div className="text-6xl animate-bounce mb-4">❌</div>
                <div className="text-3xl font-bold text-red-600">
                  {lives > 0 ? 'Wrong word! Lives left: ' + lives : 'Game Over!'}
                </div>
              </div>
            )}

            {!showSuccess && !showError && (
              <>
                <div className="text-center">
                  <p className="text-lg font-semibold mb-4">Click the word that matches the definition!</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {wordOptions.map((word, idx) => (
                    <button
                      key={`${word}-${idx}-${currentIndex}`}
                      onClick={() => handleWordSelect(word)}
                      disabled={selectedWord !== null}
                      className={cn(
                        "px-8 py-6 rounded-xl bg-gradient-to-br from-lime-400 to-green-500 text-white text-2xl font-bold shadow-lg transition-all hover:scale-110 hover:shadow-2xl",
                        selectedWord === word && "ring-4 ring-yellow-300",
                        selectedWord !== null && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {word}
                    </button>
                  ))}
                </div>
              </>
            )}

            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
              <div 
                className="bg-gradient-to-r from-lime-500 to-green-500 h-4 rounded-full transition-all duration-500"
                style={{ width: `${((currentIndex + 1) / vocabulary.length) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Ecosystem Builder Game (Life Skills)
function EcosystemBuilder({ onBack, onFinish }: { onBack: () => void; onFinish: () => void }) {
  const foodChains = [
    {
      chain: [
        { name: 'Grass', icon: '🌾', role: 'Producer' },
        { name: 'Rabbit', icon: '🐰', role: 'Primary Consumer' },
        { name: 'Fox', icon: '🦊', role: 'Secondary Consumer' },
      ],
      title: 'Grassland Food Chain',
    },
    {
      chain: [
        { name: 'Algae', icon: '🌿', role: 'Producer' },
        { name: 'Small Fish', icon: '🐟', role: 'Primary Consumer' },
        { name: 'Big Fish', icon: '🐠', role: 'Secondary Consumer' },
        { name: 'Shark', icon: '🦈', role: 'Tertiary Consumer' },
      ],
      title: 'Ocean Food Chain',
    },
    {
      chain: [
        { name: 'Leaves', icon: '🍃', role: 'Producer' },
        { name: 'Caterpillar', icon: '🐛', role: 'Primary Consumer' },
        { name: 'Bird', icon: '🐦', role: 'Secondary Consumer' },
      ],
      title: 'Forest Food Chain',
    },
    {
      chain: [
        { name: 'Seaweed', icon: '🌊', role: 'Producer' },
        { name: 'Crab', icon: '🦀', role: 'Primary Consumer' },
        { name: 'Seal', icon: '🦭', role: 'Secondary Consumer' },
      ],
      title: 'Coastal Food Chain',
    },
    {
      chain: [
        { name: 'Flowers', icon: '🌸', role: 'Producer' },
        { name: 'Bee', icon: '🐝', role: 'Primary Consumer' },
        { name: 'Spider', icon: '🕷️', role: 'Secondary Consumer' },
        { name: 'Lizard', icon: '🦎', role: 'Tertiary Consumer' },
      ],
      title: 'Garden Food Chain',
    },
    {
      chain: [
        { name: 'Berries', icon: '🫐', role: 'Producer' },
        { name: 'Mouse', icon: '🐭', role: 'Primary Consumer' },
        { name: 'Snake', icon: '🐍', role: 'Secondary Consumer' },
        { name: 'Eagle', icon: '🦅', role: 'Tertiary Consumer' },
      ],
      title: 'Mountain Food Chain',
    },
    {
      chain: [
        { name: 'Phytoplankton', icon: '🌊', role: 'Producer' },
        { name: 'Krill', icon: '🦐', role: 'Primary Consumer' },
        { name: 'Whale', icon: '🐋', role: 'Secondary Consumer' },
      ],
      title: 'Deep Ocean Chain',
    },
    {
      chain: [
        { name: 'Acorns', icon: '🌰', role: 'Producer' },
        { name: 'Squirrel', icon: '🐿️', role: 'Primary Consumer' },
        { name: 'Owl', icon: '🦉', role: 'Secondary Consumer' },
      ],
      title: 'Woodland Chain',
    },
    {
      chain: [
        { name: 'Grass', icon: '🌱', role: 'Producer' },
        { name: 'Zebra', icon: '🦓', role: 'Primary Consumer' },
        { name: 'Lion', icon: '🦁', role: 'Secondary Consumer' },
      ],
      title: 'Savanna Food Chain',
    },
    {
      chain: [
        { name: 'Sea Grass', icon: '🌿', role: 'Producer' },
        { name: 'Turtle', icon: '🐢', role: 'Primary Consumer' },
        { name: 'Shark', icon: '🦈', role: 'Secondary Consumer' },
      ],
      title: 'Sea Grass Chain',
    },
    {
      chain: [
        { name: 'Fruits', icon: '🍎', role: 'Producer' },
        { name: 'Monkey', icon: '🐵', role: 'Primary Consumer' },
        { name: 'Jaguar', icon: '🐆', role: 'Secondary Consumer' },
      ],
      title: 'Rainforest Chain',
    },
    {
      chain: [
        { name: 'Algae', icon: '🪸', role: 'Producer' },
        { name: 'Small Fish', icon: '🐟', role: 'Primary Consumer' },
        { name: 'Penguin', icon: '🐧', role: 'Secondary Consumer' },
        { name: 'Leopard Seal', icon: '🦭', role: 'Tertiary Consumer' },
      ],
      title: 'Antarctic Chain',
    },
    {
      chain: [
        { name: 'Seeds', icon: '🌻', role: 'Producer' },
        { name: 'Finch', icon: '🐦', role: 'Primary Consumer' },
        { name: 'Hawk', icon: '🦅', role: 'Secondary Consumer' },
      ],
      title: 'Desert Chain',
    },
    {
      chain: [
        { name: 'Plants', icon: '🌿', role: 'Producer' },
        { name: 'Deer', icon: '🦌', role: 'Primary Consumer' },
        { name: 'Wolf', icon: '🐺', role: 'Secondary Consumer' },
      ],
      title: 'Forest Chain',
    },
    {
      chain: [
        { name: 'Plankton', icon: '🌊', role: 'Producer' },
        { name: 'Shrimp', icon: '🦐', role: 'Primary Consumer' },
        { name: 'Fish', icon: '🐟', role: 'Secondary Consumer' },
        { name: 'Dolphin', icon: '🐬', role: 'Tertiary Consumer' },
      ],
      title: 'Ocean Chain',
    },
    {
      chain: [
        { name: 'Nectar', icon: '🌸', role: 'Producer' },
        { name: 'Butterfly', icon: '🦋', role: 'Primary Consumer' },
        { name: 'Frog', icon: '🐸', role: 'Secondary Consumer' },
      ],
      title: 'Flower Chain',
    },
    {
      chain: [
        { name: 'Grass', icon: '🌾', role: 'Producer' },
        { name: 'Sheep', icon: '🐑', role: 'Primary Consumer' },
        { name: 'Coyote', icon: '🐺', role: 'Secondary Consumer' },
      ],
      title: 'Meadow Chain',
    },
    {
      chain: [
        { name: 'Algae', icon: '🪨', role: 'Producer' },
        { name: 'Snail', icon: '🐌', role: 'Primary Consumer' },
        { name: 'Duck', icon: '🦆', role: 'Secondary Consumer' },
      ],
      title: 'Pond Chain',
    },
    {
      chain: [
        { name: 'Bamboo', icon: '🎋', role: 'Producer' },
        { name: 'Panda', icon: '🐼', role: 'Primary Consumer' },
        { name: 'Leopard', icon: '🐆', role: 'Secondary Consumer' },
      ],
      title: 'Bamboo Forest',
    },
    {
      chain: [
        { name: 'Cactus', icon: '🌵', role: 'Producer' },
        { name: 'Rabbit', icon: '🐰', role: 'Primary Consumer' },
        { name: 'Coyote', icon: '🐺', role: 'Secondary Consumer' },
      ],
      title: 'Desert Food Chain',
    },
    {
      chain: [
        { name: 'Kelp', icon: '🌿', role: 'Producer' },
        { name: 'Sea Urchin', icon: '🦔', role: 'Primary Consumer' },
        { name: 'Sea Otter', icon: '🦦', role: 'Secondary Consumer' },
      ],
      title: 'Kelp Forest',
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [orderedChain, setOrderedChain] = useState<(typeof foodChains[0]['chain'][0] | null)[]>([]);
  const [availableOrganisms, setAvailableOrganisms] = useState<typeof foodChains[0]['chain']>([]);
  const [draggedOrganism, setDraggedOrganism] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  const currentChain = foodChains[currentIndex];
  const isComplete = currentIndex >= foodChains.length;

  useEffect(() => {
    const chain = foodChains[currentIndex];
    if (chain) {
      const shuffled = [...chain.chain].sort(() => Math.random() - 0.5);
      setAvailableOrganisms(shuffled);
      setOrderedChain(new Array(chain.chain.length).fill(null));
      setShowSuccess(false);
      setShowError(false);
    }
  }, [currentIndex]);

  const handleDrop = (slotIndex: number) => {
    if (draggedOrganism === null) return;

    const organism = availableOrganisms[draggedOrganism];
    const newOrdered = [...orderedChain];
    newOrdered[slotIndex] = organism;
    setOrderedChain(newOrdered);
    
    const newAvailable = availableOrganisms.filter((_, i) => i !== draggedOrganism);
    setAvailableOrganisms(newAvailable);
    setDraggedOrganism(null);

    const isCorrect = newOrdered.every((o, i) => o?.name === currentChain.chain[i].name);
    if (isCorrect && newOrdered.every(o => o !== null)) {
      setShowSuccess(true);
      setScore(score + 1);
      setTimeout(() => {
        if (currentIndex < foodChains.length - 1) {
          setCurrentIndex(currentIndex + 1);
          setShowSuccess(false);
        } else {
          onFinish();
        }
      }, 2000);
    } else if (newOrdered.every(o => o !== null) && !isCorrect) {
      setShowError(true);
      const newLives = lives - 1;
      setLives(newLives);
      if (newLives === 0) {
        setTimeout(() => {
          onFinish();
        }, 2000);
      } else {
        setTimeout(() => {
          setShowError(false);
          const shuffled = [...currentChain.chain].sort(() => Math.random() - 0.5);
          setAvailableOrganisms(shuffled);
          setOrderedChain(new Array(currentChain.chain.length).fill(null));
        }, 1500);
      }
    }
  };

  const handleReturnOrganism = (slotIndex: number) => {
    const organism = orderedChain[slotIndex];
    if (!organism) return;

    const newOrdered = [...orderedChain];
    newOrdered[slotIndex] = null;
    setOrderedChain(newOrdered);
    setAvailableOrganisms([...availableOrganisms, organism]);
  };

  if (isComplete) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] px-4">
        <Card className="max-w-2xl w-full border-2 border-primary/20 shadow-2xl">
          <CardHeader className="text-center space-y-4 pb-6">
            <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mb-4">
              <Trophy className="h-12 w-12 text-white" />
            </div>
            <CardTitle className="text-4xl font-bold">Ecosystem Master! 🎉</CardTitle>
            <div className="text-6xl font-bold text-primary">{score}/{foodChains.length}</div>
          </CardHeader>
          <CardContent>
            <Button onClick={onBack} className="w-full text-lg py-6" size="lg">
              <Home className="h-5 w-5 mr-2" />
              Back to Games
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (lives === 0) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] px-4">
        <Card className="max-w-2xl w-full border-2 border-red-200 shadow-2xl">
          <CardHeader className="text-center space-y-4 pb-6">
            <CardTitle className="text-4xl font-bold">Game Over! 💔</CardTitle>
            <div className="text-6xl font-bold text-red-500">{score}/{foodChains.length}</div>
          </CardHeader>
          <CardContent>
            <Button onClick={onBack} className="w-full text-lg py-6" size="lg">
              <Home className="h-5 w-5 mr-2" />
              Back to Games
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4 py-8">
      <div className="w-full max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={onBack} className="text-lg">
            <Home className="h-5 w-5 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Chains</div>
              <div className="text-3xl font-bold">{score}/{foodChains.length}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Lives</div>
              <div className="text-3xl font-bold flex gap-1">
                {[...Array(lives)].map((_, i) => (
                  <span key={i} className="text-red-500">❤️</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <Card className="border-2 shadow-2xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30">
          <CardHeader className="text-center pb-4">
            <div className="text-6xl mb-4">🌿</div>
            <CardTitle className="text-3xl md:text-4xl font-bold mb-2">Build the Food Chain!</CardTitle>
            <CardDescription className="text-xl">{currentChain.title}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-8 pb-8">
            <div className="flex justify-center gap-4">
              {orderedChain.map((organism, index) => (
                <div
                  key={index}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.add('ring-4', 'ring-primary', 'bg-primary/10');
                  }}
                  onDragLeave={(e) => {
                    e.currentTarget.classList.remove('ring-4', 'ring-primary', 'bg-primary/10');
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove('ring-4', 'ring-primary', 'bg-primary/10');
                    handleDrop(index);
                  }}
                  onClick={() => handleReturnOrganism(index)}
                  className={cn(
                    "w-32 h-32 rounded-xl border-4 border-dashed flex flex-col items-center justify-center text-center p-2 cursor-pointer transition-all",
                    organism ? "bg-green-100 border-green-500" : "bg-gray-100 border-gray-300"
                  )}
                >
                  {organism ? (
                    <>
                      <span className="text-4xl mb-1">{organism.icon}</span>
                      <span className="text-xs font-bold">{organism.name}</span>
                    </>
                  ) : (
                    <span className="text-gray-400 text-xs">{index + 1}</span>
                  )}
                </div>
              ))}
              {orderedChain.length > 0 && orderedChain[orderedChain.length - 1] && (
                <div className="text-4xl flex items-center">→</div>
              )}
            </div>

            {showSuccess && (
              <div className="text-center animate-in zoom-in">
                <div className="text-6xl animate-bounce mb-4">🎉✨</div>
                <div className="text-3xl font-bold text-green-600">Perfect Food Chain!</div>
              </div>
            )}

            {showError && (
              <div className="text-center animate-in zoom-in">
                <div className="text-6xl animate-bounce mb-4">❌</div>
                <div className="text-3xl font-bold text-red-600">
                  {lives > 0 ? 'Wrong order! Lives left: ' + lives : 'Game Over!'}
                </div>
              </div>
            )}

            {!showSuccess && !showError && (
              <>
                <div className="text-center">
                  <p className="text-lg font-semibold mb-4">Drag organisms to build the food chain in order!</p>
                </div>
                <div className="flex justify-center gap-3 flex-wrap">
                  {availableOrganisms.map((organism, index) => (
                    <div
                      key={`${organism.name}-${index}-${currentIndex}`}
                      draggable
                      onDragStart={() => setDraggedOrganism(index)}
                      onDragEnd={() => setDraggedOrganism(null)}
                      className="w-24 h-24 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex flex-col items-center justify-center text-white cursor-grab active:cursor-grabbing shadow-lg transition-all hover:scale-110 hover:rotate-3 p-2"
                    >
                      <span className="text-3xl mb-1">{organism.icon}</span>
                      <span className="text-xs font-bold text-center">{organism.name}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
              <div 
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-4 rounded-full transition-all duration-500"
                style={{ width: `${((currentIndex + 1) / foodChains.length) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Recycle Sorter Game (Life Skills)
function RecycleSorter({ onBack, onFinish }: { onBack: () => void; onFinish: () => void }) {
  const categories = {
    'Paper': { items: ['📄', '📰', '📚', '📋', '📝', '📑', '🧻'], color: 'bg-blue-200', textColor: 'text-blue-900 dark:text-blue-100', borderColor: 'border-blue-500', icon: '📄' },
    'Plastic': { items: ['🥤', '🍶', '💧', '🧴', '🪣', '🎈', '🛍️'], color: 'bg-red-200', textColor: 'text-red-900 dark:text-red-100', borderColor: 'border-red-500', icon: '🥤' },
    'Glass': { items: ['🪟', '🫙', '🔮', '💡', '🧪'], color: 'bg-yellow-200', textColor: 'text-gray-900 dark:text-gray-100', borderColor: 'border-yellow-500', icon: '🪟' },
    'Metal': { items: ['🥫', '🔑', '⚙️', '🔩', '📎', '🗝️', '🪙'], color: 'bg-gray-300', textColor: 'text-gray-900 dark:text-gray-100', borderColor: 'border-gray-500', icon: '🥫' },
    'Organic': { items: ['🍎', '🥕', '🥑', '🍌', '🍊', '🥒', '🌽'], color: 'bg-green-200', textColor: 'text-green-900 dark:text-green-100', borderColor: 'border-green-500', icon: '🍎' },
  };

  // Create 20+ items for rounds
  const allItems = useMemo(() => {
    const items: { item: string; category: string }[] = [];
    Object.entries(categories).forEach(([cat, data]) => {
      data.items.forEach(emoji => {
        items.push({ item: emoji, category: cat });
      });
    });
    // Add more rounds by duplicating with variation
    const additionalRounds = 4;
    for (let i = 0; i < additionalRounds; i++) {
      Object.entries(categories).forEach(([cat, data]) => {
        data.items.forEach(emoji => {
          items.push({ item: emoji, category: cat });
        });
      });
    }
    return items.sort(() => Math.random() - 0.5);
  }, []);

  const [currentRound, setCurrentRound] = useState(0);
  const [sortedItems, setSortedItems] = useState<{ [key: string]: string[] }>({
    'Paper': [],
    'Plastic': [],
    'Glass': [],
    'Metal': [],
    'Organic': [],
  });
  const [availableItems, setAvailableItems] = useState<typeof allItems>([]);
  const [draggedItem, setDraggedItem] = useState<{ item: string; category: string; index: number } | null>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  const roundsPerCategory = 4;
  const totalRounds = Math.ceil(allItems.length / (Object.keys(categories).length * roundsPerCategory));
  const isComplete = currentRound >= 20;

  useEffect(() => {
    const startIdx = currentRound * 8;
    const roundItems = allItems.slice(startIdx, startIdx + 8);
    setAvailableItems(roundItems);
    setSortedItems({ 'Paper': [], 'Plastic': [], 'Glass': [], 'Metal': [], 'Organic': [] });
    setShowSuccess(false);
    setShowError(false);
  }, [currentRound, allItems]);

  const handleDrop = (categoryName: string) => {
    if (!draggedItem) return;

    const newSorted = [...sortedItems[categoryName] || [], draggedItem.item];
    setSortedItems({ ...sortedItems, [categoryName]: newSorted });
    setAvailableItems(availableItems.filter((_, i) => i !== draggedItem.index));
    setDraggedItem(null);

    // Check if round is complete (all items sorted correctly)
    const correctItems = availableItems.filter(i => i.category === categoryName);
    const sortedCorrect = sortedItems[categoryName].filter(i => 
      correctItems.some(ci => ci.item === i)
    );
    
    if (sortedCorrect.length === correctItems.length && availableItems.length === 0) {
      setShowSuccess(true);
      setScore(score + 1);
      setTimeout(() => {
        if (currentRound < 19) {
          setCurrentRound(currentRound + 1);
          setShowSuccess(false);
        } else {
          onFinish();
        }
      }, 2000);
    } else if (newSorted.length > 0 && draggedItem.category !== categoryName) {
      setShowError(true);
      const newLives = lives - 1;
      setLives(newLives);
      if (newLives === 0) {
        setTimeout(() => {
          onFinish();
        }, 2000);
      } else {
        setTimeout(() => {
          setShowError(false);
          const startIdx = currentRound * 8;
          const roundItems = allItems.slice(startIdx, startIdx + 8);
          setAvailableItems(roundItems);
          setSortedItems({ 'Paper': [], 'Plastic': [], 'Glass': [], 'Metal': [], 'Organic': [] });
        }, 1500);
      }
    }
  };

  if (isComplete) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] px-4">
        <Card className="max-w-2xl w-full border-2 border-primary/20 shadow-2xl">
          <CardHeader className="text-center space-y-4 pb-6">
            <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mb-4">
              <Trophy className="h-12 w-12 text-white" />
            </div>
            <CardTitle className="text-4xl font-bold">Recycling Master! 🎉</CardTitle>
            <div className="text-6xl font-bold text-primary">{score}/20</div>
          </CardHeader>
          <CardContent>
            <Button onClick={onBack} className="w-full text-lg py-6" size="lg">
              <Home className="h-5 w-5 mr-2" />
              Back to Games
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (lives === 0) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] px-4">
        <Card className="max-w-2xl w-full border-2 border-red-200 shadow-2xl">
          <CardHeader className="text-center space-y-4 pb-6">
            <CardTitle className="text-4xl font-bold">Game Over! 💔</CardTitle>
            <div className="text-6xl font-bold text-red-500">{score}/20</div>
          </CardHeader>
          <CardContent>
            <Button onClick={onBack} className="w-full text-lg py-6" size="lg">
              <Home className="h-5 w-5 mr-2" />
              Back to Games
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4 py-8">
      <div className="w-full max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={onBack} className="text-lg">
            <Home className="h-5 w-5 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Rounds</div>
              <div className="text-3xl font-bold">{score}/20</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Lives</div>
              <div className="text-3xl font-bold flex gap-1">
                {[...Array(lives)].map((_, i) => (
                  <span key={i} className="text-red-500">❤️</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <Card className="border-2 shadow-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30">
          <CardHeader className="text-center pb-4">
            <div className="text-6xl mb-4">♻️</div>
            <CardTitle className="text-3xl md:text-4xl font-bold mb-2">Sort the Recycling!</CardTitle>
            <CardDescription className="text-xl">Drag items to the correct recycling bin</CardDescription>
          </CardHeader>

          <CardContent className="space-y-8 pb-8">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(categories).map(([categoryName, categoryData]) => (
                <div
                  key={categoryName}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.add('ring-4', 'ring-primary', 'scale-105');
                  }}
                  onDragLeave={(e) => {
                    e.currentTarget.classList.remove('ring-4', 'ring-primary', 'scale-105');
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove('ring-4', 'ring-primary', 'scale-105');
                    handleDrop(categoryName);
                  }}
                  className={cn(
                    "min-h-40 rounded-xl border-4 border-dashed p-4 transition-all",
                    categoryData.color,
                    categoryData.borderColor
                  )}
                >
                  <div className={cn("font-bold text-xl mb-2", categoryData.textColor)}>
                    {categoryName}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {(sortedItems[categoryName] || []).map((item, i) => (
                      <span key={i} className="text-2xl">{item}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {showSuccess && (
              <div className="text-center animate-in zoom-in">
                <div className="text-6xl animate-bounce mb-4">🎉✨</div>
                <div className="text-3xl font-bold text-green-600">Perfect Sorting!</div>
              </div>
            )}

            {showError && (
              <div className="text-center animate-in zoom-in">
                <div className="text-6xl animate-bounce mb-4">❌</div>
                <div className="text-3xl font-bold text-red-600">
                  {lives > 0 ? 'Wrong bin! Lives left: ' + lives : 'Game Over!'}
                </div>
              </div>
            )}

            {!showSuccess && !showError && (
              <>
                <div className="text-center">
                  <p className="text-lg font-semibold mb-4">Drag items to the correct recycling bin!</p>
                </div>
                <div className="flex justify-center gap-3 flex-wrap">
                  {availableItems.map((itemData, index) => (
                    <div
                      key={`${itemData.item}-${index}-${currentRound}`}
                      draggable
                      onDragStart={() => {
                        setDraggedItem({ item: itemData.item, category: itemData.category, index });
                      }}
                      onDragEnd={() => {
                        setDraggedItem(null);
                      }}
                      className="text-5xl cursor-grab active:cursor-grabbing hover:scale-110 transition-transform"
                    >
                      {itemData.item}
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-teal-500 h-4 rounded-full transition-all duration-500"
                style={{ width: `${((currentRound + 1) / 20) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Life Cycle Puzzle Game (Life Skills)
function LifeCyclePuzzle({ onBack, onFinish }: { onBack: () => void; onFinish: () => void }) {
  const lifeCycles = [
    {
      stages: [
        { name: 'Egg', icon: '🥚', description: 'The butterfly starts as an egg' },
        { name: 'Caterpillar', icon: '🐛', description: 'It becomes a caterpillar' },
        { name: 'Chrysalis', icon: '🫥', description: 'Then it forms a chrysalis' },
        { name: 'Butterfly', icon: '🦋', description: 'Finally it becomes a butterfly' },
      ],
      title: 'Butterfly Life Cycle',
      icon: '🦋',
    },
    {
      stages: [
        { name: 'Egg', icon: '🥚', description: 'The frog starts as an egg' },
        { name: 'Tadpole', icon: '🐟', description: 'It hatches into a tadpole' },
        { name: 'Froglet', icon: '🦎', description: 'It grows into a froglet' },
        { name: 'Frog', icon: '🐸', description: 'Finally it becomes an adult frog' },
      ],
      title: 'Frog Life Cycle',
      icon: '🐸',
    },
    {
      stages: [
        { name: 'Seed', icon: '🌱', description: 'The plant starts as a seed' },
        { name: 'Sprout', icon: '🌿', description: 'It sprouts from the ground' },
        { name: 'Plant', icon: '🌳', description: 'It grows into a plant' },
        { name: 'Flower', icon: '🌸', description: 'It produces flowers' },
        { name: 'Fruit', icon: '🍎', description: 'It bears fruit' },
      ],
      title: 'Plant Life Cycle',
      icon: '🌱',
    },
    {
      stages: [
        { name: 'Egg', icon: '🥚', description: 'The bird starts as an egg' },
        { name: 'Hatchling', icon: '🐤', description: 'It hatches into a baby bird' },
        { name: 'Nestling', icon: '🐦', description: 'It grows in the nest' },
        { name: 'Fledgling', icon: '🪶', description: 'It learns to fly' },
        { name: 'Adult', icon: '🦅', description: 'It becomes an adult bird' },
      ],
      title: 'Bird Life Cycle',
      icon: '🐦',
    },
    {
      stages: [
        { name: 'Egg', icon: '🥚', description: 'The chicken starts as an egg' },
        { name: 'Chick', icon: '🐤', description: 'It hatches into a chick' },
        { name: 'Pullet', icon: '🐔', description: 'It grows into a young hen' },
        { name: 'Hen', icon: '🐓', description: 'It becomes an adult hen' },
      ],
      title: 'Chicken Life Cycle',
      icon: '🐔',
    },
    {
      stages: [
        { name: 'Seed', icon: '🌰', description: 'The tree starts as a seed' },
        { name: 'Sapling', icon: '🌿', description: 'It grows into a sapling' },
        { name: 'Young Tree', icon: '🌳', description: 'It becomes a young tree' },
        { name: 'Mature Tree', icon: '🌲', description: 'It grows into a mature tree' },
      ],
      title: 'Tree Life Cycle',
      icon: '🌲',
    },
    {
      stages: [
        { name: 'Egg', icon: '🥚', description: 'The turtle starts as an egg' },
        { name: 'Hatchling', icon: '🐢', description: 'It hatches on the beach' },
        { name: 'Juvenile', icon: '🐢', description: 'It grows in the ocean' },
        { name: 'Adult', icon: '🐢', description: 'It returns to lay eggs' },
      ],
      title: 'Sea Turtle Life Cycle',
      icon: '🐢',
    },
    {
      stages: [
        { name: 'Larva', icon: '🐛', description: 'The beetle starts as a larva' },
        { name: 'Pupa', icon: '🫧', description: 'It becomes a pupa' },
        { name: 'Adult', icon: '🪲', description: 'It emerges as an adult beetle' },
      ],
      title: 'Beetle Life Cycle',
      icon: '🪲',
    },
    {
      stages: [
        { name: 'Egg', icon: '🥚', description: 'The fish starts as an egg' },
        { name: 'Fry', icon: '🐟', description: 'It hatches into a fry' },
        { name: 'Juvenile', icon: '🐠', description: 'It grows into a juvenile' },
        { name: 'Adult', icon: '🐟', description: 'It becomes an adult fish' },
      ],
      title: 'Fish Life Cycle',
      icon: '🐟',
    },
    {
      stages: [
        { name: 'Seed', icon: '🌻', description: 'The sunflower starts as a seed' },
        { name: 'Sprout', icon: '🌱', description: 'It sprouts from the soil' },
        { name: 'Stem', icon: '🌿', description: 'It grows a tall stem' },
        { name: 'Flower', icon: '🌻', description: 'It blooms a beautiful flower' },
      ],
      title: 'Sunflower Life Cycle',
      icon: '🌻',
    },
    {
      stages: [
        { name: 'Egg', icon: '🥚', description: 'The duck starts as an egg' },
        { name: 'Duckling', icon: '🐤', description: 'It hatches into a duckling' },
        { name: 'Young Duck', icon: '🦆', description: 'It grows feathers' },
        { name: 'Adult Duck', icon: '🦆', description: 'It becomes an adult duck' },
      ],
      title: 'Duck Life Cycle',
      icon: '🦆',
    },
    {
      stages: [
        { name: 'Egg', icon: '🥚', description: 'The spider starts as an egg' },
        { name: 'Spiderling', icon: '🕷️', description: 'It hatches into a spiderling' },
        { name: 'Juvenile', icon: '🕷️', description: 'It molts and grows' },
        { name: 'Adult', icon: '🕷️', description: 'It becomes an adult spider' },
      ],
      title: 'Spider Life Cycle',
      icon: '🕷️',
    },
    {
      stages: [
        { name: 'Seed', icon: '🍓', description: 'The strawberry starts as a seed' },
        { name: 'Runner', icon: '🌿', description: 'It sends out runners' },
        { name: 'Plant', icon: '🌱', description: 'It grows into a plant' },
        { name: 'Flower', icon: '🌸', description: 'It produces flowers' },
        { name: 'Strawberry', icon: '🍓', description: 'It bears strawberries' },
      ],
      title: 'Strawberry Life Cycle',
      icon: '🍓',
    },
    {
      stages: [
        { name: 'Egg', icon: '🥚', description: 'The penguin starts as an egg' },
        { name: 'Chick', icon: '🐧', description: 'It hatches into a chick' },
        { name: 'Juvenile', icon: '🐧', description: 'It grows waterproof feathers' },
        { name: 'Adult', icon: '🐧', description: 'It becomes an adult penguin' },
      ],
      title: 'Penguin Life Cycle',
      icon: '🐧',
    },
    {
      stages: [
        { name: 'Spore', icon: '🍄', description: 'The mushroom starts as a spore' },
        { name: 'Mycelium', icon: '🕸️', description: 'It grows mycelium underground' },
        { name: 'Pinhead', icon: '🍄', description: 'A small mushroom appears' },
        { name: 'Mature', icon: '🍄', description: 'It grows into a full mushroom' },
      ],
      title: 'Mushroom Life Cycle',
      icon: '🍄',
    },
    {
      stages: [
        { name: 'Seed', icon: '🌽', description: 'The corn starts as a seed' },
        { name: 'Sprout', icon: '🌱', description: 'It sprouts from the ground' },
        { name: 'Stalk', icon: '🌾', description: 'It grows a tall stalk' },
        { name: 'Ear', icon: '🌽', description: 'It produces ears of corn' },
      ],
      title: 'Corn Life Cycle',
      icon: '🌽',
    },
    {
      stages: [
        { name: 'Egg', icon: '🥚', description: 'The bee starts as an egg' },
        { name: 'Larva', icon: '🐛', description: 'It becomes a larva' },
        { name: 'Pupa', icon: '🫧', description: 'It forms a pupa' },
        { name: 'Adult Bee', icon: '🐝', description: 'It emerges as an adult bee' },
      ],
      title: 'Bee Life Cycle',
      icon: '🐝',
    },
    {
      stages: [
        { name: 'Seed', icon: '🥜', description: 'The bean starts as a seed' },
        { name: 'Roots', icon: '🌱', description: 'It grows roots' },
        { name: 'Shoot', icon: '🌿', description: 'A shoot appears above ground' },
        { name: 'Plant', icon: '🫛', description: 'It grows into a bean plant' },
      ],
      title: 'Bean Life Cycle',
      icon: '🫛',
    },
    {
      stages: [
        { name: 'Egg', icon: '🥚', description: 'The ant starts as an egg' },
        { name: 'Larva', icon: '🐛', description: 'It becomes a larva' },
        { name: 'Pupa', icon: '🫧', description: 'It forms a pupa' },
        { name: 'Adult', icon: '🐜', description: 'It becomes an adult ant' },
      ],
      title: 'Ant Life Cycle',
      icon: '🐜',
    },
    {
      stages: [
        { name: 'Seed', icon: '🌰', description: 'The oak starts as an acorn' },
        { name: 'Sprout', icon: '🌱', description: 'It sprouts from the acorn' },
        { name: 'Sapling', icon: '🌿', description: 'It becomes a small tree' },
        { name: 'Oak Tree', icon: '🌳', description: 'It grows into a mighty oak' },
      ],
      title: 'Oak Tree Life Cycle',
      icon: '🌳',
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [orderedStages, setOrderedStages] = useState<(typeof lifeCycles[0]['stages'][0] | null)[]>([]);
  const [availableStages, setAvailableStages] = useState<typeof lifeCycles[0]['stages']>([]);
  const [draggedStage, setDraggedStage] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  const currentCycle = lifeCycles[currentIndex];
  const isComplete = currentIndex >= lifeCycles.length;

  useEffect(() => {
    const cycle = lifeCycles[currentIndex];
    if (cycle) {
      const shuffled = [...cycle.stages].sort(() => Math.random() - 0.5);
      setAvailableStages(shuffled);
      setOrderedStages(new Array(cycle.stages.length).fill(null));
      setShowSuccess(false);
      setShowError(false);
    }
  }, [currentIndex]);

  const handleDrop = (slotIndex: number) => {
    if (draggedStage === null) return;

    const stage = availableStages[draggedStage];
    const newOrdered = [...orderedStages];
    newOrdered[slotIndex] = stage;
    setOrderedStages(newOrdered);
    
    const newAvailable = availableStages.filter((_, i) => i !== draggedStage);
    setAvailableStages(newAvailable);
    setDraggedStage(null);

    const isCorrect = newOrdered.every((s, i) => s?.name === currentCycle.stages[i].name);
    if (isCorrect && newOrdered.every(s => s !== null)) {
      setShowSuccess(true);
      setScore(score + 1);
      setTimeout(() => {
        if (currentIndex < lifeCycles.length - 1) {
          setCurrentIndex(currentIndex + 1);
          setShowSuccess(false);
        } else {
          onFinish();
        }
      }, 2000);
    } else if (newOrdered.every(s => s !== null) && !isCorrect) {
      setShowError(true);
      const newLives = lives - 1;
      setLives(newLives);
      if (newLives === 0) {
        setTimeout(() => {
          onFinish();
        }, 2000);
      } else {
        setTimeout(() => {
          setShowError(false);
          const shuffled = [...currentCycle.stages].sort(() => Math.random() - 0.5);
          setAvailableStages(shuffled);
          setOrderedStages(new Array(currentCycle.stages.length).fill(null));
        }, 1500);
      }
    }
  };

  const handleReturnStage = (slotIndex: number) => {
    const stage = orderedStages[slotIndex];
    if (!stage) return;

    const newOrdered = [...orderedStages];
    newOrdered[slotIndex] = null;
    setOrderedStages(newOrdered);
    setAvailableStages([...availableStages, stage]);
  };

  if (isComplete) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] px-4">
        <Card className="max-w-2xl w-full border-2 border-primary/20 shadow-2xl">
          <CardHeader className="text-center space-y-4 pb-6">
            <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mb-4">
              <Trophy className="h-12 w-12 text-white" />
            </div>
            <CardTitle className="text-4xl font-bold">Life Cycle Master! 🎉</CardTitle>
            <div className="text-6xl font-bold text-primary">{score}/{lifeCycles.length}</div>
          </CardHeader>
          <CardContent>
            <Button onClick={onBack} className="w-full text-lg py-6" size="lg">
              <Home className="h-5 w-5 mr-2" />
              Back to Games
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (lives === 0) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] px-4">
        <Card className="max-w-2xl w-full border-2 border-red-200 shadow-2xl">
          <CardHeader className="text-center space-y-4 pb-6">
            <CardTitle className="text-4xl font-bold">Game Over! 💔</CardTitle>
            <div className="text-6xl font-bold text-red-500">{score}/{lifeCycles.length}</div>
          </CardHeader>
          <CardContent>
            <Button onClick={onBack} className="w-full text-lg py-6" size="lg">
              <Home className="h-5 w-5 mr-2" />
              Back to Games
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4 py-8">
      <div className="w-full max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={onBack} className="text-lg">
            <Home className="h-5 w-5 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Cycles</div>
              <div className="text-3xl font-bold">{score}/{lifeCycles.length}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Lives</div>
              <div className="text-3xl font-bold flex gap-1">
                {[...Array(lives)].map((_, i) => (
                  <span key={i} className="text-red-500">❤️</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <Card className="border-2 shadow-2xl bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30">
          <CardHeader className="text-center pb-4">
            <div className="text-6xl mb-4">{currentCycle.icon}</div>
            <CardTitle className="text-3xl md:text-4xl font-bold mb-2">Arrange the Life Cycle!</CardTitle>
            <CardDescription className="text-xl">{currentCycle.title}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-8 pb-8">
            <div className="flex justify-center gap-4 flex-wrap">
              {orderedStages.map((stage, index) => (
                <div
                  key={index}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.add('ring-4', 'ring-primary', 'bg-primary/10');
                  }}
                  onDragLeave={(e) => {
                    e.currentTarget.classList.remove('ring-4', 'ring-primary', 'bg-primary/10');
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove('ring-4', 'ring-primary', 'bg-primary/10');
                    handleDrop(index);
                  }}
                  onClick={() => handleReturnStage(index)}
                  className={cn(
                    "w-32 h-32 rounded-xl border-4 border-dashed flex flex-col items-center justify-center text-center p-2 cursor-pointer transition-all",
                    stage ? "bg-purple-100 border-purple-500" : "bg-gray-100 border-gray-300"
                  )}
                >
                  {stage ? (
                    <>
                      <span className="text-4xl mb-1">{stage.icon}</span>
                      <span className="text-xs font-bold">{stage.name}</span>
                    </>
                  ) : (
                    <span className="text-gray-400 text-xs">{index + 1}</span>
                  )}
                </div>
              ))}
            </div>

            {showSuccess && (
              <div className="text-center animate-in zoom-in">
                <div className="text-6xl animate-bounce mb-4">🎉✨</div>
                <div className="text-3xl font-bold text-green-600">Perfect Life Cycle!</div>
              </div>
            )}

            {showError && (
              <div className="text-center animate-in zoom-in">
                <div className="text-6xl animate-bounce mb-4">❌</div>
                <div className="text-3xl font-bold text-red-600">
                  {lives > 0 ? 'Wrong order! Lives left: ' + lives : 'Game Over!'}
                </div>
              </div>
            )}

            {!showSuccess && !showError && (
              <>
                <div className="text-center">
                  <p className="text-lg font-semibold mb-4">Drag stages to arrange the life cycle in order!</p>
                </div>
                <div className="flex justify-center gap-3 flex-wrap">
                  {availableStages.map((stage, index) => (
                    <div
                      key={`${stage.name}-${index}-${currentIndex}`}
                      draggable
                      onDragStart={() => setDraggedStage(index)}
                      onDragEnd={() => setDraggedStage(null)}
                      className="w-24 h-24 rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 flex flex-col items-center justify-center text-white cursor-grab active:cursor-grabbing shadow-lg transition-all hover:scale-110 hover:rotate-3 p-2"
                    >
                      <span className="text-3xl mb-1">{stage.icon}</span>
                      <span className="text-xs font-bold text-center">{stage.name}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
              <div 
                className="bg-gradient-to-r from-violet-500 to-purple-500 h-4 rounded-full transition-all duration-500"
                style={{ width: `${((currentIndex + 1) / lifeCycles.length) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ==================== ADDITIONAL GAME COMPONENTS ====================

// Number Race Game (Mathematics)
function NumberRace({ onBack, onFinish }: { onBack: () => void; onFinish: () => void }) {
  const challenges = Array.from({ length: 20 }, (_, i) => ({
    question: `What comes after ${i + 1}?`,
    answer: (i + 2).toString(),
    wrongAnswers: [(i + 3).toString(), (i + 1).toString(), (i + 4).toString()],
  }));

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  const currentChallenge = challenges[currentIndex];
  const isComplete = currentIndex >= challenges.length;

  const options = useMemo(() => {
    return [currentChallenge.answer, ...currentChallenge.wrongAnswers].sort(() => Math.random() - 0.5);
  }, [currentIndex]);

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    if (answer === currentChallenge.answer) {
      setShowSuccess(true);
      setScore(score + 1);
      setTimeout(() => {
        if (currentIndex < challenges.length - 1) {
          setCurrentIndex(currentIndex + 1);
          setShowSuccess(false);
          setSelectedAnswer(null);
        } else {
          onFinish();
        }
      }, 1500);
    } else {
      setShowError(true);
      const newLives = lives - 1;
      setLives(newLives);
      if (newLives === 0) {
        setTimeout(() => onFinish(), 2000);
      } else {
        setTimeout(() => {
          setShowError(false);
          setSelectedAnswer(null);
        }, 1500);
      }
    }
  };

  if (isComplete || lives === 0) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] px-4">
        <Card className="max-w-2xl w-full border-2 border-primary/20 shadow-2xl">
          <CardHeader className="text-center space-y-4 pb-6">
            <CardTitle className="text-4xl font-bold">{lives === 0 ? 'Game Over! 💔' : 'Number Race Champion! 🎉'}</CardTitle>
            <div className="text-6xl font-bold text-primary">{score}/{challenges.length}</div>
          </CardHeader>
          <CardContent>
            <Button onClick={onBack} className="w-full text-lg py-6" size="lg">
              <Home className="h-5 w-5 mr-2" />
              Back to Games
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4 py-8">
      <div className="w-full max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={onBack} className="text-lg">
            <Home className="h-5 w-5 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Score</div>
              <div className="text-3xl font-bold">{score}/{challenges.length}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Lives</div>
              <div className="text-3xl font-bold flex gap-1">
                {[...Array(lives)].map((_, i) => <span key={i} className="text-red-500">❤️</span>)}
              </div>
            </div>
          </div>
        </div>

        <Card className="border-2 shadow-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
          <CardHeader className="text-center pb-4">
            <div className="text-6xl mb-4">🏃</div>
            <CardTitle className="text-3xl md:text-4xl font-bold mb-2">Number Race!</CardTitle>
            <CardDescription className="text-xl">{currentChallenge.question}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-8 pb-8">
            {showSuccess && (
              <div className="text-center animate-in zoom-in">
                <div className="text-6xl animate-bounce mb-4">🎉✨</div>
                <div className="text-3xl font-bold text-green-600">Correct!</div>
              </div>
            )}

            {showError && (
              <div className="text-center animate-in zoom-in">
                <div className="text-6xl animate-bounce mb-4">❌</div>
                <div className="text-3xl font-bold text-red-600">
                  {lives > 0 ? 'Wrong! Lives left: ' + lives : 'Game Over!'}
                </div>
              </div>
            )}

            {!showSuccess && !showError && (
              <div className="grid grid-cols-2 gap-4">
                {options.map((option, idx) => (
                  <button
                    key={`${option}-${idx}-${currentIndex}`}
                    onClick={() => handleAnswer(option)}
                    disabled={selectedAnswer !== null}
                    className={cn(
                      "px-8 py-6 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 text-white text-2xl font-bold shadow-lg transition-all hover:scale-110 hover:shadow-2xl",
                      selectedAnswer === option && "ring-4 ring-yellow-300",
                      selectedAnswer !== null && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}

            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
              <div 
                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-4 rounded-full transition-all duration-500"
                style={{ width: `${((currentIndex + 1) / challenges.length) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Addition Adventure Game (Mathematics)
function AdditionAdventure({ onBack, onFinish }: { onBack: () => void; onFinish: () => void }) {
  const challenges = Array.from({ length: 20 }, () => {
    const a = Math.floor(Math.random() * 20) + 1;
    const b = Math.floor(Math.random() * 20) + 1;
    return {
      question: `${a} + ${b} = ?`,
      answer: (a + b).toString(),
      wrongAnswers: [(a + b + 1).toString(), (a + b - 1).toString(), (a + b + 2).toString()],
    };
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  const currentChallenge = challenges[currentIndex];
  const isComplete = currentIndex >= challenges.length;

  const options = useMemo(() => {
    return [currentChallenge.answer, ...currentChallenge.wrongAnswers].sort(() => Math.random() - 0.5);
  }, [currentIndex]);

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    if (answer === currentChallenge.answer) {
      setShowSuccess(true);
      setScore(score + 1);
      setTimeout(() => {
        if (currentIndex < challenges.length - 1) {
          setCurrentIndex(currentIndex + 1);
          setShowSuccess(false);
          setSelectedAnswer(null);
        } else {
          onFinish();
        }
      }, 1500);
    } else {
      setShowError(true);
      const newLives = lives - 1;
      setLives(newLives);
      if (newLives === 0) {
        setTimeout(() => onFinish(), 2000);
      } else {
        setTimeout(() => {
          setShowError(false);
          setSelectedAnswer(null);
        }, 1500);
      }
    }
  };

  if (isComplete || lives === 0) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] px-4">
        <Card className="max-w-2xl w-full border-2 border-primary/20 shadow-2xl">
          <CardHeader className="text-center space-y-4 pb-6">
            <CardTitle className="text-4xl font-bold">{lives === 0 ? 'Game Over! 💔' : 'Addition Master! 🎉'}</CardTitle>
            <div className="text-6xl font-bold text-primary">{score}/{challenges.length}</div>
          </CardHeader>
          <CardContent>
            <Button onClick={onBack} className="w-full text-lg py-6" size="lg">
              <Home className="h-5 w-5 mr-2" />
              Back to Games
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4 py-8">
      <div className="w-full max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={onBack} className="text-lg">
            <Home className="h-5 w-5 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Score</div>
              <div className="text-3xl font-bold">{score}/{challenges.length}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Lives</div>
              <div className="text-3xl font-bold flex gap-1">
                {[...Array(lives)].map((_, i) => <span key={i} className="text-red-500">❤️</span>)}
              </div>
            </div>
          </div>
        </div>

        <Card className="border-2 shadow-2xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30">
          <CardHeader className="text-center pb-4">
            <div className="text-6xl mb-4">➕</div>
            <CardTitle className="text-3xl md:text-4xl font-bold mb-2">Addition Adventure!</CardTitle>
            <CardDescription className="text-3xl font-bold">{currentChallenge.question}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-8 pb-8">
            {showSuccess && (
              <div className="text-center animate-in zoom-in">
                <div className="text-6xl animate-bounce mb-4">🎉✨</div>
                <div className="text-3xl font-bold text-green-600">Perfect!</div>
              </div>
            )}

            {showError && (
              <div className="text-center animate-in zoom-in">
                <div className="text-6xl animate-bounce mb-4">❌</div>
                <div className="text-3xl font-bold text-red-600">
                  {lives > 0 ? 'Wrong! Lives left: ' + lives : 'Game Over!'}
                </div>
              </div>
            )}

            {!showSuccess && !showError && (
              <div className="grid grid-cols-2 gap-4">
                {options.map((option, idx) => (
                  <button
                    key={`${option}-${idx}-${currentIndex}`}
                    onClick={() => handleAnswer(option)}
                    disabled={selectedAnswer !== null}
                    className={cn(
                      "px-8 py-6 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 text-white text-2xl font-bold shadow-lg transition-all hover:scale-110 hover:shadow-2xl",
                      selectedAnswer === option && "ring-4 ring-yellow-300",
                      selectedAnswer !== null && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}

            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
              <div 
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-4 rounded-full transition-all duration-500"
                style={{ width: `${((currentIndex + 1) / challenges.length) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Subtraction Splash Game (Mathematics)
function SubtractionSplash({ onBack, onFinish }: { onBack: () => void; onFinish: () => void }) {
  const challenges = Array.from({ length: 20 }, () => {
    const a = Math.floor(Math.random() * 30) + 10;
    const b = Math.floor(Math.random() * (a - 1)) + 1;
    return {
      question: `${a} - ${b} = ?`,
      answer: (a - b).toString(),
      wrongAnswers: [(a - b + 1).toString(), (a - b - 1).toString(), (a - b + 2).toString()],
    };
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  const currentChallenge = challenges[currentIndex];
  const isComplete = currentIndex >= challenges.length;

  const options = useMemo(() => {
    return [currentChallenge.answer, ...currentChallenge.wrongAnswers].sort(() => Math.random() - 0.5);
  }, [currentIndex]);

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    if (answer === currentChallenge.answer) {
      setShowSuccess(true);
      setScore(score + 1);
      setTimeout(() => {
        if (currentIndex < challenges.length - 1) {
          setCurrentIndex(currentIndex + 1);
          setShowSuccess(false);
          setSelectedAnswer(null);
        } else {
          onFinish();
        }
      }, 1500);
    } else {
      setShowError(true);
      const newLives = lives - 1;
      setLives(newLives);
      if (newLives === 0) {
        setTimeout(() => onFinish(), 2000);
      } else {
        setTimeout(() => {
          setShowError(false);
          setSelectedAnswer(null);
        }, 1500);
      }
    }
  };

  if (isComplete || lives === 0) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] px-4">
        <Card className="max-w-2xl w-full border-2 border-primary/20 shadow-2xl">
          <CardHeader className="text-center space-y-4 pb-6">
            <CardTitle className="text-4xl font-bold">{lives === 0 ? 'Game Over! 💔' : 'Subtraction Star! 🎉'}</CardTitle>
            <div className="text-6xl font-bold text-primary">{score}/{challenges.length}</div>
          </CardHeader>
          <CardContent>
            <Button onClick={onBack} className="w-full text-lg py-6" size="lg">
              <Home className="h-5 w-5 mr-2" />
              Back to Games
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4 py-8">
      <div className="w-full max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={onBack} className="text-lg">
            <Home className="h-5 w-5 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Score</div>
              <div className="text-3xl font-bold">{score}/{challenges.length}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Lives</div>
              <div className="text-3xl font-bold flex gap-1">
                {[...Array(lives)].map((_, i) => <span key={i} className="text-red-500">❤️</span>)}
              </div>
            </div>
          </div>
        </div>

        <Card className="border-2 shadow-2xl bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30">
          <CardHeader className="text-center pb-4">
            <div className="text-6xl mb-4">➖</div>
            <CardTitle className="text-3xl md:text-4xl font-bold mb-2">Subtraction Splash!</CardTitle>
            <CardDescription className="text-3xl font-bold">{currentChallenge.question}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-8 pb-8">
            {showSuccess && (
              <div className="text-center animate-in zoom-in">
                <div className="text-6xl animate-bounce mb-4">🎉✨</div>
                <div className="text-3xl font-bold text-green-600">Excellent!</div>
              </div>
            )}

            {showError && (
              <div className="text-center animate-in zoom-in">
                <div className="text-6xl animate-bounce mb-4">❌</div>
                <div className="text-3xl font-bold text-red-600">
                  {lives > 0 ? 'Wrong! Lives left: ' + lives : 'Game Over!'}
                </div>
              </div>
            )}

            {!showSuccess && !showError && (
              <div className="grid grid-cols-2 gap-4">
                {options.map((option, idx) => (
                  <button
                    key={`${option}-${idx}-${currentIndex}`}
                    onClick={() => handleAnswer(option)}
                    disabled={selectedAnswer !== null}
                    className={cn(
                      "px-8 py-6 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 text-white text-2xl font-bold shadow-lg transition-all hover:scale-110 hover:shadow-2xl",
                      selectedAnswer === option && "ring-4 ring-yellow-300",
                      selectedAnswer !== null && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}

            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
              <div 
                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-4 rounded-full transition-all duration-500"
                style={{ width: `${((currentIndex + 1) / challenges.length) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Color gradient mappings for games
const gradientClasses: Record<string, { card: string; button: string; progress: string }> = {
  'purple-pink': { card: 'from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30', button: 'from-purple-400 to-pink-500', progress: 'from-purple-500 to-pink-500' },
  'yellow-amber': { card: 'from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/30', button: 'from-yellow-400 to-amber-500', progress: 'from-yellow-500 to-amber-500' },
  'indigo-purple': { card: 'from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30', button: 'from-indigo-400 to-purple-500', progress: 'from-indigo-500 to-purple-500' },
  'teal-cyan': { card: 'from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30', button: 'from-teal-400 to-cyan-500', progress: 'from-teal-500 to-cyan-500' },
  'rose-pink': { card: 'from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30', button: 'from-rose-400 to-pink-500', progress: 'from-rose-500 to-pink-500' },
  'blue-indigo': { card: 'from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30', button: 'from-blue-400 to-indigo-500', progress: 'from-blue-500 to-indigo-500' },
  'green-emerald': { card: 'from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30', button: 'from-green-400 to-emerald-500', progress: 'from-green-500 to-emerald-500' },
  'blue-cyan': { card: 'from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30', button: 'from-blue-400 to-cyan-500', progress: 'from-blue-500 to-cyan-500' },
  'violet-purple': { card: 'from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30', button: 'from-violet-400 to-purple-500', progress: 'from-violet-500 to-purple-500' },
  'sky-blue': { card: 'from-sky-50 to-blue-50 dark:from-sky-950/30 dark:to-blue-950/30', button: 'from-sky-400 to-blue-500', progress: 'from-sky-500 to-blue-500' },
  'yellow-orange': { card: 'from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30', button: 'from-yellow-400 to-orange-500', progress: 'from-yellow-500 to-orange-500' },
  'red-orange': { card: 'from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30', button: 'from-red-400 to-orange-500', progress: 'from-red-500 to-orange-500' },
};

// Helper function to create multiple choice games
function createMultipleChoiceGame(
  name: string,
  icon: string,
  gradientKey: string,
  challenges: Array<{ question: string; answer: string; options: string[] }>
) {
  return function GameComponent({ onBack, onFinish }: { onBack: () => void; onFinish: () => void }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState(false);

    const currentChallenge = challenges[currentIndex];
    const isComplete = currentIndex >= challenges.length;
    const colors = gradientClasses[gradientKey] || gradientClasses['blue-indigo'];

    const options = useMemo(() => {
      return currentChallenge.options.sort(() => Math.random() - 0.5);
    }, [currentIndex]);

    const handleAnswer = (answer: string) => {
      setSelectedAnswer(answer);
      if (answer === currentChallenge.answer) {
        setShowSuccess(true);
        setScore(score + 1);
        setTimeout(() => {
          if (currentIndex < challenges.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setShowSuccess(false);
            setSelectedAnswer(null);
          } else {
            onFinish();
          }
        }, 1500);
      } else {
        setShowError(true);
        const newLives = lives - 1;
        setLives(newLives);
        if (newLives === 0) {
          setTimeout(() => onFinish(), 2000);
        } else {
          setTimeout(() => {
            setShowError(false);
            setSelectedAnswer(null);
          }, 1500);
        }
      }
    };

    if (isComplete || lives === 0) {
      return (
        <div className="flex items-center justify-center min-h-[80vh] px-4">
          <Card className="max-w-2xl w-full border-2 border-primary/20 shadow-2xl">
            <CardHeader className="text-center space-y-4 pb-6">
              <CardTitle className="text-4xl font-bold">{lives === 0 ? 'Game Over! 💔' : name + ' Champion! 🎉'}</CardTitle>
              <div className="text-6xl font-bold text-primary">{score}/{challenges.length}</div>
            </CardHeader>
            <CardContent>
              <Button onClick={onBack} className="w-full text-lg py-6" size="lg">
                <Home className="h-5 w-5 mr-2" />
                Back to Games
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center min-h-[80vh] px-4 py-8">
        <div className="w-full max-w-5xl space-y-6">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={onBack} className="text-lg">
              <Home className="h-5 w-5 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Score</div>
                <div className="text-3xl font-bold">{score}/{challenges.length}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Lives</div>
                <div className="text-3xl font-bold flex gap-1">
                  {[...Array(lives)].map((_, i) => <span key={i} className="text-red-500">❤️</span>)}
                </div>
              </div>
            </div>
          </div>

          <Card className={cn("border-2 shadow-2xl bg-gradient-to-br", colors.card)}>
            <CardHeader className="text-center pb-4">
              <div className="text-6xl mb-4">{icon}</div>
              <CardTitle className="text-3xl md:text-4xl font-bold mb-2">{name}!</CardTitle>
              <CardDescription className="text-xl">{currentChallenge.question}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-8 pb-8">
              {showSuccess && (
                <div className="text-center animate-in zoom-in">
                  <div className="text-6xl animate-bounce mb-4">🎉✨</div>
                  <div className="text-3xl font-bold text-green-600">Perfect!</div>
                </div>
              )}

              {showError && (
                <div className="text-center animate-in zoom-in">
                  <div className="text-6xl animate-bounce mb-4">❌</div>
                  <div className="text-3xl font-bold text-red-600">
                    {lives > 0 ? 'Wrong! Lives left: ' + lives : 'Game Over!'}
                  </div>
                </div>
              )}

              {!showSuccess && !showError && (
                <div className="grid grid-cols-2 gap-4">
                  {options.map((option, idx) => (
                    <button
                      key={`${option}-${idx}-${currentIndex}`}
                      onClick={() => handleAnswer(option)}
                      disabled={selectedAnswer !== null}
                      className={cn(
                        "px-8 py-6 rounded-xl bg-gradient-to-br text-white text-2xl font-bold shadow-lg transition-all hover:scale-110 hover:shadow-2xl",
                        colors.button,
                        selectedAnswer === option && "ring-4 ring-yellow-300",
                        selectedAnswer !== null && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}

              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                <div 
                  className={cn("h-4 rounded-full transition-all duration-500 bg-gradient-to-r", colors.progress)}
                  style={{ width: `${((currentIndex + 1) / challenges.length) * 100}%` }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };
}

// Measurement Master Game
const MeasurementMaster = createMultipleChoiceGame(
  'Measurement Master',
  '📏',
  'purple-pink',
  [
    { question: 'How many centimeters in 1 meter?', answer: '100', options: ['10', '100', '1000', '50'] },
    { question: 'How many meters in 1 kilometer?', answer: '1000', options: ['100', '1000', '10', '500'] },
    { question: 'How many grams in 1 kilogram?', answer: '1000', options: ['100', '1000', '10', '500'] },
    { question: 'How many milliliters in 1 liter?', answer: '1000', options: ['100', '1000', '10', '500'] },
    { question: 'How many seconds in 1 minute?', answer: '60', options: ['30', '60', '100', '120'] },
    ...Array.from({ length: 15 }, (_, i) => ({
      question: `How many ${['centimeters', 'meters', 'grams', 'milliliters', 'seconds'][i % 5]} in ${i + 2} ${['meters', 'kilometers', 'kilograms', 'liters', 'minutes'][i % 5]}?`,
      answer: ((i + 2) * [100, 1000, 1000, 1000, 60][i % 5]).toString(),
      options: [
        ((i + 2) * [100, 1000, 1000, 1000, 60][i % 5]).toString(),
        ((i + 1) * [100, 1000, 1000, 1000, 60][i % 5]).toString(),
        ((i + 3) * [100, 1000, 1000, 1000, 60][i % 5]).toString(),
        ((i + 4) * [100, 1000, 1000, 1000, 60][i % 5]).toString(),
      ],
    })),
  ]
);

// Time Teller Game - Special implementation with clock
function TimeTeller({ onBack, onFinish }: { onBack: () => void; onFinish: () => void }) {
  const generateTimeChallenge = () => {
    const hour = Math.floor(Math.random() * 12) + 1;
    const minute = Math.floor(Math.random() * 4) * 15;
    const timeStr = `${hour}:${minute.toString().padStart(2, '0')}`;
    const wrongTimes = [
      `${hour}:${((minute + 15) % 60).toString().padStart(2, '0')}`,
      `${hour === 12 ? 1 : hour + 1}:${minute.toString().padStart(2, '0')}`,
      `${hour === 1 ? 12 : hour - 1}:${minute.toString().padStart(2, '0')}`,
    ];
    return { timeStr, wrongTimes };
  };

  const challenges = Array.from({ length: 20 }, () => {
    const { timeStr, wrongTimes } = generateTimeChallenge();
    return { question: `What time does this clock show?`, clockTime: timeStr, answer: timeStr, options: [timeStr, ...wrongTimes] };
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  const currentChallenge = challenges[currentIndex];
  const isComplete = currentIndex >= challenges.length;

  const options = useMemo(() => {
    return currentChallenge.options.sort(() => Math.random() - 0.5);
  }, [currentIndex]);

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    if (answer === currentChallenge.answer) {
      setShowSuccess(true);
      setScore(score + 1);
      setTimeout(() => {
        if (currentIndex < challenges.length - 1) {
          setCurrentIndex(currentIndex + 1);
          setShowSuccess(false);
          setSelectedAnswer(null);
        } else {
          onFinish();
        }
      }, 1500);
    } else {
      setShowError(true);
      const newLives = lives - 1;
      setLives(newLives);
      if (newLives === 0) {
        setTimeout(() => onFinish(), 2000);
      } else {
        setTimeout(() => {
          setShowError(false);
          setSelectedAnswer(null);
        }, 1500);
      }
    }
  };

  if (isComplete || lives === 0) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] px-4">
        <Card className="max-w-2xl w-full border-2 border-primary/20 shadow-2xl">
          <CardHeader className="text-center space-y-4 pb-6">
            <CardTitle className="text-4xl font-bold">{lives === 0 ? 'Game Over! 💔' : 'Time Master! 🎉'}</CardTitle>
            <div className="text-6xl font-bold text-primary">{score}/{challenges.length}</div>
          </CardHeader>
          <CardContent>
            <Button onClick={onBack} className="w-full text-lg py-6" size="lg">
              <Home className="h-5 w-5 mr-2" />
              Back to Games
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const [hour, minute] = currentChallenge.clockTime.split(':').map(Number);
  const hourAngle = (hour % 12) * 30 + minute * 0.5;
  const minuteAngle = minute * 6;

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4 py-8">
      <div className="w-full max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={onBack} className="text-lg">
            <Home className="h-5 w-5 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Score</div>
              <div className="text-3xl font-bold">{score}/{challenges.length}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Lives</div>
              <div className="text-3xl font-bold flex gap-1">
                {[...Array(lives)].map((_, i) => <span key={i} className="text-red-500">❤️</span>)}
              </div>
            </div>
          </div>
        </div>

        <Card className="border-2 shadow-2xl bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30">
          <CardHeader className="text-center pb-4">
            <div className="text-6xl mb-4">🕐</div>
            <CardTitle className="text-3xl md:text-4xl font-bold mb-2">Time Teller!</CardTitle>
            <CardDescription className="text-xl">{currentChallenge.question}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-8 pb-8">
            <div className="flex justify-center">
              <div className="relative w-48 h-48 border-8 border-gray-800 rounded-full bg-white">
                {[...Array(12)].map((_, i) => {
                  const angle = (i * 30 - 90) * (Math.PI / 180);
                  const x = 96 + 80 * Math.cos(angle);
                  const y = 96 + 80 * Math.sin(angle);
                  return (
                    <span key={i} className="absolute text-2xl font-bold" style={{ left: `${x - 12}px`, top: `${y - 16}px` }}>
                      {i === 0 ? 12 : i}
                    </span>
                  );
                })}
                <div className="absolute top-1/2 left-1/2 w-2 h-16 bg-gray-800 origin-top" style={{ transform: `translate(-50%, -100%) rotate(${hourAngle}deg)`, transformOrigin: 'bottom center' }} />
                <div className="absolute top-1/2 left-1/2 w-1.5 h-20 bg-gray-800 origin-top" style={{ transform: `translate(-50%, -100%) rotate(${minuteAngle}deg)`, transformOrigin: 'bottom center' }} />
                <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-gray-800 rounded-full transform -translate-x-1/2 -translate-y-1/2" />
              </div>
            </div>

            {showSuccess && (
              <div className="text-center animate-in zoom-in">
                <div className="text-6xl animate-bounce mb-4">🎉✨</div>
                <div className="text-3xl font-bold text-green-600">Correct!</div>
              </div>
            )}

            {showError && (
              <div className="text-center animate-in zoom-in">
                <div className="text-6xl animate-bounce mb-4">❌</div>
                <div className="text-3xl font-bold text-red-600">
                  {lives > 0 ? 'Wrong! Lives left: ' + lives : 'Game Over!'}
                </div>
              </div>
            )}

            {!showSuccess && !showError && (
              <div className="grid grid-cols-2 gap-4">
                {options.map((option, idx) => (
                  <button
                    key={`${option}-${idx}-${currentIndex}`}
                    onClick={() => handleAnswer(option)}
                    disabled={selectedAnswer !== null}
                    className={cn(
                      "px-8 py-6 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 text-white text-2xl font-bold shadow-lg transition-all hover:scale-110 hover:shadow-2xl",
                      selectedAnswer === option && "ring-4 ring-yellow-300",
                      selectedAnswer !== null && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}

            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 h-4 rounded-full transition-all duration-500" style={{ width: `${((currentIndex + 1) / challenges.length) * 100}%` }} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Rhyme Time Game - Special implementation
function RhymeTime({ onBack, onFinish }: { onBack: () => void; onFinish: () => void }) {
  const rhymingPairs = [
    { word: 'cat', rhymes: ['hat', 'bat', 'rat'], wrong: ['dog', 'sun', 'car'] },
    { word: 'dog', rhymes: ['fog', 'log', 'hog'], wrong: ['cat', 'car', 'top'] },
    { word: 'sun', rhymes: ['fun', 'run', 'bun'], wrong: ['cat', 'dog', 'car'] },
    { word: 'car', rhymes: ['star', 'far', 'bar'], wrong: ['cat', 'dog', 'sun'] },
    { word: 'tree', rhymes: ['bee', 'see', 'free'], wrong: ['cat', 'dog', 'car'] },
    ...Array.from({ length: 15 }, (_, i) => {
      const words = ['hat', 'cake', 'fish', 'boat', 'mouse', 'book', 'ball', 'rain', 'night', 'blue', 'play', 'red', 'moon', 'ring', 'snow'];
      const word = words[i % words.length];
      return {
        word,
        rhymes: [word.slice(0, -1) + 'at', word.slice(0, -1) + 'it', word.slice(0, -1) + 'ot'],
        wrong: ['cat', 'dog', 'sun'],
      };
    }),
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  const currentPair = rhymingPairs[currentIndex];
  const isComplete = currentIndex >= rhymingPairs.length;

  const options = useMemo(() => {
    const correct = currentPair.rhymes[Math.floor(Math.random() * currentPair.rhymes.length)];
    return [correct, ...currentPair.wrong].sort(() => Math.random() - 0.5);
  }, [currentIndex]);

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    if (currentPair.rhymes.includes(answer)) {
      setShowSuccess(true);
      setScore(score + 1);
      setTimeout(() => {
        if (currentIndex < rhymingPairs.length - 1) {
          setCurrentIndex(currentIndex + 1);
          setShowSuccess(false);
          setSelectedAnswer(null);
        } else {
          onFinish();
        }
      }, 1500);
    } else {
      setShowError(true);
      const newLives = lives - 1;
      setLives(newLives);
      if (newLives === 0) {
        setTimeout(() => onFinish(), 2000);
      } else {
        setTimeout(() => {
          setShowError(false);
          setSelectedAnswer(null);
        }, 1500);
      }
    }
  };

  if (isComplete || lives === 0) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] px-4">
        <Card className="max-w-2xl w-full border-2 border-primary/20 shadow-2xl">
          <CardHeader className="text-center space-y-4 pb-6">
            <CardTitle className="text-4xl font-bold">{lives === 0 ? 'Game Over! 💔' : 'Rhyme Master! 🎉'}</CardTitle>
            <div className="text-6xl font-bold text-primary">{score}/{rhymingPairs.length}</div>
          </CardHeader>
          <CardContent>
            <Button onClick={onBack} className="w-full text-lg py-6" size="lg">
              <Home className="h-5 w-5 mr-2" />
              Back to Games
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4 py-8">
      <div className="w-full max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={onBack} className="text-lg">
            <Home className="h-5 w-5 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Score</div>
              <div className="text-3xl font-bold">{score}/{rhymingPairs.length}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Lives</div>
              <div className="text-3xl font-bold flex gap-1">
                {[...Array(lives)].map((_, i) => <span key={i} className="text-red-500">❤️</span>)}
              </div>
            </div>
          </div>
        </div>

        <Card className="border-2 shadow-2xl bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/30 dark:to-rose-950/30">
          <CardHeader className="text-center pb-4">
            <div className="text-6xl mb-4">🎵</div>
            <CardTitle className="text-3xl md:text-4xl font-bold mb-2">Rhyme Time!</CardTitle>
            <CardDescription className="text-2xl font-bold">What rhymes with "{currentPair.word}"?</CardDescription>
          </CardHeader>

          <CardContent className="space-y-8 pb-8">
            {showSuccess && (
              <div className="text-center animate-in zoom-in">
                <div className="text-6xl animate-bounce mb-4">🎉✨</div>
                <div className="text-3xl font-bold text-green-600">Perfect rhyme!</div>
              </div>
            )}

            {showError && (
              <div className="text-center animate-in zoom-in">
                <div className="text-6xl animate-bounce mb-4">❌</div>
                <div className="text-3xl font-bold text-red-600">
                  {lives > 0 ? 'Wrong! Lives left: ' + lives : 'Game Over!'}
                </div>
              </div>
            )}

            {!showSuccess && !showError && (
              <div className="grid grid-cols-2 gap-4">
                {options.map((option, idx) => (
                  <button
                    key={`${option}-${idx}-${currentIndex}`}
                    onClick={() => handleAnswer(option)}
                    disabled={selectedAnswer !== null}
                    className={cn(
                      "px-8 py-6 rounded-xl bg-gradient-to-br from-pink-400 to-rose-500 text-white text-2xl font-bold shadow-lg transition-all hover:scale-110 hover:shadow-2xl",
                      selectedAnswer === option && "ring-4 ring-yellow-300",
                      selectedAnswer !== null && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}

            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
              <div className="bg-gradient-to-r from-pink-500 to-rose-500 h-4 rounded-full transition-all duration-500" style={{ width: `${((currentIndex + 1) / rhymingPairs.length) * 100}%` }} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Remaining games using the helper
const SpellingBee = createMultipleChoiceGame('Spelling Bee', '🐝', 'yellow-amber', Array.from({ length: 20 }, () => {
  const words = ['cat', 'dog', 'sun', 'hat', 'cup', 'pen', 'bed', 'red', 'car', 'tree', 'book', 'ball', 'fish', 'cake', 'moon', 'star', 'bird', 'rain', 'blue', 'play'];
  const word = words[Math.floor(Math.random() * words.length)];
  const wrong = words.filter(w => w !== word).slice(0, 3);
  return { question: `Spell the word: ${word.toUpperCase()}`, answer: word, options: [word, ...wrong] };
}));

const ReadingComprehension = createMultipleChoiceGame('Reading Comprehension', '📚', 'indigo-purple', [
  { question: 'If a story says "The cat sat on the mat", where was the cat?', answer: 'On the mat', options: ['On the mat', 'In the tree', 'Under the bed', 'In the car'] },
  { question: 'What color is the sky during the day?', answer: 'Blue', options: ['Blue', 'Red', 'Green', 'Yellow'] },
  { question: 'How many legs does a cat have?', answer: 'Four', options: ['Two', 'Three', 'Four', 'Five'] },
  ...Array.from({ length: 17 }, (_, i) => ({
    question: `Question ${i + 4}: What do you use to ${['write', 'read', 'play', 'eat', 'drink', 'sleep', 'run', 'jump', 'sing', 'dance', 'draw', 'paint', 'swim', 'fly', 'walk', 'talk', 'listen'][i % 17]}?`,
    answer: ['A pen', 'A book', 'A ball', 'A spoon', 'Water', 'A bed', 'Your legs', 'Your legs', 'Your voice', 'Your body', 'A pencil', 'A brush', 'Your arms', 'Wings', 'Your legs', 'Your mouth', 'Your ears'][i % 17],
    options: [
      ['A pen', 'A book', 'A ball', 'A spoon', 'Water', 'A bed', 'Your legs', 'Your legs', 'Your voice', 'Your body', 'A pencil', 'A brush', 'Your arms', 'Wings', 'Your legs', 'Your mouth', 'Your ears'][i % 17],
      ['A fork', 'A chair', 'A car', 'A knife', 'Juice', 'A table', 'A car', 'A bike', 'A radio', 'A guitar', 'A marker', 'A pen', 'A boat', 'A plane', 'A bike', 'A phone', 'Eyes'][i % 17],
      ['A pencil', 'A desk', 'A toy', 'A plate', 'Milk', 'A pillow', 'A train', 'A trampoline', 'A microphone', 'A piano', 'A crayon', 'A canvas', 'A pool', 'A rocket', 'A scooter', 'A megaphone', 'A speaker'][i % 17],
      ['Nothing', 'Nothing', 'Nothing', 'Nothing', 'Nothing', 'Nothing', 'Nothing', 'Nothing', 'Nothing', 'Nothing', 'Nothing', 'Nothing', 'Nothing', 'Nothing', 'Nothing', 'Nothing', 'Nothing'][i % 17],
    ],
  })),
]);

const PunctuationPower = createMultipleChoiceGame('Punctuation Power', '✍️', 'teal-cyan', Array.from({ length: 20 }, (_, i) => {
  const sentences = [
    { text: 'The cat sat on the mat', correct: '.', wrong: ['!', '?', ','] },
    { text: 'What time is it', correct: '?', wrong: ['.', '!', ','] },
    { text: 'Wow that is amazing', correct: '!', wrong: ['.', '?', ','] },
    { text: 'I like apples bananas and oranges', correct: ',', wrong: ['.', '!', '?'] },
  ];
  const sentence = sentences[i % sentences.length];
  return { question: `What punctuation should go at the end: "${sentence.text}"?`, answer: sentence.correct, options: [sentence.correct, ...sentence.wrong] };
}));

const PronunciationPractice = createMultipleChoiceGame('Pronunciation Practice', '🗣️', 'rose-pink', Array.from({ length: 20 }, (_, i) => {
  const words = ['cat', 'dog', 'sun', 'hat', 'cup', 'pen', 'bed', 'red', 'car', 'tree', 'book', 'ball', 'fish', 'cake', 'moon', 'star', 'bird', 'rain', 'blue', 'play'];
  const word = words[i % words.length];
  return { question: `How do you pronounce: ${word.toUpperCase()}?`, answer: word, options: [word, words[(i + 1) % words.length], words[(i + 2) % words.length], words[(i + 3) % words.length]] };
}));

const GrammarGames = createMultipleChoiceGame('Grammar Games', '📖', 'blue-indigo', Array.from({ length: 20 }, (_, i) => {
  const questions = [
    { q: 'Which is correct: "I am happy" or "I is happy"?', a: 'I am happy', o: ['I am happy', 'I is happy', 'I are happy', 'I be happy'] },
    { q: 'Which is correct: "The cat is sleeping" or "The cat are sleeping"?', a: 'The cat is sleeping', o: ['The cat is sleeping', 'The cat are sleeping', 'The cat be sleeping', 'The cat am sleeping'] },
    { q: 'Which is correct: "They are playing" or "They is playing"?', a: 'They are playing', o: ['They are playing', 'They is playing', 'They am playing', 'They be playing'] },
    { q: 'Which word is a noun?', a: 'cat', o: ['cat', 'run', 'happy', 'quickly'] },
  ];
  const q = questions[i % questions.length];
  return { question: q.q, answer: q.a, options: q.o };
}));

const ConversationCorner = createMultipleChoiceGame('Conversation Corner', '💬', 'green-emerald', Array.from({ length: 20 }, (_, i) => {
  const responses = [
    { q: 'How are you?', a: 'I am fine, thank you', o: ['I am fine, thank you', 'I am cat', 'I am running', 'I am blue'] },
    { q: 'What is your name?', a: 'My name is...', o: ['My name is...', 'My name are...', 'My name be...', 'My name am...'] },
    { q: 'How old are you?', a: 'I am 8 years old', o: ['I am 8 years old', 'I is 8 years old', 'I are 8 years old', 'I be 8 years old'] },
    { q: 'Where do you live?', a: 'I live in...', o: ['I live in...', 'I lives in...', 'I living in...', 'I lived in...'] },
  ];
  const r = responses[i % responses.length];
  return { question: r.q, answer: r.a, options: r.o };
}));

const WordExplorer = createMultipleChoiceGame('Word Explorer', '🔍', 'violet-purple', Array.from({ length: 20 }, (_, i) => {
  const words = [
    { word: 'happy', meaning: 'Feeling joy', wrong: ['Feeling sad', 'Feeling angry', 'Feeling tired'] },
    { word: 'big', meaning: 'Large in size', wrong: ['Small in size', 'Round in size', 'Flat in size'] },
    { word: 'fast', meaning: 'Moving quickly', wrong: ['Moving slowly', 'Moving backwards', 'Moving sideways'] },
    { word: 'cold', meaning: 'Low temperature', wrong: ['High temperature', 'Medium temperature', 'No temperature'] },
  ];
  const w = words[i % words.length];
  return { question: `What does "${w.word}" mean?`, answer: w.meaning, options: [w.meaning, ...w.wrong] };
}));

const WeatherWizard = createMultipleChoiceGame('Weather Wizard', '🌈', 'sky-blue', Array.from({ length: 20 }, (_, i) => {
  const weather = [
    { q: 'What do you need when it rains?', a: 'An umbrella', o: ['An umbrella', 'Sunglasses', 'A fan', 'Ice cream'] },
    { q: 'What happens when it snows?', a: 'It gets cold', o: ['It gets cold', 'It gets hot', 'It gets dark', 'It gets loud'] },
    { q: 'When is the sun shining?', a: 'On a sunny day', o: ['On a sunny day', 'On a rainy day', 'At night', 'In the ocean'] },
    { q: 'What comes after rain?', a: 'A rainbow', o: ['A rainbow', 'A thunder', 'A snow', 'A cloud'] },
  ];
  const w = weather[i % weather.length];
  return { question: w.q, answer: w.a, options: w.o };
}));

const HealthyHabits = createMultipleChoiceGame('Healthy Habits', '💚', 'green-emerald', Array.from({ length: 20 }, (_, i) => {
  const habits = [
    { q: 'How many times should you brush your teeth?', a: 'Twice a day', o: ['Twice a day', 'Once a month', 'Never', 'Ten times a day'] },
    { q: 'What should you eat for breakfast?', a: 'Healthy food', o: ['Healthy food', 'Only candy', 'Nothing', 'Only water'] },
    { q: 'How much water should you drink?', a: 'Lots of water', o: ['Lots of water', 'No water', 'Only soda', 'Only juice'] },
    { q: 'What should you do every day?', a: 'Exercise', o: ['Exercise', 'Stay in bed', 'Eat only junk food', 'Never sleep'] },
  ];
  const h = habits[i % habits.length];
  return { question: h.q, answer: h.a, options: h.o };
}));

const CommunityHelpers = createMultipleChoiceGame('Community Helpers', '👮', 'blue-cyan', Array.from({ length: 20 }, (_, i) => {
  const helpers = [
    { q: 'Who helps put out fires?', a: 'Firefighter', o: ['Firefighter', 'Teacher', 'Doctor', 'Cook'] },
    { q: 'Who teaches children?', a: 'Teacher', o: ['Teacher', 'Pilot', 'Chef', 'Artist'] },
    { q: 'Who helps sick people?', a: 'Doctor', o: ['Doctor', 'Police officer', 'Farmer', 'Driver'] },
    { q: 'Who keeps us safe?', a: 'Police officer', o: ['Police officer', 'Nurse', 'Baker', 'Musician'] },
  ];
  const h = helpers[i % helpers.length];
  return { question: h.q, answer: h.a, options: h.o };
}));

const EmotionExplorer = createMultipleChoiceGame('Emotion Explorer', '😊', 'yellow-orange', Array.from({ length: 20 }, (_, i) => {
  const emotions = [
    { q: 'How do you feel when you get a present?', a: 'Happy', o: ['Happy', 'Sad', 'Angry', 'Scared'] },
    { q: 'How do you feel when you lose something?', a: 'Sad', o: ['Sad', 'Happy', 'Excited', 'Proud'] },
    { q: 'How do you feel when you are scared?', a: 'Afraid', o: ['Afraid', 'Happy', 'Calm', 'Excited'] },
    { q: 'How do you feel when you win a game?', a: 'Proud', o: ['Proud', 'Sad', 'Angry', 'Tired'] },
  ];
  const e = emotions[i % emotions.length];
  return { question: e.q, answer: e.a, options: e.o };
}));

const SafetyFirst = createMultipleChoiceGame('Safety First', '🛡️', 'red-orange', Array.from({ length: 20 }, (_, i) => {
  const safety = [
    { q: 'What should you do before crossing the road?', a: 'Look both ways', o: ['Look both ways', 'Close your eyes', 'Run fast', 'Jump'] },
    { q: 'Who should you talk to if a stranger approaches?', a: 'A trusted adult', o: ['A trusted adult', 'The stranger', 'No one', 'Only friends'] },
    { q: 'What should you wear when riding a bike?', a: 'A helmet', o: ['A helmet', 'Nothing', 'A hat', 'Sunglasses'] },
    { q: 'What should you do if you see fire?', a: 'Tell an adult', o: ['Tell an adult', 'Touch it', 'Hide', 'Run towards it'] },
  ];
  const s = safety[i % safety.length];
  return { question: s.q, answer: s.a, options: s.o };
}));
