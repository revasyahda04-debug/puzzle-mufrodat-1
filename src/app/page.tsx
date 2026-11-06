"use client";

import { useEffect, useMemo, useState } from "react";

type Word = {
  id: string; arabic: string; latin: string; meaning: string; category: string;
  audioUrl?: string | null; imageUrl?: string | null; letters: string;
};
type User = { id: string; name: string; email: string; role: "ADMIN" | "SISWA" };

function shuffle<T,>(items: T[]) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [words, setWords] = useState<Word[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [index, setIndex] = useState(0);
  const [pool, setPool] = useState<string[]>([]);
  const [answer, setAnswer] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [score, setScore] = useState(0);
  const [loginMode, setLoginMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [adminForm, setAdminForm] = useState({ arabic: "", latin: "", meaning: "", category: "Alat Sekolah", letters: "", audioUrl: "" });
  const [busy, setBusy] = useState(false);

  async function load() {
    const [meRes, wordsRes] = await Promise.all([fetch("/api/me"), fetch("/api/mufrodat")]);
    const me = await meRes.json(); const data = await wordsRes.json();
    setUser(me.user); setWords(data.items || []);
  }
  useEffect(() => { load(); }, []);

  const categories = useMemo(() => ["Semua", ...Array.from(new Set(words.map(w => w.category)))], [words]);
  const visibleWords = useMemo(() => words.filter(w => selectedCategory === "Semua" || w.category === selectedCategory), [words, selectedCategory]);
  const current = visibleWords[index % Math.max(visibleWords.length, 1)];

  function startWord(word: Word) {
    const letters = word.letters.split("|").filter(Boolean);
    setPool(shuffle(letters)); setAnswer([]); setMessage("");
  }
  useEffect(() => { if (current) startWord(current); }, [current?.id]);

  async function authenticate(e: React.FormEvent) {
    e.preventDefault(); setBusy(true);
    const endpoint = loginMode === "login" ? "/api/auth/login" : "/api/auth/register";
    const res = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json(); setBusy(false);
    if (!res.ok) return alert(data.error || "Gagal masuk.");
    setUser(data.user); setForm({ name: "", email: "", password: "" });
    await load();
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" }); setUser(null);
  }

  function addLetter(letter: string, poolIndex: number) {
    setAnswer(prev => [...prev, letter]);
    setPool(prev => prev.filter((_, i) => i !== poolIndex));
    setMessage("");
  }

  function removeLetter(answerIndex: number) {
    const letter = answer[answerIndex];
    setAnswer(prev => prev.filter((_, i) => i !== answerIndex));
    setPool(prev => [...prev, letter]);
    setMessage("");
  }

  async function checkAnswer() {
    if (!current || !user) return setMessage("Masuk terlebih dahulu untuk menyimpan hasil latihan.");
    const result = await fetch("/api/attempts", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mufrodatId: current.id, answer: answer.join("") })
    });
    const data = await result.json();
    if (!result.ok) return setMessage(data.error || "Terjadi kesalahan.");
    if (data.isCorrect) { setMessage("🎉 Hebat! Jawaban kamu benar. +10 poin"); setScore(s => s + 10); }
    else setMessage("Belum tepat. Coba dengarkan audio dan susun lagi, ya!");
  }

  async function addWord(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/mufrodat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(adminForm) });
    const data = await res.json();
    if (!res.ok) return alert(data.error || "Gagal menyimpan.");
    setAdminForm({ arabic: "", latin: "", meaning: "", category: "Alat Sekolah", letters: "", audioUrl: "" });
    await load(); alert("Materi berhasil ditambahkan.");
  }

  async function deleteWord(id: string) {
    if (!confirm("Nonaktifkan kosakata ini?")) return;
    await fetch(`/api/mufrodat/${id}`, { method: "DELETE" }); await load();
  }

  return (
    <main className="shell">
      <header className="topbar">
        <a className="brand" href="#"><span className="brand-icon">م</span><span>Mufrodat<span className="brand-light">Ceria</span><small>Belajar Bahasa Arab jadi menyenangkan</small></span></a>
        <div className="user-area">
          {user ? <><span className="user-name">Halo, {user.name}</span><button className="btn btn-ghost" onClick={logout}>Keluar</button></> : <a href="#akun" className="btn btn-ghost">Masuk / Daftar</a>}
        </div>
      </header>

      <section className="hero">
        <div><span className="eyebrow">✦ MEDIA BELAJAR KELAS 4 SD</span><h1>Yuk, belajar <em>mufrodat!</em></h1><p>Dengarkan, kenali huruf, lalu susun menjadi kosakata Bahasa Arab yang benar.</p><a className="btn btn-primary" href="#latihan">Mulai belajar <span>→</span></a></div>
        <div className="hero-art"><div className="sun"></div><div className="arabic-art">أَبْجَدِيَّة</div><div className="book">📚</div><div className="pencil">✏️</div><div className="star star-one">✦</div><div className="star star-two">✧</div></div>
      </section>

      {!user && <section className="account-card" id="akun">
        <div><span className="eyebrow">AKUN BELAJAR</span><h2>{loginMode === "login" ? "Masuk untuk menyimpan nilai" : "Buat akun siswa"}</h2><p>Latihan bisa dilihat setelah kamu masuk.</p></div>
        <form onSubmit={authenticate} className="auth-form">
          {loginMode === "register" && <input placeholder="Nama lengkap" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />}
          <input type="email" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          <input type="password" placeholder="Password (minimal 8 karakter)" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} minLength={8} required />
          <button className="btn btn-primary" disabled={busy}>{busy ? "Memproses..." : loginMode === "login" ? "Masuk" : "Daftar sebagai siswa"}</button>
          <button type="button" className="text-button" onClick={() => setLoginMode(loginMode === "login" ? "register" : "login")}>{loginMode === "login" ? "Belum punya akun? Daftar siswa" : "Sudah punya akun? Masuk"}</button>
        </form>
      </section>}

      <section className="learning-section" id="latihan">
        <div className="section-heading"><div><span className="eyebrow">RUANG LATIHAN</span><h2>Pilih dan susun kata</h2><p>Dengarkan audio, lalu ketuk huruf sesuai urutannya.</p></div><div className="score-pill">⭐ Skor sesi <b>{score}</b></div></div>
        <div className="category-row">{categories.map(c => <button key={c} onClick={() => { setSelectedCategory(c); setIndex(0); }} className={`category-chip ${selectedCategory === c ? "active" : ""}`}>{c}</button>)}</div>
        {current ? <div className="game-grid">
          <article className="word-card">
            <div className="card-top"><span className="tag">{current.category}</span><span className="counter">{index + 1} / {visibleWords.length}</span></div>
            <div className="word-illustration">{current.imageUrl ? <img src={current.imageUrl} alt={current.meaning} /> : <span>🧩</span>}</div>
            <h3>Dengarkan kosakatanya</h3><p className="muted">Perhatikan bunyi kata dalam Bahasa Arab.</p>
            {current.audioUrl ? <audio controls src={current.audioUrl} className="audio-player">Browser tidak mendukung audio.</audio> : <div className="audio-placeholder">🔊 Audio belum ditambahkan guru</div>}
            <div className="meaning-hint"><span>Petunjuk arti</span><b>{current.meaning}</b></div>
          </article>
          <article className="answer-card">
            <span className="eyebrow">TANTANGAN HARI INI</span><h3>Susun huruf menjadi kata!</h3><p className="muted">Pilih huruf satu per satu untuk mengisi kotak jawaban.</p>
            <div className="answer-label">JAWABANMU <span>← arah penulisan Arab</span></div>
            <div className="answer-slots" dir="rtl">{answer.map((letter, i) => <button key={`${letter}-${i}`} className="letter-tile selected" onClick={() => removeLetter(i)} aria-label={`Hapus huruf ${letter}`}>{letter}</button>)}{Array.from({ length: Math.max(0, current.letters.split("|").length - answer.length) }).map((_, i) => <span className="empty-slot" key={i}>·</span>)}</div>
            <div className="letter-bank" dir="rtl">{pool.map((letter, i) => <button key={`${letter}-${i}`} className="letter-tile" onClick={() => addLetter(letter, i)}>{letter}</button>)}</div>
            <div className="feedback" role="status">{message || "Semangat! Kamu pasti bisa."}</div>
            <div className="game-actions"><button className="btn btn-outline" onClick={() => current && startWord(current)}>Acak ulang</button><button className="btn btn-primary" onClick={checkAnswer} disabled={answer.length === 0}>Periksa jawaban</button></div>
            <button className="next-link" onClick={() => setIndex(i => (i + 1) % visibleWords.length)}>Lewati ke kata berikutnya →</button>
          </article>
        </div> : <div className="empty-state">Belum ada materi untuk kategori ini.</div>}
      </section>

      {user?.role === "ADMIN" && <section className="admin-section">
        <div className="section-heading"><div><span className="eyebrow">PANEL GURU</span><h2>Kelola materi mufrodat</h2><p>Tambah kosakata dan tautan audio untuk latihan siswa.</p></div><span className="admin-badge">Admin</span></div>
        <form className="admin-form" onSubmit={addWord}>
          <input placeholder="Tulisan Arab (contoh: كِتَابٌ)" value={adminForm.arabic} onChange={e => setAdminForm({ ...adminForm, arabic: e.target.value })} required />
          <input placeholder="Latin (Kitaabun)" value={adminForm.latin} onChange={e => setAdminForm({ ...adminForm, latin: e.target.value })} required />
          <input placeholder="Arti (Buku)" value={adminForm.meaning} onChange={e => setAdminForm({ ...adminForm, meaning: e.target.value })} required />
          <input placeholder="Kategori (Alat Sekolah)" value={adminForm.category} onChange={e => setAdminForm({ ...adminForm, category: e.target.value })} required />
          <input placeholder="Huruf dipisah | contoh: ك|ت|ا|ب" value={adminForm.letters} onChange={e => setAdminForm({ ...adminForm, letters: e.target.value })} required />
          <input placeholder="URL audio MP3 (opsional)" value={adminForm.audioUrl} onChange={e => setAdminForm({ ...adminForm, audioUrl: e.target.value })} />
          <button className="btn btn-primary">Simpan kosakata</button>
        </form>
        <div className="admin-list">{words.map(w => <div key={w.id}><span className="arabic-small">{w.arabic}</span><span>{w.meaning} <small>· {w.category}</small></span><button className="delete-button" onClick={() => deleteWord(w.id)}>Nonaktifkan</button></div>)}</div>
      </section>}

      <footer><span>مفردات · Mufrodat Ceria</span><span>Belajar sedikit demi sedikit, hebat setiap hari ✨</span></footer>
    </main>
  );
}
