
import { useState } from "react";
import { chapters, questions } from "./data/questions";

const translations = {
  ur: "اردو",
  en: "English",
  it: "Italiano",
};

export default function App() {
  const [page, setPage] = useState("home");
  const [language, setLanguage] = useState("ur");
  const [chapter, setChapter] = useState(null);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(null);
  const [saved, setSaved] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("patenteSaved") || "[italian]");
    } catch {
      return [];
    }
  });

  const [search, setSearch] = useState("");

  const current = quizQuestions[index];

  function navigate(next) {
    setPage(next);
    setChapter(null);
  }

  function startQuiz(chapterId = null) {
    const list = chapterId
      ? questions.filter((q) => q.chapter === chapterId)
      : [...questions];

    if (!list.length) {
      alert("Is chapter ke questions abhi add nahi kiye gaye.");
      return;
    }

    setChapter(chapterId);
    setQuizQuestions(list);
    setIndex(0);
    setScore(0);
    setAnswered(null);
    setPage("quiz");
  }

  function answer(value) {
    if (answered !== null) return;

    setAnswered(value);

    if (value === current.correct) {
      setScore((previous) => previous + 1);
    }
  }

  function nextQuestion() {
    if (answered === null) {
      alert("Pehle VERO ya FALSO select karo.");
      return;
    }

    if (index + 1 < quizQuestions.length) {
      setIndex((previous) => previous + 1);
      setAnswered(null);
    } else {
      setPage("result");
    }
  }

  function toggleSaved(id) {
    setSaved((previous) => {
      const updated = previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id];

      localStorage.setItem("patenteSaved", JSON.stringify(updated));
      return updated;
    });
  }

  function textFor(question) {
    if (language === "it") return question.italian;
    if (language === "en") return question.english;
    return question.urdu;
  }

  function questionCard(question) {
    return (
      <article className="saved-card" key={question.id}>
        <span className="tag">
          {chapters.find((c) => c.id === question.chapter)?.name}
        </span>
        <h3>{question.italian}</h3>
        <p className="translation">{question.urdu}</p>
        <p className="english">{question.english}</p>
        <button className="outline" onClick={() => toggleSaved(question.id)}>
          {saved.includes(question.id) ? "★ Remove from Scheda" : "🔖 Save to Scheda"}
        </button>
      </article>
    );
  }

  return (
    <>
      <header className="topbar">
        <button className="brand" onClick={() => navigate("home")}>
          🚗 Patente <span>B Quiz</span>
        </button>

        <select
          aria-label="Translation language"
          value={language}
          onChange={(event) => setLanguage(event.target.value)}
        >
          {Object.entries(translations).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </header>

      <div className="layout">
        <aside className="sidebar">
          <h3>Menu</h3>
          {[
            ["home", "🏠 Home"],
            ["chapters", "📚 All Chapters"],
            ["learning", "📖 Learning"],
            ["saved", "🔖 Scheda"],
          ].map(([value, label]) => (
            <button
              key={value}
              className={`nav-button ${page === value ? "active" : ""}`}
              onClick={() => navigate(value)}
            >
              {label}
            </button>
          ))}

          <button className="nav-button" onClick={() => startQuiz()}>
            📝 Practice Test
          </button>
        </aside>

        <main className="main">
          {page === "home" && (
            <>
              <section className="hero">
                <span className="tag">YOUR DRIVING THEORY STUDY APP</span>
                <h1>Patente B Quiz</h1>
                <p>Italian driving theory with Urdu and English translations.</p>
                <button className="primary" onClick={() => navigate("chapters")}>
                  Start Learning →
                </button>
              </section>

              <div className="stats">
                <div className="stat"><strong>{questions.length}</strong><span>Sample Questions</span></div>
                <div className="stat"><strong>{chapters.length}</strong><span>Chapters</span></div>
                <div className="stat"><strong>{saved.length}</strong><span>Saved Questions</span></div>
              </div>

              <h2 className="section-title">Quick Start</h2>
              <div className="grid">
                <button className="feature" onClick={() => navigate("chapters")}>
                  📚<h3>Chapters</h3><p>Choose a topic to study.</p>
                </button>
                <button className="feature" onClick={() => startQuiz()}>
                  📝<h3>Practice</h3><p>Answer VERO or FALSO.</p>
                </button>
                <button className="feature" onClick={() => navigate("learning")}>
                  📖<h3>Learning</h3><p>Review driving theory topics.</p>
                </button>
                <button className="feature" onClick={() => navigate("saved")}>
                  🔖<h3>Scheda</h3><p>Review saved questions.</p>
                </button>
              </div>
            </>
          )}

          {page === "chapters" && (
            <>
              <h1>📚 All Chapters</h1>
              <p className="muted">Choose a chapter to practise its available questions.</p>
              <input
                className="search"
                placeholder="Search chapters..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <div className="grid">
                {chapters
                  .filter((item) =>
                    `${item.name} ${item.title}`.toLowerCase().includes(search.toLowerCase())
                  )
                  .map((item) => {
                    const count = questions.filter((q) => q.chapter === item.id).length;

                    return (
                      <button
                        className="chapter-card"
                        key={item.id}
                        onClick={() => startQuiz(item.id)}
                      >
                        <span className="tag">CHAPTER {item.id}</span>
                        <h3>{item.name}</h3>
                        <p>{item.title}</p>
                        <small>{count} sample questions</small>
                        <span className="chapter-arrow">→</span>
                      </button>
                    );
                  })}
              </div>
            </>
          )}

          {page === "quiz" && current && (
            <section className="quiz-panel">
              <div className="quiz-heading">
                <button className="outline" onClick={() => navigate("chapters")}>
                  ← Chapters
                </button>
                <span>Score: {score}</span>
              </div>

              <div className="progress">
                <div
                  style={{ width: `${((index + 1) / quizQuestions.length) * 100}%` }}
                />
              </div>

              <p className="muted">
                Question {index + 1} of {quizQuestions.length}
              </p>

              <h2 className="question">{current.italian}</h2>

              <div className="translation">
                <strong>{translations[language]}</strong>
                <p>{textFor(current)}</p>
              </div>

              <div className="answer-grid">
                {[true, false].map((value) => {
                  const isCorrect = answered !== null && value === current.correct;
                  const isWrong = answered === value && value !== current.correct;

                  return (
                    <button
                      key={String(value)}
                      disabled={answered !== null}
                      className={`answer ${value ? "vero" : "falso"} ${
                        isCorrect ? "correct" : ""
                      } ${isWrong ? "wrong" : ""}`}
                      onClick={() => answer(value)}
                    >
                      {value ? "✓ VERO" : "✕ FALSO"}
                    </button>
                  );
                })}
              </div>

              {answered !== null && (
                <div className={answered === current.correct ? "feedback good" : "feedback bad"}>
                  {answered === current.correct ? "✅ Correct!" : "❌ Incorrect."}
                  <p>
                    Correct answer: <strong>{current.correct ? "VERO" : "FALSO"}</strong>
                  </p>
                </div>
              )}

              <div className="quiz-actions">
                <button className="outline" onClick={() => toggleSaved(current.id)}>
                  {saved.includes(current.id) ? "★ Saved" : "🔖 Scheda"}
                </button>
                <button className="primary" onClick={nextQuestion}>
                  {index + 1 === quizQuestions.length ? "Finish Test" : "Next Question →"}
                </button>
              </div>
            </section>
          )}

          {page === "result" && (
            <section className="result-panel">
              <div className="result-icon">🎉</div>
              <h1>Test Finished</h1>
              <div className="result-score">
                {Math.round((score / quizQuestions.length) * 100)}%
              </div>
              <p>You answered {score} out of {quizQuestions.length} questions correctly.</p>
              <div className="quiz-actions">
                <button className="outline" onClick={() => startQuiz(chapter)}>
                  🔄 Try Again
                </button>
                <button className="primary" onClick={() => navigate("home")}>
                  🏠 Home
                </button>
              </div>
            </section>
          )}

          {page === "learning" && (
            <>
              <h1>📖 Learning Centre</h1>
              <p className="muted">Study these topics before taking a practice test.</p>
              <div className="lesson-list">
                {[
                  ["🚦", "Traffic Signs", "Learn warning, prohibition, mandatory and information signs."],
                  ["↔️", "Right of Way", "Study priority rules at intersections."],
                  ["🦺", "Road Safety", "Understand seat belts and safe driving behaviour."],
                  ["💡", "Vehicle Lights", "Learn the purpose of indicators and vehicle lights."],
                  ["🅿️", "Parking", "Review stopping and parking rules."],
                  ["🛣️", "Speed Limits", "Study speed limits and adapt speed to road conditions."],
                ].map(([icon, title, description]) => (
                  <article className="lesson" key={title}>
                    <span>{icon}</span>
                    <div><h3>{title}</h3><p>{description}</p></div>
                  </article>
                ))}
              </div>
            </>
          )}

          {page === "saved" && (
            <>
              <h1>🔖 Scheda — Saved Questions</h1>
              <p className="muted">Your saved questions stay in this browser.</p>
              {saved.length === 0 ? (
                <div className="empty">No saved questions yet. Save questions while practising.</div>
              ) : (
                <div className="saved-list">
                  {questions.filter((q) => saved.includes(q.id)).map(questionCard)}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </>
  );
}
